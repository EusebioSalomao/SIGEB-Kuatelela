import mongoose from "mongoose"
const Schema = mongoose.Schema;

const NotasDisciplina = new Schema({
    aluno: {
        type: Schema.Types.ObjectId,
        ref: "alunos",
        required: true
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        required: true
    },
    idMinipauta: {
        type: Schema.Types.ObjectId,
        ref: "minipautas",
        require: true
    },
    idClasse: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        required: true
    },
    idTurma: {
        type: Schema.Types.ObjectId,
        ref: "turmas",
        required: true
    },
    notas: {
        type: Schema.Types.ObjectId,
        ref: "notasTrimestrais",
        require: true
    },
    idCurso: {
        type: Schema.Types.ObjectId,
        ref: "cursos",
        require: true
    }
})


const notadisciplina  = mongoose.model("notasdisciplina", NotasDisciplina)
export default notadisciplina