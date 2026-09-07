import { Router } from "express";
import { adicionarCandidato, adicionarCandidatoSave, admissaoCandidaturas, admissaoCandidaturasConf, candidatos, homeCoordenacao } from "../controlles/coordenador.controll.js";
import { eCoordCurso, veryLogin } from "../../helpers/eAdmin.js";
const router = Router()

router.get("/:id",veryLogin, eCoordCurso, homeCoordenacao)
router.get("/candidatos/:id",veryLogin, eCoordCurso, candidatos)
router.post("/adicionarCandidato",veryLogin, eCoordCurso, adicionarCandidato)
router.post("/adicionarCandidatoSave",veryLogin, eCoordCurso, adicionarCandidatoSave)
router.post("/admissaoCandidaturas",veryLogin, eCoordCurso, admissaoCandidaturas)
router.post("/admissaoCandidaturasConf",veryLogin, eCoordCurso, admissaoCandidaturasConf)






export default router
