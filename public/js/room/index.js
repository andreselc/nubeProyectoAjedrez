//-------------------------------------
//DOM Elements
//-------------------------------------
const room = document.getElementById('room');
const boxes = document.querySelectorAll('box');
const playerLight = document.getElementById('player-light');
const playerBlack = document.getElementById('player-black');
const waitingMessage = document.getElementById('waiting-message');
const playerLightTimer = playerLight.querySelector('.timer');
const playerBlackTimer = playerBlack.querySelector('.timer');
const lightCapturePieces = document.getElementById('light-capture-pieces');
const blackCapturePieces = document.getElementById('black-capture-pieces');
//const piecesToRemove = document.querySelectorAll('.piece-to-remove');



//-------------------------------------
//Variables de juego
//-------------------------------------

let user = null;

let search = window.location.search.split('&');

let roomId = null;
let password = null;

let gameDetails = null;

let gameHasTimer = false;
let timer = null;
let myTurn = false;
let kingIsAttacked = false;
let pawnToPromotePosition = null;
let castling = null;

let gameOver = false;
let myScore = 0;
let enemyScore = 0;

let gameStartedAtTimestamp = null

if (search.lenght > 1) {
    roomId = search[0].split('=')[1];
    password = search[1].split('=')[1];

}else{
    roomId = search[0].split("=")[1];
}

//-------------------------------------
//Funciones de juego
//--------------------------------------

const fetchUsersCallback = (data) => {
    user = data;
    if (password){
        socket.emit('user-connected', user ,roomId, password);
    }else {
        socket.emit('user-connected', user, roomId);
    }

    socket.emit('get-game-details', roomId, user)
}

fetchUsersCallback("/api/user-info", fetchUsersCallback);

const displayChessPieces = () => {
    boxes.forEach(box => {
        box.innerHTML = '';
    }
    )

    lightPieces.forEach(piece => {
        let box = document.getElementById(piece.position);

        box.innerHTML += 
        `<div class="piece light  data-piece="${piece.piece}" data-points="${piece.points}">
            <img src="${piece.icon}" alt="${piece.piece}">
            </div>`
    })

    blackPieces.forEach(piece => {
        let box = document.getElementById(piece.position);

        box.innerHTML += 
        `<div class="piece light  data-piece="${piece.piece}" data-points="${piece.points}">
            <img src="${piece.icon}" alt="${piece.piece}">
            </div>`
    })

}

const updateTimer = () => {}

const timerEndedCallback = () => {}

const setCursor = (cursor) => {
    document.querySelectorAll(`.piece.${player}`).forEach(piece => {	
        piece.getElementsByClassName.cursor = cursor;
    })
}

const startGame = (user) => {
    playerBlack.querySelector('.username').innerText = playerTwo.username;
    waitingMessage.classList.add('hidden');
    playerBlack.classList.remove('hidden');

    displayChessPieces();
}

displayChessPieces();

//-------------------------------------
//Listeners del Socket
//-------------------------------------

socket.on("receive-game-details", (details) => {
    gameDetails = details;
    let playerOne = gameDetails.players[0];

    gameTimer = gameDetails.time > 0;

    if(!gameHasTimer){
        playerLightTimer.classList.add("hidden")
        playerBlackTimer.classList.add("hidden")
    }else{
        playerLightTimer.innerText = gameDetails.time + ":00";
        playerBlackTimer.innerText = gameDetails.time + ":00";    
    }

    playerLight.querySelector(".username").innerText = playerOne.username;

    if(playerOne.username === user.username){
        player = "light",
        enemy = "black"

        myTurn = true;
    }else{
        gameStartedAtTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        player = "black"
        enemy = "light"

        setCursor("default")
        startGame(user)
    
    }

    if (gameHasTimer){
        timer = new Timer(player, roomId, gameDetails.time, 0, updateTimer, timerEndedCallback);
    }

    hideSpinner();
    room.classList.remove("hidden");
})

// si somos el primer jugador y alguien se une, este evento se emite
socket.on("game-started", (playerTwo) => {
    gameStartedAtTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    startGame(playerTwo);
    if(gameHasTimer){
        timer.start();
    }

})	