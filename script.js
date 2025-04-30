function gameboard() {
    let gameGrid = [];

    let gridRows = 3;
    let gridColumns = 3;

    const generateGameGrid = () => {
        for (let r = 0; r < gridRows; r++) {
            gameGrid[r] = [];
            
            for (let c = 0; c < gridColumns; c++) {
                gameGrid[r].push(cellValue());
            };
        };  
    }; 
    generateGameGrid();

    const getGameGrid = () => gameGrid;

    const setValue = function(row, column, player) {
        if (gameGrid[row][column].getValue() !== 0) {
            console.log("INVALID MOVE: That cell is already populated!");
            return false;
        };

        gameGrid[row][column].setValue(player);
        return true;
    };

    const printGrid = () => {
        const cellsOfGameGrid = gameGrid.map((row) => row.map((cell) => cell.getValue()));
        console.table(cellsOfGameGrid); 
    }

    const resetGameGrid = () => {generateGameGrid();}; // run another function (don't need a return value so )

    return {getGameGrid, setValue, printGrid, resetGameGrid};
};

function cellValue() {
    let value = 0;

    const setValue = (player) => {
        value = player
    };

    const getValue = () => value;

    return {setValue, getValue};
}

function playerManager(playerOneName = "Player One", playerTwoName = "Player Two") {
    const players = [
        {name: playerOneName, value: 1, wins: 0},
        {name: playerTwoName, value: 2, wins: 0}
    ];
    
    const getName = playerIndex => players[playerIndex].name;
    const getValue = playerIndex => players[playerIndex].value;
    const getWins = playerIndex => players[playerIndex].wins;
    const incrementWinsTally = playerIndex => players[playerIndex].wins++;

    const resetPlayersData = () => {
        players[0].name = playerOneName;
        players[1].name = playerTwoName;
        players[0].wins = 0;
        players[1].wins = 0;
    };

    let activePlayerIndex = 0; // '0' = player1 | '1' = player2
    const switchTurn = () => {
        activePlayerIndex = activePlayerIndex === 0 ? 1 : 0;
        console.log(getName(activePlayerIndex) + "'s turn.")
    };
    const getActivePlayer = () => activePlayerIndex;

    return {getName, getValue, getWins, incrementWinsTally, getActivePlayer, switchTurn, resetPlayersData};
}

function gameRules(gameGrid, player) {
    const conditionsRoundScenarios = () => {
        const winScenarios = (playerValue) => {
            function diagonalWinConditions() { //2 diagonal win scenarios
                return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue) ||
                        (gameGrid[2][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[0][2].getValue() === playerValue);
            };
            function horizontalWinConditions() { //3 horizontal (row) win scenarios
                for (let i = 0; i < gameGrid.length; i++) {
                    const currentRow = gameGrid[i];
                  
                    if  (currentRow[0].getValue() === playerValue &&
                        currentRow[1].getValue() === playerValue && 
                        currentRow[2].getValue() === playerValue) {    
                        return true;
                    }
                };
                return false;
            };
            function verticalWinConditions() {//3 vertical (column) win scenarios - creating a win-condition
                return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][0].getValue() === playerValue && gameGrid[2][0].getValue() === playerValue) || //column 1
                        (gameGrid[0][1].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][1].getValue() === playerValue) || //column2
                        (gameGrid[0][2].getValue() === playerValue && gameGrid[1][2].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue); //column3
            };

            return diagonalWinConditions() || horizontalWinConditions() || verticalWinConditions(); //see if any returned true (someone won the game)
        };

        const player1Won = winScenarios(player.getValue(0));
        const player2Won = winScenarios(player.getValue(1));

        const isGridFull = () => { //check if there are absolutely no cells containing the value '0'
            for (let r = 0; r < gameGrid.length; r++) {
                for (let c = 0; c < gameGrid[r].length; c++) {
                    if (gameGrid[r][c].getValue() === 0) {
                        return false;
                    }
                }
            }
            return true;
        }

        const drawScenarios = () => {
            if (isGridFull()) {
                return !player1Won && !player2Won;
            }
            return false;
        };  

        return {
            checkWin: (playerValue) => winScenarios(playerValue),
            checkDraw: () => drawScenarios()
        };
    };

    const scenarios = conditionsRoundScenarios()

    const checkRoundScenarios = () => {
        const activePlayerIndex = player.getActivePlayer(); //access the player-index to target the correct player's dataset (not at the module level due to 'minimal knowledge/law of demeter' principle)
        const playerSymbol = player.getValue(activePlayerIndex); // (not in module-scope due to 'minimal knowledge/Law of Demeter')

        if (scenarios.checkWin(playerSymbol)) { // Round over
            player.incrementWinsTally(activePlayerIndex); // using the 'modifier method'
            if (player.getWins(activePlayerIndex) === 2) { // Game over
                return "game over";
            };
            return "win";
        }
        if (scenarios.checkDraw()) { // Round over
            console.log("Game over! Draw!")
            return "draw";
        }
        return "continue";
    }; 

    return {conditionsRoundScenarios, checkRoundScenarios}
}

