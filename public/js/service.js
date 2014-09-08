(function() {
// Получаем пользователя
$.ajax({
    url: "/api/vkuser",
    async: false,
    success: function(msg) {
         window.vkUser = new Vk(msg);
    },
    error: function(msg) {
        console.log(msg.responseText);
    }
});

window.service = {
    get: function(path, callback) {
        var result;
        $.ajax({
            type: "GET",
            url: path,
            async: typeof callback === 'function',
            contentType: "application/json",
            success: function(msg) {
              if (callback) {
                  callback.call(msg, msg);
              } else {
                  result = msg;
              }
            },
            error: function(msg) {
                console.log(msg.responseText);
            }
        });
        return result;
    },
    post: function(path, data, callback) {
        var result;
        $.ajax({
            type: "POST",
            url: path,
            async: typeof callback === 'function',
            data : JSON.stringify(data),
            contentType: "application/json",
            success: function(msg) {
                if (callback) {
                  callback.call(msg, msg);
                } else {
                  result = msg;
                }
            },
            error: function(msg) {
                console.log(msg.responseText);
            }
        });
        return result;
    },
    put: function(path, data, callback) {
        var result;
        $.ajax({
            type: "PUT",
            url: path,
            async: typeof callback === 'function',
            data : JSON.stringify(data),
            contentType: "application/json",
            success: function(msg) {
                if (callback) {
                  callback.call(msg, msg);
                } else {
                  result = msg;
                }
            },
            error: function(msg) {
                console.log(msg.responseText);
            }
        });
        return result;
    },
    delete: function(path, callback) {
        var result;
        $.ajax({
            type: "DELETE",
            url: path,
            async: typeof callback === 'function',
            contentType: "application/json",
            success: function(msg) {
                if (callback) {
                  callback.call(msg, msg);
                } else {
                  result = msg;
                }
            },
            error: function(msg) {
                console.log(msg.responseText);
            }
        });
        return result;
    }
};


// класс Вк
function Vk (user) {
    this.id = user.id;
    this.username = user.username;
    this.photoUrl = user.photoUrl;
    this.token = user.token;
}
Vk.prototype.getAudioList = function(count, offset, callback) {
    var path = "https://api.vk.com/method/audio.get?user_id="+ this.id
               + "&v=5.24&count=" + count + "&offset=" + offset
               + "&access_token="+ this.token ;

    $.ajax({
        url: path,
        dataType: 'jsonp',
        success: function(msg) {
            console.log(msg);
            callback(msg.response);
        },
        error: function(msg) {
            console.log(msg.responseText);
        }
    });
};

Vk.prototype.audioSearch = function(q, count, offset, callback) {
    var path = "https://api.vk.com/method/audio.search?q=" + q
              + "&auto_complete=1" + "&v=5.24&count=" + count
              + "&search_own=1" + "&offset=" + offset
              + "&access_token="+ this.token ;
    $.ajax({
        url: path,
        dataType: 'jsonp',
        success: function(msg) {
            console.log(msg);
            callback(msg.response);
        },
        error: function(msg) {
            console.log(msg.responseText);
        }
    });
};


// инициализация плееера
window.player = new MediaElementPlayer('#player', {
    audioWidth: "100%",
    playlistposition: 'bottom',
    playlist: true,
    startVolume: 1,
    features: [
        'prevtrack',
        'playpause',
        'nexttrack',
        'loop',
        'current',
        'progress',
        'duration',
        'volume'
    ],
    enableKeyboard: false,
    success: function (mediaElement, domObject) {
        /*
            Добавляем событие по окончанию плейлиста
            1) // Повтор песни
            2) // Потвор всего плейлиста
            3) // след трек
        */
        mediaElement.addEventListener('ended', function() {
            var loop = $('.mejs-loop-on');
            var $current = $('.current');
            if (loop.length > 0) {
                audioList.repeat();
            } else {
                audioList.nextTrack();
            }
        });

        // При ошибке след. трек
        mediaElement.addEventListener('error', function(e) {
            var src = $('#player').attr('src');
            if (src !== '/') {
                setTimeout(function() {
                    audioList.nextTrack();
                }, 2000);
            }
        });
    }
});

})();
