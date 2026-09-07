import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Ocorrencia = new Schema({
    descricao: {
        type: String,
        require: true
    },
    anoLectivo: {
        type: Schema.Types.ObjectId,
        ref: "anosLectivo",
        require: true
    },
    anoSolicitado: {
        type: Schema.Types.ObjectId,
        ref: "anosLectivo",
        require: true
    },
    tipoOcorrencia: {
        type: String,
        require: true
    },
    nomeDoSolicitante: {
        type: String,
        require: true
    },
    numBI: {
        type: String,
        require: true
    },
    turma: {
        type: Schema.Types.ObjectId,
        ref: "turmas",
        require: true
    },
    numfaltas: {
        type: Number,
        require: true
    },
    disciplina: {
        type: String,
        require: true
    },
    dataFalta: {
        type: Date,
        require: true
    },
    origem: {
        type: String,
        require: true
    },
    dataOcorrencia: {
        type: Date,
        default: Date.now()
    },
    estado: {
        type: String,
        require: true
    },
    comNotas: {
        type: String,
        require: true
    },
    classe: {
        type: String,
        require: true
    },
    funcionario: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        require: true
    },
    autorizado: {
        type: String,
        require: true
    },
    emissor: {
        type: String,
        require: true
    },
    copOcorrencia: {
        type: String,
        require: true
    },
    contacto: {
        type: String,
        require: true
    },
    anoDeConclusao: {
        type: String,
        require: true
    },
    paraEfeito: {
        type: String,
        require: true
    }
    
})


const ocorrencia  = mongoose.model("ocorrencias", Ocorrencia)
export default ocorrencia