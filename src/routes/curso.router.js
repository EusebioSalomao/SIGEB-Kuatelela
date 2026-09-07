import { Router } from "express";
const router = Router()
import { adCurso, allCursos, editCurso, excluirCurso, wAdCurso, wEditCurso } from "../controlles/curso.controll.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";

router.get('/', veryLogin, allCursos)
router.get('/add/:id', veryLogin, eAdmin, wAdCurso)
router.post('/add', veryLogin, eAdmin, adCurso)
router.get('/editar/:id', veryLogin, eAdmin, wEditCurso)
router.post('/editar', veryLogin, eAdmin, editCurso)
router.get('/excluir/:id', veryLogin, eAdmin, excluirCurso)


export default router