console.log("Welcome to Tic-Tac-Toe! To target a cell, apply two numbers as arguments (row, column) to 'game.playRound()'. Example: game.playRound(1,1).")

function gameboard() {
    gameGrid = [];

    let gridRows = 3;
    let gridColumns = 3;

    for (let r = 0; r < gridRows; r++) {
        gameGrid[r] = [];
        
        for (let c = 0; c < gridColumns; c++) {
            gameGrid[r].push(cellValue());
        };
    };

    const getGameGrid = () => gameGrid;

    const setValue = function(row, column, player) {
        if (gameGrid[row][column].getValue() !== 0) {
            console.log("INVALID MOVE: That cell is already populated!");
            return false;
        }

        gameGrid[row][column].setValue(player);
        return true;
    };

    const printGrid = () => {
        const cellsOfGameGrid = gameGrid.map((row) => row.map((cell) => cell.getValue()));
    
        console.log(cellsOfGameGrid); 
    }

    return {getGameGrid, setValue, printGrid};
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
        {name: playerOneName, value: 1},
        {name: playerTwoName, value: 2}
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const getActivePlayer = () => activePlayer;

    function printNewRound() {
        grid.printGrid();
    }

    function playRound(row, column) {  

        const moveValid = grid.setValue(row, column, `${getActivePlayer().value}`); 
        if (!moveValid) {
            console.log("Try Again!");
            return;
        }

        console.log(`VALID MOVE: ${getActivePlayer().name} claimed the cell from row-${row}/column-${column} and turned it to ${getActivePlayer().value}!`);

        //utility-functions for checking cell values for possible win-scenarios 
        function diagonalWinConditions(playerValue) { //2 diagonal win scenarios
            return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue) ||
                    (gameGrid[2][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[0][2].getValue() === playerValue);
        };
        function horizontalWinCondition(playerValue) { //3 horizontal (row) win scenarios
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
        function verticalWinConditions(playerValue) {//3 vertical (column) win scenarios
            return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][0].getValue() === playerValue && gameGrid[2][0].getValue() === playerValue) || //column 1
                    (gameGrid[0][1].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][1].getValue() === playerValue) || //column2
                    (gameGrid[0][2].getValue() === playerValue && gameGrid[1][2].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue); //column3
        };

        if (diagonalWinConditions("1")) {
            console.log("Player1 won diagonally!");
            return;
            } 
        else if (diagonalWinConditions("2")) {
            console.log("Player2 won diagonally!");
            return;
        };
        if (horizontalWinCondition("1")) {
            console.log("Player1 won horizontally by dominating row 'x'!");
            return;
            }
        else if (horizontalWinCondition("2")) {
            console.log("Player2 won horizontally by dominating row 'x'!");
            return;
        };
        if (verticalWinConditions("1")) {
            console.log("Player1 won vertically by dominating column 'x'");
            return;
            }
        else if (verticalWinConditions("2")) {
            console.log("Player2 won vertically by dominating column 'x'");
            return;
        };


        switchPlayerTurn();
        printNewRound();
    };


    printNewRound();

    return {playRound, getActivePlayer};
}

const game = gameController();
