import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Classe = new Schema({
    designacao: {
        type: String,
        require: true
    },
    numVagas: {
        type: Number,
        require: 0
    },
    turmas: {
        type: Array,
        require: true
    },
    idCurso: {
        type: String,
        require: true
    },
    idAno: {
        type: String,
        require: true
    },
    disciplinas: {
        type: Array,
        require: true
    }
    
})


const classe  = mongoose.model("classes", Classe)
export default classe