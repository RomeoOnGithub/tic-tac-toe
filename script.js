const gameboard = (() => {
    let gameGrid = []
    let initialized = false
    let gridRows = 3
    let gridColumn = 3

    const getGridArray = () => gameGrid //Do I need this? Feel like it just returns an uninitialized array
    const generateGameGrid = () => {
        for (let rows = 0; rows < gridRows; rows++) {
            gameGrid[rows] = [];

            for (let columns = 0; columns < gridColumn; columns++) {
                gameGrid[rows].push(gridCell.createCell());
            }
        }
    }
    const initializeGameGrid = () => { //lazy initialization (allows the same instance of 'gameGrid' to be referenced, regardless of timing issues presented by IIFE)
        if (!initialized) {
            generateGameGrid()
            initialized = true
        }
    }
    const getGameGrid = () => {
        initializeGameGrid()
        return gameGrid
    }
    const resetGameGrid = () => {
        gameGrid = []
        generateGameGrid()
    }
    function setValue(row, column, player) {
        if (gameGrid[row][column].getValue() !== 0) {
            console.log("INVALID: that cell is already populated!")
            return false;
        }
        gameGrid[row][column].setValue(player);
        return true;
    }

    return {getGridArray, getGameGrid, resetGameGrid, setValue}
})()

const gridCell = (() => {
    const createCell = () => {
        let value = 0

        const setValue = (player) => {
            value = player
        }
        const getValue = () => value

        return {setValue, getValue}
    }
    return {createCell}
})()

const playerManager = ((playerOneName = "Player One", playerTwoName = "Player Two") => {
    const players = [ //TODO: add a 'picture' variable
        {name: playerOneName, value: 1, wins: 0}, 
        {name: playerTwoName, value: 2, wins: 0}
    ]

    const resetPlayersData = () => {
        players[0].name = playerOneName
        players[1].name = playerTwoName
        players[0].wins = 0
        players[1].wins = 0
        activePlayerIndex = 0
    }

    const getName = playerIndex => players[playerIndex].name
    const getValue = playerIndex => players[playerIndex].value
    const getWinTally = playerIndex => players[playerIndex].wins
    const incrementWinTally = playerIndex => players[playerIndex].wins++

    let activePlayerIndex = 0;
    const switchTurn = () => {
        activePlayerIndex = activePlayerIndex === 0 ? 1 : 0
        console.log(getName(activePlayerIndex) + "'s turn.")
    }

    const getActivePlayer = () => activePlayerIndex

    return {
        getName, getValue, getWinTally, incrementWinTally,
        getActivePlayer, switchTurn,
        resetPlayersData,
    }
})()

