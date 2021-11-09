const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env'});

const conectarDB = async () => {
 
    try {
        await mongoose.connect(process.env.DB_MONGO)
        console.log("Base de Datos conectada correctamente");
   
    } catch (error) {
        console.log(error);
        procces.exit(1) //se detiene la app
    }

}

module.exports = conectarDB;