//Controllar follows de los usuarios

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
const follow = require('../models/follow');
const { findByIdAndRemove } = require('../models/user');

function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followSaved) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el follow' });
        if (!followSaved) return res.status(404).send({ message: 'El seguimiento no se ha guardado' });
        return res.status(200).send({ follow: followSaved });
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al dejar de seguir' });
        return res.status(200).send({ message: 'Se ha eliminado el follow' });
    });
}


function getFollowingUsers(req, res) {
    var userId = req.user.sub;
    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;
    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No estás siguiendo ningún usuario' });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });
}

function getFollowedUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;
    Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No te está siguiendo ningún usuario :(' });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });
    });
}
//Listar usuarios que me siguen y sigo
function getMyFollows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({ user: userId });

    if (req.params.followed) {

        find = Follow.find({ followed: userId });
    }
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor' });
        if (!follows) return res.status(404).send({ message: 'No sigues a ningún usuario :(' });
        return res.status(200).send({ follows });
    });
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows

}