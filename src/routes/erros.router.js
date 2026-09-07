import { Router } from "express";
import { veryLogin } from "../../helpers/eAdmin.js";
import { mensagemDeerros } from "../erros.controll.js";

const router = Router()

router.get('/', veryLogin, mensagemDeerros)

export default router;