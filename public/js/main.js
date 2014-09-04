var socket = io.connect('http://localhost');

// Объект аудиолист с функциями play итд
var audioList = {
    type: 'all',
    count: 50,
    offset: 0,
    height: $("#audiolist").height() * 2,
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
        var $vkList  = $("#audiolist .current");
        var $corporateList = $("#corporateList .current");
        if ($nextrack.length > 0) {
            audioList.play.call($nextrack);
        } else if ($vkList.length > 0) {

            if (!audioList.none) {
            // подгрузка плейлиста по окончанию воспроизведения
                if (audioList.type === 'all') {
                    vkUser.getAudioList(audioList.count,
                                        audioList.offset, function(res) {
                      if(res) {
                          if (res.items.length > 0) {
                              var renderObj = {
                                  items: res.items,
                                  formatedDuration: audioList.formDuration
                              };
                              audioList.offset += audioList.count;
                              audioList.height += $("#audiolist").height() * 3;
                              var rendered = Mustache.render(audioList.template,
                                                             renderObj);
                              $('#audiolist').append(rendered);
                              $('.audio_add-wrap').tipsy({ gravity: 'se'});
                              audioList.nextTrack();
                          } else {
                              audioList.none = true;
                          }
                      }
                    });
                } else if (audioList.type === 'search') {
                    var q = $("#search").val();
                    vkUser.audioSearch(q, audioList.count,
                                        audioList.offset, function(res){
                        if(res) {
                            if (res.items.length > 0) {
                                var renderObj = {
                                    items: res.items,
                                    formatedDuration: audioList.formDuration
                                };
                                audioList.offset += audioList.count;
                                audioList.height += $("#audiolist").height() * 3;
                                var rendered = Mustache.render(audioList.template,
                                                               renderObj);
                                $('#audiolist').append(rendered);
                                $('.audio_add-wrap').tipsy({ gravity: 'se'});
                                audioList.nextTrack();
                            } else {
                                audioList.none = true;
                            }
                        }
                    });
                    //audioList.nextTrack();
                }
            } else {
                debugger
                var $current = $('.current');
                $('#audiolist').scrollTop(0);
                var $firstTrack  =  $current.parent().children(":first");
                audioList.play.call($firstTrack);
            }
        } else if ( $corporateList > 0 ) {

        }
    },
    repeat: function() {
        player.play();
    }
};

// Получаем аудиозаписи пользователя
vkUser.getAudioList(audioList.count, audioList.offset, function(res) {
    $('#audiolist').empty();
    $.get('/templates/audiolist.mst', function(template) {
        audioList.template = template;
        audioList.offset = audioList.count;
        var rendered = Mustache.render(template, {items: res.items,
                                       formatedDuration: audioList.formDuration,
                                       audioinfo: audioList.jsonInfo });
        $('#audiolist').append(rendered);
        $('.audio_add-wrap').tipsy({ gravity: 'se' });
    });
});



// При наведении на кнопку добавить
function vkAddActive(selector) {
    if($(selector).parent().hasClass('current')) {
        $(selector).css({ "opacity": "1", "color": "white" });
    } else {
        $(selector).css({ "opacity": "1", "color": "black" });
    }
}

// При уходе с элемена
function vkAddInActive(selector) {
    if($(selector).parent().hasClass('current')) {
        $(selector).css({ "opacity": "0.4", "color": "white" });
    } else {
        $(selector).css({ "opacity": "0.4", "color": "black" });
    }
}

// Добавляем песню
function addSong(selector, e) {
    e.stopPropagation();
}

// Скроллы плейлистов
function scrollAll() {
    var scrollTop = $("#audiolist").scrollTop();

    if (scrollTop >= audioList.height && !audioList.none) {
        audioList.offset += audioList.count;
        audioList.height += $("#audiolist").height() * 3;
        vkUser.getAudioList(audioList.count,
                            audioList.offset, vkCallback);
    }
}

