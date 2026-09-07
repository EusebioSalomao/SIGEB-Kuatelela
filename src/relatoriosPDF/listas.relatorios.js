import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";

import { findAnoLectivoByEstadoService } from "../services/anoLectivo.service.js";
import {
    findAlunosByIdTurma,
    findAlunosByIdTurmaParaPDF,
} from "../services/aluno.service.js";
import { actualizarPintadoAlunoService } from "../services/aluno.service.js";
import { findTurmaByIdService } from "../services/turma.service.js";
import { findCursoByIdService } from "../services/curso.service.js";
import { findClasseByIdService } from "../services/classe.service.js";


const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(currentDir, "../../public/img/logor.png");
const capitalize = (name) =>
    !name
        ? "Sem Nome"
        : String(name)
              .toLocaleLowerCase("pt-BR")
              .replace(/(?:^|\s)\S/g, (letter) =>
                  letter.toLocaleUpperCase("pt-BR"),
              );
const getDate = () => {
    const now = new Date();
    return {
        dia: now.getDate(),
        mes: now.toLocaleString("pt-BR", { month: "long" }),
        ano: now.getFullYear(),
    };
};
const pick = (object, keys, fallback = "—") => {
    for (const key of keys) {
        const value = object?.[key];
        if (value !== undefined && value !== null && String(value).trim()) {
            return value;
        }
    }
    return fallback;
};
const safe = (loader, fallback) => Promise.resolve().then(loader).catch(() => fallback);
/**
 * Indica se o nome do aluno deve ser impresso a vermelho.
 *
 * Pode ser importada noutros módulos com:
 * import { pintarNomeAluno } from "./listas.relatorios.js";
 */
const alunoDeveSerPintado = (aluno) =>
    aluno?.pintado === true ||
    aluno?.pintado === "true" ||
    aluno?.pintado === 1 ||
    aluno?.pintado === "1";
export const pintarNomeAluno = async (req, res) => {
    try {
        const valorPintado = req.body?.pintado;
        const pintado =
            valorPintado === true || valorPintado === "true"
                ? true
                : valorPintado === false || valorPintado === "false"
                    ? false
                    : undefined;
        if (pintado === undefined) {
            return res.status(400).json({ message: "O campo pintado deve ser booleano." });
        }

        const aluno = await actualizarPintadoAlunoService(req.params.id, pintado);
        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado." });
        }

        return res.json({ id: aluno._id, pintado: aluno.pintado });
    } catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao actualizar o aluno." });
    }
};
const getTurmaData = async (id, findAlunos = findAlunosByIdTurma) => {
    const [anoLectivo, alunos, turma] = await Promise.all([
        safe(() => findAnoLectivoByEstadoService("Activo"), null),
        safe(() => findAlunos(id), []),
        safe(() => findTurmaByIdService(id), null),
    ]);
    const [curso, classe] = await Promise.all([
        turma?.idCurso ? safe(() => findCursoByIdService(turma.idCurso), null) : null,
        turma?.idClasse ? safe(() => findClasseByIdService(turma.idClasse), null) : null,
    ]);
    return { anoLectivo, alunos: Array.isArray(alunos) ? alunos : [], turma, curso, classe };
};
const drawLogo = (doc, width, y) => {
    if (fs.existsSync(logoPath)) {
        try {
            doc.image(logoPath, doc.page.width / 2 - width / 2, y, { width });
            return true;
        } catch {
            return false;
        }
    }
    return false;
};
const drawCentered = (doc, text, y, options = {}) => {
    const {
        font = "Helvetica",
        fontSize = 10,
        color = "#000000",
        x = doc.page.margins.left,
        width = doc.page.width - doc.page.margins.left - doc.page.margins.right,
    } = options;
    doc.fillColor(color).font(font).fontSize(fontSize).text(String(text ?? ""), x, y, {
        width,
        align: "center",
        lineBreak: false,
    });
    return doc.y;
};
const drawSharedFooter = (doc, text, { left, lineY, textY, width, fontSize }) => {
    doc.strokeColor("#e1e1e1")
        .lineWidth(1)
        .moveTo(left, lineY)
        .lineTo(left + width, lineY)
        .stroke();
    doc.fillColor("#a1a1a1")
        .font("Helvetica-Oblique")
        .fontSize(fontSize)
        .text(text, left, textY, { width, align: "center", lineBreak: false });
};

