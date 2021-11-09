
const app = require('./config/app');
const conectarDB= require('./config/db.js');

//Se crea el servidor
app.listen(4000, () => {        
    console.log("el servidor esta corriendo");
}) 
//conectar la DB
conectarDB();




