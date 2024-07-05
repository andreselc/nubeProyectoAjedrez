// DOM Elements
const lobby = document.getElementById("lobby");
const username = document.getElementById("usename");
const rank = document.getElementById("rank");
const points = document.getElementById("points");
const beginnerRooms = document.getElementById("beginner-rooms");
const intermediateRooms = document.getElementById("intermediate-rooms");
const advancedRooms = document.getElementById("advanced-rooms");
const expertRooms = document.getElementById("expert-rooms");
const totalUsers = document.getElementById("total-users");
const totalRooms = document.getElementById("total-rooms");

let user;

const fetchUserCallBack = (data) => {
    user = data;
    user.token = data.token; 

    socket.emit('user-connected', user);
    
    socket.emit('send-total-rooms-and-users');

    hideSpinner();

    lobby.classList.remove("hidden");
    username.innerText = user.username;
    rank.innerText = user.user_rank;
    points.innerText = user.user_points;

    console.log(user);
}

async function renewToken() {
    try {
      const response = await fetch('/api/renew-token', {
        method: 'GET',
        credentials: 'include', // Incluir cookies
      });
  
      if (response.ok) {
        const { token } = await response.json();
        // Actualizar el token en el cliente
        user.token = token;
      } else {
        // Manejar el error de token expirado
        console.error('Error renovando el token:', response.status);
        // Redirigir al usuario a la página de inicio de sesión o realizar otra acción
      }
    } catch (error) {
      console.error('Error al renovar el token:', error);
    }
  }

setInterval(renewToken, 300000);

url = '/api/user-info';

async function fetchData(url, fetchUserCallBack) {
try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` // Enviar el token en la solicitud
      },
      credentials: 'include' // Incluir cookies
    });

    // ...
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  }
}

socket.on("receive-number-of-rooms-and-users", (numberOfRooms, totalR, totalU) => {
    beginnerRooms.innerText = `${numberOfRooms[0]} rooms`;
    intermediateRooms.innerText = `${numberOfRooms[1]} rooms`;
    advancedRooms.innerText = `${numberOfRooms[2]} rooms`;
    expertRooms.innerText = `${numberOfRooms[3]} rooms`;

    totalRooms.innerText = `Total Rooms: ${totalR}`;
    totalUsers.innerText = `Total Rooms: ${totalU}`;
})