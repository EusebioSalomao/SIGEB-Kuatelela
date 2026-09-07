
import { Router } from "express";
import {storage} from '../middlewares/uploadImage.midware.js'
import { newNova, create, findtAll, topNews, findById, searchByTitle, byUser, updateNews, erase, likesNews, addComents, deleteComents, wEdtNew } from "../controlles/new.controll.js";
import multer from 'multer'
import { eAdmin, veryLogin } from '../../helpers/eAdmin.js';
const upload = multer({storage: storage});
const router = Router();
//import {authMiddware} from '../middwares/auth.middware.js'

router.get('/nova', newNova )
router.post('/create', upload.single('capa'),veryLogin, create)
router.get('/', findtAll)
router.get('/top', topNews)
router.post('/pesqNews',veryLogin, findById)
router.post('/search', searchByTitle)
router.post('/byUser', byUser)
router.get('/wEdtNew/:id', wEdtNew)
router.post('/update',veryLogin, updateNews)//Método - patch
router.post('/delete', erase)// Método - delete
router.post('/likes', veryLogin, likesNews)//Método - patch
router.post('/coments', addComents)//Método - patch
router.post('/deleteComents', deleteComents)//Método - patch




export default router