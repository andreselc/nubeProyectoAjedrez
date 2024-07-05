const socket = io();

const fetchData = (url, callback) => {
    fetch(url)
    .then(res => {
        if(!res.ok){
            throw Error("Algo Falló :c");
        }

        return res.json();
    })
    .then(callback)
    .catch(err => console.log(err.message))
}

// FIXME: Creo que el https aqui deberia ser 3000
socket.on("error", (errorMessage) => {
    window.location.href = "http://localhost:5000/games?error=" + errorMessage
})