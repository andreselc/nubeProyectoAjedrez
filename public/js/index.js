const socket = io();

socket.emit("hello", "Ito")

socket.on("hello", (name) => {
    console.log("Hello " + name)
})