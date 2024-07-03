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