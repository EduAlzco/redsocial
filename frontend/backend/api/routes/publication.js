var express = require('express');
var api = express.Router();
var PublicationController = require('../controllers/publication');
var md_auth = require('../middlewares/authenticated');

var crypto = require('crypto')
var multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, cb) {

        cb(null, './upload/publications');

    },
    filename(req, file = {}, cb) {

        const { originalname } = file;

        const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0]

        // cb(null, ${file.fieldname}__${Date.now()}${fileExtension});

        crypto.pseudoRandomBytes(16, function (err, raw) {

            cb(null, raw.toString('hex') + Date.now() + fileExtension)

        })
    },
})

var mul_upload = multer({ dest: './upload/publications', storage });

api.get('/prueba', md_auth.ensureAuth, PublicationController.probando);
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id?', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-publication/:id', [md_auth.ensureAuth, mul_upload.single('image') ], PublicationController.uploadPublication);
api.get('/get-image-publication/:imageFile', PublicationController.getImagefile);

module.exports = api;