const gameRules = (() => {
    player = playerManager //dependency

    const scenarioConditions = () => {
        gameGrid = gameboard.getGameGrid() //dependency

        const wins = (playerValue) => {
            function diagonal() {
                return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue) || //top-left to bottom-right
                        (gameGrid[2][0].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[0][2].getValue() === playerValue) //top-right to bottom-left 
            }
            function horizontal() {
                for (let row = 0; row < gameGrid.length; row++) {
                    const currentRow = gameGrid[row];

                    if (currentRow[0].getValue() === playerValue &&
                        currentRow[1].getValue() === playerValue &&
                        currentRow[2].getValue() === playerValue) {
                            return true
                        }
                }
                return false
            }
            function vertical() {
            return  (gameGrid[0][0].getValue() === playerValue && gameGrid[1][0].getValue() === playerValue && gameGrid[2][0].getValue() === playerValue) || //column1
                    (gameGrid[0][1].getValue() === playerValue && gameGrid[1][1].getValue() === playerValue && gameGrid[2][1].getValue() === playerValue) || //column2
                    (gameGrid[0][2].getValue() === playerValue && gameGrid[1][2].getValue() === playerValue && gameGrid[2][2].getValue() === playerValue)    //column3
            }
        return diagonal() || horizontal() || vertical() //if any of these return 'true', someone won the game
        }

        const player1Won = wins(player.getValue(0))
        const player2Won = wins(player.getValue(1)) 

        // ---- // 

        const fullGrid = () => { //if ALL cells are populated by player values, 1 or 2, and no win conditions return true - that represents a tie
            for (let rows = 0; rows < gameGrid.length; rows++) {
                for (let columns = 0; columns < gameGrid[rows].length; columns++) {
                    if (gameGrid[rows][columns].getValue() === 0) { //checks if any cell has the value 0 (no player value)
                        return false
                    }
                }
            }
            return true
        }

        const draw = () => {
            if (fullGrid()) {
                return !player1Won && !player2Won
            }
            return false
        }

        return {
            checkForWin: (playerValue) => wins(playerValue),
            checkForDraw: () => draw()
        }
    }

    const checkRoundScenarios = () => {
        const roundEndingScenarios = scenarioConditions()
        const activePlayerIndex = player.getActivePlayer()
        const playerSymbol = player.getValue(activePlayerIndex)

        //pre-game

        //in-game
        if (roundEndingScenarios.checkForWin(playerSymbol)) {
            player.incrementWinTally(activePlayerIndex)
            
            if (playerManager.getWinTally(activePlayerIndex) === 2) {
                return "game over";
            }
            return "round over"
        }
        if (roundEndingScenarios.checkForDraw()) {
            console.log("Round Over! Draw!")
            return "draw"
        }
        return "continue"

        //post-round

        //post-game
    }

    return {checkRoundScenarios}
})()

const gameController = (() => {
    const playRound = (row, column) => {
        //Dependencies
        const activePlayer = playerManager.getActivePlayer()
        const activePlayerValue = playerManager.getValue(activePlayer)

        //Prevent function if these constraints are present 
        if (flagManager.getFrozenGameGrid() === true) {
            console.log("Grid is frozen\nStart a new round or reset the game.")
            return "grid-frozen"
        }

        const moveValid = gameboard.setValue(row, column, activePlayerValue)
        if (!moveValid) {
            console.log("Try Again!")
            return "invalid move"
        }

        //Check the state of the grid as per gameRules
        const roundStatus = gameRules.checkRoundScenarios()
        if (roundStatus === "round over" || roundStatus === "draw" || roundStatus === "game over") {
            flagManager.setFrozenGameGrid(true);
        }
        if (roundStatus === "game over") {
            console.log("Game concluded")
            console.log(`${playerManager.getName(activePlayer)} won two round! Finito!`)
            return "game over"
        }
        if (roundStatus === "round over") {
            console.log("Round concluded.");
            console.log(`${playerManager.getName(activePlayer)} won the Round!\nThey have now won ${playerManager.getWinTally(activePlayer)} round(s).`)
            return "round over"
        }
        if (roundStatus === "draw") {
        console.log("Round concluded.")
        console.log("Draw!\nNo player get's a point.")
        return "draw"
    }
    playerManager.switchTurn()
    return "continue"
    }
    return {playRound}
})()

const flagManager = (() => { //flags used across modules
    const flags = {
        buttonClicked: 
            {startGame: false, 
            nextRound: false,
            resetGame: false},
        gameStates: 
            {preGame: true,
            inGame: false,
            postGame: false},
        gridState:
            {frozen: true}
    }

    const getFrozenGameGrid = () => flags.gridState.frozen
    const setFrozenGameGrid = (value) => flags.gridState.frozen = value
    const getGameStateFlags = () => flags.gameStates

    const setButtonFlags = (startGame, nextRound, resetGame) => {
        flags.buttonClicked.startGame = startGame
        flags.buttonClicked.nextRound = nextRound
        flags.buttonClicked.resetGame = resetGame
    }
    const setGameStateFlags = (statePreGame, stateInGame, statePostGame) => {
        flags.gameStates.preGame = statePreGame
        flags.gameStates.inGame = stateInGame
        flags.gameStates.postGame = statePostGame
    }
    return {
        getGameStateFlags, getFrozenGameGrid,
        setFrozenGameGrid, getFrozenGameGrid, setButtonFlags, setGameStateFlags}
})()

