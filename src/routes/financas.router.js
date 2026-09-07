import { Router } from "express";
import { addDespesa, addReceita, despesas, gerarRelDiario, gerarRelSem, homeFinancas, receitas, relatorios, resumo, saveDespesa, saveReceita } from "../controlles/financas.controll.js";
import { eFinanc, veryLogin } from "../../helpers/eAdmin.js";
const router = Router()

router.get('/', veryLogin, eFinanc, homeFinancas)
router.get('/receitas', veryLogin, eFinanc, receitas)
router.get('/addReceita', veryLogin, eFinanc, addReceita)
router.post('/saveReceita', saveReceita)
router.get('/despesas', veryLogin, eFinanc, despesas)
router.get('/addDespesa', veryLogin, eFinanc, addDespesa)
router.post('/saveDespesa', veryLogin, eFinanc, saveDespesa)
router.get('/resumo', veryLogin, eFinanc, resumo)
router.get('/relatorios', veryLogin, eFinanc, relatorios)
router.post('/gerarRelDiario', veryLogin, eFinanc, gerarRelDiario)
router.post('/gerarRelSem', veryLogin, eFinanc, gerarRelSem)


export default router