import fs from 'fs'
import path from 'path'
import pdf from 'html-pdf'
import ejs from 'ejs'
import { findPautaByIdService, findPautaByIdTurma } from '../services/pauta.service.js'
import { findDadosTurmaByIdService, findTurmaByIdService } from '../services/turma.service.js'
import { findAnoLectivoByEstadoService, findAnoLectivoById } from '../services/anoLectivo.service.js'
import { findAllDespesasService, findAllReceitasService } from '../services/financas.service.js'
import { findAlunoByBIService, findAlunoByIdService, findAlunosByIdTurma } from '../services/aluno.service.js'
import { findOcorrenciaByIdAndUpdateServece, findSolicitacaoByIdService } from '../services/ocorrencias.service.js'
import { findCursoByIdService } from '../services/curso.service.js'
import { findClasseByIdService } from '../services/classe.service.js'
import { initialMaiuculas } from '../outrasF/turma.outF.js'
import pauta from '../models/pauta.modell.js'
import { notasOrganizadas } from '../outrasF/pauta.OutF.js'
import { findAllCandidatosByCursoService } from '../services/candidato.service.js'
import aluno from '../models/aluno.modell.js'


/* PAUTA DO Iº TRIMESTRE */
export const pautaTrimestral = async (req, res) => {
    try {

        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        const anoActivo = await findAnoLectivoByEstadoService("Activo")
        const TDpautas = await findPautaByIdTurma(idTurma)
        let pautas = []
        TDpautas.forEach(pauta => {
            if (pauta.anoLectivo == "" + anoActivo._id) {
                pautas.push(pauta)
            }
        });
        //return res.send({pautas})

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let trimestre = ''
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = { "notas": dadosOrganizado[0] }
                    disciplinasOrdenadas = dadosOrganizado[1]
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id
                pautaT1.trimestre = pauta.trimestre

            }
            //Fim do primeiro trimestre

            //Se for Segundo trimestre - Colocar o código aqui

            //Se for Terceiro trimestre - Colocar o código aqui

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaF.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id
            }//Fim Pauta final
        });

        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        const anoPdf = anoLectivo.codigo
        const anoCod = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let anoLet = anoCod.replace("/", "-")

        /* Verificar se ha alunos sem notas devido atraso de lançamento dos professores */
        /* As disciplinas que não foram lançadas serão anonimas e naparecera espaço vazio */
        pautaT1.forEach(aluno => {
            aluno.notas.notas.forEach(nota => {
                if(nota === undefined || nota === null){
                    const index = aluno.notas.notas.indexOf(nota);
                    aluno.notas.notas[index] = {disciplina: "Anonima", mac1:0, pp1:0, pt1:0, mt1:0}
                }
            });
        });

       

        //PARA GERAR RELATÓRIO
        
        // Se for pauta da 10ª Classe
        //return res.send({pautaT1})
        if ((classe == "10ª Classe" && curso.descricao == "Curso de Ciências Humanas") || (classe == "12ª Classe" && curso.descricao == "Curso de Ciências Humanas") || classe == "10ª Classe" && curso.descricao == "Curso de Ciências Físicas e Biológicas") {
            // return res.send({classe})
            //console.log("PAUTA DA 10ªA CLASSE")

            ejs.renderFile("./views/relatorios/pautaI10CH.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre1/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            return res.send('Um erro aconteceu')
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else if (classe == "10ª Classe" && curso.descricao == "Curso de Ciências Económico-Jurídicas") {
            ejs.renderFile("./views/relatorios/pautaI10CEJ.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre1/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            return res.send('Um erro aconteceu')
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else {
            ejs.renderFile("./views/relatorios/pautaI.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    return res.send('HOUVE UM ERRO!' + err)
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre1/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })

        }

    } catch (error) {
        const msdDeErro = 'Verifique se todos alunos têm notas!'
        const msdDeErro2 = '' + err
        return res.render('msgError', { msdDeErro, msdDeErro2 })
    }
}

/* PAUTA DO IIº TRIMESTRE */
export const pautaTrimestral2 = async (req, res) => {
    try {
        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        const anoActivo = await findAnoLectivoByEstadoService("Activo")
        const TDpautas = await findPautaByIdTurma(idTurma)
        let pautas = []
        TDpautas.forEach(pauta => {
            if (pauta.anoLectivo == "" + anoActivo._id) {
                pautas.push(pauta)
            }
        });

        let pautaT1 = [] // Este array está funcionando para todos trimestre
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let trimestre = ''
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = { "notas": dadosOrganizado[0] }
                    disciplinasOrdenadas = dadosOrganizado[1]
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id
                pautaT1.trimestre = pauta.trimestre

            }

        });

        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        const anoPdf = anoLectivo.codigo
        const anoCod = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let anoLet = anoCod.replace("/", "-")


        //PARA GERAR RELATÓRIO
        // Se for pauta da 10ª Classe
        //return res.send({pautaT1})
        if ((classe == "10ª Classe" && curso.descricao == "Curso de Ciências Humanas") || (classe == "12ª Classe" && curso.descricao == "Curso de Ciências Humanas") || classe == "10ª Classe" && curso.descricao == "Curso de Ciências Físicas e Biológicas") {
            // return res.send({classe})
            console.log("PAUTA DA 10ªA CLASSE")

            ejs.renderFile("./views/relatorios/pautaII10CH.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre2/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre2')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else if (classe == "10ª Classe" && curso.descricao == "Curso de Ciências Económico-Jurídicas") {
            ejs.renderFile("./views/relatorios/pautaII10CEJ.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre2/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre2')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else {
            ejs.renderFile("./views/relatorios/pautaII.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre2/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre2')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* PAUTA DO IIIº TRIMESTRE */
export const pautaTrimestral3 = async (req, res) => {
    try {
        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        const anoActivo = await findAnoLectivoByEstadoService("Activo")
        const TDpautas = await findPautaByIdTurma(idTurma)
        let pautas = []
        TDpautas.forEach(pauta => {
            if (pauta.anoLectivo == "" + anoActivo._id) {
                pautas.push(pauta)
            }
        });

        let pautaT1 = [] // Este array está funcionando para todos trimestre
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let trimestre = ''
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = { "notas": dadosOrganizado[0] }
                    disciplinasOrdenadas = dadosOrganizado[1]
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id
                pautaT1.trimestre = pauta.trimestre

            }

        });

        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        const anoPdf = anoLectivo.codigo
        const anoCod = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let anoLet = anoCod.replace("/", "-")


        //PARA GERAR RELATÓRIO
        // Se for pauta da 10ª Classe
        //return res.send({pautaT1})
        if ((classe == "10ª Classe" && curso.descricao == "Curso de Ciências Humanas") || (classe == "12ª Classe" && curso.descricao == "Curso de Ciências Humanas") || classe == "10ª Classe" && curso.descricao == "Curso de Ciências Físicas e Biológicas") {
            // return res.send({classe})
            console.log("PAUTA DA 10ªA CLASSE")

            ejs.renderFile("./views/relatorios/pautaIII10CH.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre3/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre3')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else if (classe == "10ª Classe" && curso.descricao == "Curso de Ciências Económico-Jurídicas") {
            ejs.renderFile("./views/relatorios/pautaIII10CEJ.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre3/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre3')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else {
            ejs.renderFile("./views/relatorios/pautaIII.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/trimestre3/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre3')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}



/* Antigos */
//SEGUNDO TRIMESTRE
export const pautaTrimestralII = async (req, res) => {
    try {

        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        //return res.send(idTurma)

        const pautas = await findPautaByIdTurma(idTurma)
        const pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        //return res.send({anoLectivo})
        let disciplinas = []
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT1.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT2.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim do Segundo trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT3.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//fim terceiro trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                pauta.dadosPauta.forEach(element => {
                    pautaF.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim Pauta final
        });
        console.log(disciplinas)


        // const pauta = await findPautaByIdService(idPauta)
        // const alunosDaTurma = await findAlunosByIdTurma(idTurma)
        // const notasDisciplinasTurma = await findMinipautasByIdTurma(idTurma)

        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo
        const anoPdf = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        //return res.send({pautaT2})


        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/pautaII.ejs", { dia: dia, mes: mes, ano: ano, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT2: pautaT2 }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                pdf.create(html, {}).toFile("./relatorios/pauta_" + turmaPDF + "_IITrimestre.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu')
                    } else {
                        req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                        res.redirect('/pedagogico/pauta/' + idTurma)
                    }
                })
            }
        })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
//TERCEIRO TRIMESTRE
export const pautaTrimestralIII = async (req, res) => {
    try {

        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        //return res.send(idTurma)

        const pautas = await findPautaByIdTurma(idTurma)
        const pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        //return res.send({anoLectivo})
        let disciplinas = []
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT1.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT2.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim do Segundo trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                pauta.dadosPauta.forEach(element => {

                    pautaT3.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//fim terceiro trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                pauta.dadosPauta.forEach(element => {
                    pautaF.push(element)
                });
                const d = []
                pauta.discsTurma.forEach(element => {
                    d.push(element.disciplina)
                })
                disciplinas = d

            }//Fim Pauta final
        });
        console.log(disciplinas)


        // const pauta = await findPautaByIdService(idPauta)
        // const alunosDaTurma = await findAlunosByIdTurma(idTurma)
        // const notasDisciplinasTurma = await findMinipautasByIdTurma(idTurma)

        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo
        const anoPdf = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        //return res.send({pautaT2})


        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/pautaIII.ejs", { dia: dia, mes: mes, ano: ano, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT3: pautaT3 }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                pdf.create(html, {}).toFile("./relatorios/pauta_" + turmaPDF + "_III_Trimestre.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu')
                    } else {
                        req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                        res.redirect('/pedagogico/pauta/' + idTurma)
                    }
                })
            }
        })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}


