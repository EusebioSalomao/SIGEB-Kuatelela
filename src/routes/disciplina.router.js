import {Router} from 'express'
import { addDisciplina, editarDisciplina, editarDisciplinaSave, tdDisciplina } from '../controlles/disciplina.controll.js';
import { eAdmin, veryLogin } from '../../helpers/eAdmin.js';
const router = Router()

router.get('/', veryLogin, tdDisciplina)
router.post('/add', veryLogin, eAdmin, addDisciplina)
router.get('/editar/:id', veryLogin, eAdmin, editarDisciplina)
router.post('/editarDisciplinaSave', veryLogin, eAdmin, editarDisciplinaSave)


export default router;