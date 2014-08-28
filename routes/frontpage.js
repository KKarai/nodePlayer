module.exports = function(req, res) {
    res.render('index', { title: "Player", user: req.user });
}
