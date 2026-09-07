import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Receita = new Schema({
    descricao: {
        type: String,
        required: true
    },
    qt: {
        type: Number,
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    obs: {
        type: String,
        require: true
    },
    idAno: {
        type: Schema.Types.ObjectId,
        ref: "anosLevtivos",
        require: true
    },
    funcionario: {
        type: Schema.Types.ObjectId,
        ref: "funcionarios",
        require: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})


const receita  = mongoose.model("receitas", Receita)
export default receita