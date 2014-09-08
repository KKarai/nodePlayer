var mongoose = require('../db');

var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    userphoto: {
        type: String
    },
    artist: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

exports.CorporatePlaylist = mongoose.model('CorporatePlaylist', schema);