const componentManager = (() => {
    //OG COLUMN
     const columnsContainer = (() => {
        let container = null 
        const create = () => {
            container = document.createElement('div')
            container.id = "container"
            document.body.appendChild(container)
        }
        const remove = () => {
            container.remove()
            container = null
        }
        return {
            create, remove,
            getContainer: () => container
        }
    })()
    //COLUMN1 
    //COLUMN2
    const column2Container = (() => {
        let container = columnsContainer.getContainer()
        let column2Container = null 
        const create = () => {
            if (!container) {
                columnsContainer.create()
                container = columnsContainer.getContainer() //no longer null - so this gets the rendered reference, allowing this to get appended
            }
            if (!column2Container) {
                column2Container = document.createElement('div')
                column2Container.id = "column2" 
                container.appendChild(column2Container)
            }
        }
        const remove = () => {
            column2Container.remove()
            column2Container = null
        }

        return {
            create, remove,
            getColumn2Container: () => column2Container
        }
    })()
    const gameStateContainer = (() => {
        let container = column2Container.getColumn2Container()
        let gameStateContainer = null 
        let introductionContainer = null
        let stateContainer = null
        let stateMessages = {
            preGame: "Let's Play!",
            inGame: "Game On!",
            postRound: "Round Concluded!",
            postGame: "Game Over!",
        } 

        const create = () => {
            if (!container && !gameStateContainer) {
                column2Container.create()

                gameStateContainer = document.createElement('div')
                gameStateContainer.classList.add('game-state-indicators')
                column2Container.getColumn2Container().appendChild(gameStateContainer)
            }
            if (!introductionContainer) {
                introductionContainer = document.createElement('div')
                introductionContainer.id = "introduction"
                introductionContainer.textContent = "Tic Tac Toe"
                gameStateContainer.appendChild(introductionContainer)
            }
            if (!stateContainer) {
                stateContainer = document.createElement('div')
                stateContainer.id = "state"
                gameStateContainer.appendChild(stateContainer)
            }
        }
        const changeState = (state) => {
            stateContainer.textContent = stateMessages[state]
            return stateMessages[state]
        }
        const remove = () => {
            column2Container.remove()
            gameStateContainer.remove()
            gameStateContainer = null

            introductionContainer.remove()
            introductionContainer = null

            stateContainer.remove()
            stateContainer = null
        }
        return {
            create, remove,
            changeState
        }
    })()
    const gridContainer = (() => {
        let gridContainer = null
        const create = () => {
            if (!gridContainer) {
                    gridContainer = document.createElement('div')
                    gridContainer.classList.add('grid')
                    column2Container.getColumn2Container().appendChild(gridContainer)
                }
        }
        const remove = () => {
            gridContainer.remove()
            gridContainer = null
        }
        return {
            create, remove,
            getContainer: () => gridContainer
        }
    })()

    const activePlayerIndicator = (() => {
        let playerTurnContainer = null //will hold a DOM reference
        let playerOneSymbol = null
        let playerTwoSymbol = null

        const create = () => {
            playerTurnContainer = document.createElement('div')
            playerTurnContainer.classList.add('turn')
            column2Container.getColumn2Container().appendChild(playerTurnContainer)

            playerOneSymbol = document.createElement('div')
                playerOneSymbol.textContent = `${playerManager.getValue(0)}`
                playerOneSymbol.classList.add('player-symbol', 'player1-symbol')
            playerTwoSymbol = document.createElement('div')    
                playerTwoSymbol.textContent = `${playerManager.getValue(1)}`
                playerTwoSymbol.classList.add('player-symbol', 'player2-symbol')

            playerTurnContainer.appendChild(playerOneSymbol)
            playerTurnContainer.appendChild(playerTwoSymbol)
        }
        const remove = () =>  {
            playerTurnContainer.remove()
            playerTurnContainer = null //revert back to null - preventing memory leaks, I think?
            playerOneSymbol = null
            playerTwoSymbol = null
        }
        return {
            triggerCreation: create,
            triggerRemoval: remove,
        }
    })()
    const gameGrid = (() => {
        const create = () => {
            gridContainer.create()
            const container = gridContainer.getContainer()
            //gridContainer = document.querySelector('.grid')
            gameboard.getGameGrid() //make sure 'gameboard > gameGrid' (array) no longer has an empty array, I think?

            gameboard.getGridArray().forEach((row, rowIndex) => {
                const rowDiv = document.createElement('div')
                rowDiv.classList.add('row')

                row.forEach((cell, columnIndex) => {
                    const cellButton = document.createElement('button')
                    cellButton.classList.add('cell')

                    cellButton.dataset.row = rowIndex //unique ID (identify a cell through it's row & column ID)
                    cellButton.dataset.column = columnIndex

                    if (cell.getValue() === 1) {cellButton.textContent = 'X'}
                    else if (cell.getValue() === 2) {cellButton.textContent = 'O'}

                    rowDiv.appendChild(cellButton)
                })
                container.appendChild(rowDiv)
            })
        }
        const remove = () => {
            const container = gridContainer.getContainer()
            container.replaceChildren()
        }
        return {
            triggerCreation: create,
            triggerRemoval: remove
        }
    })()
    //COLUMN 3
    const column3Container = (() => {
        let container = columnsContainer.getContainer()
        let column3Container = null 
        const create = () => {
            if (!container) {
                columnsContainer.create()
                container = columnsContainer.getContainer() //no longer null - so this gets the rendered reference, allowing this to get appended
            }
            if (!column3Container) {
                column3Container = document.createElement('div')
                column3Container.id = "column3" 
                container.appendChild(column3Container)
            }
        }
        const remove = () => {
            column3Container.remove()
            column3Container = null
        }

        return {
            create, remove,
            getColumn3Container: () => column3Container
        }
    })()
    const gameMenu = (() => {
        let gameMenuContainer = null 
        let gameInfoContainer = null
        let gameOptionsContainer = null
        let gameOptionsHeader = null
        let listContainer = null

        const create = () => {
            //Grandparent container
            if (!column3Container.getColumn3Container()) {
                column3Container.create()
            }
            //Parent Container
            gameMenuContainer = document.createElement('div')
            gameMenuContainer.id = 'game-menu'
            column3Container.getColumn3Container().appendChild(gameMenuContainer)

            //Info Container
            gameInfoContainer = document.createElement('div')
            gameInfoContainer.classList.add('game-info')
            gameMenuContainer.appendChild(gameInfoContainer)
                //text
            gameInfoContainer.textContent = 
                "Welcome mandem, to Tic Tac Toe."

            //Options Container
            gameOptionsContainer = document.createElement('fieldset')
            gameOptionsContainer.classList.add('game-options')
            gameMenuContainer.appendChild(gameOptionsContainer)
                //container title
            gameOptionsHeader = document.createElement('legend')
            gameOptionsHeader.textContent = "select desired game options"
            gameOptionsContainer.appendChild(gameOptionsHeader)
                //container format: vertical rather than horizontal via list element
            listContainer = document.createElement('ul')
            gameOptionsContainer.appendChild(listContainer)
                //object-constructor for generating option buttons to the container
           function generateGameOption(Text, For, Class, Type, Name, Value) { //capital letters to mitigate reserved keywords
                const listItem = document.createElement('li')
                const inputLabel = document.createElement('label')
                const inputItem = document.createElement('input')

                inputLabel.htmlFor = For //'htmlFor' because 'for' is reserved
                inputLabel.textContent = Text

                inputItem.id = For;
                inputItem.className = Class; // 'className' because class is a reserved keyword
                inputItem.type = Type;
                inputItem.name = Name;
                inputItem.value = Value;
            
                inputLabel.appendChild(inputItem);
                listItem.appendChild(inputLabel);
                listContainer.appendChild(listItem);
            } //constructor could be moved to a seperate module, but I just don't have many constructors so it seems redundant to do so 
            generateGameOption("Player vs Player", "1option1", "game-option", 'radio', 'selected-players', 'pVSp')
            generateGameOption("Player vs Computer", "1option2", "game-option", 'radio', 'selected-players', 'pVSc')
            generateGameOption("Computer vs Computer", "1option3", "game-option", 'radio', 'selected-players', 'cVSc')
            generateGameOption("Randomise starting player", "2option1", "game-option", 'checkbox', 'randomise-starting-player', 'randomise')
        }
        const remove = () => {
            gameMenuContainer.remove()
            gameMenuContainer = null 
            gameInfoContainer = null
            gameOptionsContainer = null
            gameOptionsHeader = null
            listContainer = null
        }
        return {
            triggerCreation: create,
            triggerRemoval: remove,
        }
    })()
    const gameButtons = (() => {
        let gameButtonsContainer = null 
        let buttons = {} //an object because the buttons are created via a constructor and can be grouped as a set which helps storage and reference handling for two other constructors  
            //object-constructor for game-flow/control buttons
        function generateButtons(buttonID, Class, Text) {
            if (!gameButtonsContainer) { //create its container (only once, this avoids duplications)
                gameButtonsContainer = document.createElement('div')
                gameButtonsContainer.classList.add('game-buttons')
                column3Container.getColumn3Container().appendChild(gameButtonsContainer)
            }
            const button = document.createElement('button')
            button.id = buttonID
            button.classList.add(Class)
            button.textContent = Text

            gameButtonsContainer.appendChild(button)
            return button
        }

        const addButton = (Name, ID, text) => {
            buttons[Name] = generateButtons(ID, 'game-button', text)
            return buttons[Name]
        }
        const removeButton = (Name) => {
            if (buttons[Name]) { //this safety will mitigate an error being thrown if for example 'reset' is clicked before 'next round' is rendered
                buttons[Name].remove() //remove the DOM referencing the 'buttons' object-variable
                delete buttons[Name] //remove the 'buttons' object-variable itself
            }

        }
        return {
            create: {
                startButton: () => addButton('start', 'startGameButton', 'Start Game'),
                nextRoundButton: () => addButton('nextRound', 'nextRoundButton', 'Next Round'),
                resetGameButton: () => addButton('reset', 'resetGameButton', 'Reset Game'),
                menuButton: () => addButton('menu', 'returnToMenu', 'Return to Menu')
            },
            remove: {
                startButton: () => removeButton('start'),
                nextRoundButton: () => removeButton('nextRound'),
                resetGameButton: () => removeButton('reset'),
                menuButton: () => removeButton('menu'),
            },
        }
    })()
    const refresh = {
        grid() {
            gameGrid.triggerRemoval()
            gameGrid.triggerCreation()
            //remover.gameGrid()
            //renderer.gameGrid()
        },
        activePlayer() {
            //DOM Dependencies
            const playerOne = document.querySelector('.player1-symbol')
            const playerTwo = document.querySelector('.player2-symbol')

            //if (!playerOne || !playerTwo) return //mitigate timing errors?

            if (playerManager.getActivePlayer() === 0) { //remember '0' is player 1
                playerOne.setAttribute("data-isActive", "true")
                playerTwo.setAttribute("data-isActive", "false")
            }
            if (playerManager.getActivePlayer() === 1) {
                playerOne.setAttribute("data-isActive", "false")
                playerTwo.setAttribute("data-isActive", "true")
            }
            //↑ can instead be written with ternary operators if .getActivePlayer() is held by a variable
        },
    }
    const gameState = { //remove other elements and render the ones related to the current gameState
        preGame() {
            //column2
            //gameStateContainer.changeState("preGame") //needs column2 elements to render first
            
            //column3
            gameMenu.triggerCreation()
            gameButtons.create.startButton()
        },
        inGame() {
            //column2
            gameStateContainer.create()
            gameStateContainer.changeState("inGame")
            activePlayerIndicator.triggerCreation()
            gameGrid.triggerCreation()
        
            //column3
            //TODO: 'round snapshot' feature
            gameMenu.triggerRemoval()
            gameButtons.remove.startButton()
            gameButtons.create.resetGameButton()
        },
        postRound() {
            //column2
            gameStateContainer.changeState("postRound")
            //column3
            //TODO: 'round snapshot' feature
            gameButtons.create.nextRoundButton()
        },
        postGame() {
            //column2
            gameStateContainer.changeState("postGame")
            //TODO: 'round snapshot' feature
        },
    }
    return {column2Container, gameStateContainer, activePlayerIndicator, gameGrid, gameMenu, gameButtons, refresh, gameState}
})()

