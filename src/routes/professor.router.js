import { Router } from "express";
import mongoose from "mongoose";
import { actualizarDados, aplicarFalta, avaliacoes, config, criarAvaliacao, justificarFaltaDoAluno, lancarNota, lancarNotaRep, lancarNotaRepSalve, listaAlunos, miniPauta, miniPautas, minipautasCadPAdmin, professor, saveActualizarDadosProf, solicitacoesProf, turmasDoProf } from "../controlles/professor.controll.js";
import { selelectTrimestAndNotaDe } from "../middlewares/professor.middlewere.js";
import { eAdmin, veryLogin } from "../../helpers/eAdmin.js";
import { verifyChangePassword } from "../outrasF/ocorrFunc.js";
import { miniPautaComNotasPDF } from "../relatoriosPDF/listas.relatorios.js";
const router = Router()

const camposDeNotaEditaveis = new Set([
    "mac1",
    "mac2",
    "mac3",
    "pt1",
    "pt2",
    "pt3",
    "examePF"
]);

const numeroComDuasCasas = (valor) => Math.round(valor * 100) / 100;

const calcularMedia = (valores) => {
    const valoresValidos = valores
        .map(Number)
        .filter((valor) => Number.isFinite(valor));

    if (!valoresValidos.length) return 0;

    return numeroComDuasCasas(
        valoresValidos.reduce((total, valor) => total + valor, 0) / valoresValidos.length
    );
};

const calcularMediasDaNota = (nota) => {
    const mt1 = calcularMedia([nota.mac1, nota.pt1]);
    const mt2 = calcularMedia([nota.mac2, nota.pt2]);
    const mt3 = calcularMedia([nota.mac3, nota.pt3]);
    const medDosTrimestes = calcularMedia([mt1, mt2, mt3]);
    const cf = calcularMedia([medDosTrimestes, nota.examePF]);

    return { mt1, mt2, mt3, medDosTrimestes, cf };
};

/*
 * A minipauta liga notasdisciplina a notasTrimestrais através do campo "notas".
 * A rota fica aqui para que a edição inline não dependa da rota administrativa.
 * Os modelos já são registados pela aplicação quando a minipauta é carregada.
 */
const actualizarNotaMinipauta = async (req, res) => {
    try {
        const {
            idNotaDisciplina,
            idNotaTrimestral,
            campo,
            valor
        } = req.body || {};

        if (
            !mongoose.isValidObjectId(idNotaDisciplina) ||
            !mongoose.isValidObjectId(idNotaTrimestral) ||
            !camposDeNotaEditaveis.has(campo)
        ) {
            return res.status(400).json({
                ok: false,
                mensagem: "Dados da nota inválidos."
            });
        }

        const valorNormalizado = String(valor).trim().replace(",", ".");
        const nota = Number(valorNormalizado);

        if (
            valorNormalizado === "" ||
            !Number.isFinite(nota) ||
            nota < 0 ||
            nota > 20
        ) {
            return res.status(400).json({
                ok: false,
                mensagem: "A nota deve ser um número entre 0 e 20."
            });
        }

        const NotasDisciplina = mongoose.model("notasdisciplina");
        const NotaTrimestral = mongoose.model("notasTrimestrais");
        const notaDisciplina = await NotasDisciplina
            .findById(idNotaDisciplina)
            .select("notas")
            .lean();

        if (
            !notaDisciplina ||
            String(notaDisciplina.notas) !== String(idNotaTrimestral)
        ) {
            return res.status(404).json({
                ok: false,
                mensagem: "A relação da nota com a minipauta não foi encontrada."
            });
        }

        const notaExistente = await NotaTrimestral
            .findById(idNotaTrimestral)
            .lean();

        if (!notaExistente) {
            return res.status(404).json({
                ok: false,
                mensagem: "Nota trimestral não encontrada."
            });
        }

        const notaComAlteracao = { ...notaExistente, [campo]: nota };
        const medias = calcularMediasDaNota(notaComAlteracao);
        const notaActualizada = await NotaTrimestral.findByIdAndUpdate(
            idNotaTrimestral,
            { $set: { [campo]: nota, ...medias } },
            { new: true, runValidators: true }
        ).lean();

        if (!notaActualizada) {
            return res.status(404).json({
                ok: false,
                mensagem: "Nota trimestral não encontrada."
            });
        }

        return res.json({
            ok: true,
            nota: notaActualizada
        });
    } catch (erro) {
        console.error("Erro ao actualizar nota da minipauta:", erro);
        return res.status(500).json({
            ok: false,
            mensagem: "Não foi possível guardar a nota."
        });
    }
};

router.get('/solicitacoesProf', veryLogin, solicitacoesProf)
router.get('/:id', veryLogin, verifyChangePassword, professor)
router.get('/turmas/:id', veryLogin, turmasDoProf)
router.get('/listaAlunos/:id', veryLogin, listaAlunos)
router.get('/minipautas/:id', veryLogin, miniPautas)
router.get('/minipautasCadPAdmin/:id', veryLogin, eAdmin, minipautasCadPAdmin)
router.get('/minipauta/:id', veryLogin, miniPauta)
router.get('/minipautaPDF/:id', veryLogin, miniPautaComNotasPDF)
router.get('/config', veryLogin, config)
router.post('/lancarNota', veryLogin, selelectTrimestAndNotaDe, lancarNota)
router.post('/lancarNotaRep', veryLogin, selelectTrimestAndNotaDe, lancarNotaRep)
router.post('/lancarNotaRepSalve', veryLogin, selelectTrimestAndNotaDe, lancarNotaRepSalve)
router.post('/actualizarNotaMinipauta', veryLogin, actualizarNotaMinipauta)
router.post('/aplicarFalta', veryLogin, aplicarFalta)
router.post('/justificarFaltaDoAluno', veryLogin, justificarFaltaDoAluno)
router.post('/actualizarDados', veryLogin, actualizarDados)
router.post('/saveActualizarDadosProf', veryLogin, saveActualizarDadosProf)
router.get('/avaliacoes/:id', veryLogin, avaliacoes)
router.post('/criarAvaliacao', veryLogin, criarAvaliacao)

export default router