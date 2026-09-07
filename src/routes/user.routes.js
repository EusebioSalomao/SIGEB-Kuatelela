import { Router } from "express";
const router = Router();
import { addUser, allUsers, alterarSenha, createNewUserAluno, deletUser, editUser, funcionariosUsers, login, logout, perfil, restaurar, telaLogin, wAddUser, wEditUser } from "../controlles/user.controll.js";
import {validFildUser} from '../middlewares/user.middlewer.js'
import {storage} from '../middlewares/uploadImage.midware.js'
import multer from 'multer'
import { eAdmin, veryLogin,pago } from "../../helpers/eAdmin.js";
const upload = multer({storage: storage});

router.get('/allUsers',veryLogin, eAdmin, allUsers)
router.get('/login',pago, telaLogin)
router.post('/login',pago, login)
router.get('/logout', logout)
router.get('/add', veryLogin, eAdmin, wAddUser)
router.post('/add', veryLogin, eAdmin, upload.single('fotoUser'), validFildUser, addUser)
router.get('/deletUser/:id', veryLogin, eAdmin, deletUser)
router.get('/editUser/:id', veryLogin, eAdmin, wEditUser)
router.post('/editUser', veryLogin, eAdmin, editUser)
router.get('/perfil', veryLogin, perfil)
router.get('/newUserAluno/:id', veryLogin, eAdmin, createNewUserAluno)
router.get('/funcionarios', veryLogin, eAdmin, funcionariosUsers)
router.post('/restaurar', veryLogin, eAdmin, restaurar)
router.post('/alterarSenha', veryLogin, alterarSenha)


export default router