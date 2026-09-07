import {Router} from 'express'
import { salvarSolicitacao, solicitar } from '../controlles/informaAqui.control.js'
import {storage} from '../middlewares/uploadImage.midware.js'
import multer from 'multer'
const upload = multer({storage: storage});
const router = Router()

router.post('/solicitar', solicitar)
router.post('/salvarSolicitacao', upload.single('copOcorrencia'), salvarSolicitacao)



export default router