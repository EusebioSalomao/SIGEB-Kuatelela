import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fs2 from 'fs';
import ejs from 'ejs';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



import { findPautaByIdService } from '../src/services/pauta.service.js';
import { findAnoLectivoById } from '../src/services/anoLectivo.service.js';

export const listaAprovadosPDF = async (req, res) => {
    try {

        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const idPauta = req.params.id
        let alunosAprovados = []
        let qtAlunos = 0
        let pauta = await findPautaByIdService(idPauta)
        let descCurso = pauta.curso.descricao
        let turmaPDF = pauta.turma.codigo
        let periodoPDF = pauta.turma.periodo
        let anoPdf = await findAnoLectivoById(pauta.anoLectivo)
        anoPdf = anoPdf.codigo
        let novaOrdem = 0
        let aprovado = false
        let classePDF = ""
        let titulo = ""

        pauta.dadosPauta.forEach(aluno => {
            if (aluno.estado == "APTO" || aluno.estado == "APTA") {
                aluno.numOrdem = novaOrdem + 1
                aprovado = true
                alunosAprovados.push(aluno)
                novaOrdem++
            }
        });
        if (aprovado) { titulo = "LISTA DE ALUNOS APROVADOS" }
        if (pauta.classe.designacao == "10ª Classe") { classePDF = "11ª Classe" }
        if (pauta.classe.designacao == "11ª Classe") { classePDF = "12ª Classe" }
        //return res.send({ pauta})

        /* usando puppeteer para gerar pdf */
        const templatePath = path.join(__dirname, '../views/listaAlunosAprovados.ejs');
        // Ler e renderizar o conteúdo do EJS
        const ejsTemplate = await fs.readFile(templatePath, 'utf-8');
        const html = await ejs.render(ejsTemplate, { dia: dia, mes: mes, anoPdf, titulo, alunosAprovados, ano, classePDF, pauta, descCurso, turmaPDF, periodoPDF });

        // Gerar PDF com Puppeteer a partir do HTML renderizado
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ 
            format: "A4",
                    orientation: 'Landscape',
                    margin: {
                        top: '10px',
                        bottom: '20px',
                        left: '20px',
                        right: '20px'
                    },
                    header: {
                        height: "15mm"
                    },
                    footer: {
                        height: "25mm"
                    }
         });

        await browser.close();

        //res.setHeader('Content-Type', 'application/pdf');
        //fs2.writeFileSync('./teste.pdf', pdfBuffer);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="arquivo.pdf"',
        });

         //res.contentType("application/pdf")
        return res.send(pdfBuffer);

    } catch (err) {
        return res.status(500).send(`Erro ao renderizar template EJS: ${err.message}`);
    }

}

export const verListaPDF = async (req, res) => {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto('https://localhost:8081/relatorios/listaAprovados/686e30c817cc81f90b3f6e46', {
            waitUntil: 'networkidle0'
        })

        const pdf = await page.pdf({
            printBackground: true,
            format: 'Latter',
            margin: {
                top: "20px",
                bottom: "40px",
                left: "20px",
                right: "20px"
            }
        })

        await browser.close()

        res.contentType("application/pdf")

        return res.send(pdf)
    } catch (error) {
        return res.status(500).send({mesage: error.mesage})
    }
}

export const gerarListaPDF = async (req, res) => {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto('https://localhost:8081/relatorios/listaAprovados/686e30c817cc81f90b3f6e46', {
            waitUntil: 'networkidle0'
        })

        const pdf = await page.pdf({
            printBackground: true,
            format: 'Latter',
            margin: {
                top: "20px",
                bottom: "40px",
                left: "20px",
                right: "20px"
            }
        })

        await browser.close()

        res.contentType("application/pdf")

        return res.send(pdf)
    } catch (error) {
        return res.status(500).send({mesage: error.mesage})
    }
}