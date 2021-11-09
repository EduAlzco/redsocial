const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs')
const mongoosePaginate = require('mongoose-pagination');
const jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/user');
const follow = require('../models/follow');
const Publication = require('../models/publication');
const user = require('../models/user');



function home(req, res) {
    res.status(200).send({
        message: 'Accion de pruebas en el controller de usuario'
    });
};
function pruebas(req, res) {
    res.status(200).send({
        message: 'Accion de pruebas en el controller de usuario'
    });
};

//Registro
function saveUser(req, res) {
    const params = req.body;
    const user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //Controlar y validar para que el correo o usuario no se repita
        User.findOne({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({
                message: 'Error en la petición de usuarios'
            });
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que ha intentado registrar ya existe' });
            } else {

                //Cifrar contraseña con bcrypt
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userSaved) => {

                        if (err) return res.status(500).send({
                            message: 'Ha ocurrido un problema guardando el usuario'
                        });

                        if (userSaved) {
                            res.status(200).send({ user: userSaved });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        }

                    });
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Faltan datos por rellenar'
        })
    }
};

//Login
function loginUser(req, res) {
    const params = req.body;
    const email = params.email;
    const password = params.password;
    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    if (params.gettoken) {
                        //Generar y Devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //Devolver datos de usuario
                        user.password = undefined; //Esto para que no vuelva la id de la contraseña y solo se quede dentro del backend
                        return res.status(200).send({ user });
                    }

                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                }
            })
        } else {
            return res.status(500).send({ message: 'Error, El usuario no se ha podido identificar' });
        };
    });
}

//Conseguir dato de un usuario
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({
            message: "error en la petición"
        });
        if (!user) return res.status(404).send({
            message: "El usuario no existe"
        });

        followThisUser(req.user.sub, userId).then((value) => {
            //hacer que no muestre la contraseña
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });

    });
}

//Funcion asincrona para saber si sigues o te sigue un usuario
async function followThisUser(identity_user_id, user_id) {
    var following = await follow.findOne({ "user": identity_user_id, "followed": user_id }).exec().then((follow) => {

        return follow;
    });

    var followed = await follow.findOne({ "user": user_id, "followed": identity_user_id }).exec().then((follow) => {

        return follow;
    });

    return {
        following: following,
        followed: followed
    };
}

//Devolver listado de usuarios paginado
function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var ItemsPerPage = 5;
    User.find().sort('_id').paginate(page, ItemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({
            message: "error en la petición"
        });
        if (!users) return res.status(404).send({
            message: "No hay usuarios disponibles"
        });

        followUserIds(identity_user_id).then((value) => {

            return res.status(200).send({
                users,
                users_following: value.following,
                users_following_me: value.followed,
                total,
                pages: Math.ceil(total / ItemsPerPage)
            });
        });


    });
}async function followUserIds(user_id) {
    try {
        var following = await follow.find({ 'user': user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec()
            .then((follows) => {

                var follows_clean = []

                follows.forEach((follow) => {
                    follows_clean.push(follow.followed)
                });

                return follows_clean;

            })
            .catch((err) => {
                return handleerror(err);
            });

        var followed = await follow.find({ 'followed': user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec()
            .then((follows) => {

                let follows_clean = []

                follows.forEach((follow) => {
                    follows_clean.push(follow.user)
                });
                return follows_clean;
            })
            .catch((err) => {
                return handleerror(err);
            });

        return {
            following: following,
            followed: followed
        }

    } catch (error) {
        console.log(error);
    }
}

//Devolver contador de cuanta gente nos sigue, seguimos, publicaciones etc
function getCounters(req, res){
    var userId = req.user.sub;
 if(req.params.id){
     userId = req.params.id;
 }
 getCountFollow(userId).then((value)=>{
    return res.status(200).send(value); 
});

}async function getCountFollow(user_id) {
    var following = await follow.countDocuments({ user: user_id })
        .exec()
        .then((count) => {
            console.log(count);
            return count;
        })
        .catch((err) => { return handleError(err); });
 
    var followed = await follow.countDocuments({ followed: user_id })
        .exec()
        .then((count) => {
            return count;
        })
        .catch((err) => { return handleError(err); });
 
    var publications = await Publication.countDocuments({"user": user_id})
    .exec()
    .then((count)=>{
        return count;
    })
    .catch((err)=>{return handleError(err); });

    return { 
        following: following,
        followed: followed,
        publications: publications
        
         }
 
}




//Actualizar usuarios
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;
    if (userId != req.user.sub) {
        return res.status(500).send({
            message: "No tienes permiso para actualizar los datos del usuario"
        });
    }
    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err,users) => {
        var user_isset = false;
        users.forEach((user) =>{
            if(user && user._id != userId) user_isset = true; 
        });

        if(user_isset)return res.status(404).send({
            message: " Los datos ya están en uso"
        });
        
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: 'Error en la petición' });
            if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            return res.status(200).send({ user: userUpdated });
        });
    })
  
}

//Subir archivos de imagen / avatar de usuario

function uploadImage(req, res) {
    var userId = req.params.id;

    if (req.file) {
        // console.log(req.file);
        var file_path = req.file.path;
        // console.log(file_path);
        var file_split = file_path.split('\\');
        // console.log(file_split);
        var file_name = file_split[2];
        // console.log(file_name);
        var ext_split = file_name.split('\.');
        // console.log(ext_split);
        var file_ext = ext_split[1];
        // console.log(file_ext);

        if (userId != req.user.sub) {
            removeFilesOfUploads(res, file_path, 'No tienes permiso para modificar el archivo');
        }

        if (file_ext == 'png' || file_ext == 'PNG' || file_ext == 'jpg' || file_ext == 'JPG' || file_ext == 'jpeg' || file_ext == 'JPEG' || file_ext == 'gif' || file_ext == 'GIF') {
            //Actualizar atributo de usuario logueado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la petición' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar la foto' });

                return res.status(200).send({ user: userUpdated });
            });
        } else {
            removeFilesOfUploads(res, file_path, 'Extensión no válida');
        }
    } else {
        return res.status(200).send({ message: 'No se ha subido ningún archivo' });
    }
}
//Funcion para remover archivo subido  en uploadImage en caso tal la extensión no sea valida
function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}

function getImagefile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './upload/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    })
}



module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImagefile,
   
};