function scrollSearch() {
    var scrollTop = $("#audiolist").scrollTop();
    if (scrollTop >= audioList.height && !audioList.none) {
        var q = $("#search").val();
        audioList.offset += audioList.count;
        audioList.height += $("#audiolist").height() * 3;
        vkUser.audioSearch(q, audioList.count, audioList.offset, vkCallback);
    }
}

// Коллбэк для запросов вк
function vkCallback(res) {
    if(res) {
        if (res.items.length > 0) {
            var renderObj = {
                items: res.items,
                formatedDuration: audioList.formDuration
            };
            var rendered = Mustache.render(audioList.template,
                                           renderObj);
            $('#audiolist').append(rendered);
            $('.audio_add-wrap').tipsy({ gravity: 'se'});
        } else {
            audioList.none = true;
        }
    }
}

// Events
// Подгрузка аудиозаписей по скроллу
$('#audiolist').scroll(function() {
    if (audioList.type == 'all') {
        scrollAll();
    } else if (audioList.type == 'search') {
        scrollSearch();
    }
});

// Поиск
var timeout = null;
$('#search').on('keyup', function(event) {
    audioList.offset = 0;
    var q = $(this).val();
    if (q !== "") {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            vkUser.audioSearch(q, audioList.count, audioList.offset, function(res) {
                if(res) {
                    $('#audiolist').empty();
                    audioList.type = 'search';
                    audioList.offset =  audioList.count;
                    audioList.none = false;
                    audioList.height = $("#audiolist").height() * 2;
                    var renderObj = {
                        items: res.items,
                        formatedDuration: audioList.formDuration
                    };
                    var rendered = Mustache.render(audioList.template,
                                                   renderObj);
                    $('#audiolist').append(rendered);
                    $('.audio_add-wrap').tipsy({ gravity: 'se'});
                }
            })
        }.bind(this), 500);
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            vkUser.getAudioList(audioList.count, audioList.offset, function(res) {
                $('#audiolist').empty();
                audioList.type = 'all';
                audioList.none = false;
                audioList.offset = audioList.count;
                audioList.height = $("#audiolist").height() * 2;
                var rendered = Mustache.render(audioList.template, {
                               items: res.items,
                               formatedDuration: audioList.formDuration,
                               audioinfo: audioList.jsonInfo });
                $('#audiolist').append(rendered);
                $('.audio_add-wrap').tipsy({ gravity: 'se'});
            });
        }.bind(this), 500);
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

// На плеере play/pause button
$('.mejs-playpause-button').on('click', 'button', function() {
    var pause = $(this).parent().hasClass('mejs-pause');
    if (pause) {
        $('.current').find('.glyphicon-pause')
                        .removeClass("glyphicon-pause")
                        .addClass("glyphicon-play");
    } else {
        $('.current').find('.glyphicon-play')
                        .removeClass("glyphicon-play")
                        .addClass("glyphicon-pause");
    }
});

// socket.io events
socket
    // получаем список пользователей онлайн
    .on('online', function(data) {
        var users = "";
        delete data[vkUser.id];
        for(var key in data ) {
            users += "<li id='" + data[key].id + "'><img class='img-circle' src='"
            + data[key].photoUrl + "'><p class='message-online'>Online</p></li>";
        }
        $(users).appendTo('.users-online').hide().fadeIn('slow');
    })
    // При подключении любого пользователя
    .on('join', function(data) {
        if ($('#' + data.id).length === 0 && data.id != vkUser.id) {
            var user = "<li id='"+ data.id + "'><img class='img-circle' src='"
            + data.photoUrl + "'><p class='message-online'>Online</p></li>"
            $(user).appendTo('.users-online').hide().fadeIn('slow');
        }
    })
    // При выходе любого пользователя
    .on('leave', function(data) {
        $('#' + data.id).hide('slow', function() {
            this.remove();
        });
    });
