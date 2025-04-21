console.log("Welcome to Tic-Tac-Toe, best of 3!\nTo target a cell, apply a set of numbers (row, column)\nTo 'game.playRound()'. Example: game.playRound(1,1).")

function gameboard() {
    gameGrid = [];

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

    const resetGameGrid = () => {
        generateGameGrid();
    };

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

function gameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    const grid = gameboard();
    const gameGrid = grid.getGameGrid();

    const players = [
        {name: playerOneName, value: 1, wins: 0},
        {name: playerTwoName, value: 2, wins: 0}
    ];
    const resetPlayersData = () => {
     players[0].name = playerOneName;
     players[1].name = playerTwoName;
     players[0].wins = 0;
     players[1].wins = 0;
    };

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        console.log(`${getActivePlayer().name}'s turn.`)
    };
    const getActivePlayer = () => activePlayer;

    function printNewRound() {
        grid.printGrid();
    }

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

        const player1Won = winScenarios(players[0].value);
        const player2Won = winScenarios(players[1].value);

        const isGridFull = () => {
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
            //check the obvious (no more valid moves)
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

    const scenarios = conditionsRoundScenarios(); //get access to win and draw scenarios

    const checkRoundScenarios = () => {
        if (scenarios.checkWin(getActivePlayer().value)) { //Round over
            getActivePlayer().wins++;
            if (getActivePlayer().wins === 2) { //Game over
                return;
            };
            return "win";
        }
        if (scenarios.checkDraw()) { //Round over
            console.log("Game over! Draw!")
            return "draw";
        }
        return "continue";
    }; 

    function playRound(row, column) {  
        const moveValid = grid.setValue(row, column, getActivePlayer().value); 
        if (!moveValid) {
            console.log("Try Again!");
            return;
        }
        //console.log(`VALID MOVE: ${getActivePlayer().name} claimed the cell from row-${row}/column-${column} and turned it to ${getActivePlayer().value}!`);

        //manageRoundScenarios
        const getRoundStatus = checkRoundScenarios();
        if (getRoundStatus === "win" || getRoundStatus === "draw" || getActivePlayer().wins === 2) { //Round over
            printNewRound();
            

            if (getActivePlayer().wins === 2) { //Game over
                console.log("Game concluded.");
                console.log(`${getActivePlayer().name} won two rounds! That's game over!`)
                console.log("To reset: game.resetGame()")
                return;
            };

            console.log("Round concluded.");
            if (getRoundStatus === "win") { //Round over
                console.log(`${getActivePlayer().name} won the round!\nThey have now won ${getActivePlayer().wins} round(s).`)
                console.log("To continue: game.newRound()\nTo reset: game.resetGame()")
                return;
            };

            if (getRoundStatus === "draw") { //Round over
                console.log("Draw!\nNo player get's a point.")
                console.log("To continue: game.newRound()\nTo reset: game.resetGame()")
                return;
        };
    }
        switchPlayerTurn();
        printNewRound();
    };

    const resetGame = () => {
        grid.resetGameGrid();
        resetPlayersData();
        activePlayer = players[0];
        console.log("Game has been reset!");
        printNewRound();
    };

    const newRound = () => {
        grid.resetGameGrid();
        activePlayer = players[0];
        console.log("Game has been reset!" );
        printNewRound();
    };

    printNewRound();

    return {playRound, getActivePlayer, resetGame, newRound};
}

const game = gameController();
