import mongoose from "mongoose"
const Schema = mongoose.Schema;

const RelUsuario = new Schema({
    username: {
        type: String,
        required: true
    },
    nomeDoUsuario: {
        type: String,
        required: true
    },
    horaDeAcesso: {
        type: String,
        require: true
    },
    diaDeAcesso: {
        type: String,
        require: true
    },
    mesDeAcesso: {
        type: String,
        require: true
    },
    anoDeAcesso: {
        type: String,
        require: true
    },
    categoria: {
        type: String,
        require: true
    },
    idProfessor: {
        type: String,
        require: true
    },
})

const relUsusuario  = mongoose.model("relUsuarios", RelUsuario)
export default relUsusuario