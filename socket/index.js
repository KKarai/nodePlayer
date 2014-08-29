
module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('authorization', function(handshake, callback) {

    });
    // Обработчики событий
    io.sockets.on('connection', function(socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function(data) {
            console.log(data);
        })
    });

};
