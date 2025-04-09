console.log("Welcome to Tic-Tac-Toe! To target a cell, apply two numbers as arguments (row, column) to 'game.playRound()'.")

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

    const players = [
        {name: playerOneName, value: 1},
        {name: playerTwoName, value: 2}
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    function printNewRound() {
        grid.printGrid();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    function playRound(row, column) {  

        const moveValid = grid.setValue(row, column, `${getActivePlayer().value}`);
        if (!moveValid) {
            console.log("Try Again!");
            return;
        }

        console.log(`VALID MOVE: ${getActivePlayer().name} claimed the cell from row-${row}/column-${column} and turned it to ${getActivePlayer().value}!`);

        //logic to handle a winner
            //horizontal win-condition  
            //vertical win-condition
            //diagonal win-condition

        switchPlayerTurn();
        printNewRound();
    };


    printNewRound();

    return {playRound, getActivePlayer};
}

const game = gameController();