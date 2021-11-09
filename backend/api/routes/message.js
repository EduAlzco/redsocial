var express = require('express');
var api = express.Router();
var MessageController = require('../controllers/message');
var md_auth = require('../middlewares/authenticated');



api.get('/prueba', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/received-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmittedMessages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getViewedMessages);
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;