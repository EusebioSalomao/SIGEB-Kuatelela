import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Despesa = new Schema({
    descricao: {
        type: String,
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


const despesa  = mongoose.model("despesas", Despesa)
export default despesa