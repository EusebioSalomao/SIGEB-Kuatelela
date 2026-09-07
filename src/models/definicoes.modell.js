import mongoose from "mongoose"
const Schema = mongoose.Schema;

const Definicao = new Schema({
    nome: {
        type: String,
        default: "Definições"
    },
    abrirReconfirmacao: {
        type: Boolean,
        default: false
    },
    autorizarAdmissaoCandidato: {
        type: Boolean,
        default: false
    },
    vagasCHRegular: {
        type: Number,
        default: 0
    },
    vagasCHAdultos: {
        type: Number,
        default: 0
    },
    vagasCFBRegular: {
        type: Number,
        default: 0
    },
    vagasCFBAdultos: {
        type: Number,
        default: 0
    },
    vagasCEJRegular: {
        type: Number,
        default: 0
    },
    vagasCEJAdultos: {
        type: Number,
        default: 0
    },
    diaPago: {
        type: Number,
        default: 3
    },
    diaLimite: {
        type: Number,
        default: 3
    },
    mesPago: {
        type: Number,
        default: 1
    },
    mesLimite: {
        type: Number,
        default: 1
    },
    anoLimite: {
        type: Number,
        default: 2025
    },
    fimDoPrazo: {
        type: Boolean,
        default: false
    },
    
})

const definicao  = mongoose.model("definioes", Definicao)
export default definicao