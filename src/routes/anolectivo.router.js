import { Router } from "express";
import { abrirCandidatura, activarAnoLectivo, adAnoLectivo, allAnosLectivos, deletarAnoLectivo, desactivarAnoLectivo, ecerrarCandidatura, editAnoLectivo, editSave, gerirCurso, pauta2, pautas, wAdAnoLectivo, wConfigAnoLectivo } from "../controlles/anoLectivo.controll.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
const router = Router()

router.get('/', veryLogin, eAdmin, allAnosLectivos)
router.get('/add', veryLogin, eAdmin, wAdAnoLectivo)
router.post('/add', veryLogin, eAdmin, adAnoLectivo)
router.get('/config/:id', veryLogin, wConfigAnoLectivo)
router.post('/deletar', veryLogin, eAdmin, deletarAnoLectivo)
router.get('/activar/:id', veryLogin, eAdmin, activarAnoLectivo)
router.post('/desativar', veryLogin, eAdmin, desactivarAnoLectivo)
router.post('/gerirCurso', veryLogin, gerirCurso)
router.get('/edit/:id', veryLogin, eAdmin, editAnoLectivo)
router.post('/editSave', veryLogin, eAdmin, editSave)
router.get('/abrirCandidatura/:id', veryLogin, eAdmin, abrirCandidatura)
router.get('/encerrarCandidatura/:id', veryLogin, eAdmin, ecerrarCandidatura)
router.get('/pautas/:id', veryLogin, eAdmin, pautas)
router.post('/pauta3', veryLogin, eAdmin, pauta2)

export default router