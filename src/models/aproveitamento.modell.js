import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Aproveitamento = new Schema({
    trimestre: {
        type: String,
        required: true
    },
    aproveitamentoII: {
        type: Array,
        require: true
    },
    idAno: {
        type: Schema.Types.ObjectId,
        ref: "anosLevtivos",
        require: true
    }
    
})  


const aproveitamento  = mongoose.model("aproveitamentos", Aproveitamento)
export default aproveitamento