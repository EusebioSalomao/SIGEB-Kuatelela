import { Router } from "express";
import { atribuirCargo, autorizacoes, autorizar, autorizarAdmin, bloquearSystem, definicoes, lancamentoDeNotas, nivelPrivilegio, pagamento, redefinicaoDeSenha, removerCargo, restringirAccess, salvarCargo, salvarRemCargo, vercSystemHome, vercSystemLog, vercSystemVerifyLog } from "../controlles/definicao.controll.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
const router = Router()

router.get('/', veryLogin, eAdmin, definicoes)
router.post('/atribuirCargo', veryLogin, eAdmin, atribuirCargo)
router.post('/salvarCargo', veryLogin, eAdmin, salvarCargo)
router.post('/removerCargo', veryLogin, eAdmin, removerCargo)
router.post('/salvarRemCargo', veryLogin, eAdmin, salvarRemCargo)
router.get('/autorizacoes', veryLogin, eAdmin, autorizacoes)
router.post('/autorizarAdmin', veryLogin, eAdmin, autorizarAdmin)
router.post('/autorizar', veryLogin, eAdmin, autorizar)
router.post('/nivelPrivilegio', veryLogin, eAdmin, nivelPrivilegio)
router.post('/pagamento', veryLogin, eAdmin, pagamento)
router.post('/bloquearSystem', veryLogin, eAdmin, bloquearSystem)
router.post('/lancamentoDeNotas', veryLogin, eAdmin, lancamentoDeNotas)
router.post('/restringirAccess', veryLogin, eAdmin, restringirAccess)
router.post('/redefinicaoDeSenha', veryLogin, eAdmin, redefinicaoDeSenha)


/* Avanced */
router.get('/vercSystemHome', vercSystemHome)
router.post('/vercSystem', vercSystemLog)
router.post('/vercSystemVerifyLog', vercSystemVerifyLog)


export default router