//Servicio de tokens - libreria jwt
const jwt = require('jwt-simple');
const moment = require('moment');//libreria moment para generar fechas
const secret = 'clave_secreta_red_social'; //clave secreta de token
exports.createToken = function(user){
    const payload = {                             //objeto que tendra todos los datos el token
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        rol: user.rol,
        image: user.image,
        //Generar fecha de creacion y expirancion de token
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwt.encode(payload, secret);
};