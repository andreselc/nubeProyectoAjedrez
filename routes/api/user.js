const { Router } = require("express");
const { check } = require("express-validator");
const { register, login, getInfo, renewToken } = require("../../controllers/api/user");

const router = Router();

// Rutas para el registro y login
router.post("/register", [
    check("username", "El username es obligatorio").notEmpty(),
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "Por favor, introduzca un email válido").isEmail(),
    check("password", "La contraseña es válida").notEmpty(),
    check("confirmPassword", "Las contraseñas no coinciden").notEmpty(),
], register);

router.post("/login", [
    check("email", "El email es obligatorio").notEmpty(),
    check("email", "Por favor, introduzca un email válido").isEmail(),
    check("password", "La contraseña es válida").notEmpty(),
], login);

// Ruta para obtener información del usuario
router.get("/user-info", getInfo);

module.exports = router;