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
        {name: playerOneName, value: 'X', wins: 0}, 
        {name: playerTwoName, value: 'O', wins: 0}
    ]
    const avatars = {
        human1: 'images/avatars/a1.svg',
        human2: 'images/avatars/a2.svg',
        human3: 'images/avatars/a3.svg',
        human4: 'images/avatars/a4.svg',
        human5: 'images/avatars/a5.svg',
        human6: 'images/avatars/a6.svg',
        human7: 'images/avatars/a7.svg',
        human8: 'images/avatars/a8.svg',
        human9: 'images/avatars/a9.svg',
        human10: 'images/avatars/a10.svg',
        human11: 'images/avatars/a11.svg',
        human12: 'images/avatars/a12.svg',
        human13: 'images/avatars/a13.svg',
        human14: 'images/avatars/a14.svg',
        human15: 'images/avatars/a15.svg',
        human16: 'images/avatars/a16.svg',
        human17: 'images/avatars/a17.svg',
        human18: 'images/avatars/a18.svg',
        human19: 'images/avatars/a19.svg',
    }

    const createAvatarSelector = () => {

    }

    const resetPlayersData = () => {
        players[0].name = playerOneName
        players[1].name = playerTwoName
        players[0].wins = 0
        players[1].wins = 0
        activePlayerIndex = 0
    }

    const getName = playerIndex => players[playerIndex].name
    const getValue = playerIndex => players[playerIndex].value
    const getAvatar = playerIndex => players[playerIndex].avatar
    const getWinTally = playerIndex => players[playerIndex].wins
    const incrementWinTally = playerIndex => players[playerIndex].wins++

    let activePlayerIndex = 0;
    const switchTurn = () => {
        activePlayerIndex = activePlayerIndex === 0 ? 1 : 0
        console.log(getName(activePlayerIndex) + "'s turn.")
    }

    const getActivePlayer = () => activePlayerIndex

    return {
        avatars, getName, getValue, getWinTally, incrementWinTally,
        getActivePlayer, switchTurn,
        resetPlayersData, 
        resetActivePlayer: () => activePlayerIndex = 0,
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

const componentManager = (() => { //aka DOMManager
     const bodyContainer = (() => { //houses all dynamic content
        const parentContainer = document.getElementById('body')
        let container = null 
        const create = () => {
            container = document.createElement('div')
            container.id = "container"
            parentContainer.appendChild(container)
        }
        return {
            create,
            getContainer: () => container
        }
    })()
    //B-COLUMN1
    //Event-Messages
    const gameStateMessages = (() => {
        const container = document.getElementById('game-state-indicator')
        let stateMessages = {
            preGame: "Let's Play Tic-Tac-Toe!",
            inSettings: "Configure Your Game",
            inGame: "Game on! Best of *x*",
            postRound: "Round Ended!",
            postGame: "Game Over! *losing player* is wack at this tbh"
        }
        const updateStateMessage = (gameState) => {
            container.textContent = stateMessages[gameState]
            return stateMessages[gameState]
        } 

        const create = (gameState) => {
            if (gameState === 'preGame') {
                targetContainer.textContent = '' //clear
                targetContainer.textContent = "Let's Play Tic-Tac-Toe!"       
            }
            if (gameState === 'configurating') {
                targetContainer.textContent = ''
                targetContainer.textContent = "Configure Your Game"
            }
            if (gameState === 'inGame') {
                targetContainer.textContent = ''
                targetContainer.textContent = "Game on! Best of *x*"
            }
            if (gameState === 'postRound') {
                targetContainer.textContent = ''
                targetContainer.textContent = "Round Ended!"
            }
            if (gameState === 'postGame') {
                targetContainer.textContent = ''
                targetContainer.textContent = "Game Over! *losing player* is wack at this tbh"
            }
        }
        return {updateStateMessage}
    })()
    const configurationsContainer = (() => {
        const parentContainer = document.getElementById('b-column1')
        let container  = null

        const create = () => {
            container = document.createElement('div')
            container.id = 'pre-game-options'
            parentContainer.appendChild(container)

            //container to house a set of player-options
            playerOptions = document.createElement('div')
            playerOptions.id = 'player-options'
            container.appendChild(playerOptions)
            
            //player1 options container
            playerOneOptions = document.createElement('fieldset') 
            playerOneOptions.id = 'player-one-options'
            playerOptions.appendChild(playerOneOptions)
                //container header
            playerOneOptionsHeader = document.createElement('legend')
            
            playerOneOptionsHeader.textContent = "Player Options"
            playerOneOptions.appendChild(playerOneOptionsHeader)
                //options container
            playerOneOptionsList = document.createElement('ul') //container format: vertical rather than horizontal via list element
            playerOneOptions.appendChild(playerOneOptionsList)

            //player2 options container
            playerTwoOptions = document.createElement('fieldset') 
            playerTwoOptions.id = 'player-two-options'
            playerOptions.appendChild(playerTwoOptions)
                //container header
            playerTwoOptionsHeader = document.createElement('legend')
            playerTwoOptionsHeader.textContent = "Player Options"
            playerTwoOptions.appendChild(playerTwoOptionsHeader)
                //options container
            playerTwoOptionsList = document.createElement('ul')
            playerTwoOptions.appendChild(playerTwoOptionsList)

            //game options container
            gameSettingsContainer = document.createElement('fieldset')
            gameSettingsContainer.id = 'game-options'
            container.appendChild(gameSettingsContainer)
                //game-options container header
            gameSettingsHeader = document.createElement('legend')
            gameSettingsHeader.textContent = "Game Options"
            gameSettingsContainer.appendChild(gameSettingsHeader)
                //opening-player-options container
            openingPlayerOptionsContainer = document.createElement('fieldset')
            openingPlayerOptionsContainer.id = 'opening-player'
            gameSettingsContainer.appendChild(openingPlayerOptionsContainer)
                //opening-player-options container header
            openingPlayerOptionsContainerHeader = document.createElement('legend')
            openingPlayerOptionsContainerHeader.textContent = 'Opening Player (per round)'
            openingPlayerOptionsContainer.appendChild(openingPlayerOptionsContainerHeader)
                //No. of Rounds options container
            numberOfRoundsOptionContainer = document.createElement('fieldset')
            numberOfRoundsOptionContainer.id = 'number-of-round-options-container'
            gameSettingsContainer.appendChild(numberOfRoundsOptionContainer)
                //No. of Rounds options container header
            numberOfRoundsOptionsContainerHeader = document.createElement('legend')
            numberOfRoundsOptionsContainerHeader.textContent = "No. of Rounds"
            numberOfRoundsOptionContainer.appendChild(numberOfRoundsOptionsContainerHeader)
                //Gamegrid-size option container
            gameBoardSizeOptionContainer = document.createElement('fieldset')
            gameBoardSizeOptionContainer.id = 'gameboard-size-options-container'
            gameSettingsContainer.appendChild(gameBoardSizeOptionContainer)
                //Gamegrid-size option container header
            gameBoardSizeOptionContainerHeader = document.createElement('legend')
            gameBoardSizeOptionContainerHeader.textContent = "Gameboard Size"
            gameBoardSizeOptionContainer.appendChild(gameBoardSizeOptionContainerHeader)
                //'special' options container 
            specialOptionsContainer = document.createElement('fieldset')
            specialOptionsContainer.id = 'special-options-container'
            gameSettingsContainer.appendChild(specialOptionsContainer)
                //'special' options container header
            specialOptionsContainerHeader = document.createElement('legend')
            specialOptionsContainerHeader.textContent = 'Special'
            specialOptionsContainer.appendChild(specialOptionsContainerHeader)


            gameSettingsList = document.createElement('ul') 
            gameSettingsContainer.appendChild(gameSettingsList)
            
            //factory for generating options
            function generateFormUI(Text, For, Class, Type, Name, Value, targetContainer) { //capital letters to mitigate reserved keywords
                const listItem = document.createElement('li')
                const inputLabel = document.createElement('label')
                const inputItem = document.createElement('input')

                inputLabel.htmlFor = For //'htmlFor' because 'for' is reserved

                inputItem.id = For
                inputItem.className = Class // 'className' because class is a reserved keyword
                inputItem.type = Type
                inputItem.name = Name
                inputItem.value = Value

                inputLabel.appendChild(inputItem)
                inputLabel.appendChild(document.createTextNode(Text)) //appending after the form-type allows the form-input to display *before* the text
                listItem.appendChild(inputLabel)
                
                targetContainer.appendChild(listItem)
            } //constructor could be moved to a seperate module, but I just don't have many constructors so it seems redundant to do so 
            generateFormUI("Human", "player1-is-human", "player-one-option", 'radio', 'player-one-type', 'Human', playerOneOptionsList)
            generateFormUI("AI", "player1-is-AI", "player-one-option", 'radio', 'player-one-type', 'AI', playerOneOptionsList)

            generateFormUI("Human", "player2-is-human", "player-two-option", 'radio', 'player-two-type', 'Human', playerTwoOptionsList)
            generateFormUI("AI", "player2-is-AI", "player-two-option", 'radio', 'player-two-type', 'AI', playerTwoOptionsList)

            generateFormUI("Random", "random-starting-player", "game-option", 'checkbox', 'starting-player', 'random', openingPlayerOptionsContainer)
            generateFormUI("Alternating", "alternating-starting-player", "game-option", 'checkbox', 'starting-player', 'alternating', openingPlayerOptionsContainer)
            generateFormUI("Round Winner", "round-winner-starting-player", "game-option", 'checkbox', 'starting-player', 'winner', openingPlayerOptionsContainer)
            generateFormUI("Round Loser", "round-loser-starting-player", "game-option", 'checkbox', 'starting-player', 'loser', openingPlayerOptionsContainer)
            generateFormUI("'Minesweeper'", "random-move-steal", "game-option", 'checkbox', 'minesweeper', 'minesweeperr', specialOptionsContainer)
            generateFormUI("", "number-of-rounds", "game-option", 'range', 'no.-rounds', 'roundss', numberOfRoundsOptionContainer)
            generateFormUI("", "board-size", "game-option", 'range', 'game-grid-size', 'grid-size', gameBoardSizeOptionContainer)
        }
        const remove = () => {
            if (container === null) {
                console.log("🔴 nothing to remove | configurations/settings container is empty")
                return
            }
            container.remove()
            container = null
        }
        return {create, remove}
    })()
    const roundSnapshotContainer = (() => {
        parentContainer = document.getElementById('b-column1')
        container = null 

        const create = () => { //gotta flesh this out, just a placeholder atm. 
            if (!container) {
                container = document.createElement('div')
                container.id = 'round-snapshots'
                container.textContent = "this will display round-snapshots"
                parentContainer.appendChild(container)
                return
            }
            console.log("avoided duplicate | round-snapshot container already exists")
            return
        }
        const remove = () => {
            if (container) {
                container.remove()
                container = null
            }
            console.log("nothing to remove | round-snapshot container doesn't exist")
        }
        return {create,remove}
    })()
    //B-COLUMN2
    const playerInfoContainer = (() => {
        let parentContainer = null
        let playerOneContainer = null
        let playerTwoContainer = null
        let playerStateContainer = null

        const create = () => {
            parentContainer = document.createElement('div')
            parentContainer.id = 'player-info' 
            
            playerOneContainer = document.createElement('div')
            playerOneContainer.id = 'player-one-container'
                //avatar
                playerOneAvatarContainer = document.createElement('div')
                playerOneAvatarContainer.id = 'player-one-avatar-container'
                    playerOneAvatarImage = document.createElement('img')
                    playerOneAvatarImage.id = "player-one-avatar"
                    playerOneAvatarImage.src = playerManager.avatars.human1
                    playerOneAvatarContainer.appendChild(playerOneAvatarImage)
                playerOneContainer.appendChild(playerOneAvatarContainer)
                //symbol
                playerOneSymbolContainer = document.createElement('div')
                playerOneSymbolContainer.id = 'player-one-symbol'
                playerOneSymbolContainer.textContent = `${playerManager.getValue(0)}`
                playerOneContainer.appendChild(playerOneSymbolContainer)
                //win-tally
                playerOneWinTallyContainer = document.createElement('div')
                playerOneWinTallyContainer.id = 'player-one-win-tally-container'
                playerOneContainer.appendChild(playerOneWinTallyContainer)


            playerTwoContainer = document.createElement('div')
            playerTwoContainer.id = 'player-two-container'
                //avatar
                playerTwoAvatarContainer = document.createElement('div')
                playerTwoAvatarContainer.id = 'player-two-avatar-container'
                    playerTwoAvatarImage = document.createElement('img')
                    playerTwoAvatarImage.id = "player-two-avatar"
                    playerTwoAvatarImage.src = playerManager.avatars.human2
                    playerTwoAvatarContainer.appendChild(playerTwoAvatarImage)
                playerTwoContainer.appendChild(playerTwoAvatarContainer)
                //symbol
                playerTwoSymbolContainer = document.createElement('div')
                playerTwoSymbolContainer.id = 'player-two-symbol'
                playerTwoSymbolContainer.textContent = `${playerManager.getValue(1)}`
                playerTwoContainer.appendChild(playerTwoSymbolContainer)
                //win-tally
                playerTwoWinTallyContainer = document.createElement('div')
                playerTwoWinTallyContainer.id = 'player-two-win-tally-container'
                playerTwoWinTallyContainer.textContent = `${playerManager.getWinTally(1)} win(s)`
                playerTwoContainer.appendChild(playerTwoWinTallyContainer)

            playerStateContainer = document.createElement('div')
            playerStateContainer.id = 'player-indicator-container'
            
            parentContainer.appendChild(playerOneContainer)
            parentContainer.appendChild(playerStateContainer)
            parentContainer.appendChild(playerTwoContainer) 
            document.getElementById('b-column2').appendChild(parentContainer)
        }
        const remove = () => {
            if (parentContainer) {
                parentContainer.remove()
                parentContainer = null
                console.log("removed | 'player-info'")
                return
            }
            console.log("nothing to remove | 'player-information' is not rendered")
        }
        return {
            create, remove,
            getPlayerOneContainer: () => playerOneContainer,
            getPlayerTwoContainer: () => playerTwoContainer,
            getPlayerStateContainer: () => playerStateContainer,
        }
        return {play}
    })()
    const gameGridContainer = (() => {
        const parentContainer = document.getElementById('b-column2')
        let gameGridContainer = null

        const create = () => {
            if (!gameGridContainer) {
                    gameGridContainer = document.createElement('div')
                    gameGridContainer.id = 'game-grid'
                    parentContainer.appendChild(gameGridContainer)
                }
        }
        return {
            create,
            remove: () => {
                if (gameGridContainer) {
                    gameGridContainer.remove()
                    gameGridContainer = null
                    console.log("removed | game-grid")
                    return
                }
                console.log("nothing to remove for game-grid")
            },
            getContainer: () => gameGridContainer
        }
    })()
    const gameGrid = (() => {
        const create = () => {
            gameGridContainer.create()
            const container = gameGridContainer.getContainer()
            //gameGridContainer = document.querySelector('.grid')
            gameboard.getGameGrid() //make sure 'gameboard > gameGrid' (array) no longer has an empty array, I think?

            gameboard.getGridArray().forEach((row, rowIndex) => { 
                const rowDiv = document.createElement('div')
                rowDiv.classList.add('row')

                row.forEach((cell, columnIndex) => {
                    const cellButton = document.createElement('button')
                    cellButton.classList.add('cell')

                    cellButton.dataset.row = rowIndex //unique ID (identify a cell through it's row & column ID), ++ for readability
                    cellButton.dataset.column = columnIndex

                    if (cell.getValue() !== 0) {
                        cellButton.textContent = cell.getValue()
                    }
                    rowDiv.appendChild(cellButton)
                })
                container.appendChild(rowDiv)
            })
        }
        const remove = () => {
            const container = gameGridContainer.getContainer()
            container.replaceChildren()
        }
        return {
            triggerCreation: create,
            triggerRemoval: remove
        }
    })()
    const gameButtons = (() => {
        const bodyColumn1Container = document.getElementById('b-column1')
        const bodyColumn2Container = document.getElementById('b-column2')
        let preGameButtonContainer = null
        let inGameButtonContainer = null 
        let buttons = {} //an object because the buttons are created via a constructor and can be grouped as a set which helps storage and reference handling for two other constructors  
            //object-constructor for game-flow/control buttons
        function generateButtons(buttonID, Class, Text, parentContainer) {
            let targetContainer;
            if (parentContainer === bodyColumn1Container) {
                if (!preGameButtonContainer) {
                    preGameButtonContainer = document.createElement('div')
                    preGameButtonContainer.id = 'pre-game-buttons'
                    bodyColumn1Container.appendChild(preGameButtonContainer)
                }
                targetContainer = preGameButtonContainer
            }

            if (parentContainer === bodyColumn2Container) {
                if (!inGameButtonContainer) {
                    inGameButtonContainer = document.createElement('div')
                    inGameButtonContainer.classList.add('game-buttons')
                    bodyColumn2Container.appendChild(inGameButtonContainer)
                }
                targetContainer = inGameButtonContainer
            }

            const button = document.createElement('button')
            button.id = buttonID
            button.classList.add(Class)
            button.textContent = Text

            targetContainer.appendChild(button)
            return button
        }

        const addButton = (Name, ID, text, parentContainer) => {
            if (!document.getElementById(ID)) { //safety so that it doesn't duplicate when using 'menu' button
                buttons[Name] = generateButtons(ID, 'game-button', text, parentContainer)
                return buttons[Name]
            }
            console.log(`Avoided duplication| ${Name} already exists`)
        }
        const removeButton = (Name, parentContainer) => {
            if (buttons[Name]) { //this safety will mitigate an error being thrown if for example 'reset' is clicked before 'next round' is rendered
                buttons[Name].remove() //remove the DOM referencing the 'buttons' object-variable
                delete buttons[Name] //remove the 'buttons' object-variable itself
            }

        }
        return {
            create: {
                startButton: () => addButton('start', 'startGameButton', 'Start Game', bodyColumn1Container),
                nextRoundButton: () => addButton('nextRound', 'nextRoundButton', 'Next Round', bodyColumn2Container),
                resetGameButton: () => addButton('reset', 'resetGameButton', 'Reset Game', bodyColumn2Container),
                openSettingsButton: () => addButton('openSettings', 'open-settings', '⛭', bodyColumn1Container),
                saveSettingsButton: () => addButton('saveSettings', 'save-settings', 'Save Settings', bodyColumn1Container),
                returnFromSettingsButton: () => addButton('returnFromSettings', 'return-from-settings', 'Back', bodyColumn1Container),
            },
            remove: {
                startButton: () => removeButton('start', bodyColumn1Container),
                nextRoundButton: () => removeButton('nextRound'),
                resetGameButton: () => removeButton('reset'),
                preGameButtonsContainer: () => {preGameButtonContainer.remove(), preGameButtonContainer = null},
                inGameButtonsContainer: () => {
                    if (inGameButtonContainer) {
                        inGameButtonContainer.remove()
                        inGameButtonContainer = null
                        console.log("removed | inGameButtonContainer")
                        return
                    }
                    console.log("nothing to remove | inGameButtonContainer")
                },
                openSettingsButton: () => removeButton('openSettings'),
                saveSettingsButton: () => removeButton('saveSettings'),
                returnFromSettingsButton: () => removeButton('returnFromSettings'),
            },
        }
    })()
    const refresh = {
        grid() {
            gameGrid.triggerRemoval()
            gameGrid.triggerCreation()
        },
        activePlayer() { //dynamic active-player indicator
            const playerOne = document.getElementById("player-one-avatar-container")
            const turnIndicator =  document.getElementById('player-indicator-container')
            const playerTwo = document.getElementById("player-two-avatar-container")

            if (playerManager.getActivePlayer() === 0) { //remember '0' is player 1
                playerOne.setAttribute("data-isActive", "true")
                playerTwo.setAttribute("data-isActive", "false")
                turnIndicator.textContent = "Player One's Turn"
            }
            if (playerManager.getActivePlayer() === 1) {
                playerOne.setAttribute("data-isActive", "false")
                playerTwo.setAttribute("data-isActive", "true")
                turnIndicator.textContent = "Player Two's Turn"
            } //↑↑ can instead be written with ternary operators if .getActivePlayer() is held by a variable
            document.getElementById('player-one-win-tally-container').textContent = `${playerManager.getWinTally(0)} win(s)`
            document.getElementById('player-two-win-tally-container').textContent = `${playerManager.getWinTally(1)} win(s)`
        },
    }
    const gameState = { //remove other elements and render the ones related to the current gameState
        preGame() {
            gameStateMessages.updateStateMessage('preGame')
            gameButtons.create.startButton()
            gameButtons.create.openSettingsButton()
        },
        preGameSettings() {
            configurationsContainer.create()
        },
        inGame() {
            //gameStateContainer.create()
            gameStateMessages.updateStateMessage('inGame')
            //activePlayerIndicator.triggerCreation()
                playerInfoContainer.create()
            gameGrid.triggerCreation()
        
            roundSnapshotContainer.create()
            gameButtons.remove.preGameButtonsContainer()
            gameButtons.create.resetGameButton() //move the if-statement here, makes more sense imo
        },
        postRound() {
            gameStateMessages.updateStateMessage('postRound')
            //column3
            //TODO: 'round snapshot' feature
            gameButtons.create.nextRoundButton()
        },
        postGame() {
            gameStateMessages.updateStateMessage('postGame')
            //TODO: 'round snapshot' feature
        },
        reset() {
        //'unmount' b-column1 elements
        gameButtons.remove.saveSettingsButton()
        gameButtons.remove.returnFromSettingsButton()
        configurationsContainer.remove()
        roundSnapshotContainer.remove()

        //'unmount' b-column2 elements
        playerInfoContainer.remove()
        gameboard.resetGameGrid()
        playerManager.resetPlayersData()
        gameGridContainer.remove()
        gameButtons.remove.inGameButtonsContainer()
        //render menu frame
        componentManager.gameState.preGame()
        }
    }
    return {configurationsContainer, gameStateMessages, configurationsContainer, roundSnapshotContainer, playerInfoContainer, gameGridContainer, gameGrid, gameButtons, refresh, gameState}
})()

const screenController = (() => {
    componentManager.gameState.preGame() //initial frame
    document.getElementById('menu-button').addEventListener('click', () => { //adding functionality (reset) to static button/image
        componentManager.gameState.reset()
    })

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
        if (event.target.id === 'open-settings') {
            openSettings()
        }
            if (event.target.id === 'save-settings') {
                saveSettings()
            }
            if (event.target.id === 'return-from-settings') {
                returnFromSettings()
            }
    }
        //make explicit the functionality of 'game-flow buttons' 
        const startGame = () => {
            // update flags
            flagManager.setGameStateFlags(false, true, false)
            flagManager.setFrozenGameGrid(false)
            // render new frame
            componentManager.gameState.inGame() //render the frame with all elements related to this game-state
            componentManager.refresh.activePlayer()

            console.log("A new game has begun!")
        }
        const nextRound = () => {
            // update flags
            flagManager.setGameStateFlags(false, true, false)
            flagManager.setFrozenGameGrid(false)
            // reset
            gameboard.resetGameGrid()
            playerManager.resetActivePlayer()
            // render new frame
            componentManager.gameStateMessages.updateStateMessage('inGame')
            componentManager.gameButtons.remove.nextRoundButton() 
            componentManager.refresh.grid()
            componentManager.refresh.activePlayer() //because 'resetActivePlayer()' resets 'activePlayer` to player1 (to avoid UI misrepresenting active-player)

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
            componentManager.refresh.activePlayer() //because 'resetPlayersData()' resets 'activePlayer` to player1
            componentManager.gameStateMessages.updateStateMessage('inGame')
            componentManager.refresh.grid()
            componentManager.gameButtons.remove.nextRoundButton() //if the round hasn't concluded (and therefore the 'next round' button hasn't rendered) - this will throw an error message (if it wasn't for the safety in the 'removeButton' method)

            console.log("↪️ The game has been reset!")
        }
        const openSettings = () => {
            componentManager.gameButtons.remove.startButton()
            componentManager.gameButtons.remove.openSettingsButton()
            componentManager.gameButtons.create.saveSettingsButton()
            componentManager.gameButtons.create.returnFromSettingsButton()
            componentManager.configurationsContainer.create()
        }
            const saveSettings = () => {
                //handle UI - consider making this a factory since the 'Back' button has the same handling
                componentManager.configurationsContainer.remove()
                componentManager.gameState.preGame()
                componentManager.gameButtons.remove.saveSettingsButton()
                componentManager.gameButtons.remove.returnFromSettingsButton()
                //handle functionality
                    //TODO: actually save and apply the settings
            }
            const returnFromSettings = () => {
                //handle UI
                componentManager.configurationsContainer.remove()
                componentManager.gameState.preGame()
                componentManager.gameButtons.remove.saveSettingsButton()
                componentManager.gameButtons.remove.returnFromSettingsButton()
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