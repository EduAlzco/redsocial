const express = require('express');
//const bodyParser = require('body-parser');
const app = express();

//Cargar rutas
const user_routes = require('../routes/user');
const follow_routes = require('../routes/follow');
const publication_routes = require('../routes/publication');
const message_routes = require('../routes/message');

//Cargar middlewares   - Metodos que se ejecutan antes que se ejecute alguna accion de un controlador
app.use(express.json());
app.use(express.urlencoded({extended:false}));
//app.use(bodyParser.json());

//Cargar cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

//Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);









//exportar
module.exports = app;