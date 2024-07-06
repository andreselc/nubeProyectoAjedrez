const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const userRepository = require('../../repositories/userRepository');
const { validationResult } = require('express-validator');
const redisClient = require("../../config/redis");

const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.redirect("/register?error=" + errors.array()[0].msg);
    }

    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.redirect("/register?error=Passwords do not match");
    }

    // Verificar si el usuario o email ya existen
    const existingUser = await userRepository.findByUsernameOrEmail(username, email);

    if (existingUser) {
      return res.redirect("/register?error=Username or email already in use");
    }

    // Encriptar la contraseña
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Guardar el usuario en la base de datos
    const newUser = await userRepository.createUser({
      username: username,
      email: email,
      password: encryptedPassword
    });

    // Crear token JWT
    const payload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    jwt.sign(payload, jwtSecret, { expiresIn: '300d' }, async (err, token) => {
      if (err) {
        throw err;
      }

      // Guardar el token en Redis
      redisClient.set(`token:${newUser.id}`, token, 'EX', 3600);

      // Configurar las cookies
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });
      res.cookie("user_rank", "beginner", {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });
      res.cookie("user_points", 1000, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });

      res.redirect("/?success=Te has registrado exitosamente");
    });

  } catch (err) {
    console.log(err);
    res.redirect("/register?error=Algo salió mal!");
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.redirect("/login?error=" + errors.array()[0].msg);
    }

    const { email, password } = req.body;

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.redirect("/login?error=Email o password incorrectos");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.redirect("/login?error=Email o password incorrectos");
    }

    const userInfo = await userRepository.findUserInfoByUserId(user.id);

    if (!userInfo) {
      return res.redirect("/login?error=No se pudo recuperar la información del usuario");
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    jwt.sign(payload, jwtSecret, { expiresIn: '300d' }, async (err, token) => {
      if (err) {
        throw err;
      }
      
      // Guardar el token en Redis (opcional)
      redisClient.set(`token:${user.id}`, token, 'EX', 3600);

      // Configurar las cookies
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });
      res.cookie("user_rank", userInfo.user_rank, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });
      res.cookie("user_points", userInfo.user_points, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
        sameSite: "strict"
      });

      res.redirect("/?success=Te has logeado exitosamente");
    });

  } catch (err) {
    console.log(err);
    res.redirect("/login?error=Algo salió mal!");
  }
};

exports.getInfo = (req, res) => {
  try {
    jwt.verify(req.cookies.token, jwtSecret, (err, userPayload) => {
      if (err) 
        throw err;
      
      const { id, email, username } = userPayload;
      
      let user = {
        id, 
        username,
        email,
        user_rank: req.cookies.user_rank,
        user_points: req.cookies.user_points
      }

      return res.json(user);
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }

};

