// Dom Elements
const gamesDivElement = document.getElementById("games");
const rankFilter = document.getElementById("filter");
const gamesList = document.getElementById("games-list");
const noGamesMessage = document.getElementById("no-games-message");

const createRoomBtn = document.getElementById("create-room");
const joinRoomBtn = document.getElementById("join-room");

const createRoomFormContainer = document.getElementById("create-room-form-container");
const createRoomForm = document.getElementById("create-room-form");
const roomId = document.getElementById("room-id");
const gameTime = document.getElementById("game-time");
const closeCreateRoomFormBtn = document.getElementById("close-create-form");
const addPassword = document.getElementById("add-password");
const passwordInputGroup = document.getElementById("password-input-group");
const roomPassword = document.getElementById("room-password");

const joinRoomFormContainer = document.getElementById("join-room-form-container");
const joinRoomForm = document.getElementById("join-room-form");
const roomPasswordJoin = document.getElementById("room-password-join");
const closeJoinRoomFormBtn = document.getElementById("close-join-form");

roomPassword.readOnly = true;

let user;

let gameId = null;

const intervals = [0, 15, 30, 45, 60]

// Functions
const fetchUserCallback = (data) => {
    user = data;

    socket.emit("user-connected", user);
    socket.emit('get-rooms', "all");

    gamesDivElement.classList.remove("hidden")

    hideSpinner();
}

const addJoinButtonListeners = () => {
    document.querySelectorAll(".game button").forEach(button => {
        if(!button.classList.contains("disabled")){
            button.addEventListener("click", e => {
                let game = button.parentNode;

                if(game.dateset.withpassword === 'true'){
                    gameId = game.id;
                    joinRoomFormContainer.classList.remove('hidden');
                }else{
                    socket.emit('join-room', game.id, user);
                }
            })
        }
    })
}

const displayRooms = rooms => {
    gamesList.innerHTML = "";

    rooms.forEach(room => {
        let {username, user_rank} = room.players[0];
        let numberOfPlayersInRoom = room.players[1] ? 2 : 1;
        let hasPassword = room.password && room.password !== "" ? true : false

        gamesList.innerHTML += `
            <li class='game' id='${room.id}' data-withpassword="${hasPassword}">
                <div class="user">
                    <span>${username}</span>
                    <span>( ${user_rank.charAt(0).toUpperCase() + user_rank.slice(1)} )</span>
                </div>

                <div class="user-in-room">${numberOfPlayersInRoom} / 2</div>

                <button ${numberOfPlayersInRoom === 2 ? "class='disabled'" : ""}>Join</button>
            </li>
        `
    })

    // addJoinButtonListeners()
}

fetchData('/api/user-info', fetchUserCallback)

// Listeners
socket.on('receive-rooms', rooms => {
    if(rooms.length > 0){
        noGamesMessage.classList.add("hidden");
        gamesList.classList.remove('hidden');

        displayRooms(rooms);
    }else{
        gamesList.classList.add('hidden');
        noGamesMessage.classList.remove('hidden');
    }
})

rankFilter.addEventListener("change", (e) => {
    socket.emit("get-rooms", e.target.value)
})