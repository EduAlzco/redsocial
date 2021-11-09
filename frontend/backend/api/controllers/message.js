var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res) {
    res.status(200).send({ message: 'Hola desde controlador message' });

}

function saveMessage(req, res) {
    var params = req.body;
    if (!params.text || !params.receiver) {
        res.status(200).send({ message: 'Envia los datos necesarios' });
    }
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageSaved) => {
        if (err) res.status(500).send({ message: 'Error en la petición' });
        if (!messageSaved) res.status(404).send({ message: 'Error al enviar el mensaje' });
        return res.status(200).send({ message: messageSaved });


    });
}

function getReceivedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page
    }
    var itemsPerPage = 4;
    Message.find({ receiver: userId }).populate('emitter','name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) res.status(500).send({ message: 'Error en la petición' });
        if (!messages) res.status(404).send({ message: 'No hay mensajes' });
        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages: messages
        });
    });
}

function getEmittedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page
    }
    var itemsPerPage = 4;
    Message.find({ emitter: userId }).populate('emitter receiver','name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) res.status(500).send({ message: 'Error en la petición' });
        if (!messages) res.status(404).send({ message: 'No hay mensajes' });
        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages: messages
        });
    });
}

async function getViewedMessages(req, res) {
    var userId = req.user.sub;
    var messages_viewed = await Message.countDocuments({receiver:userId, viewed:'false'}).exec().then((messages)=>{
        viewed_m = '';

        return viewed_m = res.status(200).send({
            'unviewed':messages
        });
    });   
    return messages_viewed;
}

function setViewedMessages(req, res) {
    var userId = req.user.sub;
    Message.updateMany({receiver: userId, viewed:'false'}, {'viewed':true}, {"multi":true}, (err, messageUpdated) =>{
        if (err) res.status(500).send({ message: 'Error en la petición' });
        if (!messageUpdated) res.status(404).send({ message: 'No se han podido marcar en visto los mensajes' });
        return res.status(200).send({
            messages: messageUpdated
        });
    });
}

module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmittedMessages,
    getViewedMessages,
    setViewedMessages
}