/* Actual */
//PAUTA FINAL
export const pautaFinal = async (req, res) => {
    try {
        //BUSCANDO DADOS DO BANCO
        const idTurma = req.params.id
        const pautas = await findPautaByIdTurma(idTurma)

        let pautaT1 = [] // Este array está funcionando para todos trimestre
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let trimestre = ''
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {
            if (pauta.trimestre == 'Pauta Final' & pauta.anoLectivo == dadosTurma.idAno) {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome
                    const genero = dado.genero
                    const estado = dado.estado
                    const reprovar = dado.reprovar
                    let somaMedias = 0
                    let qtMedias = 0

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = { "notas": dadosOrganizado[0] }
                    disciplinasOrdenadas = dadosOrganizado[1]

                    /* Calcular a média geral */
                    notas.notas.forEach(nota => {
                        if (classe == "12ª Classe") { somaMedias = somaMedias + nota.cf } else { somaMedias = somaMedias + nota.mf }
                        qtMedias++
                    });

                    const media = Math.round(somaMedias / qtMedias)
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "genero": genero, "notas": notas, "media": media, estado, reprovar }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id
                pautaT1.trimestre = pauta.trimestre

            }

        });
        //return res.snd({pautaT1})
        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        const anoPdf = anoLectivo.codigo
        const anoCod = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let anoLet = anoCod.replace("/", "-")
        let descCurso = curso.descricao
        let classeExame = false; if (classePDF == "12ª Classe") { classeExame = true }

        //return res.send({classeExame})

        //PARA GERAR RELATÓRIO
        if (classeExame) {
            /* Caso seja uma classe de exame */
            ejs.renderFile("./views/relatorios/pautaFExame.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/final/pautasF/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })

        } else {

            /* Caso não seja classes de exame */
            // Se for pauta da 10ª Classe
            if ((classe == "10ª Classe" && curso.descricao == "Curso de Ciências Humanas") || (classe == "12ª Classe" && curso.descricao == "Curso de Ciências Humanas") || classe == "10ª Classe" && curso.descricao == "Curso de Ciências Físicas e Biológicas") {
                // return res.send({classe})
                console.log("PAUTA DA 10ªA CLASSE")

                ejs.renderFile("./views/relatorios/pautaF10CH.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasF/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })
            } else if (classe == "10ª Classe" && curso.descricao == "Curso de Ciências Económico-Jurídicas") {
                ejs.renderFile("./views/relatorios/pautaF10CEJ.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasF/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre2')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })
            } else {
                ejs.renderFile("./views/relatorios/pautaF.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasF/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })

            }
        }


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

//PAUTA FINAL DO CONSELHO
export const pautaFinalDoConselho = async (req, res) => {
    try {
        //BUSCANDO DADOS DO BANCO
        const idPauta = req.params.id
        let pautaFDoConselho = await findPautaByIdService(idPauta)
        const idTurma = pautaFDoConselho.turma._id
        const pautas = await findPautaByIdTurma(idTurma)
        // return res.send({pautaFDoConselho})

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let trimestre = ''
        //return res.send({pautaFDoConselho})
        let disciplinas = pautaFDoConselho.dadosPauta[3].notas
        let disciplinasOrdenadas = []

        disciplinas.forEach(dado => {
            disciplinasOrdenadas.push({ "disciplina": dado.disciplina })
        });
        // return res.send({disciplinasOrdenadas})



        // return res.snd({pautaFDoConselho})
        //VARIÁVEIR PARA PDF
        const classePDF = dadosTurma.idClasse.designacao
        const turmaPDF = dadosTurma.codigo
        const periodoPDF = dadosTurma.periodo.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        const anoPdf = anoLectivo.codigo
        const anoCod = anoLectivo.codigo
        const date = new Date();

        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let anoLet = anoCod.replace("/", "-")
        let descCurso = curso.descricao
        let classeExame = false; if (classePDF == "12ª Classe") { classeExame = true }


        pautaFDoConselho.dadosPauta.forEach(aluno => {
            if (aluno.genero == "Não definido") { aluno.genero = "M" }
            let somaMedias = 0
            aluno.notas.forEach(notas => {
                if (classe == "12ª Classe") { somaMedias = somaMedias + notas.cf } else { somaMedias = somaMedias + notas.mf }

                //somaMedias = somaMedias + notas.mf

            });
            aluno.media = Math.round(somaMedias / disciplinasOrdenadas.length)
            pautaT1.push(aluno)

        });
        pautaT1.trimestre = pautaFDoConselho.trimestre

        //PARA GERAR RELATÓRIO
        // Se for pauta da 10ª Classe
        //return res.send({pautaT1})
        if (classeExame) {
            /* Caso seja uma classe de exame */
            ejs.renderFile("./views/relatorios/pautaFDoConselhoExa.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                if (err) {
                    const msdDeErro = 'Verifique se todos alunos têm notas!'
                    const msdDeErro2 = '' + err
                    return res.render('msgError', { msdDeErro, msdDeErro2 })
                } else {
                    const options = {
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

                    }
                    pdf.create(html, options).toFile("./relatorios/pautas/final/pautasFDoConselho/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                        if (err) {
                            const msdDeErro = 'Verifique se todos alunos têm notas!'
                            const msdDeErro2 = '' + err
                            return res.render('msgError', { msdDeErro, msdDeErro2 })
                        } else {
                            req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                            res.redirect('/pedagogico/pauta3/' + idTurma)
                        }
                    })
                }
            })
        } else {


            if ((classe == "10ª Classe" && curso.descricao == "Curso de Ciências Humanas") || (classe == "12ª Classe" && curso.descricao == "Curso de Ciências Humanas") || classe == "10ª Classe" && curso.descricao == "Curso de Ciências Físicas e Biológicas") {
                // return res.send({classe})
                console.log("PAUTA DA 10ªA CLASSE")

                ejs.renderFile("./views/relatorios/pautaFConselho10CH.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasFDoConselho/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })
            } else if (classe == "10ª Classe" && curso.descricao == "Curso de Ciências Económico-Jurídicas") {
                ejs.renderFile("./views/relatorios/pautaFConselho10CEJ.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasFDoConselho/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/trimestre2')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })
            } else {
                ejs.renderFile("./views/relatorios/pautaFDoConselho.ejs", { dia: dia, mes: mes, ano: ano, anoCod, anoPdf: anoPdf, classePDF: classePDF, turmaPDF: turmaPDF, periodoPDF: periodoPDF, disciplinas: disciplinas, pautaT1: pautaT1, disciplinasOrdenadas, descCurso }, (err, html) => {
                    if (err) {
                        const msdDeErro = 'Verifique se todos alunos têm notas!'
                        const msdDeErro2 = '' + err
                        return res.render('msgError', { msdDeErro, msdDeErro2 })
                    } else {
                        const options = {
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

                        }
                        pdf.create(html, options).toFile("./relatorios/pautas/final/pautasFDoConselho/" + classePDF + "-" + turmaPDF + "-Pauta-" + pautaT1.trimestre + "-" + anoLet + ".pdf", (err, re) => {
                            if (err) {
                                const msdDeErro = 'Verifique se todos alunos têm notas!'
                                const msdDeErro2 = '' + err
                                return res.render('msgError', { msdDeErro, msdDeErro2 })
                            } else {
                                req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios/pautas/final')
                                res.redirect('/pedagogico/pauta3/' + idTurma)
                            }
                        })
                    }
                })

            }

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}


//RELATORIO FINANCEIRO DO DIA
export const relFDiario = async (req, res) => {
    try {

        const date = new Date();
        const diaR = date
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const despesas = await findAllDespesasService()
        const receitas = await findAllReceitasService()
        let relaDiario = []
        const relGeral = []

        //return res.send('Teste...')
        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/relDiario.ejs", { diaR: diaR, dia: dia, mes: mes, ano: ano, despesas: despesas, receitas: receitas }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                pdf.create(html, {}).toFile("./relatorios/rel" + dia + "_diario.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu')
                    } else {
                        req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                        res.redirect('/financas/relatorios')
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const declaracaoSemNota = async (req, res) => {
    try {
        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const idAluno = req.body.idAluno
        const idSolic = req.body.idSolic
        const anoActivo = req.body.anoActivo
        const aluno = await findAlunoByIdService(idAluno)
        const nome = aluno.nome
        const curso = aluno.curso
        const classe = aluno.classe
        const nomeEncarregado = aluno.nomeEncarregado
        const numBI = aluno.numBI
        const solicitacao = await findSolicitacaoByIdService(idSolic)
        solicitacao.estado = 'Atendido'
        const update = await findOcorrenciaByIdAndUpdateServece(idSolic, solicitacao)
        //return res.send({update})

        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/decSemNota.ejs", { dia: dia, mes: mes, ano: ano, nome: nome, curso: curso, nomeEncarregado: nomeEncarregado, classe: classe, numBI: numBI, curso: curso, anoActivo: anoActivo }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                pdf.create(html, {}).toFile("./relatorios/decSemNota" + nome + "_.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu')
                    } else {

                        req.flash('success_msg', 'Arquivo gerado com sucesso! veja na pasta de relatórios')
                        res.redirect('/pedagogico/pedidos')
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const gerarListaAlunos = async (req, res) => {
    try {
        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const idTurma = req.params.id
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        const anoCod = anoLectivo.codigo
        const tdAlunos = await findAlunosByIdTurma(idTurma)
        let alunos = []

        tdAlunos.forEach(aluno => {
            if (aluno.matriculado) { alunos.push(aluno) }
        });

        /*   let alunos = []
          alunosT.forEach(async aluno => {
              aluno.nome = await initialMaiuculas(aluno.nome)
              console.log(aluno.nome)
              alunos.push(aluno)
          });
  
          return res.send({alunos}) */
        const turma = await findTurmaByIdService(idTurma)
        const turmaCod = turma.codigo
        const periodo = turma.periodo
        const idCurso = turma.idCurso
        const curso = await findCursoByIdService(idCurso)
        const classe = await findClasseByIdService(turma.idClasse)


        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaAlunos.ejs", { dia: dia, mes: mes, ano: ano, alunos: alunos, curso: curso, anoCod: anoCod, classe: classe, turmaCod: turmaCod, periodo: periodo }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                const options = {
                    format: "A4",
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/" + classe.designacao + "-" + turmaCod + "-Lista.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/turmas/turma/' + idTurma)
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const gerarListaExame = async (req, res) => {
    try {
        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const idTurma = req.params.id
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        const anoCod = anoLectivo.codigo
        const alunos = await findAlunosByIdTurma(idTurma)

        /*   let alunos = []
          alunosT.forEach(async aluno => {
              aluno.nome = await initialMaiuculas(aluno.nome)
              console.log(aluno.nome)
              alunos.push(aluno)
          });
  
          */
          //return res.send({alunos}) 
        const turma = await findTurmaByIdService(idTurma)
        const turmaCod = turma.codigo
        const periodo = turma.periodo
        const idCurso = turma.idCurso
        const curso = await findCursoByIdService(idCurso)
        const classe = await findClasseByIdService(turma.idClasse)


        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaExame.ejs", { dia: dia, mes: mes, ano: ano, alunos: alunos, curso: curso, anoCod: anoCod, classe: classe, turmaCod: turmaCod, periodo: periodo }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                const options = {
                    format: "A4",
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/exame/" + classe.designacao + "-" + turmaCod + "-presenca.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/turmas/turma/' + idTurma)
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const gerarListaDePresenca = async (req, res) => {
    try {
        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        const idTurma = req.params.id
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        const anoCod = anoLectivo.codigo
        const alunos = await findAlunosByIdTurma(idTurma)

        /*   let alunos = []
          alunosT.forEach(async aluno => {
              aluno.nome = await initialMaiuculas(aluno.nome)
              console.log(aluno.nome)
              alunos.push(aluno)
          });
  
          return res.send({alunos}) */
        const turma = await findTurmaByIdService(idTurma)
        const turmaCod = turma.codigo
        const periodo = turma.periodo
        const idCurso = turma.idCurso
        const curso = await findCursoByIdService(idCurso)
        const classe = await findClasseByIdService(turma.idClasse)


        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaAlunosPresenca.ejs", { dia: dia, mes: mes, ano: ano, alunos: alunos, curso: curso, anoCod: anoCod, classe: classe, turmaCod: turmaCod, periodo: periodo }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                const options = {
                    format: "A4",
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/presencas/" + classe.designacao + "-" + turmaCod + "-presenca.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/turmas/turma/' + idTurma)
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const listaAprovados = async (req, res) => {
    try {
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

        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

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

        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaAlunosAprovados.ejs", { dia: dia, mes: mes, anoPdf, titulo, alunosAprovados, ano, classePDF, pauta, descCurso, turmaPDF, periodoPDF }, (err, html) => {
            if (err) {
                return res.send('HOUVE de Novo OUTRO ERRO!' + err)
            } else {
                const options = {
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/aprovados/" + classePDF + "-" + turmaPDF + " - Lista de reconfirmação.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/pedagogico/aprovados/' + idPauta)
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}


/* EM DEV */
export const rendListaAlunosAprovados = async (req, res) => {
    try {
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

        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

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

        const caminhoTemplateEJS = path.join(process.cwd(), 'views', 'listaAlunosAprovados.ejs');


        const alunos = []
        ejs.renderFile(caminhoTemplateEJS, { dia: dia, mes: mes, anoPdf, titulo, alunosAprovados, ano, classePDF, pauta, descCurso, turmaPDF, periodoPDF }, (err, html) => {
            if (err) {
                return res.status(500).send('Erro outravez ao renderizar EJS: ' + err);
            }

            // Gera PDF usando html-pdf
            const options = {
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

            }
            pdf.create(html, options).toStream((err, stream) => {
                if (err) return res.status(500).send('Erro Detalhado ao gerar PDF' + err);
                res.setHeader('Content-Type', 'application/pdf');
                return stream.pipe(res);
                //return res.send("Success")
            });
        });

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}


export const listaReprovados = async (req, res) => {
    try {
        const idPauta = req.params.id
        let alunosReprovados = []
        let qtAlunos = 0
        let pauta = await findPautaByIdService(idPauta)
        let descCurso = pauta.curso.descricao
        let turmaPDF = pauta.turma.codigo
        let periodoPDF = pauta.turma.periodo
        let anoPdf = await findAnoLectivoById(pauta.anoLectivo)
        anoPdf = anoPdf.codigo
        let classePDF = pauta.classe.designacao
        let novaOrdem = 0
        let titulo = ""

        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();

        pauta.dadosPauta.forEach(aluno => {
            if (aluno.estado == "N/APTO" || aluno.estado == "N/APTA") {
                aluno.numOrdem = novaOrdem + 1
                alunosReprovados.push(aluno)
                novaOrdem++
            }
        });

        //return res.send({ alunosReprovados})

        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaAlunosReprovados.ejs", { dia: dia, mes: mes, anoPdf, titulo, alunosReprovados, ano, classePDF, pauta, descCurso, turmaPDF, periodoPDF }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                const options = {
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/repetentes/" + classePDF + "-" + turmaPDF + " - Lista de reconfirmação - repetentes.pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/pedagogico/pauta3/' + pauta.turma._id)
                    }
                })
            }
        })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const listaCandidatosCursos = async (req, res) => {
    try {
        const idCurso = req.params.id
        const eAdmin = true
        const curso = await findCursoByIdService(idCurso)
        let alunosDoCurso = await findAllCandidatosByCursoService(curso.descricao)

        let numOrdem = 1
        alunosDoCurso.forEach(aluno => {
            aluno.numOrdem = numOrdem
            numOrdem++
        });
        const anoAtivo = await findAnoLectivoByEstadoService("Activo")
        let anoPdf = await findAnoLectivoById(anoAtivo._id)
        anoPdf = anoPdf.codigo
        const descCurso = curso.descricao

        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();


        //return res.send("Sucesso!")
        //PARA GERAR RELATÓRIO
        ejs.renderFile("./views/relatorios/listaCandidatos.ejs", { dia: dia, mes: mes, anoPdf, alunosDoCurso, ano, descCurso }, (err, html) => {
            if (err) {
                return res.send('HOUVE UM ERRO!' + err)
            } else {
                const options = {
                    format: "A4",
                    orientation: 'portrait',//portrait ou Landscape
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

                }
                pdf.create(html, options).toFile("./relatorios/listas/candidatos/Lista-Cand - " + descCurso + ".pdf", (err, re) => {
                    if (err) {
                        return res.send('Um erro aconteceu ao guradar lista')
                    } else {
                        req.flash('success_msg', 'Lista gerada com sucesso! veja na pasta de relatórios em C:/')
                        res.redirect('/candidatos/verListaPorCurso/' + curso._id)
                    }
                })
            }
        })

    } catch (error) {
        return res.status(500).send({ mesage: error.masage })
    }
}