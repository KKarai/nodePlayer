var CorporatePlaylist =
                    require('../models/corporatePlaylist.js').CorporatePlaylist;

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

    // Rest Api
    app.get('/api/vkuser', function(req, res) {
        if (req.user) {
            res.send(req.user);
        } else {
            res.status(401).send('Unauthorized');
        }
    });

    app.get('/api/collections/playlist', function(req, res, next) {
        if (req.user) {
            CorporatePlaylist.find({}, function(err, songs) {
                if (err) return next(err);
                res.json(songs);
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    });
    app.get('/api/collections/playlist/:id', function(req, res, next) {
        if (req.user) {
            CorporatePlaylist.findById(req.params.id, function(err, song) {
                if (err) return next(err);
                res.json(song);
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    });
    app.post('/api/collections/playlist', function(req, res, next) {
        if (req.user) {
            var user = req.body;
            console.log(user);
            var song = new CorporatePlaylist({
                username: user.username,
                userphoto: user.userphoto,
                artist: user.artist,
                title: user.title,
                duration: user.duration,
                link: user.link
            });
            console.log(user);
            song.save(function(err, song, affected){
                if (err) return next(err);
                res.json(song);
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    });

    app.delete('/api/collections/playlist', function(req, res) {
        if (req.user) {
            CorporatePlaylist.remove({}, function(err) {
                if (err) return next(err);
                res.send('success');
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    });
    app.delete('/api/collections/playlist/:id', function(req, res) {
        if (req.user) {
            CorporatePlaylist.remove({ _id: req.params.id }, function(err, song) {
                if (err) return next(err);
                res.json({"id": req.params.id});
            });
        } else {
            res.status(401).send('Unauthorized');
        }
    });
}
