(function() {

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
}

// Получаем пользователя
$.ajax({
    url: "/api/vkuser",
    success: function(msg) {
         window.vkUser = new Vk(msg);
         var script = document.createElement('script');
             script.type = 'text/javascript';
             script.src = '/js/main.js';
             $('body').append(script);
    },
    error: function(msg) {
        console.log(msg.responseText);
    }
});

// инициализация плееера
player = new MediaElementPlayer('#player', {
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
    enableAutosize: true,
    success: function (mediaElement, domObject) {
        mediaElement.addEventListener('ended', function() {
            var loop = $('.mejs-loop-on');
            var $current = $('.current');
            if (loop.length > 0) {
                audioList.repeat();
            } else if (audioList.none && $current.next().length === 0) {
                var $firstTrack  =  $('.audio-info').first()
                audioList.play.call($firstTrack);
            } else {
                audioList.nextTrack();
            }
        });
    }
});

})();