function gameController() {

    let freezeGrid = false;
    const grid = gameboard(); //gain access to the module holding grid methods
        const gameGrid = grid.getGameGrid(); //access the existing instance/grid/gameboard - so that manipulations apply to the correct data as opposed to generating a new instance (also used for dependency injection for 'gameRules')
    const player = playerManager(); //gain access to the module holding player methods (also used for dependency injection for 'gameRules')
    
    function printNewRound() {
        grid.printGrid();
    }

    function playRound(row, column) { 
        if (freezeGrid) {
            console.log("Grid is frozen!\nStart a new round or reset the game.")
            return
        }
        
        const activePlayerIndex = player.getActivePlayer(); //access the player-index to target the correct player's dataset (not at the module level due to 'minimal knowledge/law of demeter' principle)
        const playerSymbol = player.getValue(activePlayerIndex); // (not in module-scope due to 'minimal knowledge/Law of Demeter')

        const moveValid = grid.setValue(row, column, playerSymbol); //this feels like bypassing the accessor-properties - I'm accessing the 'players' array directly here no?
        if (!moveValid) {
            console.log("Try Again!");
            return;
        }

        //↓ handle checks of the grid with the rules 
        const rules = gameRules(gameGrid, player);
            const roundStatus = rules.checkRoundScenarios();
        printNewRound();

        if (roundStatus === "win" || roundStatus === "draw" || roundStatus === "game over") {
            freezeGrid = true;
        }
        if (roundStatus === "game over") { // Game over
            console.log("Game concluded.")
            console.log(`${player.getName(activePlayerIndex)} won two rounds! Finito!`)
            console.log("To reset: game.resetGame()")
            return;
        }
        if (roundStatus === "win") { // Round over
            console.log("Round concluded.");
            console.log(`${player.getName(activePlayerIndex)} won the round!\nThey have now won ${player.getWins(activePlayerIndex)} round(s).`);
            console.log("To continue: game.newRound()\nTo reset: game.resetGame()");
            return;
        };
        if (roundStatus === "draw") { // Round over
            console.log("Round concluded.");
            console.log("Draw!\nNo player get's a point.")
            console.log("To continue: game.newRound()\nTo reset: game.resetGame()")
            return;
        };
    

        player.switchTurn();
    };

    const resetGame = () => {
        grid.resetGameGrid();
        player.resetPlayersData();
        console.log("Game has been reset!");
        printNewRound();
    };

    const newRound = () => {
        grid.resetGameGrid();
        console.log("New round started!");
        printNewRound();
    };

    printNewRound();

    return {grid, player, playRound, resetGame, newRound};
}

function screenController() {
    // initialise - DOM elements
    const gridDiv = document.querySelector('.grid'); 
        const game = gameController(); // initialise - get the correct instance (get the data that's being manipulated rather than creating a new data-set)
        const grid = game.grid; 
        const gameGrid = grid.getGameGrid();
    const playerTurnDiv = document.querySelector('.turn')
        const player = playerManager();

    const updateScreen = () => {
        gridDiv.textContent = ""; //don't keep snapshots of each move (if I want to keep the snapshot of a concluded-round, having a system with this seems like the move)

        const activePlayerIndex = player.getActivePlayer(); // initialise (not in module-scope due to 'minimal knowledge/Law of Demeter')
        playerTurnDiv.textContent = `${player.getName(activePlayerIndex)}'s turn...`;
    
        // generate 3x3 grid & make cells responsive to clicks 
        gameGrid.forEach((row, rowIndex) => {
            // initialise
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row');

            row.forEach((cell, columnIndex) => {
                // initialise 
                const cellButton = document.createElement('button');
                    cellButton.classList.add('cell');

                // unique cell ID
                cellButton.dataset.row = rowIndex;  
                cellButton.dataset.column = columnIndex;

                // display player.value's as 'symbols'
                const cellValue = cell.getValue(); 

                if (cellValue === 1) {cellButton.textContent = 'X';}
                    else if (cellValue === 2) {cellButton.textContent = 'O';}
                    else {cellButton.textContent = '';}

                // handle events
                cellButton.addEventListener('click', () => {
                    game.playRound(rowIndex, columnIndex);
                    updateScreen();
                });
            rowDiv.appendChild(cellButton);
            
            });
        gridDiv.appendChild(rowDiv);
        
        });
    };
    
    updateScreen();
}
screenController();

