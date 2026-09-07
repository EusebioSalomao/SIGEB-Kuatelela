import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Candidato = new Schema({
    nome: {
        type: String,
        required: true
    },
    numBI: {
        type: String,
        require: true
    },
    dataNascimento: {
        type: Date,
        require: true
    },
    foto: {
        type: String,
        require: true
    },
    idade: {
        type: Number,
        require: true
    },
    anoNascimento: {
        type: Number,
        require: true
    },
    genero: {
        type: String,
        required: true
    },
    contacto: {
        type: String,
        require: true
    },
    periodo: {
        type: String,
        default: ''
    },
    escolaAnterior: {
        type: String,
        default: ''
    },
    curso: {
        type: String,
        required: true
    },
    certificado: {
        type: String,
        default: ''
    },
    emolumento: {
        type: String,
        default: ''
    },
    media: {
        type: Number,
        default: 0
    },
    estado: {
        type: String,
        default: 'Inscrito'
    },
    naoAdmitido: {
        type: Boolean,
        require: true
    }
    
})


const candidato  = mongoose.model("candidatos", Candidato)
export default candidato