// ------------------------- Lista de presença -------------------------
export const actualPDF = async (req, res) => {
    console.log("🚀 Rota /actualPDF iniciada para o ID:", req.params.id);
    try {
        const { dia, mes, ano } = getDate();
        const { alunos, turma, classe } = await getTurmaData(
            req.params.id,
            findAlunosByIdTurmaParaPDF,
        );
        const classeDesignacao = classe?.designacao || "—";
        const turmaCod = turma?.codigo || "Sem Código";
        const doc = new PDFDocument({
            size: "A4",
            bufferPages: true,
            margins: { top: 40, bottom: 20, left: 45, right: 40 },
        });
        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${classeDesignacao}-${turmaCod}-lista-presenca.pdf"`,
        });
        doc.pipe(res);

        const startX = 65;
        const colNoWidth = 35;
        const colNomeWidth = 240;
        const colAssLineWidth = 190;
        const tableWidth = colNoWidth + colNomeWidth + colAssLineWidth;
        const footerLineY = doc.page.height - 52;
        const footerTextY = doc.page.height - 45;
        const footerText = `Gerado pelo Sistema de Gestão escolar do Liceu Rei Ndunduma-Cuito (SIGEB-L290) // ${dia} de ${mes} de ${ano}.`;

        if (!drawLogo(doc, 50, 35)) doc.moveDown(3);
        else doc.moveDown(3.2);
        doc.fillColor("#000000").font("Helvetica").fontSize(11);
        doc.text("República de Angola", { align: "center" });
        doc.text("Ministério da Educação", { align: "center" });
        doc.text("Governo da Província do Bié", { align: "center" });
        doc.font("Helvetica-Bold").text("LICEU REI NDUNDUMA DO CUITO", { align: "center" });
        doc.moveDown(0.8).font("Helvetica").fontSize(10);
        doc.text(
            `PROVA DO ___ TRIMESTRE DE :_____________________;    ${classeDesignacao}    Turma: ${turmaCod}`,
            { align: "center" },
        );
        doc.moveDown(0.5);
        doc.fillColor("red").font("Helvetica-Bold").fontSize(14).text("LISTA DE PRESENÇA", {
            align: "center",
        });
        doc.moveDown(1.5);

        let currentY = doc.y;
        doc.fillColor("#cdcccc").rect(startX, currentY, tableWidth, 20).fill();
        doc.lineWidth(1).strokeColor("#000000").rect(startX, currentY, tableWidth, 20).stroke();
        [colNoWidth, colNoWidth + colNomeWidth].forEach((offset) =>
            doc.moveTo(startX + offset, currentY).lineTo(startX + offset, currentY + 20).stroke(),
        );
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
        doc.text("Nº", startX, currentY + 5, { width: colNoWidth, align: "center" });
        doc.text("NOME COMPLETO", startX + colNoWidth + 8, currentY + 5, { width: colNomeWidth });
        doc.text("ASSINATURA", startX + colNoWidth + colNomeWidth, currentY + 5, {
            width: colAssLineWidth,
            align: "center",
        });
        currentY += 20;
        doc.font("Helvetica").fontSize(10);

        const quantidadeAlunos = alunos.length;
        const assinaturaHeight = 88;
        const espacoAssinatura = 20;
        const rowHeight = quantidadeAlunos > 0 ? 20 : 30;
        const rowFontSize = quantidadeAlunos > 0 ? 10 : 10;
        const tablePageBottom = footerLineY - 8;
        const finalTableBottom =
            footerLineY - assinaturaHeight - espacoAssinatura;
        const continuationStart = doc.page.margins.top;

        const drawPresenceRow = (aluno, index) => {
                doc.lineWidth(1).strokeColor("#000000").rect(startX, currentY, tableWidth, rowHeight).stroke();
                [colNoWidth, colNoWidth + colNomeWidth].forEach((offset) =>
                    doc.moveTo(startX + offset, currentY).lineTo(startX + offset, currentY + rowHeight).stroke(),
                );
                const alunoId = String(aluno?._id ?? aluno?.id ?? "");
                const nomeDeveSerVermelho = alunoDeveSerPintado(aluno);
                const textY = currentY + Math.max(0, (rowHeight - doc.currentLineHeight()) / 2);
                doc.text(String(index + 1), startX, textY, { width: colNoWidth, align: "center", lineBreak: false });
                doc.save()
                    .fillColor(nomeDeveSerVermelho ? "#dc3545" : "#000000")
                    .font("Helvetica")
                    .fontSize(rowFontSize)
                    .text(capitalize(aluno?.nome), startX + colNoWidth + 8, textY, {
                        width: colNomeWidth - 10,
                        ellipsis: true,
                        lineBreak: false,
                    })
                    .restore();
                currentY += rowHeight;
        };

        if (quantidadeAlunos) {
            let index = 0;

            while (index < quantidadeAlunos) {
                const remaining = quantidadeAlunos - index;
                const rowsThatFitWithSignatures = Math.floor(
                    (finalTableBottom - currentY) / rowHeight,
                );

                // A última página reserva espaço para a data e assinaturas.
                if (remaining <= rowsThatFitWithSignatures) {
                    while (index < quantidadeAlunos) {
                        drawPresenceRow(alunos[index], index);
                        index += 1;
                    }
                    break;
                }

                // Nas páginas intermédias continuam apenas as linhas da tabela.
                const rowsThatFitOnPage = Math.floor(
                    (tablePageBottom - currentY) / rowHeight,
                );

                if (rowsThatFitOnPage <= 0) {
                    doc.addPage();
                    currentY = continuationStart;
                    continue;
                }

                const rowsToDraw = Math.min(rowsThatFitOnPage, remaining);
                for (let row = 0; row < rowsToDraw; row += 1) {
                    drawPresenceRow(alunos[index], index);
                    index += 1;
                }

                if (index < quantidadeAlunos) {
                    doc.addPage();
                    currentY = continuationStart;
                }
            }
        } else {
            doc.lineWidth(1).strokeColor("#000000").rect(startX, currentY, tableWidth, 30).stroke();
            doc.fillColor("#68738a").text("Nenhum participante cadastrado nesta turma.", startX + 15, currentY + 10);
            currentY += 30;
        }

        currentY += espacoAssinatura;
        doc.y = Math.min(currentY, footerLineY - assinaturaHeight);
        doc.fillColor("#000000").font("Helvetica").fontSize(11);
        const assinaturaX = doc.page.margins.left;
        const assinaturaWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const assinatura = (text) =>
            doc.text(text, assinaturaX, doc.y, { width: assinaturaWidth, align: "center", lineBreak: false });
        assinatura(`Liceu Rei Ndunduma no Cuito aos ${dia} de ${mes} de ${ano}.`);
        doc.moveDown(1).font("Helvetica-Bold");
        assinatura("O Subdirector Pedagógico");
        doc.moveDown(1.5).font("Helvetica");
        assinatura("_________________________");
        assinatura("MSc. Frederico Sanji Figueiredo");
        const pageRange = doc.bufferedPageRange();
        doc.switchToPage(pageRange.start + pageRange.count - 1);
        drawSharedFooter(doc, footerText, {
            left: 45,
            lineY: footerLineY,
            textY: footerTextY,
            width: doc.page.width - 90,
            fontSize: 9,
        });
        doc.flushPages();
        doc.end();
        console.log("🎯 PDF enviado com sucesso para o cliente!");
    } catch (error) {
        console.error("❌ ERRO INTERNO DETECTADO:", error);
        if (!res.headersSent) res.status(500).json({ message: error.message });
    }
};

