exports.getRegisterPage = (req, res) => {
    res.render('auth/register');
};

exports.getLoginPage = (req, res) => {
    res.render('auth/login');
};

exports.getLobbyPage = (req, res) => {
    res.render("lobby");
}