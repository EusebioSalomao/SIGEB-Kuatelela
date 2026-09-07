import {Router} from 'express'
import { actualizaDadosAluno, alterarNome, fichaAluno, matricular, menu, tdAlunos, wAdmitir } from '../controlles/aluno.controll.js'
import { eAdmin, veryLogin } from '../../helpers/eAdmin.js'
import {storage} from '../middlewares/uploadImage.midware.js'
import multer from 'multer'
const upload = multer({storage: storage});

const router = Router()

router.post('/alterarNome', veryLogin, eAdmin, alterarNome )
router.get('/', veryLogin, eAdmin, tdAlunos)
router.get('/matricular/:id', veryLogin, eAdmin, wAdmitir)
router.post('/matricular/:id', veryLogin, eAdmin, matricular)
router.get('/ficha/:id', veryLogin, fichaAluno)
router.post('/actualizaDadosAluno', veryLogin, actualizaDadosAluno)
router.get('/menu/:id', veryLogin, menu)

export default router