const screenController = (() => {
    componentManager.gameState.preGame() //initial frame

    //listen for all clicks
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('game-button')) {
            handleGameButtonClick(event)
        }
        if (event.target.classList.contains('cell')) {
            handleCellClick(event)
        }
    })

    const handleGameButtonClick = (event) => {
        if (event.target.id === 'startGameButton') {
            startGame()
        }
        if (event.target.id === 'nextRoundButton') {
            nextRound()
        }
        if (event.target.id === 'resetGameButton') {
            resetGame()
        }
    }
        //make explicit the functionality of 'game-flow buttons' 
        const startGame = () => {
            // update flags
            flagManager.setGameStateFlags(false, true, false)
            flagManager.setFrozenGameGrid(false)
            // render new frame
            componentManager.gameState.inGame() //render the frame with all elements related to this game-state
            // render and 'activate' (instantiate) active-player-indicator
            componentManager.refresh.activePlayer()

            console.log("A new game has begun!")
        }
        const nextRound = () => {
            // update flags
            flagManager.setGameStateFlags(false, true, false)
            flagManager.setFrozenGameGrid(false)
            // reset
            gameboard.resetGameGrid()
            // render new frame
            componentManager.gameButtons.remove.nextRoundButton() 
            componentManager.refresh.grid()
            componentManager.refresh.activePlayer()
            componentManager.gameStateContainer.changeState('inGame')

            console.log("A new round has started!")
        }
        const resetGame = () => {
            // update flags
            flagManager.setGameStateFlags(true, false, false)
            flagManager.setFrozenGameGrid(false)
            // reset data
            playerManager.resetPlayersData()
            gameboard.resetGameGrid()
            // render new frame
            componentManager.refresh.grid()
            componentManager.refresh.activePlayer()
            componentManager.gameButtons.remove.nextRoundButton() //if the round hasn't concluded (and therefore the 'next round' button hasn't rendered) - this will throw an error message (if it wasn't for the safety in the 'removeButton' method)
            componentManager.gameStateContainer.changeState('inGame')

            console.log("↪️ The game has been reset!")
        }
        const returnToMenu = () => { //TODO
            componentManager.gameState.preGame()
        }
        
    const handleCellClick = (event) => {
        // make move
        const row = event.target.dataset.row
        const column = event.target.dataset.column
        const roundStatus = gameController.playRound(row, column) //make the move but also capture return values from 'gameController' (which is why a variable is attached) which can be used for UI updates
        // check for UI updates dependent on the round status
        if (roundStatus === "round over" || roundStatus === "draw") {
            componentManager.gameState.postRound()
        }
        if (roundStatus === "game over") {
            componentManager.gameState.postGame()
        }
        // refresh frame
        componentManager.refresh.grid()
        componentManager.refresh.activePlayer()
    }
})()