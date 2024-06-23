const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const userRepository = require('../../repositories/userRepository');
const {validationResult} = require('express-validator');
const redisClient = require("../../config/redis");

const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'secret';

exports.register = (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.redirect("/register/error="+ errors.array()[0].msg);
        }

        const {username, email, password, confirmPassword} = req.body;

        if(password !== confirmPassword) {
            return res.redirect("/register/error=Passwords do not match");
        }

        let query = `SELECT id FROM users WHERE username=${username} OR email= ${email}`;

        db.query(query, (err, result) => {
            if(err){
                throw err;
            }
            if(result.length > 0) {
                return res.redirect("/register/error=Username or email already in use");
            }

        const encryptedPassword = bcrypt.hashSync(password, 10);

        const newUser = userRepository.createUser({
            username: username,
            email: email,
            password: encryptedPassword
        });

        db.query(newUser, (err, result) => {
            if(err) {
                throw err;
            }

        query = `SELECT id FROM users WHERE email= ${email}`;
        
            db.query(query, (err, result) => {
                    if(err) {
                        throw err;
                    }

                    if (result.length === 0) {
                        res.redirect("/?success=Algo salió mal!");
                    }
                    
                    let userId = result[0].id;

                    const payload = {
                        id: userId, username, email
                    };

                    jwt.sign(payload, jwtSecret, (err, token) =>{
                        if(err) {
                            throw err;
                        }
                        
                    res.cookie("token", token, {maxAge: 1000*60*60*24*30, httpOnly: true, secure: false, sameSite : "strict"});
                    res.cookie("user_rank", "beginner", {maxAge: 1000*60*60*24*30, httpOnly: true, secure: false, sameSite : "strict"});
                    res.cookie("user_points", 1000, {maxAge: 1000*60*60*24*30, httpOnly: true, secure: false, sameSite : "strict"});
                    
                    res.redirect("/?success=Te has registrado exitosamente");
                   
                    })
            })
        })
    })

    } catch (err) {
        console.log(err);
        res.redirect("/?success=Algo salió mal!");
    }
};