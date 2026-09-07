import { Router } from "express";
import { addAluno, admin, anularMatricula, anularMatriculaGeral, apagarAluno, apagarAluno2, atribGenero, backup, confirmarMatricula, contactosAlunos, credenciaisUserPDF, edidarMiniPauta, editarFoto, editarMiniPauta2, editarNotaMinipauta, editarTurma, eliminarMiniPauta, eliminarMiniPauta2, eliminarNotasDisciplina, eliminarTurma, listaUserPDF, relUserSistema, verificarNomesRepetidos } from "../controlles/admin.controll.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
import { actualizarIdAnoActivo, actualizarNomes } from "../controlles/aluno.controll.js";
const router = Router()

router.get('/verificarNomesRepetidos/',veryLogin, verificarNomesRepetidos)
router.get('/relUserSistema', veryLogin, eAdmin, relUserSistema)
router.get('/actualizarNomesAlunos/',veryLogin, actualizarNomes)//Este método coloca todos nomes em minusculas ou inicial Maiuscala
router.get('/actualizarIdAnoActivo/',veryLogin, actualizarIdAnoActivo)//Este método Actualiza o id do ano activo em todos alunos matriculados
router.get('/contactosAlunos', veryLogin, eAdmin, contactosAlunos)
router.get('/listaUserPDF/',veryLogin, eAdmin, listaUserPDF)
router.get('/credenciasPDF/',veryLogin, eAdmin, credenciaisUserPDF)
router.get('/backup', veryLogin, eAdmin, backup)
router.get('/:id', veryLogin, eAdmin, admin)
router.post('/editFoto', veryLogin, editarFoto)
router.post('/addAluno',veryLogin, eAdmin, addAluno)
router.post('/atribGenero',veryLogin, eAdmin, atribGenero)
router.get('/apagarAluno/:id', veryLogin, eAdmin, apagarAluno)
router.get('/anularMatricula/:id', veryLogin, eAdmin, anularMatricula)
router.get('/anularMatriculaGeral/:id', veryLogin, eAdmin, anularMatriculaGeral)
router.post('/apagarAluno2/', veryLogin, eAdmin, apagarAluno2)
router.get('/eliminarMiniPauta/:id', veryLogin, eAdmin, eliminarMiniPauta)
router.get('/edidarMiniPauta/:id', veryLogin, eAdmin, edidarMiniPauta)
router.post('/eliminarMiniPauta/', veryLogin, eAdmin, eliminarMiniPauta2)
router.post('/editarMiniPauta/', veryLogin, eAdmin, editarMiniPauta2)
router.post('/eliminarTurma/', eAdmin, eliminarTurma)
router.post('/editarTurma/',veryLogin, eAdmin, editarTurma)
router.post('/editarNotaMinipauta/',veryLogin, editarNotaMinipauta)
router.get('/eliminarNotasDisciplina/:id', veryLogin, eAdmin, eliminarNotasDisciplina)
router.post('/confirmarMatricula/',veryLogin, confirmarMatricula)




export default router