// --------------------------- Lista de alunos ---------------------------
const listPDF = (() => {
    const PDF_OPTIONS = {
        size: "A4",
        layout: "portrait",
        margins: { top: 36, bottom: 52, left: 40, right: 40 },
    };
    const FOOTER_HEIGHT = 24;
    const CLOSING_HEIGHT = 102;
    const getClosingStartY = (doc) =>
        doc.page.height - doc.page.margins.bottom - FOOTER_HEIGHT - CLOSING_HEIGHT;
    const getData = async (id) => {
        const data = await getTurmaData(id);
        return {
            ...getDate(),
            alunos: data.alunos,
            anoCod: pick(data.anoLectivo, ["codigo", "ano", "designacao", "descricao"], "Não informado"),
            periodo: pick(
                data.turma,
                ["periodo", "período", "turno"],
                pick(data.anoLectivo, ["periodo", "período"], "Não informado"),
            ),
            cursoDescricao: pick(data.curso, ["descricao", "descrição", "nome"], "LISTA DOS ALUNOS"),
            classeDesignacao: pick(data.classe, ["designacao", "designação", "nome"]),
            turmaCod: pick(data.turma, ["codigo", "código", "nome"], "Sem Código"),
        };
    };
    const filename = (value) =>
        `${String(value || "lista-de-alunos")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w.-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "lista-de-alunos"}.pdf`;
    const cellText = (
        doc,
        text,
        x,
        y,
        width,
        align,
        height,
        font = "Helvetica-Bold",
        color = "#000000",
    ) => {
        const padding = align === "left" ? 6 : 0;
        doc.fillColor(color).font(font).fontSize(9);
        doc.text(String(text ?? ""), x + padding, y + Math.max(0, (height - doc.currentLineHeight()) / 2), {
            width: width - padding - 4,
            align,
            lineBreak: false,
            ellipsis: true,
        });
    };
    const header = (doc, data) => {
        drawLogo(doc, 48, doc.page.margins.top);
        let y = doc.page.margins.top + 54;
        [
            ["República de Angola", "Helvetica", 11],
            ["Ministério da Educação", "Helvetica", 11],
            ["Governo da Província do Bié", "Helvetica", 11],
            ["LICEU REI NDUNDUMA DO CUITO", "Helvetica-Bold", 11],
        ].forEach(([text, font, fontSize]) => {
            drawCentered(doc, text, y, { font, fontSize });
            y += 14;
        });
        y += 4;
        drawCentered(doc, data.cursoDescricao, y, { font: "Helvetica-Bold", fontSize: 13, color: "#b00000" });
        y += 22;
        drawCentered(doc, [`Ano Lectivo: ${data.anoCod}`, data.classeDesignacao, `Turma: ${data.turmaCod}`, `Período: ${data.periodo}`].join("    "), y);
        y += 24;
        drawCentered(doc, "LISTA DOS ALUNOS", y, { font: "Helvetica-Bold", fontSize: 14 });
        return y + 27;
    };
    const columns = (doc) => {
        const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        return [
            { label: "Nº", key: "number", width: width * 0.1, align: "center" },
            { label: "NOME COMPLETO", key: "name", width: width * 0.44, align: "left" },
            { label: "SEXO", key: "gender", width: width * 0.16, align: "center" },
            { label: "OBSERVAÇÃO", key: "observation", width: width * 0.3, align: "left" },
        ];
    };
    const tableHeader = (doc, cols, y, height = 18) => {
        const x0 = doc.page.margins.left;
        const width = cols.reduce((sum, col) => sum + col.width, 0);
        doc.fillColor("#cdcccc").rect(x0, y, width, height).fill();
        doc.lineWidth(1).strokeColor("#000000").rect(x0, y, width, height).stroke();
        let x = x0;
        cols.forEach((col, index) => {
            if (index) doc.moveTo(x, y).lineTo(x, y + height).stroke();
            cellText(doc, col.label, x, y, col.width, col.align, height);
            x += col.width;
        });
        return y + height;
    };
    const studentRow = (doc, cols, student, index, y, height = 18) => {
        const x0 = doc.page.margins.left;
        const width = cols.reduce((sum, col) => sum + col.width, 0);
        const values = {
            number: index + 1,
            name: capitalize(student?.nome),
            gender: pick(student, ["genero", "sexo"]),
            observation: pick(student, ["observacao", "observação", "observation"], ""),
        };
        doc.lineWidth(1).strokeColor("#000000").rect(x0, y, width, height).stroke();
        let x = x0;
        cols.forEach((col, columnIndex) => {
            if (columnIndex) doc.moveTo(x, y).lineTo(x, y + height).stroke();
            cellText(
                doc,
                values[col.key],
                x,
                y,
                col.width,
                col.align,
                height,
                "Helvetica",
                col.key === "name" && alunoDeveSerPintado(student)
                    ? "#dc3545"
                    : "#000000",
            );
            x += col.width;
        });
        return y + height;
    };
    const emptyRow = (doc, cols, y) => {
        const width = cols.reduce((sum, col) => sum + col.width, 0);
        doc.lineWidth(1).strokeColor("#000000").rect(doc.page.margins.left, y, width, 30).stroke();
        doc.fillColor("#68738a").font("Helvetica").fontSize(9).text("Nenhum aluno cadastrado nesta turma.", doc.page.margins.left + 8, y + 9, {
            width: width - 16,
            align: "center",
            lineBreak: false,
        });
        return y + 30;
    };
    const director = (doc, data) => {
        const width = 138;
        const x = doc.page.margins.left + 8;
        const y = doc.page.margins.top + 8;
        [["A Directora", "Helvetica-Bold", 0], ["___________________", "Helvetica", 15], ["Lic. Emília Carla Adelino Cawaia", "Helvetica", 30], [`___/____/${data.anoCod}`, "Helvetica", 45]].forEach(([text, font, offset]) => {
            doc.fillColor("#000000").font(font).fontSize(9).text(text, x, y + offset, {
                width,
                align: "center",
                lineBreak: false,
            });
        });
    };
    const closing = (doc, data) => {
        let y = Math.min(doc.y + 18, getClosingStartY(doc));
        drawCentered(doc, "Obs. Apenas os estudantes que reconfirmaram a matrícula constam na lista.", y, { fontSize: 9 });
        y += 19;
        drawCentered(doc, `Liceu Rei Ndunduma no Cuito aos ${data.dia} de ${data.mes} de ${data.ano}.`, y);
        y += 23;
        drawCentered(doc, "O Subdirector Pedagógico", y, { font: "Helvetica-Bold" });
        y += 22;
        drawCentered(doc, "_________________________", y);
        y += 14;
        drawCentered(doc, "MSc. Frederico Sanji Figueiredo", y);
    };
    const footer = (doc, data) =>
        drawSharedFooter(
            doc,
            `Gerado pelo Sistema de Gestão escolar do Liceu Rei Ndunduma-Cuito (SIGEB-L290) // ${data.dia} de ${data.mes} de ${data.ano}.`,
            {
                left: doc.page.margins.left,
                lineY: doc.page.height - doc.page.margins.bottom - FOOTER_HEIGHT,
                textY: doc.page.height - doc.page.margins.bottom - FOOTER_HEIGHT + 8,
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                fontSize: 8,
            },
        );
    return async (req, res) => {
        try {
            const data = await getData(req.params.id);
            const doc = new PDFDocument({ ...PDF_OPTIONS, bufferPages: true });
            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename(`Lista-${data.classeDesignacao}-${data.turmaCod}`)}"`,
            });
            doc.pipe(res);
            const cols = columns(doc);
            const tableStartY = header(doc, data);
            director(doc, data);
            let currentY = tableHeader(doc, cols, tableStartY);
            const rowHeight = 18;
            const tablePageBottom =
                doc.page.height - doc.page.margins.bottom - FOOTER_HEIGHT - 8;
            const continuationStart = doc.page.margins.top;

            if (!data.alunos.length) {
                currentY = emptyRow(doc, cols, currentY);
            } else {
                let index = 0;

                while (index < data.alunos.length) {
                    const remaining = data.alunos.length - index;
                    const rowsThatFitWithClosing = Math.floor(
                        (getClosingStartY(doc) - currentY) / rowHeight,
                    );

                    // Na última página, reserva-se o espaço do encerramento.
                    if (remaining <= rowsThatFitWithClosing) {
                        while (index < data.alunos.length) {
                            currentY = studentRow(
                                doc,
                                cols,
                                data.alunos[index],
                                index,
                                currentY,
                                rowHeight,
                            );
                            index += 1;
                        }
                        break;
                    }

                    // Nas páginas intermédias, continuam apenas as linhas.
                    const rowsThatFitOnPage = Math.floor(
                        (tablePageBottom - currentY) / rowHeight,
                    );

                    if (rowsThatFitOnPage <= 0) {
                        doc.addPage(PDF_OPTIONS);
                        currentY = continuationStart;
                        continue;
                    }

                    const rowsToDraw = Math.min(rowsThatFitOnPage, remaining);
                    for (let row = 0; row < rowsToDraw; row += 1) {
                        currentY = studentRow(
                            doc,
                            cols,
                            data.alunos[index],
                            index,
                            currentY,
                            rowHeight,
                        );
                        index += 1;
                    }

                    if (index < data.alunos.length) {
                        doc.addPage(PDF_OPTIONS);
                        currentY = continuationStart;
                    }
                }
            }
            doc.y = currentY;
            closing(doc, data);
            const pageRange = doc.bufferedPageRange();
            doc.switchToPage(pageRange.start + pageRange.count - 1);
            footer(doc, data);
            doc.flushPages();
            doc.end();
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({
                    message: error instanceof Error ? error.message : "Erro interno ao gerar a lista de alunos.",
                });
            }
        }
    };
})();
export const listaAlunosPDF = listPDF;

