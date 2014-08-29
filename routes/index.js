module.exports = function(app, passport) {
    app.get('/', require('./frontpage'));
    app.get('/logout', require('./logout'))
    app.get('/auth/vk',
        passport.authenticate('vk', {
            scope: ['audio']
        }),
        function (req, res) {
         // The request will be redirected to vk.com
         // for authentication, so
         // this function will not be called.
    });
    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/auth'
        }),
        function (req, res) {
            // Successful authentication
            //, redirect home.
            res.redirect('/');
    });
    app.get('/api/vkuser', function(req, res) {
        if(req.user) {
            res.send(req.user);
        } else {
            res.status(401).send('Unauthorized');
        }
    });
}
