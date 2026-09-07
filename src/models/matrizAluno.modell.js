import mongoose from "mongoose"
const Schema = mongoose.Schema;

const MatrizAluno = new Schema({
    aluno: {
        type: Schema.Types.ObjectId,
        ref: "alunos",
        require: true
    },
    notas: {
        type: Array,
        require: true
    },
    idClasse: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    idTurma: {
        type: Schema.Types.ObjectId,
        ref: "turmas",
        require: true
    },
    idCurso: {
        type: Schema.Types.ObjectId,
        ref: "cursos",
        require: true
    },
    idAno: {
        type: Schema.Types.ObjectId,
        ref: "anosLevtivos",
        require: true
    }
    
})


const matriz  = mongoose.model("matrizesAluno", MatrizAluno)
export default matriz