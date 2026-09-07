import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Pauta = new Schema({
    trimestre: {
        type: String,
        require: true
    },
    discsTurma: {
        type: Array,
        require: true
    },
    anoLectivo: {
        type: Schema.Types.ObjectId,
        ref: "anosLectivo",
        require: true
    },
    turma: {
        type: Schema.Types.ObjectId,
        ref: "turmas",
        require: true
    },
    classe: {
        type: Schema.Types.ObjectId,
        ref: "classes",
        require: true
    },
    curso: {
        type: Schema.Types.ObjectId,
        ref: "cursos",
        require: true
    },
    dadosPauta: {
        type: Array,
        require: true
    },
    notasDisciplina: {
        type: Schema.Types.ObjectId,
        ref: "notasdisciplina",
        require: true
    },
    conselho: {
        type: String,
        default: ""
    },
    membrosConselho: {
        type: Array,
        required: true
    },
    conselhoAutomaticoAplicado: {
        type: Boolean,
        default: false
    }
    
})


const pauta  = mongoose.model("pautas", Pauta)
export default pauta