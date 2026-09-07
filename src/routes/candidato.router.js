import {Router} from 'express'
import { aceitarCand, actualizarNomes, addCandCont, admitiCand, allCandidatos, consultCand, deleteCand, saveCandidato, saveEdidarCand, solicitacoes, verListaPorCurso, wCandidato, wDetalheCand, wEdidarCand } from '../controlles/candidato.controll.js'
import {storage} from '../middlewares/uploadImage.midware.js'
import multer from 'multer'
import { eAdmin, veryLogin } from '../../helpers/eAdmin.js';
const upload = multer({storage: storage});
const router = Router()

router.get('/', veryLogin, allCandidatos)
router.get('/solicitacoes', veryLogin, solicitacoes)
router.get('/add', wCandidato)
router.post('/addCont', addCandCont)
router.post('/save', upload.single('fotoAluno'), saveCandidato)
router.get('/detalhes/:id', veryLogin, wDetalheCand)
router.get('/edidar/:id', veryLogin, eAdmin, wEdidarCand)
router.post('/edidar', veryLogin, eAdmin, saveEdidarCand)
router.get('/deletar/:id', veryLogin, eAdmin, deleteCand)
router.post('/consultar', consultCand)
router.post('/admitir', veryLogin, eAdmin, admitiCand)
router.post('/aceitarCand', veryLogin, eAdmin, aceitarCand)
router.get('/actualizarNomes', actualizarNomes)
router.get('/verListaPorCurso/:id', verListaPorCurso)

export default router