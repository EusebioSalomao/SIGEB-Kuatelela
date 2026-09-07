import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Curso = new Schema({
    descricao: {
        type: String,
        required: true
    },
    sigla: {
        type: String,
        required: true
    },
    idAno: {
        type: String,
        require: true
    },
    classe10: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    classe11: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    classe12: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    coordenador: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        require: true
    }
    
})


const curso  = mongoose.model("cursos", Curso)
export default curso