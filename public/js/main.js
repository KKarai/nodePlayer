var socket = io.connect('http://localhost');
console.log('р1');
// Объект аудиолист с функциями play итд
var audioList = {
    type: 'all',
    count: 50,
    offset: 0,
    height: $("#audiolist").height() * 2,
    none: false, // признак по которому определяем подгружать треки дальше
    callback: function(res) {
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
    },
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
            current.removeClass('current');
            current.find('.glyphicon-pause')
                            .removeClass("glyphicon-pause")
                            .addClass("glyphicon-play");
            $(this).addClass('current');
            $(this).find('.glyphicon-play')
                            .removeClass("glyphicon-play")
                            .addClass("glyphicon-pause");
            $('.player-title').empty();
            $('.player-title').append(headingText);
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
        var $corporateList = $("#corporate-audiolist .current");
        if ($nextrack.length > 0) {
            audioList.play.call($nextrack);
        } else if ($vkList.length > 0) {
            if (!audioList.none) {
                if (audioList.type === 'all') {
                    vkUser.getAudioList(audioList.count,audioList.offset,
                                        audioList.callback);
                } else if (audioList.type === 'search') {
                    var q = $("#search").val();
                    vkUser.audioSearch(q, audioList.count,audioList.offset,
                                       audioList.callback);
                }
            } else {
                var $current = $('.current');
                var $firstTrack  =  $current.parent().children(":first");
                $('#audiolist').scrollTop(0);
                audioList.play.call($firstTrack);
            }
        } else if ( $corporateList.length > 0 ) {
            var $current = $('.current');
            var $firstTrack  =  $current.parent().children(":first");
            $('#corporate-audiolist').scrollTop(0);
            audioList.play.call($firstTrack);
        }
    },
    repeat: function() {
        player.play();
    }
};

var corporateList = {
    template: null
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

// Получаем общий плейлист
service.get('/api/collections/playlist', function(res) {
    $('#corporate-audiolist').empty();
    $.get('templates/corporatelist.mst', function(template) {
        corporateList.template = template;
        var rendered = Mustache.render(template, { items: res });
        $('#corporate-audiolist').append(rendered);
        $('.audio_delete-wrap').show();
        $('.audio_delete-wrap').tipsy({ gravity: 'se' });
    });
});


function addActive(selector) {
    if($(selector).parent().hasClass('current')) {
        $(selector).css({ "opacity": "1", "color": "white" });
    } else {
        $(selector).css({ "opacity": "1", "color": "black" });
    }
}

function addInActive(selector) {
    if($(selector).parent().hasClass('current')) {
        $(selector).css({ "opacity": "0.4", "color": "white" });
    } else {
        $(selector).css({ "opacity": "0.4", "color": "black" });
    }
}

function addSong(selector, e) {
    e.stopPropagation();
    var info = $(selector).parent().children('input');
    var data = {
        username: vkUser.username,
        userphoto: vkUser.photoUrl,
        artist: $(info).attr('artist'),
        title: $(info).attr('title'),
        duration: $(info).attr('duration'),
        link: $(info).val()
    };
    service.post('/api/collections/playlist', data, function() {
        socket.emit('newsong', this);
    });
}

function deleteSong(selector, e) {
    e.stopPropagation();
    var info = $(selector).parent().children('input');
    var id = $(info).attr('id');
    service.delete('/api/collections/playlist/' + id, function() {
        socket.emit('delete', this);
    });
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
            var rendered = Mustache.render(audioList.template, renderObj);
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
            vkUser.audioSearch(q, audioList.count, audioList.offset,
                function(res) {
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
            vkUser.getAudioList(audioList.count, audioList.offset,
                function(res) {
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
            if ($('#' + key).length == 0) {
                users +=
                "<li id='" + data[key].id + "'><img class='img-circle' src='"
                + data[key].photoUrl
                + "'><p class='message-online'>Online</p></li>";
            }
        }
        $(users).appendTo('.users-online').hide().fadeIn('slow');
    })
    // При подключении любого пользователя
    .on('join', function(data) {
        if ($('#' + data.id).length == 0 && data.id != vkUser.id) {
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
    })
    .on('addSong', function(data) {
        var rendered = Mustache.render(corporateList.template, { items: data });
        $(rendered).appendTo('#corporate-audiolist').hide().fadeIn('slow',
            function() {
                $(this).children('.audio_delete-wrap').show();
                $(this).children('.audio_delete-wrap').tipsy({ gravity: 'se'});
            });
    })
    .on('deleteSong', function(data) {
        $('#' + data.id).parent().hide('slow', function() {
            $(".tipsy").remove();
            this.remove();
        });
    });
