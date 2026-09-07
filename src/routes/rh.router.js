import {Router} from 'express'
import { rhHome } from '../controlles/rh.controll.js'
import { veryLogin } from '../../helpers/eAdmin.js'
const router = Router()

router.get('/',veryLogin, rhHome)


export default router