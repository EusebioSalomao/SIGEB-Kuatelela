import { Router } from "express";
import { inicio, sobreNos } from "../controlles/home.controll.js";
import { veryLogin,pago } from "../../helpers/eAdmin.js";
const router = Router()

router.get('/',pago, inicio)
router.get('/sobreNos',pago, sobreNos)

export default router