
module.exports = function (passport) {

    var config = require("../config");
    var AuthVKStrategy = require('passport-vkontakte').Strategy;

    passport.use('vk', new AuthVKStrategy({
            clientID: config.get("auth:vk:app_id"),
            clientSecret: config.get("auth:vk:secret"),
            callbackURL: config.get("url") + "/auth/vk/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            return done(null, {
                id: profile.id,
                username: profile.displayName,
                photoUrl: profile.photos[0].value,
                profileUrl: profile.profileUrl,
                token: accessToken
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, JSON.stringify(user));
    });


    passport.deserializeUser(function (data, done) {
        try {
            done(null, JSON.parse(data));
        } catch (e) {
            done(err)
        }
    });
};
