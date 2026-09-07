import { Router } from "express";
import { addFuncionario, addFuncionarioPriori, detalheF, editarF, saveEditar, saveFuncionario, tdFuncionarios } from "../controlles/funcionario.controll.js";
import {storage} from '../middlewares/uploadImage.midware.js'
import multer from 'multer'
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
const upload = multer({storage: storage});
const router = Router()

router.get('/', veryLogin, eAdmin, tdFuncionarios)
router.get('/add', veryLogin, eAdmin, addFuncionario)
router.post('/addd', veryLogin, eAdmin, addFuncionarioPriori)
router.post('/saveFuncionario', veryLogin, eAdmin, upload.single('fotoProf'), saveFuncionario)
router.get('/detalhes/:id', veryLogin, detalheF)
router.get('/editar/:id', veryLogin, eAdmin, editarF)
router.post('/saveEditar', veryLogin, eAdmin, saveEditar)

export default router