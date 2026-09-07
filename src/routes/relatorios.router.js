import { Router } from "express";
import { gerarListaAlunos, gerarListaDePresenca, gerarListaExame, listaAprovados, listaCandidatosCursos, listaReprovados, pautaFinal, pautaFinalDoConselho, pautaTrimestral, pautaTrimestral2, pautaTrimestral3, pautaTrimestralII, pautaTrimestralIII, relFDiario, rendListaAlunosAprovados } from "../controlles/relatorios.controll.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
import { gerarListaPDF, listaAprovadosPDF, verListaPDF } from "../../api/gerarPDF.js";
import { actualPDF, listaAlunosPDF, miniPautaPDF, pintarNomeAluno } from "../relatoriosPDF/listas.relatorios.js";
const router = Router()

/* Rotas */
router.get('/pautaTrimestral/:id', veryLogin, eAdmin, pautaTrimestral)
router.get('/pautaTrimestral2/:id', veryLogin, eAdmin, pautaTrimestral2)
router.get('/pautaTrimestral3/:id', veryLogin, eAdmin, pautaTrimestral3)
router.get('/pautaFinal/:id', veryLogin, eAdmin, pautaFinal)
router.get('/pautaFinalDoConselho/:id', veryLogin, eAdmin, pautaFinalDoConselho)
router.get('/relFDiario', veryLogin, eAdmin, relFDiario)
router.get('/gerarListaAlunos/:id', veryLogin, eAdmin, gerarListaAlunos)
router.get('/listaExame/:id', veryLogin, eAdmin, gerarListaExame)
router.get('/gerarListaDePresenca/:id', veryLogin, eAdmin, gerarListaDePresenca)
router.get('/verListaPDF/:id', veryLogin, eAdmin, verListaPDF)
router.get('/listaAprovados/:id', veryLogin, eAdmin, listaAprovadosPDF)
router.get('/listaReprovados/:id', veryLogin, eAdmin, listaReprovados)
router.get('/listaCandidatosCursos/:id', veryLogin, eAdmin, listaCandidatosCursos)
router.get('/rendListaAlunosAprovados/:id', rendListaAlunosAprovados)
router.get('/listaAprovadosPDF/:id', listaAprovados)

/* Novas rotas de relatórios */
router.get('/actualPDF/:id', actualPDF)
router.get('/listaAlunosPDF/:id', listaAlunosPDF)
router.get('/minipautaPDF/:id', miniPautaPDF)
router.post('/pintarNomeAluno/:id', veryLogin, eAdmin, pintarNomeAluno)

//router.get('/pautaTrimestralII/:id', veryLogin, eAdmin, pautaTrimestralII)
//router.get('/pautaTrimestralIII/:id', veryLogin, eAdmin, pautaTrimestralIII)



export default router