// ----------------------------- Mini pauta -----------------------------
const miniPDF = (() => {
    const PAGE_MARGIN = 28;
    const FOOTER_HEIGHT = 28;
    const TABLE_HEADER_HEIGHT = 38;
    const TABLE_ROW_FONT_SIZE = 7;
    const SIGNATURE_GAP = 24;
    const groups = [
        { title: "Iº Trimestre", fill: "#f9b3a6", columns: [["av1", "av1T1"], ["av2", "av2T1"], ["av3", "av3T1"], ["MAC", "mac1"], ["PT1", "pt1"], ["MT1", "mt1", "#b7d3f7"]] },
        { title: "IIº Trimestre", fill: "#f9b3a6", columns: [["av1", "av1T2"], ["av2", "av2T2"], ["av3", "av3T2"], ["MAC", "mac2"], ["PT2", "pt2"], ["MT2", "mt2", "#b7d3f7"]] },
        { title: "IIIº Trimestre", fill: "#f9b3a6", columns: [["av1", "av1T3"], ["av2", "av2T3"], ["av3", "av3T3"], ["MAC", "mac3"], ["PT3", "pt3"], ["MT3", "mt3", "#b7d3f7"]] },
    ];
    const finalColumns = [["MT", "mt"], ["E", "e"], ["CF", "cf"]];
    const rowHeight = (fontSize = TABLE_ROW_FONT_SIZE) => Math.max(13, Math.ceil(fontSize * 1.25) + 3);
    const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");
    const nested = (object, key) =>
        !object || typeof object !== "object"
            ? undefined
            : key.split(".").reduce((value, part) => (value == null ? undefined : value[part]), object);
    const display = (value, fallback = "") => {
        if (value == null || value === "") return "";
        if (Array.isArray(value)) return display(value[0], fallback);
        if (typeof value === "object") {
            const result = first(
                value.codigo,
                value.designacao,
                value.descricao,
                value.anoLectivo,
                value.ano_lectivo,
                value.ano,
                value.periodo,
                value.period,
                value.turno,
                value.nome,
                value.name,
                value.label,
                value.valor,
                value.value,
            );
            return result !== undefined && result !== value ? display(result, fallback) : fallback;
        }
        return String(value);
    };
    const field = (object, keys) => {
        for (const key of keys) {
            const value = nested(object, key);
            if (value !== undefined && value !== null && value !== "") return value;
        }
        return "";
    };
    const entity = (value) => display(first(value?.designacao, value?.descricao, value?.nome, value?.codigo, value)) || "—";
    const period = (...sources) => {
        const keys = ["periodo", "período", "period", "turno", "designacaoPeriodo", "designacao_periodo", "nomePeriodo", "nome_periodo"];
        for (const source of sources) {
            const result = display(field(source, keys));
            if (result) return result;
        }
        return "—";
    };
    const grade = (student, key) => {
        const source = first(student?.notas, student?.avaliacoes, student?.pauta, student);
        const aliases = {
            av1T1: ["av1T1", "AV1T1", "av1", "AV1", "avaliacao1", "avaliacao_1", "av_1"],
            av2T1: ["av2T1", "AV2T1", "av2", "AV2", "avaliacao2", "avaliacao_2", "av_2"],
            av3T1: ["av3T1", "AV3T1", "av3", "AV3", "avaliacao3", "avaliacao_3", "av_3"],
            av1T2: ["av1T2", "AV1T2", "av1", "AV1", "avaliacao1", "avaliacao_1", "av_1"],
            av2T2: ["av2T2", "AV2T2", "av2", "AV2", "avaliacao2", "avaliacao_2", "av_2"],
            av3T2: ["av3T2", "AV3T2", "av3", "AV3", "avaliacao3", "avaliacao_3", "av_3"],
            av1T3: ["av1T3", "AV1T3", "av1", "AV1", "avaliacao1", "avaliacao_1", "av_1"],
            av2T3: ["av2T3", "AV2T3", "av2", "AV2", "avaliacao2", "avaliacao_2", "av_2"],
            av3T3: ["av3T3", "AV3T3", "av3", "AV3", "avaliacao3", "avaliacao_3", "av_3"],
            mac1: ["mac1", "MAC1", "mac", "MAC"], mac2: ["mac2", "MAC2", "mac", "MAC"], mac3: ["mac3", "MAC3", "mac", "MAC"],
            pt1: ["pt1", "PT1"], pt2: ["pt2", "PT2"], pt3: ["pt3", "PT3"],
            mt1: ["mt1", "MT1"], mt2: ["mt2", "MT2"], mt3: ["mt3", "MT3"],
            mt: ["mt", "MT", "medDosTrimestes", "mediaDosTrimestres", "mediaDosTrimestes"],
            e: ["examePF", "EXAMEPF", "e", "E", "exame", "exame_final"],
            cf: ["cf", "CF", "classificacao_final", "classificacaoFinal"],
        };
        const keys = aliases[key] || [key];
        const number = key.match(/([123])$/)?.[1];
        const nestedKeys = number
            ? [`trimestre${number}.${key.replace(number, "")}`, `trimestre_${number}.${key.replace(number, "")}`, `trimester${number}.${key.replace(number, "")}`]
            : [];
        return display(field(source, [...keys, ...nestedKeys]) || field(student, [...keys, ...nestedKeys]));
    };
    const cell = (doc, { x, y, width, height, text = "", fill = "#ffffff", fontSize = 7, bold = false, align = "center" }) => {
        doc.save().fillColor(fill).rect(x, y, width, height).fill();
        doc.lineWidth(0.5).strokeColor("#000000").rect(x, y, width, height).stroke();
        doc.fillColor("#000000").font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize).text(String(text), x + 2, y + Math.max(2, (height - fontSize) / 2), {
            width: Math.max(1, width - 4),
            height: Math.max(1, height - 2),
            align,
            lineBreak: false,
            ellipsis: true,
        });
        doc.restore();
    };
    const tableHeader = (doc, layout, y) => {
        const { startX, noWidth, nameWidth, gradeWidth, observationWidth } = layout;
        const firstHeight = 19;
        const secondHeight = TABLE_HEADER_HEIGHT - firstHeight;
        let x = startX;
        cell(doc, { x, y, width: noWidth, height: TABLE_HEADER_HEIGHT, text: "nº", fill: "#f9b3a6", bold: true });
        x += noWidth;
        cell(doc, { x, y, width: nameWidth, height: TABLE_HEADER_HEIGHT, text: "Nome completo", fill: "#f9b3a6", bold: true, align: "left" });
        x += nameWidth;
        groups.forEach((group) => {
            cell(doc, { x, y, width: group.columns.length * gradeWidth, height: firstHeight, text: group.title, fill: group.fill, bold: true });
            group.columns.forEach(([label, , fill]) => {
                cell(doc, { x, y: y + firstHeight, width: gradeWidth, height: secondHeight, text: label, fill: fill || "#f4f4f4", fontSize: 6, bold: true });
                x += gradeWidth;
            });
        });
        cell(doc, { x, y, width: finalColumns.length * gradeWidth, height: firstHeight, text: "C. final", fill: "#f9b3a6", bold: true });
        finalColumns.forEach(([label, key]) => {
            cell(doc, { x, y: y + firstHeight, width: gradeWidth, height: secondHeight, text: label, fill: key === "cf" ? "#b7d3f7" : "#ffffff", fontSize: 6, bold: true });
            x += gradeWidth;
        });
        cell(doc, { x, y, width: observationWidth, height: TABLE_HEADER_HEIGHT, text: "OBS.", fill: "#f9b3a6", bold: true });
        return y + TABLE_HEADER_HEIGHT;
    };
    const studentRow = (doc, layout, y, student, index, height) => {
        const { startX, noWidth, nameWidth, gradeWidth, observationWidth } = layout;
        let x = startX;
        cell(doc, { x, y, width: noWidth, height, text: index + 1, fontSize: TABLE_ROW_FONT_SIZE });
        x += noWidth;
        cell(doc, { x, y, width: nameWidth, height, text: capitalize(first(student?.nome, student?.name)), align: "left", fontSize: TABLE_ROW_FONT_SIZE });
        x += nameWidth;
        groups.forEach((group) => group.columns.forEach(([, key, fill]) => {
             cell(doc, { x, y, width: gradeWidth, height, text: grade(student, key), fill: fill || "#ffffff", fontSize: TABLE_ROW_FONT_SIZE, bold: ["mac1", "mac2", "mac3", "mt1", "mt2", "mt3"].includes(key) });
            x += gradeWidth;
        }));
        finalColumns.forEach(([, key]) => {
            cell(doc, { x, y, width: gradeWidth, height, text: grade(student, key), fill: key === "cf" ? "#b7d3f7" : "#ffffff", fontSize: TABLE_ROW_FONT_SIZE, bold: true });
            x += gradeWidth;
        });
        cell(doc, { x, y, width: observationWidth, height, text: display(first(student?.observacao, student?.observacoes, student?.obs)), fontSize: 6, align: "left" });
    };
    const miniHeader = (doc, data) => {
        const width = doc.page.width - PAGE_MARGIN * 2;
        drawLogo(doc, 36, 20);
        [["República de Angola", 61, "Helvetica", 9], ["Ministério da Educação", 73, "Helvetica", 9], ["LICEU REI NDUNDUMA-CUITO", 85, "Helvetica-Bold", 9]].forEach(([text, y, font, fontSize]) =>
            drawCentered(doc, text, y, { x: PAGE_MARGIN, width, font, fontSize }),
        );
        drawCentered(doc, data.course, 106, { x: PAGE_MARGIN, width, font: "Helvetica-Bold", fontSize: 13, color: "#03036c" });
        drawCentered(doc, `Ano Lectivo: ${data.academicYear}    ${data.className}    Turma: ${data.classCode}    Período: ${data.period}`, 125, { x: PAGE_MARGIN, width, fontSize: 8 });
        drawCentered(doc, `Nome do Professor: ${data.teacher || "________________________________________"}`, 147, { x: PAGE_MARGIN, width: width / 2, font: "Helvetica-Bold", fontSize: 8 });
        drawCentered(doc, `Disciplina: ${data.discipline || "____________________________"}`, 160, { x: PAGE_MARGIN, width: width / 2, fontSize: 8 });
        drawCentered(doc, "A Directora", 68, { x: PAGE_MARGIN, width: 142, font: "Helvetica-Bold", fontSize: 8 });
        drawCentered(doc, "___________________", 81, { x: PAGE_MARGIN, width: 142, fontSize: 8 });
        drawCentered(doc, "Lic. Emília Carla Adelino Cawaia", 94, { x: PAGE_MARGIN, width: 142, fontSize: 8 });
        drawCentered(doc, "___/____/______", 107, { x: PAGE_MARGIN, width: 142, fontSize: 8 });
        return 178;
    };
    const signatures = (doc, dateLabel, tableBottom) => {
        const width = doc.page.width - PAGE_MARGIN * 2;
        const half = width / 2;
        const dateY = tableBottom + SIGNATURE_GAP;
        const y = dateY + 31;
        drawCentered(doc, `Liceu Rei Ndunduma do Cuito aos ${dateLabel}.`, dateY, { x: PAGE_MARGIN, width, fontSize: 8 });
        drawCentered(doc, "O Coordenador da turma", y, { x: PAGE_MARGIN, width: half, font: "Helvetica-Bold", fontSize: 8 });
        drawCentered(doc, "O Subdirector Pedagógico", y, { x: PAGE_MARGIN + half, width: half, font: "Helvetica-Bold", fontSize: 8 });
        drawCentered(doc, "_________________________", y + 20, { x: PAGE_MARGIN, width: half, fontSize: 8 });
        drawCentered(doc, "_________________________", y + 20, { x: PAGE_MARGIN + half, width: half, fontSize: 8 });
        drawCentered(doc, " ", y + 33, { x: PAGE_MARGIN, width: half, fontSize: 8 });
        drawCentered(doc, "MSc. Frederico Sanji Figueiredo", y + 33, { x: PAGE_MARGIN + half, width: half, fontSize: 8 });
    };
    const footer = (doc, dateLabel) =>
        drawSharedFooter(doc, `Gerado pelo Sistema de Gestão escolar do Liceu Rei Ndunduma-Cuito (SIGEB-L290) // ${dateLabel}.`, {
            left: PAGE_MARGIN,
            lineY: doc.page.height - doc.page.margins.bottom - 14,
            textY: doc.page.height - doc.page.margins.bottom - 9,
            width: doc.page.width - PAGE_MARGIN * 2,
            fontSize: 7,
        });
    const getDataComNotas = async (id, req) => {
        const Minipauta = mongoose.model("minipautas");
        const NotasDisciplina = mongoose.model("notasdisciplina");
        const minipauta = await Minipauta.findById(id)
            .populate("idProfessor")
            .populate("idClasse")
            .populate("idTurma")
            .populate("idCurso")
            .lean();

        if (!minipauta) {
            throw new Error("Minipauta não encontrada.");
        }

        const notasDisciplina = await NotasDisciplina.find({ idMinipauta: id })
            .populate("aluno")
            .populate("notas")
            .lean();
        const turmaId = minipauta.idTurma?._id || minipauta.idTurma;
        const dadosTurma = turmaId
            ? await getTurmaData(turmaId)
            : { anoLectivo: null, turma: null, curso: null, classe: null };
        const turma = minipauta.idTurma?.codigo
            ? minipauta.idTurma
            : dadosTurma.turma;
        const curso = minipauta.idCurso?.nome || minipauta.idCurso?.descricao
            ? minipauta.idCurso
            : dadosTurma.curso;
        const classe = minipauta.idClasse?.designacao
            ? minipauta.idClasse
            : dadosTurma.classe;
        const alunos = notasDisciplina.map((registo) => ({
            ...(registo.aluno || {}),
            notas: registo.notas || {},
            observacao: first(registo.observacao, registo.observacoes, registo.obs),
        }));

        return {
            alunos,
            course: entity(curso),
            academicYear: display(first(
                dadosTurma.anoLectivo?.codigo,
                dadosTurma.anoLectivo?.designacao,
                dadosTurma.anoLectivo?.descricao,
                dadosTurma.anoLectivo?.anoLectivo,
                dadosTurma.anoLectivo?.ano,
            )) || "—",
            className: entity(classe),
            classCode: display(first(turma?.codigo, turma?.cod, turma?.nome)) || "Sem Código",
            period: period(req.query, req.body, req.params, turma, dadosTurma.anoLectivo),
            teacher: entity(minipauta.idProfessor),
            discipline: display(first(
                minipauta.nomeDisciplina,
                minipauta.disciplina,
                minipauta.nome,
            )),
        };
    };
    const getData = async (id, req, incluirNotas = false) => {
        if (incluirNotas) return getDataComNotas(id, req);

        const { anoLectivo, alunos, turma, curso, classe } = await getTurmaData(id);
        return {
            alunos,
            course: entity(curso),
            academicYear: display(first(anoLectivo?.codigo, anoLectivo?.designacao, anoLectivo?.descricao, anoLectivo?.anoLectivo, anoLectivo?.ano, anoLectivo?.nome, anoLectivo)) || "—",
            className: entity(classe),
            classCode: display(first(turma?.codigo, turma?.cod, turma?.nome)) || "Sem Código",
            period: period(req.query, req.body, req.params, turma, anoLectivo),
        };
    };
    const renderMiniPautaPDF = async (req, res, incluirNotas = false) => {
        try {
            const { dia, mes, ano } = getDate();
            const data = await getData(req.params.id, req, incluirNotas);
            const dateLabel = `${dia} de ${mes} de ${ano}`;
            const doc = new PDFDocument({
                size: "A4",
                layout: "landscape",
                bufferPages: true,
                margins: { top: PAGE_MARGIN, bottom: FOOTER_HEIGHT, left: PAGE_MARGIN, right: PAGE_MARGIN },
                autoFirstPage: true,
            });
            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${data.className}-${data.classCode}-Mini-pauta.pdf"`,
            });
            doc.pipe(res);
            const tableWidth = doc.page.width - PAGE_MARGIN * 2;
            const layout = {
                startX: PAGE_MARGIN,
                noWidth: 24,
                nameWidth: 166,
                gradeWidth: (tableWidth - 24 - 166 - 58) / 21,
                observationWidth: 58,
            };
            let currentY = tableHeader(doc, layout, miniHeader(doc, data));
            const tablePageBottom = doc.page.height - FOOTER_HEIGHT - 18;
            const continuationStart = PAGE_MARGIN;
            const contentBottom = doc.page.height - doc.page.margins.bottom - 14 - 8 - (31 + 33) - SIGNATURE_GAP;
            if (!data.alunos.length) {
                const height = rowHeight(8) + 8;
                cell(doc, { x: PAGE_MARGIN, y: currentY, width: tableWidth, height, text: "Nenhum aluno cadastrado nesta turma.", fill: "#f7f7f7", fontSize: 8, align: "left" });
                currentY += height;
            } else {
                const height = rowHeight();
                let index = 0;
                while (index < data.alunos.length) {
                    const fitsFinal = Math.floor((contentBottom - currentY) / height);
                    if (data.alunos.length - index <= fitsFinal) {
                        while (index < data.alunos.length) {
                            studentRow(doc, layout, currentY, data.alunos[index], index, height);
                            currentY += height;
                            index++;
                        }
                        break;
                    }
                    const fitsPage = Math.floor((tablePageBottom - currentY) / height);
                    if (fitsPage <= 0) {
                        doc.addPage();
                        currentY = continuationStart;
                        continue;
                    }
                    const count = Math.min(fitsPage, data.alunos.length - index);
                    for (let row = 0; row < count; row++) {
                        studentRow(doc, layout, currentY, data.alunos[index], index, height);
                        currentY += height;
                        index++;
                    }
                    if (index < data.alunos.length) {
                        doc.addPage();
                        currentY = continuationStart;
                    }
                }
            }
            if (currentY > contentBottom) {
                doc.addPage();
                currentY = continuationStart;
            }
            signatures(doc, dateLabel, currentY);
            const range = doc.bufferedPageRange();
            doc.switchToPage(range.start + range.count - 1);
            footer(doc, dateLabel);
            doc.flushPages();
            doc.end();
        } catch (error) {
            req.log?.error({ err: error }, "Erro ao gerar mini pauta em PDF");
            if (!res.headersSent) res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao gerar o PDF" });
        }
    };
    return {
        normal: (req, res) => renderMiniPautaPDF(req, res, false),
        comNotas: (req, res) => renderMiniPautaPDF(req, res, true),
    };
})();
export const miniPautaPDF = miniPDF.normal;
export const miniPautaComNotasPDF = miniPDF.comNotas;