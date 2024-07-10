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

displayChessPieces();