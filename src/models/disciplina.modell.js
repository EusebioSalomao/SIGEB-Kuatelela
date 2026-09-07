import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Disciplina = new Schema({
    nomeDisciplina: {
        type: String,
        required: true
    },
    tempoSemanal: {
        type: Number,
        required: true
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
    notas: {
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
    }
    
})


const disciplina  = mongoose.model("disciplinas", Disciplina)
export default disciplina