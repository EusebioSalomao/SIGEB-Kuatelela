import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Turma = new Schema({
    codigo: {
        type: String,
        required: true
    },
    periodo: {
        type: String,
        required: true
    },
    alunos: {
        type: Array,
        require: true
    },
    idClasse: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    idCurso: {
        type: Schema.Types.ObjectId,
        ref: "cursos",
        require: true
    },
    cordenador: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        require: true
    },
    juriPresidente: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        require: true
    },
    delegado: {
        type: Schema.Types.ObjectId,
        ref: "alunos",
        require: true
    },
    totalAlunos: {
        type: Number,
        require: true
    },
    idAno: {
        type: String,
        required: true
    },
    reconfirmaAprovados: {
        type: Boolean,
        default: false
    },
    reconfirmaReprovados: {
        type: Boolean,
        default: false
    },
    
})


const turma  = mongoose.model("turmas", Turma)
export default turma