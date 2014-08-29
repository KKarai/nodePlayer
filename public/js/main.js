var socket = io.connect('http://localhost');
// Объект аудиолист с функциями play итд
var audioList = {
    count: 50,
    offset: 0,
    height: $("#audiolist").height() * 2.5,
    none: false, // признак по которому определяем подгружать треки дальше
    formDuration: function() {
        return Math.floor(this.duration / 60) + ':'
                          + (this.duration % 60  < 10 ? '0'
                          + this.duration % 60 : this.duration % 60);
    },
    jsonInfo: function() {
        return JSON.stringify(this);
    },
    play: function() {
        var current = $('.current');
        var thisElement = $(this);
        var headingText = $(this).find('.title-info').text();

        if (current[0] !== thisElement[0]) {
            // убираем у прошлого элемента класс
            current.removeClass('current');
            current.find('.glyphicon-pause')
                            .removeClass("glyphicon-pause")
                            .addClass("glyphicon-play");
            // Добавляем текущему
            $(this).addClass('current');
            $(this).find('.glyphicon-play')
                            .removeClass("glyphicon-play")
                            .addClass("glyphicon-pause");
            // ставим заголовок
            $('.player-title').empty();
            $('.player-title').append(headingText);
            // Меняем ссылку в плеере
            player.setSrc($(".current input")[0].value);
            player.play();
        } else {
            var glyphPlay = current.find('.glyphicon-play');
            var glyphPause = current.find('.glyphicon-pause');
            if (glyphPlay.length > 0){
                glyphPlay
                    .removeClass("glyphicon-play")
                    .addClass("glyphicon-pause");
                player.play();
            } else {
                glyphPause
                    .removeClass("glyphicon-pause")
                    .addClass("glyphicon-play");
                player.pause();
            }
        }
    },
    prevTrack: function() {
        var $prevtrack  = $('.current').prev();
        if ($prevtrack.length > 0) {
            audioList.play.call($prevtrack);
        }
    },
    nextTrack: function() {
        var $nextrack = $('.current').next();
        var $vkList  = $("#audiolist current");
        var $corporateList = $("#corporateList current");
        if ($nextrack.length > 0) {
            audioList.play.call($nextrack);
        } else if ($vklist.length > 0){

            // подгрузка плейлиста по окончанию воспроизведения
            vkUser.getAudioList(audioList.count, audioList.offset, function(res) {
                if(res) {
                    if (res.items.length > 0) {
                        var renderObj = {
                            items: res.items,
                            formatedDuration: audioList.formDuration
                        };
                        audioList.offset += audioList.count;
                        audioList.height += $("#audiolist").height() * 2.5;
                        var rendered = Mustache.render(audioList.template,
                                                       renderObj);
                        $('#audiolist').append(rendered);
                        audioList.nextTrack();
                    } else {
                        audioList.none = true;
                    }
                }
            });
        } else if ( $corporateList > 0 ) {

        }
    },
    repeat: function() {
        player.play();
    }
};

// Получаем аудиозаписи пользователя
vkUser.getAudioList(audioList.count, audioList.offset, function(res) {
    $('#floatingCirclesG').remove();
    $.get('/templates/audiolist.mst', function(template) {
        audioList.template = template;
        audioList.offset = audioList.count;
        var rendered = Mustache.render(template, {items: res.items,
                                       formatedDuration: audioList.formDuration,
                                       audioinfo: audioList.jsonInfo });
        $('#audiolist').append(rendered);
    });
});

// Events

// Подгрузка аудиозаписей по скроллу
$('#audiolist').scroll(function() {

    var scrollTop = $("#audiolist").scrollTop();
    if (scrollTop >= audioList.height && !audioList.none) {

        audioList.height += $("#audiolist").height() * 2.5;
        vkUser.getAudioList(audioList.count, audioList.offset, function(res) {
            if(res) {
                if (res.items.length > 0) {
                    var renderObj = {
                        items: res.items,
                        formatedDuration: audioList.formDuration
                    };
                    audioList.offset += audioList.count;
                    var rendered = Mustache.render(audioList.template,
                                                   renderObj);
                    $('#audiolist').append(rendered);
                } else {
                    audioList.none = true;
                }
            }
        });
    }
});

// Клик на аудиозапись
$('body').on('click','.audio-info' , function() {
    audioList.play.call(this);
});

// След трек
$('.mejs-nexttrack').on('click','button' , function() {
    audioList.nextTrack();
});

// Пред трек
$('.mejs-prevtrack').on('click','button' , function() {
    audioList.prevTrack();
});
