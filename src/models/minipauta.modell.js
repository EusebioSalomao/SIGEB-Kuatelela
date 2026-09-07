import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Minipauta = new Schema({
    nomeDisciplina: {
        type: String,
        required: true
    },
    nomeProfessor: {
        type: String,
        default: "Professor"
    },
    codigoTurma: {
        type: String,
        default: "Turma"
    },
    idClasse: {
        type: Schema.Types.ObjectId,
         ref: "classes",
         require: true
    },
    idProfessor: {
        type: Schema.Types.ObjectId,
         ref: "funcionarios",
         require: true
    },
    alunos: {
        type: Array,
        require: true
    },
    idTurma: {
        type: Schema.Types.ObjectId,
         ref: "turmas",
         require: true
    },
    idCurso: {
        type: String,
        required: true
    },
    idAno: {
        type: String,
        required: true
    },
    lancadoAV1T1: {
        type: Number,
        require: true
    },
    lancadoAV2T1: {
        type: Number,
        require: true
    },
    lancadoAV3T1: {
        type: Number,
        require: true
    },
    lancadoMac1: {
        type: Number,
        require: true
    },
    lancadoPPT1: {
        type: Number,
        require: true
    },
    lancadoPTT1: {
        type: Number,
        require: true
    },
    lancadoAV1T2: {
        type: Number,
        require: true
    },
    lancadoAV2T2: {
        type: Number,
        require: true
    },
    lancadoAV3T2: {
        type: Number,
        require: true
    },
    lancadoMac2: {
        type: Number,
        require: true
    },
    lancadoPPT2: {
        type: Number,
        require: true
    },
    lancadoPTT2: {
        type: Number,
        require: true
    },
    lancadoAV1T3: {
        type: Number,
        require: true
    },
    lancadoAV2T3: {
        type: Number,
        require: true
    },
    lancadoAV3T3: {
        type: Number,
        require: true
    },
    lancadoMac3: {
        type: Number,
        require: true
    },
    lancadoPPT3: {
        type: Number,
        require: true
    },
    lancadoPTT3: {
        type: Number,
        require: true
    },
    lancadoExameOral: {
        type: Number,
        require: true
    },
    lancadoExameEscrito: {
        type: Number,
        require: true
    }
    
})

const minipauta  = mongoose.model("minipautas", Minipauta)
export default minipauta