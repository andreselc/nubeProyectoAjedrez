require("dotenv").config();

const express = require("express");
const db = require("./config/db");
const {connectToRedis, redisClient} = require("./config/redis")

const main = async () => {
    const app = express();

    db.connect(err => {
        if(err) {
            console.error(err.message);
            process.exit(1);
        }

        console.log("Connected to Postgres Database...");
    })

    await connectToRedis();

    redisClient.get('my_key', (err, result) => {
       console.log(result);
    })
    
    const value = await redisClient.get('my_key');
    console.log(value);
    await redisClient.set('my_key', 'my_val');
    await redisClient.del('my_key'); 

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

main();