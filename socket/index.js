var sessionStore = require('../sessionStore'),
    passportSocketIo = require("passport.socketio");
    config = require('../config');
    cookieParser = require('cookie-parser');
var online = {}; // Список пользователей онлайн

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept();
}

function onAuthorizeFail(data, message, error, accept){
    if(error)
        accept(new Error(message));
    console.log('failed connection to socket.io:', message);
}

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    // Авторизация
    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        key:         config.get('session:key'),
        secret:      config.get('session:secret'),
        store:       sessionStore,
        success:     onAuthorizeSuccess,
        fail:        onAuthorizeFail,
    }));


    // Обработчики событий
    io.sockets.on('connection', function(socket) {
        var user = socket.request.user;
        if (!online[user.id]) {
            online[user.id] = user;
            // Всем кроме себя посылаем, нового пользователя
            socket.broadcast.emit('join', user);
        }

        // Текущему пользователю посылаем список онлайн
        io.sockets.connected[socket.id].emit('online', online);

        // При дисконнекте
        socket.on('disconnect', function() {
            delete online[user.id];
            setTimeout(function() {
                // Если пользователя нет 10 сек убираем из списка онлайн
                if(!online[user.id]) {
                    socket.broadcast.emit('leave', user);
                }
            }, 10000);
        });
    });

};
