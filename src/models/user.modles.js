import mongoose from "mongoose"
import bcrypt from 'bcryptjs'
const Schema = mongoose.Schema;

const Usuario = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    senha: {
        type: String,
        required: true
    },
    foto: {
        type: String,
        require: true
    },
    telefone: {
        type: String,
        default: '944480128'
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    eAdminDev: {
        type: Boolean,
        default: false
    },
    privilegio: {
        type: Number,
        default: 0
    },
    categoria: {
        type: String,
        default: 'aluno'
    },
    token: {
        type: String,
        require: true
    },
    senhaAlterada: {
        type: Boolean,
        default: false
    },
    access: {
        type: Boolean,
        default: true
    },
    dev: {
        type: Boolean,
        default: false
    },
    _addUser: {
        type: Boolean,
        default: false
    },
    _openDefinitionSystem: {
        type: Boolean,
        default: false
    },
    _openAnosLectivo: {
        type: Boolean,
        default: false
    },
    _deleteUsers: {
        type: Boolean,
        default: false
    },
    _addAluno: {
        type: Boolean,
        default: false
    },
    _matricuarAluno: {
        type: Boolean,
        default: false
    },
    _anularMatricula: {
        type: Boolean,
        default: false
    },
    _professoresTurma: {
        type: Boolean,
        default: false
    },
    _editarTurma: {
        type: Boolean,
        default: false
    },
    _alterarAluno: {
        type: Boolean,
        default: false
    },
    _editarNotaAluno: {
        type: Boolean,
        default: false
    },
    _editarPauta: {
        type: Boolean,
        default: false
    },
    _eliminarPauta: {
        type: Boolean,
        default: false
    },
    _atribuirCarga: {
        type: Boolean,
        default: false
    },
})

Usuario.pre('save', async function (next){
    this.senha = await bcrypt.hash(this.senha, 10)
    next();
})

const usuario  = mongoose.model("users", Usuario)
export default usuario