import { calcularMedias } from "../middlewares/professor.middlewere.js"
import { estadoAprovadoReprovado, notasOrganizadas } from "../outrasF/pauta.OutF.js"
import { createAlunoService, findAlunoByIdAndUpdate, findAlunoByIdService, findAlunoByNomeServce, findAlunoByNumBIService, findAlunosByIdAnoService, findAlunosByIdCursoService, findAlunosByIdTurma, findAlunosMatriculados } from "../services/aluno.service.js"
import { findAnoLectivoActivoService, findAnoLectivoByEstadoService, findAnoLectivoById } from "../services/anoLectivo.service.js"
import { createAproveitamento, findAproveitamentoAndApdateService, findAproveitamentoByTrimestreService } from "../services/aproveitamentos.service.js"
import { findAllClassesService, findClasseByIdService, findClassesByIdAno } from "../services/classe.service.js"
import { findAllCursosService, findCursoByDescricaoService, findCursoByIdService, findCursosByIdAnoService } from "../services/curso.service.js"
import { findDisciplinaByIdClasse } from "../services/disciplina.service.js"
import { findFaltaBayIdAlunoService } from "../services/faltas.service.js"
import { findFuncionarioByFuncaoService, findFuncionariosByIdService } from "../services/funcionario.service.js"
import { findAllMinipautasService, findMinipautaByIdService, findMinipautasByIdAnoService, findMinipautasByIdTurma, findMiniputasByNomeService } from "../services/minipauta.service.js"
import { findAllNotasTrimSercice } from "../services/notas.service.js"
import { findAllNotasDisciplina, findNotaDisciplinaByIdAndDeleteService, findNotasDisciplinaByIdAlunoPerfil, findNotasDisciplinaByIdClasse, findNotasDisciplinaByIDServece } from "../services/notasDisciplina.service.js"
import { findOcorrenciaByEstatoService, findOcorrenciaByIdAndUpdateServece, findOcorrenciaTipoService, findSolicitacaoByIdService } from "../services/ocorrencias.service.js"
import { createPautaService, findAllPautasService, findOnePautaByIdTurma, findPautaByIdAndDelectService, findPautaByIdAndUpdateServece, findPautaByIdService, findPautaByIdTurma, findPautaByTrimestre, findPautaTDByTrimestre, findPautasByIdAnoLectivoService, findPautasByIdAnoService, findPautasByIdCursoServece } from "../services/pauta.service.js"
import { findAllTurmasDetService, findAllTurmasService2, findDadosTurmaByIdService, findTurmaByIdAndUpdService, findTurmaByIdPresidente, findTurmaByIdService, findTurmasByIdAno } from "../services/turma.service.js"
import { createUserService, findByUsernameService, findUserByIdService } from "../services/user.service.js"

export const pedagogicoHome = async (req, res) => {
    try {
        const estado = 'Pendente'
        const tipo = 'Pedido de Declaração'

        const pedidos = await findOcorrenciaTipoService(tipo)
        const pedDeclaracao = []
        pedidos.forEach(element => {
            if (element.estado == 'Pendente') {
                pedDeclaracao.push(element)
            }
        });
        //return res.send({pedDeclaracao})
        res.render('pedagogico/pedagoHome', { pedDeclaracao })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Esta é uma versão original da função posterior */
/* Toda alteração aqui, obrigatóriamente  deve se fazer na cópia abaixo*/
export const gerarPauta = async (req, res) => {
    try {
        //return res.send("Testando...")
        const idTurma = req.body.turma
        const classe = req.body.classe
        const trimestre = req.body.trimestre
        let descCurso = ""
        let classeExame = false

        if (idTurma == 'selecionar' || classe == 'selecionar' || trimestre == 'selecionar') {
            req.flash('error_msg', 'Não foi possível gerar a pauta. Seleciona corretamnete os campos!')
            res.redirect('/pedagogico/pautas')
        } else {
            const turma = await findTurmaByIdService(idTurma)
            const idClasse = turma.idClasse
            const idCurso = turma.idCurso
            const idAno = turma.idAno
            const disciplinas = await findDisciplinaByIdClasse(idClasse)
            const curso = await findCursoByIdService(idCurso)
            descCurso = curso.descricao
            let desClasse = await findClasseByIdService(idClasse)
            desClasse = desClasse.designacao
            if (desClasse == "12ª Classe") { classeExame = true }
            //return res.send({ classeExame })


            //return res.send({descCurso})
            const nomesDisciplina = []
            disciplinas.forEach(disciplina => {
                nomesDisciplina.push(disciplina.nomeDisciplina)
            });

            //SE FOR DO Iº TRIMESTRE
            if (trimestre == 'trimestre1') {
                const trimest = 'Primeiro Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Já existe uma pauta do I Trimestre dessa turma!')
                    res.redirect('/pedagogico/pautas')
                } else {
                    // return res.send('Não Achado!')
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        //dadosPauta.push(nome)
                        //dadosPauta.push(idAluno)
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                console.log('Sucesso4!')
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt1) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac1: nota.notas.mac1,
                                    pp1: nota.notas.pp1,
                                    pt1: nota.notas.pt1,
                                    mt1: nota.notas.mt1
                                }
                                if (nota.notas.mac1 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp1 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt1 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt1 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Primeiro Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac1": 0,
                                    "pp1": 0,
                                    "pt1": 0,
                                    "mt1": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac1": 0,
                                        "pp1": 0,
                                        "pt1": 0,
                                        "mt1": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    // return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    //return res.send({ pautaCreada })
                    req.flash('success_msg', 'Pauta gerada com sucesso! Clica em ver pautas da turma correspondente.')
                    res.redirect('/pedagogico/pautas')



                }
            }//FIM DO Iº TRIMESTRE

            //SE FOR DO IIº TRIMESTRE
            if (trimestre == 'trimestre2') {
                const trimest = 'Segundo Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Houve uma falha! Já existe uma pauta do II Trimestre dessa turma.')
                    res.redirect('/pedagogico/pautas')
                } else {
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt2) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac2: nota.notas.mac2,
                                    pp2: nota.notas.pp2,
                                    pt2: nota.notas.pt2,
                                    mt2: nota.notas.mt2
                                }
                                if (nota.notas.mac2 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp2 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt2 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt2 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Segundo Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac2": 0,
                                    "pp2": 0,
                                    "pt2": 0,
                                    "mt2": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac2": 0,
                                        "pp2": 0,
                                        "pt2": 0,
                                        "mt2": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    //return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    //return res.send({ pautaCreada })
                    req.flash('success_msg', 'Pauta gerada com sucesso! Clica em ver pautas da turma correspondente.')
                    res.redirect('/pedagogico/pautas')
                }
            }
            //FIM DO IIº TRIMESTRE

            //SE FOR DO IIIº TRIMESTRE
            if (trimestre == 'trimestre3') {
                const trimest = 'Terceiro Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Houve uma falha! Já existe uma pauta do III Trimestre dessa turma.')
                    res.redirect('/pedagogico/pautas')
                } else {
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt3) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac3: nota.notas.mac3,
                                    pp3: nota.notas.pp3,
                                    pt3: nota.notas.pt3,
                                    mt3: nota.notas.mt3
                                }
                                if (nota.notas.mac3 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp3 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt3 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt3 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Terceiro Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac3": 0,
                                    "pp3": 0,
                                    "pt3": 0,
                                    "mt3": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac3": 0,
                                        "pp3": 0,
                                        "pt3": 0,
                                        "mt3": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    //return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    //return res.send({ pautaCreada })
                    req.flash('success_msg', 'Pauta gerada com sucesso! Clica em ver pautas da turma correspondente.')
                    res.redirect('/pedagogico/pautas')
                }
            }
            //FIM DO IIIº TRIMESTRE

            //SE FOR PAUTA FINAL
            if (trimestre == 'pautaFinal') {
                //return res.send('Pauta final')
                const trimest = 'Pauta Final'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    console.log("Teste...")
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                        console.log("Exste")
                    } else {
                        console.log("naoExste")

                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Já existe uma pauta final desta turma!')
                    res.redirect('/pedagogico/pautas')
                } else {
                    //return res.send('Não Achado!')
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        let negativas = 0
                        const idAluno = aluno._id
                        const genero = aluno.genero
                        const notas = {
                            notas: []
                        }
                        let disciplinasChaves = []


                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {


                                //contar negativa
                                //if (nota.notas.cf < 10 || nota.notas.cf == '') { negativas += 1 }

                                //criar disciplina
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                disciplinas.push(disciplina)//adicionar disc 
                                //Caso seja classe de exame
                                if (classeExame) {
                                    /* Se for classe de exame */
                                    /* Nesta parte da função foi implementada um conselho inicial, segundo a orientação do cliente. Todos aluno com negativa de 8 a 9 devem automáticamente ser convertido em 10 valores */
                                    //console.log({nota})
                                    if (nota.notas.medDosTrimestes == undefined || nota.notas.medDosTrimestes == null) { nota.notas.medDosTrimestes = 14 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                    if (nota.notas.examePF == undefined || nota.notas.examePF == null) { nota.notas.examePF = 14 }
                                    if (nota.notas.cf == undefined || nota.notas.cf == null) { nota.notas.cf = 14 }
                                    let cf = Math.round((nota.notas.medDosTrimestes * 0.4) + (nota.notas.examePF * 0.6))
                                    if (cf < 10 & cf >= 8) {
                                        if (nota.notas.medDosTrimestes < 10) { nota.notas.medDosTrimestes = 10 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                        if (nota.notas.examePF < 10) { nota.notas.examePF = 10 }
                                        cf = Math.round((nota.notas.medDosTrimestes * 0.4) + (nota.notas.examePF * 0.6))

                                    }
                                    const discpNota = {
                                        disciplina: nota.idMinipauta.nomeDisciplina,
                                        medDosTrimestes: nota.notas.medDosTrimestes,
                                        examePF: nota.notas.examePF,
                                        cf: cf
                                    }
                                    nota.notas.cf = cf
                                    if (nota.notas.medDosTrimestes < 10) { discpNota.negativa1 = 'Sim' }
                                    if (nota.notas.examePF < 10) { discpNota.negativa2 = 'Sim' }
                                    if (nota.notas.cf < 10) { discpNota.negativa3 = 'Sim' }

                                    const discipMediaFinal = { "disciplina": nota.idMinipauta.nomeDisciplina, "mf": cf }

                                    disciplinasChaves.push(discipMediaFinal)
                                    notas.notas.push(discpNota)

                                } else {

                                    if (nota.notas.mt1 == undefined) { nota.notas.mt1 = 0 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                    if (nota.notas.mt2 == undefined) { nota.notas.mt2 = 0 }
                                    if (nota.notas.mt3 == undefined) { nota.notas.mt3 = 14 }
                                    const mf = Math.round((nota.notas.mt1 + nota.notas.mt2 + nota.notas.mt3) / 3)
                                    const discpNota = {
                                        disciplina: nota.idMinipauta.nomeDisciplina,
                                        mt1: nota.notas.mt1,
                                        mt2: nota.notas.mt2,
                                        mt3: nota.notas.mt3,
                                        mf: mf
                                    }
                                    //nota.notas.cf = mf
                                    if (nota.notas.mt1 < 10) { discpNota.negativa1 = 'Sim' }
                                    if (nota.notas.mt2 < 10) { discpNota.negativa2 = 'Sim' }
                                    if (nota.notas.mt3 < 10) { discpNota.negativa3 = 'Sim' }
                                    if (mf < 10) { discpNota.negativa4 = 'Sim' }

                                    const discipMediaFinal = { "disciplina": nota.idMinipauta.nomeDisciplina, "mf": mf }

                                    disciplinasChaves.push(discipMediaFinal)
                                    notas.notas.push(discpNota)
                                }

                            }
                        });
                        //Condição para aprovar ou reprovar
                        //return res.send({disciplinasChaves})
                        let reprovar = ""; let aprovar = ""; let desistente = ""; let recurso = "";

                        let estado = estadoAprovadoReprovado(disciplinasChaves, descCurso, genero, classeExame)
                        if (estado == "APTO" || estado == "APTA") { aprovar = "true" }
                        if (estado == "N/APTO" || estado == "N/APTA") { reprovar = "true" }
                        if (estado == "DESISTENTE") { desistente = "true" }
                        if (estado == "RECURSO") { recurso = "true" }
                        const alunoDado = {
                            nome: nome,
                            genero: genero,
                            estado: estado,
                            idAluno: idAluno,
                            notas: notas,
                            aprovar: aprovar,
                            reprovar: reprovar,
                            desistente: desistente,
                            recurso: recurso
                        }
                        dadosPauta.push(alunoDado)
                    });

                    // return res.send({dadosPauta})
                    const pauta = {
                        trimestre: 'Pauta Final',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    // return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    req.flash('success_msg', 'Pauta gerada com sucesso! Clica em ver pautas da turma correspondente.')
                    res.redirect('/pedagogico/pautas')
                }
            }//FIM PAUTA FINAL

            // res.send({nomesDisciplina})
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Esta é uma versão cópia da função anterior */
/* Toda alteração aqui, obrigatóriamente  deve se fazer na original*/
export const gerarPautaLocal = async (req, res) => {
    try {
        //return res.send("Testando...")
        const idTurma = req.body.turma
        const classe = req.body.classe
        const trimestre = req.body.trimestre
        let descCurso = ""
        let classeExame = false

        if (idTurma == 'selecionar' || classe == 'selecionar' || trimestre == 'selecionar') {
            req.flash('error_msg', 'Não foi possível gerar a pauta. Seleciona corretamnete os campos!')
            res.redirect('/pedagogico/pautas')
        } else {
            const turma = await findTurmaByIdService(idTurma)
            const idClasse = turma.idClasse
            const idCurso = turma.idCurso
            const idAno = turma.idAno
            const disciplinas = await findDisciplinaByIdClasse(idClasse)
            const curso = await findCursoByIdService(idCurso)
            descCurso = curso.descricao
            let desClasse = await findClasseByIdService(idClasse)
            desClasse = desClasse.designacao
            if (desClasse == "12ª Classe") { classeExame = true }
            //return res.send({ classeExame })


            //return res.send({descCurso})
            const nomesDisciplina = []
            disciplinas.forEach(disciplina => {
                nomesDisciplina.push(disciplina.nomeDisciplina)
            });

            //SE FOR DO Iº TRIMESTRE
            if (trimestre == 'trimestre1') {
                const trimest = 'Primeiro Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Já existe uma pauta do I Trimestre dessa turma!')
                    return res.redirect('/pedagogico/pautas')
                } else {
                    let tdAlunosDaTurma = await findAlunosByIdTurma(idTurma)
                    let alunosDaTurma = []

                    /* Filtrar alunos que não estão matriculados */
                    let qtOutr = 0
                    tdAlunosDaTurma.forEach(async aluno => {
                        if (aluno.idAno == idAno && aluno.matriculado == true) {
                            alunosDaTurma.push(aluno)
                        } else {
                            aluno.idTurma = ""
                            aluno.matricula = "Não Confirmada"
                            aluno.idAno = ""

                            await findAlunoByIdAndUpdate(aluno._id, aluno)
                        }
                    });

                    //return res.send({ alunosDaTurma, qtOutr })

                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        //dadosPauta.push(nome)
                        //dadosPauta.push(idAluno)
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                //console.log('Sucesso4!')
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                //console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt1) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac1: nota.notas.mac1,
                                    pp1: nota.notas.pp1,
                                    pt1: nota.notas.pt1,
                                    mt1: nota.notas.mt1
                                }
                                if (nota.notas.mac1 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp1 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt1 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt1 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Primeiro Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                //console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac1": 0,
                                    "pp1": 0,
                                    "pt1": 0,
                                    "mt1": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac1": 0,
                                        "pp1": 0,
                                        "pt1": 0,
                                        "mt1": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    // return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    //return res.send({ pautaCreada })
                    req.flash('success_msg', 'Pauta do Iº Trimestre gerada com sucesso!')
                    return res.redirect('/pedagogico/pauta3/' + idTurma)



                }
            }//FIM DO Iº TRIMESTRE

            //SE FOR DO IIº TRIMESTRE
            if (trimestre == 'trimestre2') {
                const trimest = 'Segundo Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Houve uma falha! Já existe uma pauta do II Trimestre dessa turma.')
                    res.redirect('/pedagogico/pautas')
                } else {
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt2) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac2: nota.notas.mac2,
                                    pp2: nota.notas.pp2,
                                    pt2: nota.notas.pt2,
                                    mt2: nota.notas.mt2
                                }
                                if (nota.notas.mac2 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp2 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt2 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt2 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Segundo Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac2": 0,
                                    "pp2": 0,
                                    "pt2": 0,
                                    "mt2": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac2": 0,
                                        "pp2": 0,
                                        "pt2": 0,
                                        "mt2": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    //return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    req.flash('success_msg', 'Pauta do IIº Trimestre gerada com sucesso!')
                    return res.redirect('/pedagogico/pauta3/' + idTurma)
                }
            }
            //FIM DO IIº TRIMESTRE

            //SE FOR DO IIIº TRIMESTRE
            if (trimestre == 'trimestre3') {
                const trimest = 'Terceiro Trimestre'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Houve uma falha! Já existe uma pauta do III Trimestre dessa turma.')
                    res.redirect('/pedagogico/pautas')
                } else {
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        const idAluno = aluno._id
                        const notas = {
                            notas: []
                        }

                        let medias = []
                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                console.log({ disciplina })
                                disciplinas.push(disciplina)
                                medias.push(nota.notas.mt3) //Somando a média trimestral
                                let discpNota = {
                                    disciplina: nota.idMinipauta.nomeDisciplina,
                                    mac3: nota.notas.mac3,
                                    pp3: nota.notas.pp3,
                                    pt3: nota.notas.pt3,
                                    mt3: nota.notas.mt3
                                }
                                if (nota.notas.mac3 < 10) { discpNota.negativa1 = 'Sim' }
                                if (nota.notas.pp3 < 10) { discpNota.negativa2 = 'Sim' }
                                if (nota.notas.pt3 < 10) { discpNota.negativa3 = 'Sim' }
                                if (nota.notas.mt3 < 10) { discpNota.negativa4 = 'Sim' }

                                notas.notas.push(discpNota)

                            }
                        });
                        if (discsTurma.length == 0) {
                            discsTurma = disciplinas
                        }
                        //Calcular Media 
                        let somaDasnotas = 0
                        medias.forEach(notaMedia => {
                            somaDasnotas += notaMedia
                        });
                        let media = somaDasnotas / medias.length
                        //media = Math.round(media).toFixed(2); 
                        media = Number((media).toFixed(2));
                        const alunoDado = {
                            nome: nome,
                            idAluno: idAluno,
                            notas: notas,
                            media: media
                        }
                        dadosPauta.push(alunoDado)
                    });
                    /* discsTurma.forEach(element => {
                        console.log(element.disciplina)
                    }); */
                    const pauta = {
                        trimestre: 'Terceiro Trimestre',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    /* Atribuir nota 0 para quem não tem */
                    pauta.dadosPauta.forEach(dados => {

                        if (dados.notas.notas == "") {
                            pauta.discsTurma.forEach(disciplina => {
                                console.log(disciplina)
                                dados.notas.notas.push({
                                    "disciplina": disciplina["disciplina"],
                                    "mac3": 0,
                                    "pp3": 0,
                                    "pt3": 0,
                                    "mt3": 0,
                                    negativa1: 'Sim',
                                    negativa2: 'Sim',
                                    negativa3: 'Sim',
                                    negativa4: 'Sim',
                                })
                            });
                            dados.media = 0
                        } else {
                            pauta.discsTurma.forEach(disciplina => {
                                let discipProc = ''
                                dados.notas.notas.forEach(notas => {
                                    if (notas.disciplina == disciplina["disciplina"]) {
                                        discipProc = notas.disciplina
                                    }
                                });
                                if (discipProc == '') {
                                    dados.notas.notas.push({
                                        "disciplina": disciplina["disciplina"],
                                        "mac3": 0,
                                        "pp3": 0,
                                        "pt3": 0,
                                        "mt3": 0,
                                        negativa1: 'Sim',
                                        negativa2: 'Sim',
                                        negativa3: 'Sim',
                                        negativa4: 'Sim',
                                    })
                                }
                            });
                        }

                    });

                    //return res.send({ pauta })
                    const pautaCreada = await createPautaService(pauta)
                    req.flash('success_msg', 'Pauta do IIIº Trimestre gerada com sucesso!')
                    return res.redirect('/pedagogico/pauta3/' + idTurma)
                }
            }
            //FIM DO IIIº TRIMESTRE

            //SE FOR PAUTA FINAL
            if (trimestre == 'pautaFinal') {
                //return res.send('Pauta final')
                const trimest = 'Pauta Final'
                const verifyPauta = await findPautaByIdTurma(idTurma)
                let pautaExist = ''
                verifyPauta.forEach(pauta => {
                    console.log("Teste...")
                    if (pauta.trimestre == trimest & pauta.anoLectivo == turma.idAno) {
                        pautaExist = 'Sim'
                        console.log("Exste")
                    } else {
                        console.log("naoExste")

                    }
                });
                //return res.send({verifyPauta})
                //const verifyPauta = await findPautaByTrimestre(trimest)
                if (pautaExist == 'Sim') {
                    req.flash('error_msg', 'Já existe uma pauta final desta turma!')
                    res.redirect('/pedagogico/pautas')
                } else {
                    //return res.send('Não Achado!')
                    const alunosDaTurma = await findAlunosByIdTurma(idTurma)
                    const notasClasse = await findNotasDisciplinaByIdClasse(idClasse)

                    const dadosPauta = []
                    let discsTurma = []
                    alunosDaTurma.forEach(aluno => {
                        const disciplinas = []
                        const nome = aluno.nome
                        let negativas = 0
                        const idAluno = aluno._id
                        const genero = aluno.genero
                        const notas = {
                            notas: []
                        }
                        let disciplinasChaves = []


                        notasClasse.forEach(nota => {
                            if ('' + aluno._id == nota.aluno) {


                                //contar negativa
                                //if (nota.notas.cf < 10 || nota.notas.cf == '') { negativas += 1 }

                                //criar disciplina
                                let disciplina = {
                                    disciplina: nota.idMinipauta.nomeDisciplina
                                }
                                disciplinas.push(disciplina)//adicionar disc 
                                //Caso seja classe de exame
                                if (classeExame) {
                                    /* Se for classe de exame */
                                    /* Nesta parte da função foi implementada um conselho inicial, segundo a orientação do cliente. Todos aluno com negativa de 8 a 9 devem automáticamente ser convertido em 10 valores */
                                    //console.log({nota})
                                    if (nota.notas.medDosTrimestes == undefined || nota.notas.medDosTrimestes == null) { nota.notas.medDosTrimestes = 14 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                    if (nota.notas.examePF == undefined || nota.notas.examePF == null) { nota.notas.examePF = 14 }
                                    if (nota.notas.cf == undefined || nota.notas.cf == null) { nota.notas.cf = 14 }
                                    let cf = Math.round((nota.notas.medDosTrimestes * 0.4) + (nota.notas.examePF * 0.6))
                                    if (cf < 10 & cf >= 8) {
                                        if (nota.notas.medDosTrimestes < 10) { nota.notas.medDosTrimestes = 10 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                        if (nota.notas.examePF < 10) { nota.notas.examePF = 10 }
                                        cf = Math.round((nota.notas.medDosTrimestes * 0.4) + (nota.notas.examePF * 0.6))

                                    }
                                    const discpNota = {
                                        disciplina: nota.idMinipauta.nomeDisciplina,
                                        medDosTrimestes: nota.notas.medDosTrimestes,
                                        examePF: nota.notas.examePF,
                                        cf: cf
                                    }
                                    nota.notas.cf = cf
                                    if (nota.notas.medDosTrimestes < 10) { discpNota.negativa1 = 'Sim' }
                                    if (nota.notas.examePF < 10) { discpNota.negativa2 = 'Sim' }
                                    if (nota.notas.cf < 10) { discpNota.negativa3 = 'Sim' }

                                    const discipMediaFinal = { "disciplina": nota.idMinipauta.nomeDisciplina, "mf": cf }

                                    disciplinasChaves.push(discipMediaFinal)
                                    notas.notas.push(discpNota)

                                } else {

                                    if (nota.notas.mt1 == undefined) { nota.notas.mt1 = 0 } //Se estas notas náo existirem autopaticamento o sistema atribui 0
                                    if (nota.notas.mt2 == undefined) { nota.notas.mt2 = 0 }
                                    if (nota.notas.mt3 == undefined) { nota.notas.mt3 = 14 }
                                    const mf = Math.round((nota.notas.mt1 + nota.notas.mt2 + nota.notas.mt3) / 3)
                                    const discpNota = {
                                        disciplina: nota.idMinipauta.nomeDisciplina,
                                        mt1: nota.notas.mt1,
                                        mt2: nota.notas.mt2,
                                        mt3: nota.notas.mt3,
                                        mf: mf
                                    }
                                    //nota.notas.cf = mf
                                    if (nota.notas.mt1 < 10) { discpNota.negativa1 = 'Sim' }
                                    if (nota.notas.mt2 < 10) { discpNota.negativa2 = 'Sim' }
                                    if (nota.notas.mt3 < 10) { discpNota.negativa3 = 'Sim' }
                                    if (mf < 10) { discpNota.negativa4 = 'Sim' }

                                    const discipMediaFinal = { "disciplina": nota.idMinipauta.nomeDisciplina, "mf": mf }

                                    disciplinasChaves.push(discipMediaFinal)
                                    notas.notas.push(discpNota)
                                }

                            }
                        });
                        //Condição para aprovar ou reprovar
                        //return res.send({disciplinasChaves})
                        let reprovar = ""; let aprovar = ""; let desistente = ""; let recurso = "";

                        let estado = estadoAprovadoReprovado(disciplinasChaves, descCurso, genero, classeExame)
                        if (estado == "APTO" || estado == "APTA") { aprovar = "true" }
                        if (estado == "N/APTO" || estado == "N/APTA") { reprovar = "true" }
                        if (estado == "DESISTENTE") { desistente = "true" }
                        if (estado == "RECURSO") { recurso = "true" }
                        const alunoDado = {
                            nome: nome,
                            genero: genero,
                            estado: estado,
                            idAluno: idAluno,
                            notas: notas,
                            aprovar: aprovar,
                            reprovar: reprovar,
                            desistente: desistente,
                            recurso: recurso
                        }
                        dadosPauta.push(alunoDado)
                    });

                    // return res.send({dadosPauta})
                    const pauta = {
                        trimestre: 'Pauta Final',
                        discsTurma: discsTurma,
                        anoLectivo: idAno,
                        turma: idTurma,
                        curso: idCurso,
                        classe: idClasse,
                        dadosPauta: dadosPauta
                    }

                    // return res.send({ Testando })
                    const pautaCreada = await createPautaService(pauta)
                    req.flash('success_msg', 'Pauta gerada com sucesso! Clica em ver pautas da turma correspondente.')
                    res.redirect('/pedagogico/pauta3/' + idTurma)
                }
            }//FIM PAUTA FINAL

            // res.send({nomesDisciplina})
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const minipautas = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivoActivo) {
            const msdDeErro = 'Não ha nunhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivoActivo._id
        const minipautas = await findMinipautasByIdAnoService(idAno)
        //return res.send({minipautas})


        res.render('pedagogico/minipautasPed', { minipautas, anoLectivoActivo })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })

    }
}

export const pautas = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivo._id
        const pautas = await findPautasByIdAnoService(idAno)
        const turmas = await findTurmasByIdAno(idAno)
        const pautas10 = []
        const pautas11 = []
        const pautas12 = []
        turmas.forEach(element => {
            if (element.idClasse.designacao == '10ª Classe') {
                pautas10.push(element)
            }
            if (element.idClasse.designacao == '11ª Classe') {
                pautas11.push(element)
            }
            if (element.idClasse.designacao == '12ª Classe') {
                pautas12.push(element)
            }

        });
        //return res.send({pautas12})
        res.render('pedagogico/pautas', { turmas, pautas10, pautas11, pautas12, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const pauta = async (req, res) => {
    try {
        const idTurma = req.params.id
        const pautas = await findPautaByIdTurma(idTurma)

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []
        const pautaFConselhada = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        let disciplinas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT1.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }//Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT2.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }
            //Fim do Segundo trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT3.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }//fim terceiro trimestre

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

            //Se for pauta final Conselhada
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                pauta.dadosPauta.forEach(element => {
                    pautaFConselhada.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaFinConselhada = pauta._id
            }//Fim Pauta final Conselhada
        });

        res.render('pedagogico/pauta', { pautaT1, pautaT2, pautaT3, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaT1, idPautaT2, idPautaT3, idPautaFin, idPautaFinConselhada, pautaFConselhada })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

//Novo método de vizualizar a pauta para ordenar as disciplinas
export const pauta2 = async (req, res) => {
    try {
        const idTurma = req.params.id
        const estado = "Activo"
        let conselhoAutomaticoAplicado = false
        const anoActivo = await findAnoLectivoByEstadoService(estado)

        /* Correção de 2024 */
        const pautasDoAno = await findPautasByIdAnoLectivoService(anoActivo._id)
        //return res.send({pautasDoAno})
        //const TDpautas = await findPautaByIdTurma(idTurma)
        let pautas = []
        pautasDoAno.forEach(pauta => {
            //console.log({ pauta })
            if (pauta.turma != null) {
                if (pauta.turma._id == idTurma) { pautas.push(pauta) }
            }
        });//Fim da correção
        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []
        let pautaFConselhada = []


        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        //return res.send({curso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false
        let presidente = ''
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }


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
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }
            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    //console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                if (pauta.conselhoAutomaticoAplicado) { conselhoAutomaticoAplicado = true }
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome
                    const genero = dado.genero
                    const estado = dado.estado
                    const aprovar = dado.aprovar
                    const reprovar = dado.reprovar
                    const desistente = dado.desistente
                    const recurso = dado.recurso

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "genero": genero, "notas": notas, "media": media, "estado": estado, aprovar, reprovar, desistente, recurso }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final

            //Se for pauta final Conselhada
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                pautaFConselhada = pauta
                idPautaFinConselhada = pauta._id
                if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

                presidente = pautaFConselhada.membrosConselho[0].nomePresidente
            }
            //Fim Pauta final Conselhada
        });

        //return res.send({pautasDoAno})
        res.render('pedagogico/pauta2', { disciplinasOrdenadas, pautaT1, pautaT2, pautaT3, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaT1, idPautaT2, idPautaT3, idPautaFin, pautaFConselhada, idPautaFinConselhada, presidente, pauataFinalEmConselho, classeExame, conselhoAutomaticoAplicado })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const pautaPDF = async (req, res) => {
    try {
        return res.send('Pauta PDF')

        const idTurma = req.params.id
        const pautas = await findPautaByIdTurma(idTurma)

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        let disciplinas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT1.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }//Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT2.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do Segundo trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                pauta.dadosPauta.forEach(element => {
                    numOrdem += 1
                    element.numOrdem = numOrdem
                    pautaT3.push(element)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }//fim terceiro trimestre

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

        // return res.send({pautaT1})

        // return res.send({idPautaT1, idPautaT2, idPautaT3, idPautaFin})
        // const pauta = await findPautaByIdService(idPauta)
        // const alunosDaTurma = await findAlunosByIdTurma(idTurma)
        // const notasDisciplinasTurma = await findMinipautasByIdTurma(idTurma)
        res.render('pedagogico/pauta', { pautaT1, pautaT2, pautaT3, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaT1, idPautaT2, idPautaT3, idPautaFin })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const eliminarPauta = async (req, res) => {
    try {
        const { idPauta, idTurma } = req.body

        //res.send({idTurma})
        //const pauta = await findPautaByIdService(idPauta)

        if (idPauta == '') {
            req.flash('error_msg', 'Erro! Esta pauta ainda não foi gerada, ou não existe.')
            res.redirect('/pedagogico/pauta3/' + idTurma)
        } else {
            await findPautaByIdAndDelectService(idPauta)
            req.flash('error_msg', 'Pauta eliminada com exito!')
            res.redirect('/pedagogico/pauta3/' + idTurma)
        }
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const alunos = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivo._id
        const alunos = await findAlunosByIdAnoService(idAno)
        const turmas = await findTurmasByIdAno(idAno)
        //return res.send({turmas})
        res.render('pedagogico/alunos', { alunos, anoLectivo, turmas })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const turmas = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivo._id
        const turmas = await findTurmasByIdAno(idAno)
        //return res.send({turmas})
        const turmas10 = []
        const turmas11 = []
        const turmas12 = []
        turmas.forEach(element => {
            if (element.idClasse.designacao == "10ª Classe") {
                turmas10.push(element)
            }
            if (element.idClasse.designacao == "11ª Classe") {
                turmas11.push(element)
            }
            if (element.idClasse.designacao == "12ª Classe") {
                turmas12.push(element)
            }
        });
        res.render('pedagogico/turmas', { turmas10, turmas11, turmas12, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const classes = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        if (!anoLectivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        const idAno = anoLectivo._id
        const cursos = await findCursosByIdAnoService(idAno)
        const classes = await findClassesByIdAno(idAno)
        cursos.forEach(curso => {
            curso.classes = []
            classes.forEach(classe => {
                if (curso._id == classe.idCurso) {
                    curso.classes.push(classe)
                }
            });
        });
        // return res.send(cursos)
        res.render('pedagogico/classes', { cursos, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const cursos = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivo = await findAnoLectivoByEstadoService(estado)
        // const idAno = anoLectivo._id
        const cursos = await findAllCursosService()
        const classes = await findAllClassesService()
        cursos.forEach(curso => {
            let vagas = 0
            let turmas = 0
            classes.forEach(classe => {
                if (curso._id == classe.idCurso) {
                    vagas += classe.numVagas
                    classe.turmas.forEach(element => {
                        turmas += 1
                    });
                }
                curso.vagas = vagas
                curso.turmas = turmas
            });
        });
        //return res.send(cursos)
        res.render('pedagogico/cursos', { cursos, anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}


export const matricular = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
        const idAno = anoLectivoActivo._id
        res.redirect('/anosLectivo/config/' + idAno)
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const cargaHoraria = async (req, res) => {
    try {
        const funcao = 'professor'
        const anoActivo = await findAnoLectivoByEstadoService('Activo')
        if (!anoActivo) {
            const msdDeErro = 'Não existe nenhum ano Lectivo Activo!'
            return res.render('msgError', { msdDeErro })
        }
        let professores = await findFuncionarioByFuncaoService(funcao)
        const turmas = await findTurmasByIdAno(anoActivo._id)
        professores.forEach(professor => {
            let turmasAtrib = []
            let numTurmas = 0
            professor.turmas.forEach(async turmaP => {
                turmas.forEach(turma => {
                    if (turma._id == turmaP) {
                        turmasAtrib.push({ turma: turma.codigo })
                        numTurmas++
                    }

                });

                //const t = await findTurmaByIdService(turma)
                professor.turmasAtrib = turmasAtrib
                professor.numTurmas = numTurmas
            });
        });
        //return res.send({ professores })
        res.render('pedagogico/cargaHoraria', { professores })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const solicitacoes = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
        const idAno = anoLectivoActivo._id
        const estadoSolicitacao = 'Pendente'
        const ocorrencias = await findOcorrenciaByEstatoService(estadoSolicitacao)
        res.render('pedagogico/solicitacoes', { ocorrencias })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const solicitacao = async (req, res) => {
    try {
        const idSolicitacao = req.params.idSolicitacao
        const solicitacao = await findSolicitacaoByIdService(idSolicitacao)

        res.render('pedagogico/detalhSolicitacao', { solicitacao })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const autorizarJustific = async (req, res) => {
    try {
        const idSolicitacao = req.body.idSolicitacao
        const solicitacao = await findSolicitacaoByIdService(idSolicitacao)
        solicitacao.autorizado = 'Sim'
        await findOcorrenciaByIdAndUpdateServece(idSolicitacao, solicitacao)
        //return res.send({solicitacao})
        res.redirect('/pedagogico/solicitacao/' + idSolicitacao)

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const pedidos = async (req, res) => {
    try {
        const tipo = 'Pedido de Declaração'
        const pedidos = await findOcorrenciaTipoService(tipo)
        const pedDeclaracao = []
        pedidos.forEach(element => {
            if (element.estado == 'Pendente') {
                pedDeclaracao.push(element)
            }
        });

        //return res.send({pedDeclaracao})
        res.render('pedagogico/novasSolicitacoes', { pedDeclaracao })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const atenderDec = async (req, res) => {
    try {
        const numBI = req.body.numBI
        const comNotas = req.body.comNotas
        const idSolic = req.body.idSolic
        const aluno = await findAlunoByNumBIService(numBI)
        const pautas = await findAllPautasService()
        //res.send({comNotas})

        if (comNotas == 'Sim') {

            const dadoAluno = []

            pautas.forEach(pauta => {
                pauta.dadosPauta.forEach(dado => {
                    if (dado.idAluno == '' + aluno._id) {
                        dadoAluno.push(dado)
                    }
                });
            });
            const notas = []
            /* dadoAluno.notas.notas.forEach(nota => {
                notas.push(nota)
            }); */

        } else {
            const estadoa = 'Activo'
            const anoActivo = await findAnoLectivoByEstadoService(estadoa)
            // return res.send({estadoa})

            return res.render('pedagogico/declaracao', { aluno, anoActivo, idSolic })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const outrOp = async (req, res) => {
    try {
        res.render("pedagogico/relHome")
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const relatorioEstatistic = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const idAno = anoAct._id
        const tdAlunos = await findAlunosByIdAnoService(idAno)
        const tdNotas = await findAllNotasDisciplina()
        let alunosMatrMF = []
        tdAlunos.forEach(aluno => {
            if (aluno.genero == 'M' || aluno.genero == 'F') {
                alunosMatrMF.push(aluno)
            }
        });
        console.log(tdAlunos.length)
        console.log(alunosMatrMF.length)

        //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
        // CURSO CH

        /* 10ª Classe CH */
        let matric10ClasseCH = []
        let feminino10CH = 0
        let apvMF10CH = 0
        let apvFeminino10CH = 0
        let desistidos10MFCH = 0
        let desistidos10FemininoCH = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '10ª Classe') {
                matric10ClasseCH.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }


                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF10CH += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino10CH += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos10MFCH += 1
                    if (aluno.genero == 'F') {
                        desistidos10FemininoCH += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino10CH += 1
                }
                const semApv10MF = matric10ClasseCH.length - apvMF10CH
                const semApv10Feminino = feminino10CH - apvFeminino10CH
                matric10ClasseCH.feminino = feminino10CH
                matric10ClasseCH.apvMF = apvMF10CH
                matric10ClasseCH.apvFeminino = apvFeminino10CH
                matric10ClasseCH.semApvMF = semApv10MF - desistidos10MFCH
                matric10ClasseCH.semApvFeminino = semApv10Feminino - desistidos10FemininoCH

                matric10ClasseCH.desistMF = desistidos10MFCH
                matric10ClasseCH.desistFeminino = desistidos10FemininoCH
                matric10ClasseCH.chegadAoFimMF = matric10ClasseCH.length - desistidos10MFCH
                matric10ClasseCH.chegadAoFimFeminino = feminino10CH - desistidos10FemininoCH

            }
        });



        /* 11ª Classe CH */
        let matric11ClasseCH = []
        let feminino11CH = 0
        let apvMF11CH = 0
        let apvFeminino11CH = 0
        let desistidos11MFCH = 0
        let desistidos11FemininoCH = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                matric11ClasseCH.push(aluno)

                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }

                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF11CH += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino11CH += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos11MFCH += 1
                    if (aluno.genero == 'F') {
                        desistidos11FemininoCH += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino11CH += 1
                }
                const semApv11MF = matric11ClasseCH.length - apvMF11CH
                const semApv11Feminino = feminino11CH - apvFeminino11CH
                matric11ClasseCH.feminino = feminino11CH
                matric11ClasseCH.apvMF = apvMF11CH
                matric11ClasseCH.apvFeminino = apvFeminino11CH
                matric11ClasseCH.semApvMF = semApv11MF - desistidos11MFCH
                matric11ClasseCH.semApvFeminino = semApv11Feminino - desistidos11FemininoCH

                matric11ClasseCH.desistMF = desistidos11MFCH
                matric11ClasseCH.desistFeminino = desistidos11FemininoCH
                matric11ClasseCH.chegadAoFimMF = matric11ClasseCH.length - desistidos11MFCH
                matric11ClasseCH.chegadAoFimFeminino = feminino11CH - desistidos11FemininoCH

            }
        });

        /* 12ª Classe CH */
        let matric12ClasseCH = []
        let feminino12CH = 0
        let apvMF12CH = 0
        let apvFeminino12CH = 0
        let desistidos12MFCH = 0
        let desistidos12FemininoCH = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                matric12ClasseCH.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF12CH += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino12CH += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos12MFCH += 1
                    if (aluno.genero == 'F') {
                        desistidos12FemininoCH += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino12CH += 1
                }
                const semApv12MF = matric12ClasseCH.length - apvMF12CH
                const semApv12Feminino = feminino12CH - apvFeminino12CH
                matric12ClasseCH.feminino = feminino12CH
                matric12ClasseCH.apvMF = apvMF12CH
                matric12ClasseCH.apvFeminino = apvFeminino12CH
                matric12ClasseCH.semApvMF = semApv12MF - desistidos12MFCH
                matric12ClasseCH.semApvFeminino = semApv12Feminino - desistidos12FemininoCH

                matric12ClasseCH.desistMF = desistidos12MFCH
                matric12ClasseCH.desistFeminino = desistidos12FemininoCH
                matric12ClasseCH.chegadAoFimMF = matric12ClasseCH.length - desistidos12MFCH
                matric12ClasseCH.chegadAoFimFeminino = feminino12CH - desistidos12FemininoCH

            }
        });

        const totalCH = {
            mf: matric10ClasseCH.length + matric11ClasseCH.length + matric12ClasseCH.length,
            feminino: matric10ClasseCH.feminino + matric11ClasseCH.feminino + matric12ClasseCH.feminino,
            totalComApMF: matric10ClasseCH.apvMF + matric11ClasseCH.apvMF + matric12ClasseCH.apvMF,
            totalComApFeminino: matric10ClasseCH.apvFeminino + matric11ClasseCH.apvFeminino + matric12ClasseCH.apvFeminino,
            totalSemApMF: matric10ClasseCH.semApvMF + matric11ClasseCH.semApvMF + matric12ClasseCH.semApvMF,
            totalSemApFeminino: matric10ClasseCH.semApvFeminino + matric11ClasseCH.semApvFeminino + matric12ClasseCH.semApvFeminino,
        }
        //return res.send({alunosMatrMF})


        /* CURSO DE CIENCIAS FISICO-BIOLÓGICAS */
        /* 10ª Classe CFB */
        let matric10ClasseCFB = []
        let feminino10CFB = 0
        let apvMF10CFB = 0
        let apvFeminino10CFB = 0
        let desistidos10MFCFB = 0
        let desistidos10FemininoCFB = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                matric10ClasseCFB.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF10CFB += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino10CFB += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos10MFCFB += 1
                    if (aluno.genero == 'F') {
                        desistidos10FemininoCFB += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino10CFB += 1
                }
                const semApv10MF = matric10ClasseCFB.length - apvMF10CFB
                const semApv10Feminino = feminino10CFB - apvFeminino10CFB
                matric10ClasseCFB.feminino = feminino10CFB
                matric10ClasseCFB.apvMF = apvMF10CFB
                matric10ClasseCFB.apvFeminino = apvFeminino10CFB
                matric10ClasseCFB.semApvMF = semApv10MF - desistidos10MFCFB
                matric10ClasseCFB.semApvFeminino = semApv10Feminino - desistidos10FemininoCFB

                matric10ClasseCFB.desistMF = desistidos10MFCFB
                matric10ClasseCFB.desistFeminino = desistidos10FemininoCFB
                matric10ClasseCFB.chegadAoFimMF = matric10ClasseCFB.length - desistidos10MFCFB
                matric10ClasseCFB.chegadAoFimFeminino = feminino10CFB - desistidos10FemininoCFB
            }
        });



        /* 11ª Classe CFB */
        let matric11ClasseCFB = []
        let feminino11CFB = 0
        let apvMF11CFB = 0
        let apvFeminino11CFB = 0
        let desistidos11MFCFB = 0
        let desistidos11FemininoCFB = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '11ª Classe') {
                matric11ClasseCFB.push(aluno)

                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF11CFB += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino11CFB += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos11MFCFB += 1
                    if (aluno.genero == 'F') {
                        desistidos11FemininoCFB += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino11CFB += 1
                }
                const semApv11MF = matric11ClasseCFB.length - apvMF11CFB
                const semApv11Feminino = feminino11CFB - apvFeminino11CFB
                matric11ClasseCFB.feminino = feminino11CFB
                matric11ClasseCFB.apvMF = apvMF11CFB
                matric11ClasseCFB.apvFeminino = apvFeminino11CFB
                matric11ClasseCFB.semApvMF = semApv11MF - desistidos11MFCFB
                matric11ClasseCFB.semApvFeminino = semApv11Feminino - desistidos11FemininoCFB

                matric11ClasseCFB.desistMF = desistidos11MFCFB
                matric11ClasseCFB.desistFeminino = desistidos11FemininoCFB
                matric11ClasseCFB.chegadAoFimMF = matric11ClasseCFB.length - desistidos11MFCFB
                matric11ClasseCFB.chegadAoFimFeminino = feminino11CFB - desistidos11FemininoCFB

            }
        });

        /* 12ª Classe CFB */
        let matric12ClasseCFB = []
        let feminino12CFB = 0
        let apvMF12CFB = 0
        let apvFeminino12CFB = 0
        let desistidos12MFCFB = 0
        let desistidos12FemininoCFB = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '12ª Classe') {
                matric12ClasseCFB.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF12CFB += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino12CFB += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos12MFCFB += 1
                    if (aluno.genero == 'F') {
                        desistidos12FemininoCFB += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino12CFB += 1
                }
                const semApv12MF = matric12ClasseCFB.length - apvMF12CFB
                const semApv12Feminino = feminino12CFB - apvFeminino12CFB
                matric12ClasseCFB.feminino = feminino12CFB
                matric12ClasseCFB.apvMF = apvMF12CFB
                matric12ClasseCFB.apvFeminino = apvFeminino12CFB
                matric12ClasseCFB.semApvMF = semApv12MF - desistidos12MFCFB
                matric12ClasseCFB.semApvFeminino = semApv12Feminino - desistidos12FemininoCFB

                matric12ClasseCFB.desistMF = desistidos12MFCFB
                matric12ClasseCFB.desistFeminino = desistidos12FemininoCFB
                matric12ClasseCFB.chegadAoFimMF = matric12ClasseCFB.length - desistidos12MFCFB
                matric12ClasseCFB.chegadAoFimFeminino = feminino12CFB - desistidos12FemininoCFB

            }
        });

        const totalCFB = {
            mf: matric10ClasseCFB.length + matric11ClasseCFB.length + matric12ClasseCFB.length,
            feminino: matric10ClasseCFB.feminino + matric11ClasseCFB.feminino + matric12ClasseCFB.feminino,
            totalComApMF: matric10ClasseCFB.apvMF + matric11ClasseCFB.apvMF + matric12ClasseCFB.apvMF,
            totalComApFeminino: matric10ClasseCFB.apvFeminino + matric11ClasseCFB.apvFeminino + matric12ClasseCFB.apvFeminino,
            totalSemApMF: matric10ClasseCFB.semApvMF + matric11ClasseCFB.semApvMF + matric12ClasseCFB.semApvMF,
            totalSemApFeminino: matric10ClasseCFB.semApvFeminino + matric11ClasseCFB.semApvFeminino + matric12ClasseCFB.semApvFeminino,
        }


        /* Curso de Ciências Económico-Jurídicas */
        /* 10ª Classe CEJ */
        let matric10ClasseCEJ = []
        let feminino10CEJ = 0
        let apvMF10CEJ = 0
        let apvFeminino10CEJ = 0
        let desistidos10MFCEJ = 0
        let desistidos10FemininoCEJ = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '10ª Classe') {
                matric10ClasseCEJ.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF10CEJ += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino10CEJ += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos10MFCEJ += 1
                    if (aluno.genero == 'F') {
                        desistidos10FemininoCEJ += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino10CEJ += 1
                }
                const semApv10MF = matric10ClasseCEJ.length - apvMF10CEJ
                const semApv10Feminino = feminino10CEJ - apvFeminino10CEJ
                matric10ClasseCEJ.feminino = feminino10CEJ
                matric10ClasseCEJ.apvMF = apvMF10CEJ
                matric10ClasseCEJ.apvFeminino = apvFeminino10CEJ
                matric10ClasseCEJ.semApvMF = semApv10MF - desistidos10MFCEJ
                matric10ClasseCEJ.semApvFeminino = semApv10Feminino - desistidos10FemininoCEJ

                matric10ClasseCEJ.desistMF = desistidos10MFCEJ
                matric10ClasseCEJ.desistFeminino = desistidos10FemininoCEJ
                matric10ClasseCEJ.chegadAoFimMF = matric10ClasseCEJ.length - desistidos10MFCEJ
                matric10ClasseCEJ.chegadAoFimFeminino = feminino10CEJ - desistidos10FemininoCEJ
            }
        });

        /* 11ª Classe CEJ */
        let matric11ClasseCEJ = []
        let feminino11CEJ = 0
        let apvMF11CEJ = 0
        let apvFeminino11CEJ = 0
        let desistidos11MFCEJ = 0
        let desistidos11FemininoCEJ = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '11ª Classe') {
                matric11ClasseCEJ.push(aluno)

                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF11CEJ += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino11CEJ += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos11MFCEJ += 1
                    if (aluno.genero == 'F') {
                        desistidos11FemininoCEJ += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino11CEJ += 1
                }
                const semApv11MF = matric11ClasseCEJ.length - apvMF11CEJ
                const semApv11Feminino = feminino11CEJ - apvFeminino11CEJ
                matric11ClasseCEJ.feminino = feminino11CEJ
                matric11ClasseCEJ.apvMF = apvMF11CEJ
                matric11ClasseCEJ.apvFeminino = apvFeminino11CEJ
                matric11ClasseCEJ.semApvMF = semApv11MF - desistidos11MFCEJ
                matric11ClasseCEJ.semApvFeminino = semApv11Feminino - desistidos11FemininoCEJ

                matric11ClasseCEJ.desistMF = desistidos11MFCEJ
                matric11ClasseCEJ.desistFeminino = desistidos11FemininoCEJ
                matric11ClasseCEJ.chegadAoFimMF = matric11ClasseCEJ.length - desistidos11MFCEJ
                matric11ClasseCEJ.chegadAoFimFeminino = feminino11CEJ - desistidos11FemininoCEJ

            }
        });

        /* 12ª Classe CEJ */
        let matric12ClasseCEJ = []
        let feminino12CEJ = 0
        let apvMF12CEJ = 0
        let apvFeminino12CEJ = 0
        let desistidos12MFCEJ = 0
        let desistidos12FemininoCEJ = 0
        alunosMatrMF.forEach(aluno => {
            if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '12ª Classe') {
                matric12ClasseCEJ.push(aluno)
                //Pegando as notas do aluno
                let notasAluno = []
                tdNotas.forEach(notasD => {
                    if (notasD.aluno == "" + aluno._id) {
                        notasAluno.push(notasD)
                    }
                });
                //Conferir o aproveitamento do aluno
                let semApv = ''
                let desistido = ''
                let qtZeros = 0
                let negativas = []
                notasAluno.forEach(notasA => {
                    if (notasA.notas.mt1 < 10) {
                        negativas.push(notasA.notas.mt1)
                    }
                    if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                        qtZeros += 1
                    }
                });

                //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                if (negativas.length > 3) {
                    semApv = 'Sem Aproveitamento'
                } else {
                    negativas.forEach(notaNeg => {
                        if (notaNeg < 7) {
                            semApv = 'Sem Aproveitamento'

                        }
                    });
                }
                //Verificar a qt de notas zero que indicam a desistencia do aluno
                if (qtZeros == notasAluno.length) {
                    desistido = 'desistido'
                }
                if (semApv != 'Sem Aproveitamento') {
                    apvMF12CEJ += 1
                    //Adicionar feminino nos aproveitamento
                    if (aluno.genero == 'F') {
                        apvFeminino12CEJ += 1
                    }
                }
                if (desistido == 'desistido') {
                    desistidos12MFCEJ += 1
                    if (aluno.genero == 'F') {
                        desistidos12FemininoCEJ += 1
                    }
                }

                //Contar o Genero Feminino
                if (aluno.genero == 'F') {
                    feminino12CEJ += 1
                }
                const semApv12MF = matric12ClasseCEJ.length - apvMF12CEJ
                const semApv12Feminino = feminino12CEJ - apvFeminino12CEJ
                matric12ClasseCEJ.feminino = feminino12CEJ
                matric12ClasseCEJ.apvMF = apvMF12CEJ
                matric12ClasseCEJ.apvFeminino = apvFeminino12CEJ
                matric12ClasseCEJ.semApvMF = semApv12MF - desistidos12MFCEJ
                matric12ClasseCEJ.semApvFeminino = semApv12Feminino - desistidos12FemininoCEJ

                matric12ClasseCEJ.desistMF = desistidos12MFCEJ
                matric12ClasseCEJ.desistFeminino = desistidos12FemininoCEJ
                matric12ClasseCEJ.chegadAoFimMF = matric12ClasseCEJ.length - desistidos12MFCEJ
                matric12ClasseCEJ.chegadAoFimFeminino = feminino12CEJ - desistidos12FemininoCEJ

            }
        });

        const totalCEJ = {
            mf: matric10ClasseCEJ.length + matric11ClasseCEJ.length + matric12ClasseCEJ.length,
            feminino: matric10ClasseCEJ.feminino + matric11ClasseCEJ.feminino + matric12ClasseCEJ.feminino,
            totalComApMF: matric10ClasseCEJ.apvMF + matric11ClasseCEJ.apvMF + matric12ClasseCEJ.apvMF,
            totalComApFeminino: matric10ClasseCEJ.apvFeminino + matric11ClasseCEJ.apvFeminino + matric12ClasseCEJ.apvFeminino,
            totalSemApMF: matric10ClasseCEJ.semApvMF + matric11ClasseCEJ.semApvMF + matric12ClasseCEJ.semApvMF,
            totalSemApFeminino: matric10ClasseCEJ.semApvFeminino + matric11ClasseCEJ.semApvFeminino + matric12ClasseCEJ.semApvFeminino,
        }
        // return res.send({matric10ClasseCEJ})

        res.render('pedagogico/relEstatistico', { matric10ClasseCH, matric11ClasseCH, matric12ClasseCH, totalCH, matric10ClasseCFB, matric11ClasseCFB, matric12ClasseCFB, totalCFB, matric10ClasseCEJ, matric11ClasseCEJ, matric12ClasseCEJ, totalCEJ })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const gerarAproveitamento = async (req, res) => {
    try {
        const estado = 'Activo'
        const { trimestre } = req.body

        let routerAprovTrimestral = ""
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const idAno = anoAct._id
        const tdAlunos = await findAlunosByIdAnoService(idAno)
        let tdNotas = []
        let cursos = []
        let tdPautasFinalCH = []
        let tdPautasFinalCEJ = []
        let tdPautasFinalCFB = []
        let pautasFinalCH = []
        let pautasFinalCEJ = []
        let pautasFinalCFB = []
        if (trimestre == "Aproveitamento Final do Ano Lectivo") {
            cursos = await findAllCursosService()
            let idCursoCEJ = cursos[0]._id
            let idCursoCH = cursos[1]._id
            let idCursoCFB = cursos[2]._id
            pautasFinalCEJ = await findPautasByIdCursoServece(idCursoCEJ)
            pautasFinalCH = await findPautasByIdCursoServece(idCursoCH)
            pautasFinalCFB = await findPautasByIdCursoServece(idCursoCFB)
            tdPautasFinalCEJ.forEach(pauta => {
                if (pauta.trimestre == "Pauta Final Conselhada") { pautasFinalCEJ.push(pauta) }
            });
            tdPautasFinalCH.forEach(pauta => {
                if (pauta.trimestre == "Pauta Final Conselhada") { pautasFinalCH.push(pauta) }
            });
            tdPautasFinalCFB.forEach(pauta => {
                if (pauta.trimestre == "Pauta Final Conselhada") { pautasFinalCFB.push(pauta) }
            });

            //pautasFinalCH = await findPautasByCursoService()
        } else {
            tdNotas = await findAllNotasDisciplina()

        }

        //return res.send({pautasFinalCEJ})


        if (trimestre == "Iº Trimestre") {
            routerAprovTrimestral = 'ITrimestre'
            //return res.send({trimestre})

            let alunosMatrMF = []
            tdAlunos.forEach(aluno => {
                if (aluno.genero == 'M' || aluno.genero == 'F') {
                    alunosMatrMF.push(aluno)
                }
            });
            console.log(tdAlunos.length)
            console.log(alunosMatrMF.length)

            //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
            // CURSO CH

            /* 10ª Classe CH */
            let matric10ClasseCH = []
            let feminino10CH = 0
            let apvMF10CH = 0
            let apvFeminino10CH = 0
            let desistidos10MFCH = 0
            let desistidos10FemininoCH = 0

            let matric10ClasseCHfeminino = 0
            let matric10ClasseCHdesistFeminino = 0
            let matric10ClasseCHchegadAoFimMF = 0
            let matric10ClasseCHchegadAoFimFeminino = 0
            let matric10ClasseCHapvMF = 0
            let matric10ClasseCHapvFeminino = 0
            let matric10ClasseCHsemApvMF = 0
            let matric10ClasseCHsemApvFeminino = 0
            let matric10ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    // ORGANIZAR O APROVEITAMENTO PARA CRIAR E SALVAR
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }


                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CH += 1
                    }
                    const semApv10MF = matric10ClasseCH.length - apvMF10CH
                    const semApv10Feminino = feminino10CH - apvFeminino10CH
                    matric10ClasseCHfeminino = feminino10CH
                    matric10ClasseCHapvMF = apvMF10CH
                    matric10ClasseCHapvFeminino = apvFeminino10CH
                    matric10ClasseCHsemApvMF = semApv10MF - desistidos10MFCH
                    matric10ClasseCHsemApvFeminino = semApv10Feminino - desistidos10FemininoCH

                    matric10ClasseCHdesistMF = desistidos10MFCH
                    matric10ClasseCHdesistFeminino = desistidos10FemininoCH
                    matric10ClasseCHchegadAoFimMF = matric10ClasseCH.length - desistidos10MFCH
                    matric10ClasseCHchegadAoFimFeminino = feminino10CH - desistidos10FemininoCH

                }
            });



            /* 11ª Classe CH */
            let matric11ClasseCH = []
            let feminino11CH = 0
            let apvMF11CH = 0
            let apvFeminino11CH = 0
            let desistidos11MFCH = 0
            let desistidos11FemininoCH = 0

            let matric11ClasseCHfeminino = 0
            let matric11ClasseCHdesistFeminino = 0
            let matric11ClasseCHchegadAoFimMF = 0
            let matric11ClasseCHchegadAoFimFeminino = 0
            let matric11ClasseCHapvMF = 0
            let matric11ClasseCHapvFeminino = 0
            let matric11ClasseCHsemApvMF = 0
            let matric11ClasseCHsemApvFeminino = 0
            let matric11ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCH.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }

                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CH += 1
                    }
                    const semApv11MF = matric11ClasseCH.length - apvMF11CH
                    const semApv11Feminino = feminino11CH - apvFeminino11CH
                    matric11ClasseCHfeminino = feminino11CH
                    matric11ClasseCHapvMF = apvMF11CH
                    matric11ClasseCHapvFeminino = apvFeminino11CH
                    matric11ClasseCHsemApvMF = semApv11MF - desistidos11MFCH
                    matric11ClasseCHsemApvFeminino = semApv11Feminino - desistidos11FemininoCH

                    matric11ClasseCHdesistMF = desistidos11MFCH
                    matric11ClasseCHdesistFeminino = desistidos11FemininoCH
                    matric11ClasseCHchegadAoFimMF = matric11ClasseCH.length - desistidos11MFCH
                    matric11ClasseCHchegadAoFimFeminino = feminino11CH - desistidos11FemininoCH

                }
            });

            /* 12ª Classe CH */
            let matric12ClasseCH = []
            let feminino12CH = 0
            let apvMF12CH = 0
            let apvFeminino12CH = 0
            let desistidos12MFCH = 0
            let desistidos12FemininoCH = 0

            let matric12ClasseCHfeminino = 0
            let matric12ClasseCHdesistFeminino = 0
            let matric12ClasseCHchegadAoFimMF = 0
            let matric12ClasseCHchegadAoFimFeminino = 0
            let matric12ClasseCHapvMF = 0
            let matric12ClasseCHapvFeminino = 0
            let matric12ClasseCHsemApvMF = 0
            let matric12ClasseCHsemApvFeminino = 0
            let matric12ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CH += 1
                    }
                    const semApv12MF = matric12ClasseCH.length - apvMF12CH
                    const semApv12Feminino = feminino12CH - apvFeminino12CH
                    matric12ClasseCHfeminino = feminino12CH
                    matric12ClasseCHapvMF = apvMF12CH
                    matric12ClasseCHapvFeminino = apvFeminino12CH
                    matric12ClasseCHsemApvMF = semApv12MF - desistidos12MFCH
                    matric12ClasseCHsemApvFeminino = semApv12Feminino - desistidos12FemininoCH

                    matric12ClasseCHdesistMF = desistidos12MFCH
                    matric12ClasseCHdesistFeminino = desistidos12FemininoCH
                    matric12ClasseCHchegadAoFimMF = matric12ClasseCH.length - desistidos12MFCH
                    matric12ClasseCHchegadAoFimFeminino = feminino12CH - desistidos12FemininoCH

                }
            });

            const totalCH = {
                mf: matric10ClasseCH.length + matric11ClasseCH.length + matric12ClasseCH.length,
                feminino: matric10ClasseCHfeminino + matric11ClasseCHfeminino + matric12ClasseCHfeminino,
                totalComApMF: matric10ClasseCHapvMF + matric11ClasseCHapvMF + matric12ClasseCHapvMF,
                totalComApFeminino: matric10ClasseCHapvFeminino + matric11ClasseCHapvFeminino + matric12ClasseCHapvFeminino,
                totalSemApMF: matric10ClasseCHsemApvMF + matric11ClasseCHsemApvMF + matric12ClasseCHsemApvMF,
                totalSemApFeminino: matric10ClasseCHsemApvFeminino + matric11ClasseCHsemApvFeminino + matric12ClasseCHsemApvFeminino,
            }
            //return res.send({alunosMatrMF})


            /* CURSO DE CIENCIAS FISICO-BIOLÓGICAS */
            /* 10ª Classe CFB */
            let matric10ClasseCFB = []
            let feminino10CFB = 0
            let apvMF10CFB = 0
            let apvFeminino10CFB = 0
            let desistidos10MFCFB = 0
            let desistidos10FemininoCFB = 0

            let matric10ClasseCFBfeminino = 0
            let matric10ClasseCFBdesistFeminino = 0
            let matric10ClasseCFBchegadAoFimMF = 0
            let matric10ClasseCFBchegadAoFimFeminino = 0
            let matric10ClasseCFBapvMF = 0
            let matric10ClasseCFBapvFeminino = 0
            let matric10ClasseCFBsemApvMF = 0
            let matric10ClasseCFBsemApvFeminino = 0
            let matric10ClasseCFBdesistMF = 0

            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CFB += 1
                    }
                    const semApv10MF = matric10ClasseCFB.length - apvMF10CFB
                    const semApv10Feminino = feminino10CFB - apvFeminino10CFB
                    matric10ClasseCFBfeminino = feminino10CFB
                    matric10ClasseCFBapvMF = apvMF10CFB
                    matric10ClasseCFBapvFeminino = apvFeminino10CFB
                    matric10ClasseCFBsemApvMF = semApv10MF - desistidos10MFCFB
                    matric10ClasseCFBsemApvFeminino = semApv10Feminino - desistidos10FemininoCFB

                    matric10ClasseCFBdesistMF = desistidos10MFCFB
                    matric10ClasseCFBdesistFeminino = desistidos10FemininoCFB
                    matric10ClasseCFBchegadAoFimMF = matric10ClasseCFB.length - desistidos10MFCFB
                    matric10ClasseCFBchegadAoFimFeminino = feminino10CFB - desistidos10FemininoCFB
                }
            });



            /* 11ª Classe CFB */
            let matric11ClasseCFB = []
            let feminino11CFB = 0
            let apvMF11CFB = 0
            let apvFeminino11CFB = 0
            let desistidos11MFCFB = 0
            let desistidos11FemininoCFB = 0

            let matric11ClasseCFBfeminino = 0
            let matric11ClasseCFBapvMF = 0
            let matric11ClasseCFBapvFeminino = 0
            let matric11ClasseCFBsemApvMF = 0
            let matric11ClasseCFBsemApvFeminino = 0
            let matric11ClasseCFBdesistMF = 0
            let matric11ClasseCFBdesistFeminino = 0
            let matric11ClasseCFBchegadAoFimMF = 0
            let matric11ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCFB.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CFB += 1
                    }
                    const semApv11MF = matric11ClasseCFB.length - apvMF11CFB
                    const semApv11Feminino = feminino11CFB - apvFeminino11CFB
                    matric11ClasseCFBfeminino = feminino11CFB
                    matric11ClasseCFBapvMF = apvMF11CFB
                    matric11ClasseCFBapvFeminino = apvFeminino11CFB
                    matric11ClasseCFBsemApvMF = semApv11MF - desistidos11MFCFB
                    matric11ClasseCFBsemApvFeminino = semApv11Feminino - desistidos11FemininoCFB

                    matric11ClasseCFBdesistMF = desistidos11MFCFB
                    matric11ClasseCFBdesistFeminino = desistidos11FemininoCFB
                    matric11ClasseCFBchegadAoFimMF = matric11ClasseCFB.length - desistidos11MFCFB
                    matric11ClasseCFBchegadAoFimFeminino = feminino11CFB - desistidos11FemininoCFB

                }
            });

            /* 12ª Classe CFB */
            let matric12ClasseCFB = []
            let feminino12CFB = 0
            let apvMF12CFB = 0
            let apvFeminino12CFB = 0
            let desistidos12MFCFB = 0
            let desistidos12FemininoCFB = 0

            let matric12ClasseCFBfeminino = 0
            let matric12ClasseCFBapvMF = 0
            let matric12ClasseCFBapvFeminino = 0
            let matric12ClasseCFBsemApvMF = 0
            let matric12ClasseCFBsemApvFeminino = 0
            let matric12ClasseCFBdesistMF = 0
            let matric12ClasseCFBdesistFeminino = 0
            let matric12ClasseCFBchegadAoFimMF = 0
            let matric12ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CFB += 1
                    }
                    const semApv12MF = matric12ClasseCFB.length - apvMF12CFB
                    const semApv12Feminino = feminino12CFB - apvFeminino12CFB
                    matric12ClasseCFBfeminino = feminino12CFB
                    matric12ClasseCFBapvMF = apvMF12CFB
                    matric12ClasseCFBapvFeminino = apvFeminino12CFB
                    matric12ClasseCFBsemApvMF = semApv12MF - desistidos12MFCFB
                    matric12ClasseCFBsemApvFeminino = semApv12Feminino - desistidos12FemininoCFB

                    matric12ClasseCFBdesistMF = desistidos12MFCFB
                    matric12ClasseCFBdesistFeminino = desistidos12FemininoCFB
                    matric12ClasseCFBchegadAoFimMF = matric12ClasseCFB.length - desistidos12MFCFB
                    matric12ClasseCFBchegadAoFimFeminino = feminino12CFB - desistidos12FemininoCFB

                }
            });

            const totalCFB = {
                mf: matric10ClasseCFB.length + matric11ClasseCFB.length + matric12ClasseCFB.length,
                feminino: matric10ClasseCFBfeminino + matric11ClasseCFBfeminino + matric12ClasseCFBfeminino,
                totalComApMF: matric10ClasseCFBapvMF + matric11ClasseCFBapvMF + matric12ClasseCFBapvMF,
                totalComApFeminino: matric10ClasseCFBapvFeminino + matric11ClasseCFBapvFeminino + matric12ClasseCFBapvFeminino,
                totalSemApMF: matric10ClasseCFBsemApvMF + matric11ClasseCFBsemApvMF + matric12ClasseCFBsemApvMF,
                totalSemApFeminino: matric10ClasseCFBsemApvFeminino + matric11ClasseCFBsemApvFeminino + matric12ClasseCFBsemApvFeminino,
            }


            /* Curso de Ciências Económico-Jurídicas */
            /* 10ª Classe CEJ */
            let matric10ClasseCEJ = []
            let feminino10CEJ = 0
            let apvMF10CEJ = 0
            let apvFeminino10CEJ = 0
            let desistidos10MFCEJ = 0
            let desistidos10FemininoCEJ = 0

            let matric10ClasseCEJfeminino = 0
            let matric10ClasseCEJdesistFeminino = 0
            let matric10ClasseCEJchegadAoFimMF = 0
            let matric10ClasseCEJchegadAoFimFeminino = 0

            let matric10ClasseCEJapvMF = 0
            let matric10ClasseCEJapvFeminino = 0
            let matric10ClasseCEJsemApvMF = 0
            let matric10ClasseCEJsemApvFeminino = 0
            let matric10ClasseCEJdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CEJ += 1
                    }
                    const semApv10MF = matric10ClasseCEJ.length - apvMF10CEJ
                    const semApv10Feminino = feminino10CEJ - apvFeminino10CEJ
                    matric10ClasseCEJfeminino = feminino10CEJ
                    matric10ClasseCEJapvMF = apvMF10CEJ
                    matric10ClasseCEJapvFeminino = apvFeminino10CEJ
                    matric10ClasseCEJsemApvMF = semApv10MF - desistidos10MFCEJ
                    matric10ClasseCEJsemApvFeminino = semApv10Feminino - desistidos10FemininoCEJ

                    matric10ClasseCEJdesistMF = desistidos10MFCEJ
                    matric10ClasseCEJdesistFeminino = desistidos10FemininoCEJ
                    matric10ClasseCEJchegadAoFimMF = matric10ClasseCEJ.length - desistidos10MFCEJ
                    matric10ClasseCEJchegadAoFimFeminino = feminino10CEJ - desistidos10FemininoCEJ
                }
            });

            /* 11ª Classe CEJ */
            let matric11ClasseCEJ = []
            let feminino11CEJ = 0
            let apvMF11CEJ = 0
            let apvFeminino11CEJ = 0
            let desistidos11MFCEJ = 0
            let desistidos11FemininoCEJ = 0

            let matric11ClasseCEJfeminino = 0
            let matric11ClasseCEJapvMF = 0
            let matric11ClasseCEJapvFeminino = 0
            let matric11ClasseCEJsemApvMF = 0
            let matric11ClasseCEJsemApvFeminino = 0
            let matric11ClasseCEJdesistMF = 0
            let matric11ClasseCEJdesistFeminino = 0
            let matric11ClasseCEJchegadAoFimMF = 0
            let matric11ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCEJ.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CEJ += 1
                    }
                    const semApv11MF = matric11ClasseCEJ.length - apvMF11CEJ
                    const semApv11Feminino = feminino11CEJ - apvFeminino11CEJ
                    matric11ClasseCEJfeminino = feminino11CEJ
                    matric11ClasseCEJapvMF = apvMF11CEJ
                    matric11ClasseCEJapvFeminino = apvFeminino11CEJ
                    matric11ClasseCEJsemApvMF = semApv11MF - desistidos11MFCEJ
                    matric11ClasseCEJsemApvFeminino = semApv11Feminino - desistidos11FemininoCEJ

                    matric11ClasseCEJdesistMF = desistidos11MFCEJ
                    matric11ClasseCEJdesistFeminino = desistidos11FemininoCEJ
                    matric11ClasseCEJchegadAoFimMF = matric11ClasseCEJ.length - desistidos11MFCEJ
                    matric11ClasseCEJchegadAoFimFeminino = feminino11CEJ - desistidos11FemininoCEJ

                }
            });

            /* 12ª Classe CEJ */
            let matric12ClasseCEJ = []
            let feminino12CEJ = 0
            let apvMF12CEJ = 0
            let apvFeminino12CEJ = 0
            let desistidos12MFCEJ = 0
            let desistidos12FemininoCEJ = 0

            let matric12ClasseCEJfeminino = 0
            let matric12ClasseCEJapvMF = 0
            let matric12ClasseCEJapvFeminino = 0
            let matric12ClasseCEJsemApvMF = 0
            let matric12ClasseCEJsemApvFeminino = 0
            let matric12ClasseCEJdesistMF = 0
            let matric12ClasseCEJdesistFeminino = 0
            let matric12ClasseCEJchegadAoFimMF = 0
            let matric12ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt1 < 10) {
                            negativas.push(notasA.notas.mt1)
                        }
                        if (notasA.notas.mac1 == 0 && notasA.notas.pp1 == 0 && notasA.notas.pt1 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CEJ += 1
                    }
                    const semApv12MF = matric12ClasseCEJ.length - apvMF12CEJ
                    const semApv12Feminino = feminino12CEJ - apvFeminino12CEJ
                    matric12ClasseCEJfeminino = feminino12CEJ
                    matric12ClasseCEJapvMF = apvMF12CEJ
                    matric12ClasseCEJapvFeminino = apvFeminino12CEJ
                    matric12ClasseCEJsemApvMF = semApv12MF - desistidos12MFCEJ
                    matric12ClasseCEJsemApvFeminino = semApv12Feminino - desistidos12FemininoCEJ

                    matric12ClasseCEJdesistMF = desistidos12MFCEJ
                    matric12ClasseCEJdesistFeminino = desistidos12FemininoCEJ
                    matric12ClasseCEJchegadAoFimMF = matric12ClasseCEJ.length - desistidos12MFCEJ
                    matric12ClasseCEJchegadAoFimFeminino = feminino12CEJ - desistidos12FemininoCEJ

                }
            });

            const totalCEJ = {
                mf: matric10ClasseCEJ.length + matric11ClasseCEJ.length + matric12ClasseCEJ.length,
                feminino: matric10ClasseCEJfeminino + matric11ClasseCEJfeminino + matric12ClasseCEJfeminino,
                totalComApMF: matric10ClasseCEJapvMF + matric11ClasseCEJapvMF + matric12ClasseCEJapvMF,
                totalComApFeminino: matric10ClasseCEJapvFeminino + matric11ClasseCEJapvFeminino + matric12ClasseCEJapvFeminino,
                totalSemApMF: matric10ClasseCEJsemApvMF + matric11ClasseCEJsemApvMF + matric12ClasseCEJsemApvMF,
                totalSemApFeminino: matric10ClasseCEJsemApvFeminino + matric11ClasseCEJsemApvFeminino + matric12ClasseCEJsemApvFeminino,
            }
            // return res.send({matric10ClasseCEJ})

            const aproveitamentoII = {
                trimestre: trimestre,
                matric10ClasseCH: matric10ClasseCH,
                matric11ClasseCH: matric11ClasseCH,
                matric12ClasseCH: matric12ClasseCH,
                matric10ClasseCHfeminino: matric10ClasseCHfeminino,
                matric10ClasseCHdesistFeminino: matric10ClasseCHdesistFeminino,
                matric10ClasseCHchegadAoFimMF: matric10ClasseCHchegadAoFimMF,
                matric10ClasseCHchegadAoFimFeminino: matric10ClasseCHchegadAoFimFeminino,
                matric10ClasseCHapvMF: matric10ClasseCHapvMF,
                matric10ClasseCHapvFeminino: matric10ClasseCHapvFeminino,
                matric10ClasseCHsemApvMF: matric10ClasseCHsemApvMF,
                matric10ClasseCHsemApvFeminino: matric10ClasseCHsemApvFeminino,
                matric10ClasseCHdesistMF: matric10ClasseCHdesistMF,
                matric11ClasseCHfeminino: matric11ClasseCHfeminino,
                matric11ClasseCHapvMF: matric11ClasseCHapvMF,
                matric11ClasseCHapvFeminino: matric11ClasseCHapvFeminino,
                matric11ClasseCHsemApvMF: matric11ClasseCHsemApvMF,
                matric11ClasseCHsemApvFeminino: matric11ClasseCHsemApvFeminino,
                matric11ClasseCHdesistMF: matric11ClasseCHdesistMF,
                matric11ClasseCHdesistFeminino: matric11ClasseCHdesistFeminino,
                matric11ClasseCHchegadAoFimMF: matric11ClasseCHchegadAoFimMF,
                matric11ClasseCHchegadAoFimFeminino: matric11ClasseCHchegadAoFimFeminino,
                matric12ClasseCHfeminino: matric12ClasseCHfeminino,
                matric12ClasseCHapvMF: matric12ClasseCHapvMF,
                matric12ClasseCHapvFeminino: matric12ClasseCHapvFeminino,
                matric12ClasseCHsemApvMF: matric12ClasseCHsemApvMF,
                matric12ClasseCHsemApvFeminino: matric12ClasseCHsemApvFeminino,
                matric12ClasseCHdesistMF: matric12ClasseCHdesistMF,
                matric12ClasseCHdesistFeminino: matric12ClasseCHdesistFeminino,
                matric12ClasseCHchegadAoFimMF: matric12ClasseCHchegadAoFimMF,
                matric12ClasseCHchegadAoFimFeminino: matric12ClasseCHchegadAoFimFeminino,
                totalCH: totalCH,
                matric10ClasseCFB: matric10ClasseCFB,
                matric11ClasseCFB: matric11ClasseCFB,
                matric12ClasseCFB: matric12ClasseCFB,
                matric10ClasseCFBfeminino: matric10ClasseCFBfeminino,
                matric10ClasseCFBdesistFeminino: matric10ClasseCFBdesistFeminino,
                matric10ClasseCFBchegadAoFimMF: matric10ClasseCFBchegadAoFimMF,
                matric10ClasseCFBchegadAoFimFeminino: matric10ClasseCFBchegadAoFimFeminino,
                matric10ClasseCFBapvMF: matric10ClasseCFBapvMF,
                matric10ClasseCFBapvFeminino: matric10ClasseCFBapvFeminino,
                matric10ClasseCFBsemApvMF: matric10ClasseCFBsemApvMF,
                matric10ClasseCFBsemApvFeminino: matric10ClasseCFBsemApvFeminino,
                matric10ClasseCFBdesistMF: matric10ClasseCFBdesistMF,
                matric11ClasseCFBfeminino: matric11ClasseCFBfeminino,
                matric11ClasseCFBapvMF: matric11ClasseCFBapvMF,
                matric11ClasseCFBapvFeminino: matric11ClasseCFBapvFeminino,
                matric11ClasseCFBsemApvMF: matric11ClasseCFBsemApvMF,
                matric11ClasseCFBsemApvFeminino: matric11ClasseCFBsemApvFeminino,
                matric11ClasseCFBdesistMF: matric11ClasseCFBdesistMF,
                matric11ClasseCFBdesistFeminino: matric11ClasseCFBdesistFeminino,
                matric11ClasseCFBchegadAoFimMF: matric11ClasseCFBchegadAoFimMF,
                matric11ClasseCFBchegadAoFimFeminino: matric11ClasseCFBchegadAoFimFeminino,
                matric12ClasseCFBfeminino: matric12ClasseCFBfeminino,
                matric12ClasseCFBapvMF: matric12ClasseCFBapvMF,
                matric12ClasseCFBapvFeminino: matric12ClasseCFBapvFeminino,
                matric12ClasseCFBsemApvMF: matric12ClasseCFBsemApvMF,
                matric12ClasseCFBsemApvFeminino: matric12ClasseCFBsemApvFeminino,
                matric12ClasseCFBdesistMF: matric12ClasseCFBdesistMF,
                matric12ClasseCFBdesistFeminino: matric12ClasseCFBdesistFeminino,
                matric12ClasseCFBchegadAoFimMF: matric12ClasseCFBchegadAoFimMF,
                matric12ClasseCFBchegadAoFimFeminino: matric12ClasseCFBchegadAoFimFeminino,
                totalCFB: totalCFB,
                matric10ClasseCEJ: matric10ClasseCEJ,
                matric11ClasseCEJ: matric11ClasseCEJ,
                matric12ClasseCEJ: matric12ClasseCEJ,
                matric10ClasseCEJfeminino: matric10ClasseCEJfeminino,
                matric10ClasseCEJdesistFeminino: matric10ClasseCEJdesistFeminino,
                matric10ClasseCEJchegadAoFimMF: matric10ClasseCEJchegadAoFimMF,
                matric10ClasseCEJchegadAoFimFeminino: matric10ClasseCEJchegadAoFimFeminino,
                matric10ClasseCEJapvMF: matric10ClasseCEJapvMF,
                matric10ClasseCEJapvFeminino: matric10ClasseCEJapvFeminino,
                matric10ClasseCEJsemApvMF: matric10ClasseCEJsemApvMF,
                matric10ClasseCEJsemApvFeminino: matric10ClasseCEJsemApvFeminino,
                matric10ClasseCEJdesistMF: matric10ClasseCEJdesistMF,
                matric11ClasseCEJfeminino: matric11ClasseCEJfeminino,
                matric11ClasseCEJapvMF: matric11ClasseCEJapvMF,
                matric11ClasseCEJapvFeminino: matric11ClasseCEJapvFeminino,
                matric11ClasseCEJsemApvMF: matric11ClasseCEJsemApvMF,
                matric11ClasseCEJsemApvFeminino: matric11ClasseCEJsemApvFeminino,
                matric11ClasseCEJdesistMF: matric11ClasseCEJdesistMF,
                matric11ClasseCEJdesistFeminino: matric11ClasseCEJdesistFeminino,
                matric11ClasseCEJchegadAoFimMF: matric11ClasseCEJchegadAoFimMF,
                matric11ClasseCEJchegadAoFimFeminino: matric11ClasseCEJchegadAoFimFeminino,
                matric12ClasseCEJfeminino: matric12ClasseCEJfeminino,
                matric12ClasseCEJapvMF: matric12ClasseCEJapvMF,
                matric12ClasseCEJapvFeminino: matric12ClasseCEJapvFeminino,
                matric12ClasseCEJsemApvMF: matric12ClasseCEJsemApvMF,
                matric12ClasseCEJsemApvFeminino: matric12ClasseCEJsemApvFeminino,
                matric12ClasseCEJdesistMF: matric12ClasseCEJdesistMF,
                matric12ClasseCEJdesistFeminino: matric12ClasseCEJdesistFeminino,
                matric12ClasseCEJchegadAoFimMF: matric12ClasseCEJchegadAoFimMF,
                matric12ClasseCEJchegadAoFimFeminino: matric12ClasseCEJchegadAoFimFeminino,
                totalCEJ: totalCEJ
            }

            const veryAproveitamento = await findAproveitamentoByTrimestreService(trimestre)
            //return res.send("Actualizar")
            if (veryAproveitamento) {
                veryAproveitamento.aproveitamentoII = aproveitamentoII
                const idAp = veryAproveitamento._id
                const aproveitamentoActualizado = await findAproveitamentoAndApdateService(idAp, veryAproveitamento)
                req.flash("success_msg", "Aproveitamento do " + trimestre + " actualizado!")
                return res.redirect("/pedagogico/aproveitamentoTrimestral/" + routerAprovTrimestral)
            }

            //const trimestre = "IIº Trimestre" //este trimestre tem de vir do botão gerar aproveitamento


            const aproveitamento = {
                trimestre: trimestre,
                aproveitamentoII: aproveitamentoII,
                idAno: idAno
            }
            //return res.send({ aproveitamento })
            const newAproveitamento = await createAproveitamento(aproveitamento)

        }

        if (trimestre == "IIº Trimestre") {
            routerAprovTrimestral = 'IITrimestre'


            let alunosMatrMF = []
            tdAlunos.forEach(aluno => {
                if (aluno.genero == 'M' || aluno.genero == 'F') {
                    alunosMatrMF.push(aluno)
                }
            });
            console.log(tdAlunos.length)
            console.log(alunosMatrMF.length)

            //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
            // CURSO CH

            /* 10ª Classe CH */
            let matric10ClasseCH = []
            let feminino10CH = 0
            let apvMF10CH = 0
            let apvFeminino10CH = 0
            let desistidos10MFCH = 0
            let desistidos10FemininoCH = 0

            let matric10ClasseCHfeminino = 0
            let matric10ClasseCHdesistFeminino = 0
            let matric10ClasseCHchegadAoFimMF = 0
            let matric10ClasseCHchegadAoFimFeminino = 0
            let matric10ClasseCHapvMF = 0
            let matric10ClasseCHapvFeminino = 0
            let matric10ClasseCHsemApvMF = 0
            let matric10ClasseCHsemApvFeminino = 0
            let matric10ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    // ORGANIZAR O APROVEITAMENTO PARA CRIAR E SALVAR
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }


                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CH += 1
                    }
                    const semApv10MF = matric10ClasseCH.length - apvMF10CH
                    const semApv10Feminino = feminino10CH - apvFeminino10CH
                    matric10ClasseCHfeminino = feminino10CH
                    matric10ClasseCHapvMF = apvMF10CH
                    matric10ClasseCHapvFeminino = apvFeminino10CH
                    matric10ClasseCHsemApvMF = semApv10MF - desistidos10MFCH
                    matric10ClasseCHsemApvFeminino = semApv10Feminino - desistidos10FemininoCH

                    matric10ClasseCHdesistMF = desistidos10MFCH
                    matric10ClasseCHdesistFeminino = desistidos10FemininoCH
                    matric10ClasseCHchegadAoFimMF = matric10ClasseCH.length - desistidos10MFCH
                    matric10ClasseCHchegadAoFimFeminino = feminino10CH - desistidos10FemininoCH

                }
            });



            /* 11ª Classe CH */
            let matric11ClasseCH = []
            let feminino11CH = 0
            let apvMF11CH = 0
            let apvFeminino11CH = 0
            let desistidos11MFCH = 0
            let desistidos11FemininoCH = 0

            let matric11ClasseCHfeminino = 0
            let matric11ClasseCHdesistFeminino = 0
            let matric11ClasseCHchegadAoFimMF = 0
            let matric11ClasseCHchegadAoFimFeminino = 0
            let matric11ClasseCHapvMF = 0
            let matric11ClasseCHapvFeminino = 0
            let matric11ClasseCHsemApvMF = 0
            let matric11ClasseCHsemApvFeminino = 0
            let matric11ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCH.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }

                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CH += 1
                    }
                    const semApv11MF = matric11ClasseCH.length - apvMF11CH
                    const semApv11Feminino = feminino11CH - apvFeminino11CH
                    matric11ClasseCHfeminino = feminino11CH
                    matric11ClasseCHapvMF = apvMF11CH
                    matric11ClasseCHapvFeminino = apvFeminino11CH
                    matric11ClasseCHsemApvMF = semApv11MF - desistidos11MFCH
                    matric11ClasseCHsemApvFeminino = semApv11Feminino - desistidos11FemininoCH

                    matric11ClasseCHdesistMF = desistidos11MFCH
                    matric11ClasseCHdesistFeminino = desistidos11FemininoCH
                    matric11ClasseCHchegadAoFimMF = matric11ClasseCH.length - desistidos11MFCH
                    matric11ClasseCHchegadAoFimFeminino = feminino11CH - desistidos11FemininoCH

                }
            });

            /* 12ª Classe CH */
            let matric12ClasseCH = []
            let feminino12CH = 0
            let apvMF12CH = 0
            let apvFeminino12CH = 0
            let desistidos12MFCH = 0
            let desistidos12FemininoCH = 0

            let matric12ClasseCHfeminino = 0
            let matric12ClasseCHdesistFeminino = 0
            let matric12ClasseCHchegadAoFimMF = 0
            let matric12ClasseCHchegadAoFimFeminino = 0
            let matric12ClasseCHapvMF = 0
            let matric12ClasseCHapvFeminino = 0
            let matric12ClasseCHsemApvMF = 0
            let matric12ClasseCHsemApvFeminino = 0
            let matric12ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CH += 1
                    }
                    const semApv12MF = matric12ClasseCH.length - apvMF12CH
                    const semApv12Feminino = feminino12CH - apvFeminino12CH
                    matric12ClasseCHfeminino = feminino12CH
                    matric12ClasseCHapvMF = apvMF12CH
                    matric12ClasseCHapvFeminino = apvFeminino12CH
                    matric12ClasseCHsemApvMF = semApv12MF - desistidos12MFCH
                    matric12ClasseCHsemApvFeminino = semApv12Feminino - desistidos12FemininoCH

                    matric12ClasseCHdesistMF = desistidos12MFCH
                    matric12ClasseCHdesistFeminino = desistidos12FemininoCH
                    matric12ClasseCHchegadAoFimMF = matric12ClasseCH.length - desistidos12MFCH
                    matric12ClasseCHchegadAoFimFeminino = feminino12CH - desistidos12FemininoCH

                }
            });

            const totalCH = {
                mf: matric10ClasseCH.length + matric11ClasseCH.length + matric12ClasseCH.length,
                feminino: matric10ClasseCHfeminino + matric11ClasseCHfeminino + matric12ClasseCHfeminino,
                totalComApMF: matric10ClasseCHapvMF + matric11ClasseCHapvMF + matric12ClasseCHapvMF,
                totalComApFeminino: matric10ClasseCHapvFeminino + matric11ClasseCHapvFeminino + matric12ClasseCHapvFeminino,
                totalSemApMF: matric10ClasseCHsemApvMF + matric11ClasseCHsemApvMF + matric12ClasseCHsemApvMF,
                totalSemApFeminino: matric10ClasseCHsemApvFeminino + matric11ClasseCHsemApvFeminino + matric12ClasseCHsemApvFeminino,
            }
            //return res.send({alunosMatrMF})


            /* CURSO DE CIENCIAS FISICO-BIOLÓGICAS */
            /* 10ª Classe CFB */
            let matric10ClasseCFB = []
            let feminino10CFB = 0
            let apvMF10CFB = 0
            let apvFeminino10CFB = 0
            let desistidos10MFCFB = 0
            let desistidos10FemininoCFB = 0

            let matric10ClasseCFBfeminino = 0
            let matric10ClasseCFBdesistFeminino = 0
            let matric10ClasseCFBchegadAoFimMF = 0
            let matric10ClasseCFBchegadAoFimFeminino = 0
            let matric10ClasseCFBapvMF = 0
            let matric10ClasseCFBapvFeminino = 0
            let matric10ClasseCFBsemApvMF = 0
            let matric10ClasseCFBsemApvFeminino = 0
            let matric10ClasseCFBdesistMF = 0

            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CFB += 1
                    }
                    const semApv10MF = matric10ClasseCFB.length - apvMF10CFB
                    const semApv10Feminino = feminino10CFB - apvFeminino10CFB
                    matric10ClasseCFBfeminino = feminino10CFB
                    matric10ClasseCFBapvMF = apvMF10CFB
                    matric10ClasseCFBapvFeminino = apvFeminino10CFB
                    matric10ClasseCFBsemApvMF = semApv10MF - desistidos10MFCFB
                    matric10ClasseCFBsemApvFeminino = semApv10Feminino - desistidos10FemininoCFB

                    matric10ClasseCFBdesistMF = desistidos10MFCFB
                    matric10ClasseCFBdesistFeminino = desistidos10FemininoCFB
                    matric10ClasseCFBchegadAoFimMF = matric10ClasseCFB.length - desistidos10MFCFB
                    matric10ClasseCFBchegadAoFimFeminino = feminino10CFB - desistidos10FemininoCFB
                }
            });



            /* 11ª Classe CFB */
            let matric11ClasseCFB = []
            let feminino11CFB = 0
            let apvMF11CFB = 0
            let apvFeminino11CFB = 0
            let desistidos11MFCFB = 0
            let desistidos11FemininoCFB = 0

            let matric11ClasseCFBfeminino = 0
            let matric11ClasseCFBapvMF = 0
            let matric11ClasseCFBapvFeminino = 0
            let matric11ClasseCFBsemApvMF = 0
            let matric11ClasseCFBsemApvFeminino = 0
            let matric11ClasseCFBdesistMF = 0
            let matric11ClasseCFBdesistFeminino = 0
            let matric11ClasseCFBchegadAoFimMF = 0
            let matric11ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCFB.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CFB += 1
                    }
                    const semApv11MF = matric11ClasseCFB.length - apvMF11CFB
                    const semApv11Feminino = feminino11CFB - apvFeminino11CFB
                    matric11ClasseCFBfeminino = feminino11CFB
                    matric11ClasseCFBapvMF = apvMF11CFB
                    matric11ClasseCFBapvFeminino = apvFeminino11CFB
                    matric11ClasseCFBsemApvMF = semApv11MF - desistidos11MFCFB
                    matric11ClasseCFBsemApvFeminino = semApv11Feminino - desistidos11FemininoCFB

                    matric11ClasseCFBdesistMF = desistidos11MFCFB
                    matric11ClasseCFBdesistFeminino = desistidos11FemininoCFB
                    matric11ClasseCFBchegadAoFimMF = matric11ClasseCFB.length - desistidos11MFCFB
                    matric11ClasseCFBchegadAoFimFeminino = feminino11CFB - desistidos11FemininoCFB

                }
            });

            /* 12ª Classe CFB */
            let matric12ClasseCFB = []
            let feminino12CFB = 0
            let apvMF12CFB = 0
            let apvFeminino12CFB = 0
            let desistidos12MFCFB = 0
            let desistidos12FemininoCFB = 0

            let matric12ClasseCFBfeminino = 0
            let matric12ClasseCFBapvMF = 0
            let matric12ClasseCFBapvFeminino = 0
            let matric12ClasseCFBsemApvMF = 0
            let matric12ClasseCFBsemApvFeminino = 0
            let matric12ClasseCFBdesistMF = 0
            let matric12ClasseCFBdesistFeminino = 0
            let matric12ClasseCFBchegadAoFimMF = 0
            let matric12ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CFB += 1
                    }
                    const semApv12MF = matric12ClasseCFB.length - apvMF12CFB
                    const semApv12Feminino = feminino12CFB - apvFeminino12CFB
                    matric12ClasseCFBfeminino = feminino12CFB
                    matric12ClasseCFBapvMF = apvMF12CFB
                    matric12ClasseCFBapvFeminino = apvFeminino12CFB
                    matric12ClasseCFBsemApvMF = semApv12MF - desistidos12MFCFB
                    matric12ClasseCFBsemApvFeminino = semApv12Feminino - desistidos12FemininoCFB

                    matric12ClasseCFBdesistMF = desistidos12MFCFB
                    matric12ClasseCFBdesistFeminino = desistidos12FemininoCFB
                    matric12ClasseCFBchegadAoFimMF = matric12ClasseCFB.length - desistidos12MFCFB
                    matric12ClasseCFBchegadAoFimFeminino = feminino12CFB - desistidos12FemininoCFB

                }
            });

            const totalCFB = {
                mf: matric10ClasseCFB.length + matric11ClasseCFB.length + matric12ClasseCFB.length,
                feminino: matric10ClasseCFBfeminino + matric11ClasseCFBfeminino + matric12ClasseCFBfeminino,
                totalComApMF: matric10ClasseCFBapvMF + matric11ClasseCFBapvMF + matric12ClasseCFBapvMF,
                totalComApFeminino: matric10ClasseCFBapvFeminino + matric11ClasseCFBapvFeminino + matric12ClasseCFBapvFeminino,
                totalSemApMF: matric10ClasseCFBsemApvMF + matric11ClasseCFBsemApvMF + matric12ClasseCFBsemApvMF,
                totalSemApFeminino: matric10ClasseCFBsemApvFeminino + matric11ClasseCFBsemApvFeminino + matric12ClasseCFBsemApvFeminino,
            }


            /* Curso de Ciências Económico-Jurídicas */
            /* 10ª Classe CEJ */
            let matric10ClasseCEJ = []
            let feminino10CEJ = 0
            let apvMF10CEJ = 0
            let apvFeminino10CEJ = 0
            let desistidos10MFCEJ = 0
            let desistidos10FemininoCEJ = 0

            let matric10ClasseCEJfeminino = 0
            let matric10ClasseCEJdesistFeminino = 0
            let matric10ClasseCEJchegadAoFimMF = 0
            let matric10ClasseCEJchegadAoFimFeminino = 0

            let matric10ClasseCEJapvMF = 0
            let matric10ClasseCEJapvFeminino = 0
            let matric10ClasseCEJsemApvMF = 0
            let matric10ClasseCEJsemApvFeminino = 0
            let matric10ClasseCEJdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CEJ += 1
                    }
                    const semApv10MF = matric10ClasseCEJ.length - apvMF10CEJ
                    const semApv10Feminino = feminino10CEJ - apvFeminino10CEJ
                    matric10ClasseCEJfeminino = feminino10CEJ
                    matric10ClasseCEJapvMF = apvMF10CEJ
                    matric10ClasseCEJapvFeminino = apvFeminino10CEJ
                    matric10ClasseCEJsemApvMF = semApv10MF - desistidos10MFCEJ
                    matric10ClasseCEJsemApvFeminino = semApv10Feminino - desistidos10FemininoCEJ

                    matric10ClasseCEJdesistMF = desistidos10MFCEJ
                    matric10ClasseCEJdesistFeminino = desistidos10FemininoCEJ
                    matric10ClasseCEJchegadAoFimMF = matric10ClasseCEJ.length - desistidos10MFCEJ
                    matric10ClasseCEJchegadAoFimFeminino = feminino10CEJ - desistidos10FemininoCEJ
                }
            });

            /* 11ª Classe CEJ */
            let matric11ClasseCEJ = []
            let feminino11CEJ = 0
            let apvMF11CEJ = 0
            let apvFeminino11CEJ = 0
            let desistidos11MFCEJ = 0
            let desistidos11FemininoCEJ = 0

            let matric11ClasseCEJfeminino = 0
            let matric11ClasseCEJapvMF = 0
            let matric11ClasseCEJapvFeminino = 0
            let matric11ClasseCEJsemApvMF = 0
            let matric11ClasseCEJsemApvFeminino = 0
            let matric11ClasseCEJdesistMF = 0
            let matric11ClasseCEJdesistFeminino = 0
            let matric11ClasseCEJchegadAoFimMF = 0
            let matric11ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCEJ.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CEJ += 1
                    }
                    const semApv11MF = matric11ClasseCEJ.length - apvMF11CEJ
                    const semApv11Feminino = feminino11CEJ - apvFeminino11CEJ
                    matric11ClasseCEJfeminino = feminino11CEJ
                    matric11ClasseCEJapvMF = apvMF11CEJ
                    matric11ClasseCEJapvFeminino = apvFeminino11CEJ
                    matric11ClasseCEJsemApvMF = semApv11MF - desistidos11MFCEJ
                    matric11ClasseCEJsemApvFeminino = semApv11Feminino - desistidos11FemininoCEJ

                    matric11ClasseCEJdesistMF = desistidos11MFCEJ
                    matric11ClasseCEJdesistFeminino = desistidos11FemininoCEJ
                    matric11ClasseCEJchegadAoFimMF = matric11ClasseCEJ.length - desistidos11MFCEJ
                    matric11ClasseCEJchegadAoFimFeminino = feminino11CEJ - desistidos11FemininoCEJ

                }
            });

            /* 12ª Classe CEJ */
            let matric12ClasseCEJ = []
            let feminino12CEJ = 0
            let apvMF12CEJ = 0
            let apvFeminino12CEJ = 0
            let desistidos12MFCEJ = 0
            let desistidos12FemininoCEJ = 0

            let matric12ClasseCEJfeminino = 0
            let matric12ClasseCEJapvMF = 0
            let matric12ClasseCEJapvFeminino = 0
            let matric12ClasseCEJsemApvMF = 0
            let matric12ClasseCEJsemApvFeminino = 0
            let matric12ClasseCEJdesistMF = 0
            let matric12ClasseCEJdesistFeminino = 0
            let matric12ClasseCEJchegadAoFimMF = 0
            let matric12ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt2 < 10) {
                            negativas.push(notasA.notas.mt2)
                        }
                        if (notasA.notas.mac2 == 0 && notasA.notas.pp2 == 0 && notasA.notas.pt2 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CEJ += 1
                    }
                    const semApv12MF = matric12ClasseCEJ.length - apvMF12CEJ
                    const semApv12Feminino = feminino12CEJ - apvFeminino12CEJ
                    matric12ClasseCEJfeminino = feminino12CEJ
                    matric12ClasseCEJapvMF = apvMF12CEJ
                    matric12ClasseCEJapvFeminino = apvFeminino12CEJ
                    matric12ClasseCEJsemApvMF = semApv12MF - desistidos12MFCEJ
                    matric12ClasseCEJsemApvFeminino = semApv12Feminino - desistidos12FemininoCEJ

                    matric12ClasseCEJdesistMF = desistidos12MFCEJ
                    matric12ClasseCEJdesistFeminino = desistidos12FemininoCEJ
                    matric12ClasseCEJchegadAoFimMF = matric12ClasseCEJ.length - desistidos12MFCEJ
                    matric12ClasseCEJchegadAoFimFeminino = feminino12CEJ - desistidos12FemininoCEJ

                }
            });

            const totalCEJ = {
                mf: matric10ClasseCEJ.length + matric11ClasseCEJ.length + matric12ClasseCEJ.length,
                feminino: matric10ClasseCEJfeminino + matric11ClasseCEJfeminino + matric12ClasseCEJfeminino,
                totalComApMF: matric10ClasseCEJapvMF + matric11ClasseCEJapvMF + matric12ClasseCEJapvMF,
                totalComApFeminino: matric10ClasseCEJapvFeminino + matric11ClasseCEJapvFeminino + matric12ClasseCEJapvFeminino,
                totalSemApMF: matric10ClasseCEJsemApvMF + matric11ClasseCEJsemApvMF + matric12ClasseCEJsemApvMF,
                totalSemApFeminino: matric10ClasseCEJsemApvFeminino + matric11ClasseCEJsemApvFeminino + matric12ClasseCEJsemApvFeminino,
            }
            // return res.send({matric10ClasseCEJ})

            const aproveitamentoII = {
                trimestre: 'IIº Trimestre',
                matric10ClasseCH: matric10ClasseCH,
                matric11ClasseCH: matric11ClasseCH,
                matric12ClasseCH: matric12ClasseCH,
                matric10ClasseCHfeminino: matric10ClasseCHfeminino,
                matric10ClasseCHdesistFeminino: matric10ClasseCHdesistFeminino,
                matric10ClasseCHchegadAoFimMF: matric10ClasseCHchegadAoFimMF,
                matric10ClasseCHchegadAoFimFeminino: matric10ClasseCHchegadAoFimFeminino,
                matric10ClasseCHapvMF: matric10ClasseCHapvMF,
                matric10ClasseCHapvFeminino: matric10ClasseCHapvFeminino,
                matric10ClasseCHsemApvMF: matric10ClasseCHsemApvMF,
                matric10ClasseCHsemApvFeminino: matric10ClasseCHsemApvFeminino,
                matric10ClasseCHdesistMF: matric10ClasseCHdesistMF,
                matric11ClasseCHfeminino: matric11ClasseCHfeminino,
                matric11ClasseCHapvMF: matric11ClasseCHapvMF,
                matric11ClasseCHapvFeminino: matric11ClasseCHapvFeminino,
                matric11ClasseCHsemApvMF: matric11ClasseCHsemApvMF,
                matric11ClasseCHsemApvFeminino: matric11ClasseCHsemApvFeminino,
                matric11ClasseCHdesistMF: matric11ClasseCHdesistMF,
                matric11ClasseCHdesistFeminino: matric11ClasseCHdesistFeminino,
                matric11ClasseCHchegadAoFimMF: matric11ClasseCHchegadAoFimMF,
                matric11ClasseCHchegadAoFimFeminino: matric11ClasseCHchegadAoFimFeminino,
                matric12ClasseCHfeminino: matric12ClasseCHfeminino,
                matric12ClasseCHapvMF: matric12ClasseCHapvMF,
                matric12ClasseCHapvFeminino: matric12ClasseCHapvFeminino,
                matric12ClasseCHsemApvMF: matric12ClasseCHsemApvMF,
                matric12ClasseCHsemApvFeminino: matric12ClasseCHsemApvFeminino,
                matric12ClasseCHdesistMF: matric12ClasseCHdesistMF,
                matric12ClasseCHdesistFeminino: matric12ClasseCHdesistFeminino,
                matric12ClasseCHchegadAoFimMF: matric12ClasseCHchegadAoFimMF,
                matric12ClasseCHchegadAoFimFeminino: matric12ClasseCHchegadAoFimFeminino,
                totalCH: totalCH,
                matric10ClasseCFB: matric10ClasseCFB,
                matric11ClasseCFB: matric11ClasseCFB,
                matric12ClasseCFB: matric12ClasseCFB,
                matric10ClasseCFBfeminino: matric10ClasseCFBfeminino,
                matric10ClasseCFBdesistFeminino: matric10ClasseCFBdesistFeminino,
                matric10ClasseCFBchegadAoFimMF: matric10ClasseCFBchegadAoFimMF,
                matric10ClasseCFBchegadAoFimFeminino: matric10ClasseCFBchegadAoFimFeminino,
                matric10ClasseCFBapvMF: matric10ClasseCFBapvMF,
                matric10ClasseCFBapvFeminino: matric10ClasseCFBapvFeminino,
                matric10ClasseCFBsemApvMF: matric10ClasseCFBsemApvMF,
                matric10ClasseCFBsemApvFeminino: matric10ClasseCFBsemApvFeminino,
                matric10ClasseCFBdesistMF: matric10ClasseCFBdesistMF,
                matric11ClasseCFBfeminino: matric11ClasseCFBfeminino,
                matric11ClasseCFBapvMF: matric11ClasseCFBapvMF,
                matric11ClasseCFBapvFeminino: matric11ClasseCFBapvFeminino,
                matric11ClasseCFBsemApvMF: matric11ClasseCFBsemApvMF,
                matric11ClasseCFBsemApvFeminino: matric11ClasseCFBsemApvFeminino,
                matric11ClasseCFBdesistMF: matric11ClasseCFBdesistMF,
                matric11ClasseCFBdesistFeminino: matric11ClasseCFBdesistFeminino,
                matric11ClasseCFBchegadAoFimMF: matric11ClasseCFBchegadAoFimMF,
                matric11ClasseCFBchegadAoFimFeminino: matric11ClasseCFBchegadAoFimFeminino,
                matric12ClasseCFBfeminino: matric12ClasseCFBfeminino,
                matric12ClasseCFBapvMF: matric12ClasseCFBapvMF,
                matric12ClasseCFBapvFeminino: matric12ClasseCFBapvFeminino,
                matric12ClasseCFBsemApvMF: matric12ClasseCFBsemApvMF,
                matric12ClasseCFBsemApvFeminino: matric12ClasseCFBsemApvFeminino,
                matric12ClasseCFBdesistMF: matric12ClasseCFBdesistMF,
                matric12ClasseCFBdesistFeminino: matric12ClasseCFBdesistFeminino,
                matric12ClasseCFBchegadAoFimMF: matric12ClasseCFBchegadAoFimMF,
                matric12ClasseCFBchegadAoFimFeminino: matric12ClasseCFBchegadAoFimFeminino,
                totalCFB: totalCFB,
                matric10ClasseCEJ: matric10ClasseCEJ,
                matric11ClasseCEJ: matric11ClasseCEJ,
                matric12ClasseCEJ: matric12ClasseCEJ,
                matric10ClasseCEJfeminino: matric10ClasseCEJfeminino,
                matric10ClasseCEJdesistFeminino: matric10ClasseCEJdesistFeminino,
                matric10ClasseCEJchegadAoFimMF: matric10ClasseCEJchegadAoFimMF,
                matric10ClasseCEJchegadAoFimFeminino: matric10ClasseCEJchegadAoFimFeminino,
                matric10ClasseCEJapvMF: matric10ClasseCEJapvMF,
                matric10ClasseCEJapvFeminino: matric10ClasseCEJapvFeminino,
                matric10ClasseCEJsemApvMF: matric10ClasseCEJsemApvMF,
                matric10ClasseCEJsemApvFeminino: matric10ClasseCEJsemApvFeminino,
                matric10ClasseCEJdesistMF: matric10ClasseCEJdesistMF,
                matric11ClasseCEJfeminino: matric11ClasseCEJfeminino,
                matric11ClasseCEJapvMF: matric11ClasseCEJapvMF,
                matric11ClasseCEJapvFeminino: matric11ClasseCEJapvFeminino,
                matric11ClasseCEJsemApvMF: matric11ClasseCEJsemApvMF,
                matric11ClasseCEJsemApvFeminino: matric11ClasseCEJsemApvFeminino,
                matric11ClasseCEJdesistMF: matric11ClasseCEJdesistMF,
                matric11ClasseCEJdesistFeminino: matric11ClasseCEJdesistFeminino,
                matric11ClasseCEJchegadAoFimMF: matric11ClasseCEJchegadAoFimMF,
                matric11ClasseCEJchegadAoFimFeminino: matric11ClasseCEJchegadAoFimFeminino,
                matric12ClasseCEJfeminino: matric12ClasseCEJfeminino,
                matric12ClasseCEJapvMF: matric12ClasseCEJapvMF,
                matric12ClasseCEJapvFeminino: matric12ClasseCEJapvFeminino,
                matric12ClasseCEJsemApvMF: matric12ClasseCEJsemApvMF,
                matric12ClasseCEJsemApvFeminino: matric12ClasseCEJsemApvFeminino,
                matric12ClasseCEJdesistMF: matric12ClasseCEJdesistMF,
                matric12ClasseCEJdesistFeminino: matric12ClasseCEJdesistFeminino,
                matric12ClasseCEJchegadAoFimMF: matric12ClasseCEJchegadAoFimMF,
                matric12ClasseCEJchegadAoFimFeminino: matric12ClasseCEJchegadAoFimFeminino,
                totalCEJ: totalCEJ
            }

            const veryAproveitamento = await findAproveitamentoByTrimestreService(trimestre)
            //return res.send("Actualizar")
            if (veryAproveitamento) {
                veryAproveitamento.aproveitamentoII = aproveitamentoII
                const idAp = veryAproveitamento._id
                const aproveitamentoActualizado = await findAproveitamentoAndApdateService(idAp, veryAproveitamento)
                req.flash("success_msg", "Aproveitamento do " + trimestre + " actualizado!")
                return res.redirect("/pedagogico/aproveitamentoTrimestral/IITrimestre")
            }

            //const trimestre = "IIº Trimestre" //este trimestre tem de vir do botão gerar aproveitamento


            const aproveitamento = {
                trimestre: trimestre,
                aproveitamentoII: aproveitamentoII,
                idAno: idAno
            }
            const newAproveitamento = await createAproveitamento(aproveitamento)

            //return res.send({ aproveitamento })
        }

        if (trimestre == "IIIº Trimestre") {
            routerAprovTrimestral = 'IIITrimestre'
            let alunosMatrMF = []
            tdAlunos.forEach(aluno => {
                if (aluno.genero == 'M' || aluno.genero == 'F') {
                    alunosMatrMF.push(aluno)
                }
            });
            console.log(tdAlunos.length)
            console.log(alunosMatrMF.length)

            //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
            // CURSO CH

            /* 10ª Classe CH */
            let matric10ClasseCH = []
            let feminino10CH = 0
            let apvMF10CH = 0
            let apvFeminino10CH = 0
            let desistidos10MFCH = 0
            let desistidos10FemininoCH = 0

            let matric10ClasseCHfeminino = 0
            let matric10ClasseCHdesistFeminino = 0
            let matric10ClasseCHchegadAoFimMF = 0
            let matric10ClasseCHchegadAoFimFeminino = 0
            let matric10ClasseCHapvMF = 0
            let matric10ClasseCHapvFeminino = 0
            let matric10ClasseCHsemApvMF = 0
            let matric10ClasseCHsemApvFeminino = 0
            let matric10ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    // ORGANIZAR O APROVEITAMENTO PARA CRIAR E SALVAR
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }


                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CH += 1
                    }
                    const semApv10MF = matric10ClasseCH.length - apvMF10CH
                    const semApv10Feminino = feminino10CH - apvFeminino10CH
                    matric10ClasseCHfeminino = feminino10CH
                    matric10ClasseCHapvMF = apvMF10CH
                    matric10ClasseCHapvFeminino = apvFeminino10CH
                    matric10ClasseCHsemApvMF = semApv10MF - desistidos10MFCH
                    matric10ClasseCHsemApvFeminino = semApv10Feminino - desistidos10FemininoCH

                    matric10ClasseCHdesistMF = desistidos10MFCH
                    matric10ClasseCHdesistFeminino = desistidos10FemininoCH
                    matric10ClasseCHchegadAoFimMF = matric10ClasseCH.length - desistidos10MFCH
                    matric10ClasseCHchegadAoFimFeminino = feminino10CH - desistidos10FemininoCH

                }
            });



            /* 11ª Classe CH */
            let matric11ClasseCH = []
            let feminino11CH = 0
            let apvMF11CH = 0
            let apvFeminino11CH = 0
            let desistidos11MFCH = 0
            let desistidos11FemininoCH = 0

            let matric11ClasseCHfeminino = 0
            let matric11ClasseCHdesistFeminino = 0
            let matric11ClasseCHchegadAoFimMF = 0
            let matric11ClasseCHchegadAoFimFeminino = 0
            let matric11ClasseCHapvMF = 0
            let matric11ClasseCHapvFeminino = 0
            let matric11ClasseCHsemApvMF = 0
            let matric11ClasseCHsemApvFeminino = 0
            let matric11ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCH.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }

                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CH += 1
                    }
                    const semApv11MF = matric11ClasseCH.length - apvMF11CH
                    const semApv11Feminino = feminino11CH - apvFeminino11CH
                    matric11ClasseCHfeminino = feminino11CH
                    matric11ClasseCHapvMF = apvMF11CH
                    matric11ClasseCHapvFeminino = apvFeminino11CH
                    matric11ClasseCHsemApvMF = semApv11MF - desistidos11MFCH
                    matric11ClasseCHsemApvFeminino = semApv11Feminino - desistidos11FemininoCH

                    matric11ClasseCHdesistMF = desistidos11MFCH
                    matric11ClasseCHdesistFeminino = desistidos11FemininoCH
                    matric11ClasseCHchegadAoFimMF = matric11ClasseCH.length - desistidos11MFCH
                    matric11ClasseCHchegadAoFimFeminino = feminino11CH - desistidos11FemininoCH

                }
            });

            /* 12ª Classe CH */
            let matric12ClasseCH = []
            let feminino12CH = 0
            let apvMF12CH = 0
            let apvFeminino12CH = 0
            let desistidos12MFCH = 0
            let desistidos12FemininoCH = 0

            let matric12ClasseCHfeminino = 0
            let matric12ClasseCHdesistFeminino = 0
            let matric12ClasseCHchegadAoFimMF = 0
            let matric12ClasseCHchegadAoFimFeminino = 0
            let matric12ClasseCHapvMF = 0
            let matric12ClasseCHapvFeminino = 0
            let matric12ClasseCHsemApvMF = 0
            let matric12ClasseCHsemApvFeminino = 0
            let matric12ClasseCHdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCH.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CH += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CH += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCH += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCH += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CH += 1
                    }
                    const semApv12MF = matric12ClasseCH.length - apvMF12CH
                    const semApv12Feminino = feminino12CH - apvFeminino12CH
                    matric12ClasseCHfeminino = feminino12CH
                    matric12ClasseCHapvMF = apvMF12CH
                    matric12ClasseCHapvFeminino = apvFeminino12CH
                    matric12ClasseCHsemApvMF = semApv12MF - desistidos12MFCH
                    matric12ClasseCHsemApvFeminino = semApv12Feminino - desistidos12FemininoCH

                    matric12ClasseCHdesistMF = desistidos12MFCH
                    matric12ClasseCHdesistFeminino = desistidos12FemininoCH
                    matric12ClasseCHchegadAoFimMF = matric12ClasseCH.length - desistidos12MFCH
                    matric12ClasseCHchegadAoFimFeminino = feminino12CH - desistidos12FemininoCH

                }
            });

            const totalCH = {
                mf: matric10ClasseCH.length + matric11ClasseCH.length + matric12ClasseCH.length,
                feminino: matric10ClasseCHfeminino + matric11ClasseCHfeminino + matric12ClasseCHfeminino,
                totalComApMF: matric10ClasseCHapvMF + matric11ClasseCHapvMF + matric12ClasseCHapvMF,
                totalComApFeminino: matric10ClasseCHapvFeminino + matric11ClasseCHapvFeminino + matric12ClasseCHapvFeminino,
                totalSemApMF: matric10ClasseCHsemApvMF + matric11ClasseCHsemApvMF + matric12ClasseCHsemApvMF,
                totalSemApFeminino: matric10ClasseCHsemApvFeminino + matric11ClasseCHsemApvFeminino + matric12ClasseCHsemApvFeminino,
            }
            //return res.send({alunosMatrMF})


            /* CURSO DE CIENCIAS FISICO-BIOLÓGICAS */
            /* 10ª Classe CFB */
            let matric10ClasseCFB = []
            let feminino10CFB = 0
            let apvMF10CFB = 0
            let apvFeminino10CFB = 0
            let desistidos10MFCFB = 0
            let desistidos10FemininoCFB = 0

            let matric10ClasseCFBfeminino = 0
            let matric10ClasseCFBdesistFeminino = 0
            let matric10ClasseCFBchegadAoFimMF = 0
            let matric10ClasseCFBchegadAoFimFeminino = 0
            let matric10ClasseCFBapvMF = 0
            let matric10ClasseCFBapvFeminino = 0
            let matric10ClasseCFBsemApvMF = 0
            let matric10ClasseCFBsemApvFeminino = 0
            let matric10ClasseCFBdesistMF = 0

            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CFB += 1
                    }
                    const semApv10MF = matric10ClasseCFB.length - apvMF10CFB
                    const semApv10Feminino = feminino10CFB - apvFeminino10CFB
                    matric10ClasseCFBfeminino = feminino10CFB
                    matric10ClasseCFBapvMF = apvMF10CFB
                    matric10ClasseCFBapvFeminino = apvFeminino10CFB
                    matric10ClasseCFBsemApvMF = semApv10MF - desistidos10MFCFB
                    matric10ClasseCFBsemApvFeminino = semApv10Feminino - desistidos10FemininoCFB

                    matric10ClasseCFBdesistMF = desistidos10MFCFB
                    matric10ClasseCFBdesistFeminino = desistidos10FemininoCFB
                    matric10ClasseCFBchegadAoFimMF = matric10ClasseCFB.length - desistidos10MFCFB
                    matric10ClasseCFBchegadAoFimFeminino = feminino10CFB - desistidos10FemininoCFB
                }
            });



            /* 11ª Classe CFB */
            let matric11ClasseCFB = []
            let feminino11CFB = 0
            let apvMF11CFB = 0
            let apvFeminino11CFB = 0
            let desistidos11MFCFB = 0
            let desistidos11FemininoCFB = 0

            let matric11ClasseCFBfeminino = 0
            let matric11ClasseCFBapvMF = 0
            let matric11ClasseCFBapvFeminino = 0
            let matric11ClasseCFBsemApvMF = 0
            let matric11ClasseCFBsemApvFeminino = 0
            let matric11ClasseCFBdesistMF = 0
            let matric11ClasseCFBdesistFeminino = 0
            let matric11ClasseCFBchegadAoFimMF = 0
            let matric11ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCFB.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CFB += 1
                    }
                    const semApv11MF = matric11ClasseCFB.length - apvMF11CFB
                    const semApv11Feminino = feminino11CFB - apvFeminino11CFB
                    matric11ClasseCFBfeminino = feminino11CFB
                    matric11ClasseCFBapvMF = apvMF11CFB
                    matric11ClasseCFBapvFeminino = apvFeminino11CFB
                    matric11ClasseCFBsemApvMF = semApv11MF - desistidos11MFCFB
                    matric11ClasseCFBsemApvFeminino = semApv11Feminino - desistidos11FemininoCFB

                    matric11ClasseCFBdesistMF = desistidos11MFCFB
                    matric11ClasseCFBdesistFeminino = desistidos11FemininoCFB
                    matric11ClasseCFBchegadAoFimMF = matric11ClasseCFB.length - desistidos11MFCFB
                    matric11ClasseCFBchegadAoFimFeminino = feminino11CFB - desistidos11FemininoCFB

                }
            });

            /* 12ª Classe CFB */
            let matric12ClasseCFB = []
            let feminino12CFB = 0
            let apvMF12CFB = 0
            let apvFeminino12CFB = 0
            let desistidos12MFCFB = 0
            let desistidos12FemininoCFB = 0

            let matric12ClasseCFBfeminino = 0
            let matric12ClasseCFBapvMF = 0
            let matric12ClasseCFBapvFeminino = 0
            let matric12ClasseCFBsemApvMF = 0
            let matric12ClasseCFBsemApvFeminino = 0
            let matric12ClasseCFBdesistMF = 0
            let matric12ClasseCFBdesistFeminino = 0
            let matric12ClasseCFBchegadAoFimMF = 0
            let matric12ClasseCFBchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCFB.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });

                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CFB += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CFB += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCFB += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCFB += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CFB += 1
                    }
                    const semApv12MF = matric12ClasseCFB.length - apvMF12CFB
                    const semApv12Feminino = feminino12CFB - apvFeminino12CFB
                    matric12ClasseCFBfeminino = feminino12CFB
                    matric12ClasseCFBapvMF = apvMF12CFB
                    matric12ClasseCFBapvFeminino = apvFeminino12CFB
                    matric12ClasseCFBsemApvMF = semApv12MF - desistidos12MFCFB
                    matric12ClasseCFBsemApvFeminino = semApv12Feminino - desistidos12FemininoCFB

                    matric12ClasseCFBdesistMF = desistidos12MFCFB
                    matric12ClasseCFBdesistFeminino = desistidos12FemininoCFB
                    matric12ClasseCFBchegadAoFimMF = matric12ClasseCFB.length - desistidos12MFCFB
                    matric12ClasseCFBchegadAoFimFeminino = feminino12CFB - desistidos12FemininoCFB

                }
            });

            const totalCFB = {
                mf: matric10ClasseCFB.length + matric11ClasseCFB.length + matric12ClasseCFB.length,
                feminino: matric10ClasseCFBfeminino + matric11ClasseCFBfeminino + matric12ClasseCFBfeminino,
                totalComApMF: matric10ClasseCFBapvMF + matric11ClasseCFBapvMF + matric12ClasseCFBapvMF,
                totalComApFeminino: matric10ClasseCFBapvFeminino + matric11ClasseCFBapvFeminino + matric12ClasseCFBapvFeminino,
                totalSemApMF: matric10ClasseCFBsemApvMF + matric11ClasseCFBsemApvMF + matric12ClasseCFBsemApvMF,
                totalSemApFeminino: matric10ClasseCFBsemApvFeminino + matric11ClasseCFBsemApvFeminino + matric12ClasseCFBsemApvFeminino,
            }


            /* Curso de Ciências Económico-Jurídicas */
            /* 10ª Classe CEJ */
            let matric10ClasseCEJ = []
            let feminino10CEJ = 0
            let apvMF10CEJ = 0
            let apvFeminino10CEJ = 0
            let desistidos10MFCEJ = 0
            let desistidos10FemininoCEJ = 0

            let matric10ClasseCEJfeminino = 0
            let matric10ClasseCEJdesistFeminino = 0
            let matric10ClasseCEJchegadAoFimMF = 0
            let matric10ClasseCEJchegadAoFimFeminino = 0

            let matric10ClasseCEJapvMF = 0
            let matric10ClasseCEJapvFeminino = 0
            let matric10ClasseCEJsemApvMF = 0
            let matric10ClasseCEJsemApvFeminino = 0
            let matric10ClasseCEJdesistMF = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }

                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });
                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF10CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino10CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos10MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos10FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino10CEJ += 1
                    }
                    const semApv10MF = matric10ClasseCEJ.length - apvMF10CEJ
                    const semApv10Feminino = feminino10CEJ - apvFeminino10CEJ
                    matric10ClasseCEJfeminino = feminino10CEJ
                    matric10ClasseCEJapvMF = apvMF10CEJ
                    matric10ClasseCEJapvFeminino = apvFeminino10CEJ
                    matric10ClasseCEJsemApvMF = semApv10MF - desistidos10MFCEJ
                    matric10ClasseCEJsemApvFeminino = semApv10Feminino - desistidos10FemininoCEJ

                    matric10ClasseCEJdesistMF = desistidos10MFCEJ
                    matric10ClasseCEJdesistFeminino = desistidos10FemininoCEJ
                    matric10ClasseCEJchegadAoFimMF = matric10ClasseCEJ.length - desistidos10MFCEJ
                    matric10ClasseCEJchegadAoFimFeminino = feminino10CEJ - desistidos10FemininoCEJ
                }
            });

            /* 11ª Classe CEJ */
            let matric11ClasseCEJ = []
            let feminino11CEJ = 0
            let apvMF11CEJ = 0
            let apvFeminino11CEJ = 0
            let desistidos11MFCEJ = 0
            let desistidos11FemininoCEJ = 0

            let matric11ClasseCEJfeminino = 0
            let matric11ClasseCEJapvMF = 0
            let matric11ClasseCEJapvFeminino = 0
            let matric11ClasseCEJsemApvMF = 0
            let matric11ClasseCEJsemApvFeminino = 0
            let matric11ClasseCEJdesistMF = 0
            let matric11ClasseCEJdesistFeminino = 0
            let matric11ClasseCEJchegadAoFimMF = 0
            let matric11ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCEJ.push(aluno)

                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)

                        }
                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });
                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF11CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino11CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos11MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos11FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino11CEJ += 1
                    }
                    const semApv11MF = matric11ClasseCEJ.length - apvMF11CEJ
                    const semApv11Feminino = feminino11CEJ - apvFeminino11CEJ
                    matric11ClasseCEJfeminino = feminino11CEJ
                    matric11ClasseCEJapvMF = apvMF11CEJ
                    matric11ClasseCEJapvFeminino = apvFeminino11CEJ
                    matric11ClasseCEJsemApvMF = semApv11MF - desistidos11MFCEJ
                    matric11ClasseCEJsemApvFeminino = semApv11Feminino - desistidos11FemininoCEJ

                    matric11ClasseCEJdesistMF = desistidos11MFCEJ
                    matric11ClasseCEJdesistFeminino = desistidos11FemininoCEJ
                    matric11ClasseCEJchegadAoFimMF = matric11ClasseCEJ.length - desistidos11MFCEJ
                    matric11ClasseCEJchegadAoFimFeminino = feminino11CEJ - desistidos11FemininoCEJ

                }
            });

            /* 12ª Classe CEJ */
            let matric12ClasseCEJ = []
            let feminino12CEJ = 0
            let apvMF12CEJ = 0
            let apvFeminino12CEJ = 0
            let desistidos12MFCEJ = 0
            let desistidos12FemininoCEJ = 0

            let matric12ClasseCEJfeminino = 0
            let matric12ClasseCEJapvMF = 0
            let matric12ClasseCEJapvFeminino = 0
            let matric12ClasseCEJsemApvMF = 0
            let matric12ClasseCEJsemApvFeminino = 0
            let matric12ClasseCEJdesistMF = 0
            let matric12ClasseCEJdesistFeminino = 0
            let matric12ClasseCEJchegadAoFimMF = 0
            let matric12ClasseCEJchegadAoFimFeminino = 0
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCEJ.push(aluno)
                    //Pegando as notas do aluno
                    let notasAluno = []
                    tdNotas.forEach(notasD => {
                        if (notasD.aluno == "" + aluno._id) {
                            notasAluno.push(notasD)
                        }
                    });
                    //Conferir o aproveitamento do aluno
                    let semApv = ''
                    let desistido = ''
                    let qtZeros = 0
                    let negativas = []
                    notasAluno.forEach(notasA => {
                        if (notasA.notas.mt3 < 10) {
                            negativas.push(notasA.notas.mt3)
                        }

                        if (notasA.notas.mac3 == 0 && notasA.notas.pp3 == 0 && notasA.notas.pt3 == 0) {
                            qtZeros += 1
                        }
                    });
                    //Previsão do conselho (aprovar aluno tendo em conta os benefícios do conselho de notas)
                    if (negativas.length > 3) {
                        semApv = 'Sem Aproveitamento'
                    } else {
                        negativas.forEach(notaNeg => {
                            if (notaNeg < 7) {
                                semApv = 'Sem Aproveitamento'

                            }
                        });
                    }
                    //Verificar a qt de notas zero que indicam a desistencia do aluno
                    if (qtZeros == notasAluno.length) {
                        desistido = 'desistido'
                    }
                    if (semApv != 'Sem Aproveitamento') {
                        apvMF12CEJ += 1
                        //Adicionar feminino nos aproveitamento
                        if (aluno.genero == 'F') {
                            apvFeminino12CEJ += 1
                        }
                    }
                    if (desistido == 'desistido') {
                        desistidos12MFCEJ += 1
                        if (aluno.genero == 'F') {
                            desistidos12FemininoCEJ += 1
                        }
                    }

                    //Contar o Genero Feminino
                    if (aluno.genero == 'F') {
                        feminino12CEJ += 1
                    }
                    const semApv12MF = matric12ClasseCEJ.length - apvMF12CEJ
                    const semApv12Feminino = feminino12CEJ - apvFeminino12CEJ
                    matric12ClasseCEJfeminino = feminino12CEJ
                    matric12ClasseCEJapvMF = apvMF12CEJ
                    matric12ClasseCEJapvFeminino = apvFeminino12CEJ
                    matric12ClasseCEJsemApvMF = semApv12MF - desistidos12MFCEJ
                    matric12ClasseCEJsemApvFeminino = semApv12Feminino - desistidos12FemininoCEJ

                    matric12ClasseCEJdesistMF = desistidos12MFCEJ
                    matric12ClasseCEJdesistFeminino = desistidos12FemininoCEJ
                    matric12ClasseCEJchegadAoFimMF = matric12ClasseCEJ.length - desistidos12MFCEJ
                    matric12ClasseCEJchegadAoFimFeminino = feminino12CEJ - desistidos12FemininoCEJ

                }
            });

            const totalCEJ = {
                mf: matric10ClasseCEJ.length + matric11ClasseCEJ.length + matric12ClasseCEJ.length,
                feminino: matric10ClasseCEJfeminino + matric11ClasseCEJfeminino + matric12ClasseCEJfeminino,
                totalComApMF: matric10ClasseCEJapvMF + matric11ClasseCEJapvMF + matric12ClasseCEJapvMF,
                totalComApFeminino: matric10ClasseCEJapvFeminino + matric11ClasseCEJapvFeminino + matric12ClasseCEJapvFeminino,
                totalSemApMF: matric10ClasseCEJsemApvMF + matric11ClasseCEJsemApvMF + matric12ClasseCEJsemApvMF,
                totalSemApFeminino: matric10ClasseCEJsemApvFeminino + matric11ClasseCEJsemApvFeminino + matric12ClasseCEJsemApvFeminino,
            }
            // return res.send({matric10ClasseCEJ})

            const aproveitamentoII = {
                trimestre: 'IIº Trimestre',
                matric10ClasseCH: matric10ClasseCH,
                matric11ClasseCH: matric11ClasseCH,
                matric12ClasseCH: matric12ClasseCH,
                matric10ClasseCHfeminino: matric10ClasseCHfeminino,
                matric10ClasseCHdesistFeminino: matric10ClasseCHdesistFeminino,
                matric10ClasseCHchegadAoFimMF: matric10ClasseCHchegadAoFimMF,
                matric10ClasseCHchegadAoFimFeminino: matric10ClasseCHchegadAoFimFeminino,
                matric10ClasseCHapvMF: matric10ClasseCHapvMF,
                matric10ClasseCHapvFeminino: matric10ClasseCHapvFeminino,
                matric10ClasseCHsemApvMF: matric10ClasseCHsemApvMF,
                matric10ClasseCHsemApvFeminino: matric10ClasseCHsemApvFeminino,
                matric10ClasseCHdesistMF: matric10ClasseCHdesistMF,
                matric11ClasseCHfeminino: matric11ClasseCHfeminino,
                matric11ClasseCHapvMF: matric11ClasseCHapvMF,
                matric11ClasseCHapvFeminino: matric11ClasseCHapvFeminino,
                matric11ClasseCHsemApvMF: matric11ClasseCHsemApvMF,
                matric11ClasseCHsemApvFeminino: matric11ClasseCHsemApvFeminino,
                matric11ClasseCHdesistMF: matric11ClasseCHdesistMF,
                matric11ClasseCHdesistFeminino: matric11ClasseCHdesistFeminino,
                matric11ClasseCHchegadAoFimMF: matric11ClasseCHchegadAoFimMF,
                matric11ClasseCHchegadAoFimFeminino: matric11ClasseCHchegadAoFimFeminino,
                matric12ClasseCHfeminino: matric12ClasseCHfeminino,
                matric12ClasseCHapvMF: matric12ClasseCHapvMF,
                matric12ClasseCHapvFeminino: matric12ClasseCHapvFeminino,
                matric12ClasseCHsemApvMF: matric12ClasseCHsemApvMF,
                matric12ClasseCHsemApvFeminino: matric12ClasseCHsemApvFeminino,
                matric12ClasseCHdesistMF: matric12ClasseCHdesistMF,
                matric12ClasseCHdesistFeminino: matric12ClasseCHdesistFeminino,
                matric12ClasseCHchegadAoFimMF: matric12ClasseCHchegadAoFimMF,
                matric12ClasseCHchegadAoFimFeminino: matric12ClasseCHchegadAoFimFeminino,
                totalCH: totalCH,
                matric10ClasseCFB: matric10ClasseCFB,
                matric11ClasseCFB: matric11ClasseCFB,
                matric12ClasseCFB: matric12ClasseCFB,
                matric10ClasseCFBfeminino: matric10ClasseCFBfeminino,
                matric10ClasseCFBdesistFeminino: matric10ClasseCFBdesistFeminino,
                matric10ClasseCFBchegadAoFimMF: matric10ClasseCFBchegadAoFimMF,
                matric10ClasseCFBchegadAoFimFeminino: matric10ClasseCFBchegadAoFimFeminino,
                matric10ClasseCFBapvMF: matric10ClasseCFBapvMF,
                matric10ClasseCFBapvFeminino: matric10ClasseCFBapvFeminino,
                matric10ClasseCFBsemApvMF: matric10ClasseCFBsemApvMF,
                matric10ClasseCFBsemApvFeminino: matric10ClasseCFBsemApvFeminino,
                matric10ClasseCFBdesistMF: matric10ClasseCFBdesistMF,
                matric11ClasseCFBfeminino: matric11ClasseCFBfeminino,
                matric11ClasseCFBapvMF: matric11ClasseCFBapvMF,
                matric11ClasseCFBapvFeminino: matric11ClasseCFBapvFeminino,
                matric11ClasseCFBsemApvMF: matric11ClasseCFBsemApvMF,
                matric11ClasseCFBsemApvFeminino: matric11ClasseCFBsemApvFeminino,
                matric11ClasseCFBdesistMF: matric11ClasseCFBdesistMF,
                matric11ClasseCFBdesistFeminino: matric11ClasseCFBdesistFeminino,
                matric11ClasseCFBchegadAoFimMF: matric11ClasseCFBchegadAoFimMF,
                matric11ClasseCFBchegadAoFimFeminino: matric11ClasseCFBchegadAoFimFeminino,
                matric12ClasseCFBfeminino: matric12ClasseCFBfeminino,
                matric12ClasseCFBapvMF: matric12ClasseCFBapvMF,
                matric12ClasseCFBapvFeminino: matric12ClasseCFBapvFeminino,
                matric12ClasseCFBsemApvMF: matric12ClasseCFBsemApvMF,
                matric12ClasseCFBsemApvFeminino: matric12ClasseCFBsemApvFeminino,
                matric12ClasseCFBdesistMF: matric12ClasseCFBdesistMF,
                matric12ClasseCFBdesistFeminino: matric12ClasseCFBdesistFeminino,
                matric12ClasseCFBchegadAoFimMF: matric12ClasseCFBchegadAoFimMF,
                matric12ClasseCFBchegadAoFimFeminino: matric12ClasseCFBchegadAoFimFeminino,
                totalCFB: totalCFB,
                matric10ClasseCEJ: matric10ClasseCEJ,
                matric11ClasseCEJ: matric11ClasseCEJ,
                matric12ClasseCEJ: matric12ClasseCEJ,
                matric10ClasseCEJfeminino: matric10ClasseCEJfeminino,
                matric10ClasseCEJdesistFeminino: matric10ClasseCEJdesistFeminino,
                matric10ClasseCEJchegadAoFimMF: matric10ClasseCEJchegadAoFimMF,
                matric10ClasseCEJchegadAoFimFeminino: matric10ClasseCEJchegadAoFimFeminino,
                matric10ClasseCEJapvMF: matric10ClasseCEJapvMF,
                matric10ClasseCEJapvFeminino: matric10ClasseCEJapvFeminino,
                matric10ClasseCEJsemApvMF: matric10ClasseCEJsemApvMF,
                matric10ClasseCEJsemApvFeminino: matric10ClasseCEJsemApvFeminino,
                matric10ClasseCEJdesistMF: matric10ClasseCEJdesistMF,
                matric11ClasseCEJfeminino: matric11ClasseCEJfeminino,
                matric11ClasseCEJapvMF: matric11ClasseCEJapvMF,
                matric11ClasseCEJapvFeminino: matric11ClasseCEJapvFeminino,
                matric11ClasseCEJsemApvMF: matric11ClasseCEJsemApvMF,
                matric11ClasseCEJsemApvFeminino: matric11ClasseCEJsemApvFeminino,
                matric11ClasseCEJdesistMF: matric11ClasseCEJdesistMF,
                matric11ClasseCEJdesistFeminino: matric11ClasseCEJdesistFeminino,
                matric11ClasseCEJchegadAoFimMF: matric11ClasseCEJchegadAoFimMF,
                matric11ClasseCEJchegadAoFimFeminino: matric11ClasseCEJchegadAoFimFeminino,
                matric12ClasseCEJfeminino: matric12ClasseCEJfeminino,
                matric12ClasseCEJapvMF: matric12ClasseCEJapvMF,
                matric12ClasseCEJapvFeminino: matric12ClasseCEJapvFeminino,
                matric12ClasseCEJsemApvMF: matric12ClasseCEJsemApvMF,
                matric12ClasseCEJsemApvFeminino: matric12ClasseCEJsemApvFeminino,
                matric12ClasseCEJdesistMF: matric12ClasseCEJdesistMF,
                matric12ClasseCEJdesistFeminino: matric12ClasseCEJdesistFeminino,
                matric12ClasseCEJchegadAoFimMF: matric12ClasseCEJchegadAoFimMF,
                matric12ClasseCEJchegadAoFimFeminino: matric12ClasseCEJchegadAoFimFeminino,
                totalCEJ: totalCEJ
            }

            const veryAproveitamento = await findAproveitamentoByTrimestreService(trimestre)
            //return res.send("Actualizar")
            if (veryAproveitamento) {
                veryAproveitamento.aproveitamentoII = aproveitamentoII
                const idAp = veryAproveitamento._id
                const aproveitamentoActualizado = await findAproveitamentoAndApdateService(idAp, veryAproveitamento)
                req.flash("success_msg", "Aproveitamento do " + trimestre + " actualizado!")
                return res.redirect("/pedagogico/aproveitamentoTrimestral/IITrimestre")
            }

            const aproveitamento = {
                trimestre: trimestre,
                aproveitamentoII: aproveitamentoII,
                idAno: idAno
            }
            const newAproveitamento = await createAproveitamento(aproveitamento)

            //return res.send({ aproveitamento })
        }

        if (trimestre == "Aproveitamento Final do Ano Lectivo") {
            routerAprovTrimestral = 'aproveitamentoFinal'
            let matric10ClasseCH = []
            let matric10ClasseCFB = []
            let matric10ClasseCEJ = []
            let matric11ClasseCH = []
            let matric11ClasseCFB = []
            let matric11ClasseCEJ = []
            let matric12ClasseCH = []
            let matric12ClasseCFB = []
            let matric12ClasseCEJ = []

            let feminino10CH = []
            let feminino10CFB = []
            let feminino10CEJ = []
            let feminino11CH = []
            let feminino11CFB = []
            let feminino11CEJ = []
            let feminino12CH = []
            let feminino12CFB = []
            let feminino12CEJ = []
            let alunosMatrMF = []
            tdAlunos.forEach(aluno => {
                if (aluno.genero == 'M' || aluno.genero == 'F') {
                    alunosMatrMF.push(aluno)
                }
            });
            console.log(tdAlunos.length)
            console.log(alunosMatrMF.length)
            alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCH.push(aluno)
                    if (aluno.genero == "F") { feminino10CH.push(aluno) }
                }
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCH.push(aluno)
                    if (aluno.genero == "F") { feminino11CH.push(aluno) }
                }
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCH.push(aluno)
                    if (aluno.genero == "F") { feminino12CH.push(aluno) }
                }

                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCFB.push(aluno)
                    if (aluno.genero == "F") { feminino10CFB.push(aluno) }
                }

                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCFB.push(aluno)
                    if (aluno.genero == "F") { feminino11CFB.push(aluno) }
                }

                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCFB.push(aluno)
                    if (aluno.genero == "F") { feminino12CFB.push(aluno) }
                }

                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCEJ.push(aluno)
                    if (aluno.genero == "F") { feminino10CEJ.push(aluno) }
                }
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCEJ.push(aluno)
                    if (aluno.genero == "F") { feminino11CEJ.push(aluno) }
                }
                if (aluno.curso == 'Curso de Ciências Económico-Jurídicas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCEJ.push(aluno)
                    if (aluno.genero == "F") { feminino12CEJ.push(aluno) }
                }
            });
            //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
            // CURSO CH

            /* 10ª Classe CH */
            let apvMF10CH = 0
            let apvFeminino10CH = 0
            let naoApvMF10CH = 0
            let naoApvFeminino10CH = 0
            let desistidos10MFCH = 0
            let desistidos10FemininoCH = 0

            let matric10ClasseCHfeminino = 0
            let matric10ClasseCHdesistFeminino = 0
            let matric10ClasseCHchegadAoFimMF = 0
            let matric10ClasseCHchegadAoFimFeminino = 0
            let matric10ClasseCHapvMF = 0
            let matric10ClasseCHapvFeminino = 0
            let matric10ClasseCHsemApvMF = 0
            let matric10ClasseCHsemApvFeminino = 0
            let matric10ClasseCHdesistMF = 0


            // Verificar aproveitamento CH
            pautasFinalCH.forEach(pauta => {
                if (pauta.classe.designacao == "10ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF10CH++ }
                        if (aluno.estado == "APTA") { apvFeminino10CH++ }
                        if (aluno.estado == "N/APTO" || aluno.estado == "N/APTA") { naoApvMF10CH++ }
                        if (aluno.estado == "N/APTA") { naoApvFeminino10CH++ }
                        if (aluno.estado == "DESISTENTE") { desistidos10MFCH++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos10FemininoCH++ }

                    });
                }

            });
            const semApv10MF = matric10ClasseCH.length - apvMF10CH - desistidos10MFCH
            const semApv10Feminino = feminino10CH.length - apvFeminino10CH
            matric10ClasseCHfeminino = feminino10CH.length
            matric10ClasseCHapvMF = apvMF10CH
            matric10ClasseCHapvFeminino = apvFeminino10CH
            matric10ClasseCHsemApvMF = matric10ClasseCH.length - apvMF10CH - desistidos10MFCH
            matric10ClasseCHsemApvFeminino = feminino10CH.length - apvFeminino10CH

            matric10ClasseCHdesistMF =
                matric10ClasseCHdesistFeminino = desistidos10FemininoCH
            matric10ClasseCHchegadAoFimMF = matric10ClasseCH.length - desistidos10MFCH
            matric10ClasseCHchegadAoFimFeminino = feminino10CH.length - desistidos10FemininoCH




            /* 11ª Classe CH */
            //let matric11ClasseCH = []
            //let feminino11CH = 0
            let apvMF11CH = 0
            let apvFeminino11CH = 0
            let desistidos11MFCH = 0
            let desistidos11FemininoCH = 0

            let matric11ClasseCHfeminino = 0
            let matric11ClasseCHdesistFeminino = 0
            let matric11ClasseCHchegadAoFimMF = 0
            let matric11ClasseCHchegadAoFimFeminino = 0
            let matric11ClasseCHapvMF = 0
            let matric11ClasseCHapvFeminino = 0
            let matric11ClasseCHsemApvMF = 0
            let matric11ClasseCHsemApvFeminino = 0
            let matric11ClasseCHdesistMF = 0

            /* alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '11ª Classe') {
                    matric11ClasseCH++
                    if(aluno.genero == "F"){feminino11CH++}
                }
            }); */

            // Verificar aproveitamento CH
            pautasFinalCH.forEach(pauta => {
                if (pauta.classe.designacao == "11ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF11CH++ }
                        if (aluno.estado == "APTA") { apvFeminino11CH++ }
                        if (aluno.estado == "DESISTENTE") { desistidos11MFCH++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos11FemininoCH++ }

                    });
                }

            });
            const semApv11MF = matric11ClasseCH.length - apvMF11CH - desistidos11MFCH
            const semApv11Feminino = feminino11CH.length - apvFeminino11CH
            matric11ClasseCHfeminino = feminino11CH.length
            matric11ClasseCHapvMF = apvMF11CH
            matric11ClasseCHapvFeminino = apvFeminino11CH
            matric11ClasseCHsemApvMF = matric11ClasseCH.length - apvMF11CH - desistidos11MFCH
            matric11ClasseCHsemApvFeminino = feminino11CH.length - apvFeminino11CH

            matric11ClasseCHdesistMF = desistidos11MFCH
            matric11ClasseCHdesistFeminino = desistidos11FemininoCH
            matric11ClasseCHchegadAoFimMF = matric11ClasseCH.length - desistidos11MFCH
            matric11ClasseCHchegadAoFimFeminino = feminino11CH.length - desistidos11FemininoCH



            /* 12ª Classe CH */
            //let matric12ClasseCH = []
            //let feminino12CH = 0
            let apvMF12CH = 0
            let apvFeminino12CH = 0
            let desistidos12MFCH = 0
            let desistidos12FemininoCH = 0

            let matric12ClasseCHfeminino = 0
            let matric12ClasseCHdesistFeminino = 0
            let matric12ClasseCHchegadAoFimMF = 0
            let matric12ClasseCHchegadAoFimFeminino = 0
            let matric12ClasseCHapvMF = 0
            let matric12ClasseCHapvFeminino = 0
            let matric12ClasseCHsemApvMF = 0
            let matric12ClasseCHsemApvFeminino = 0
            let matric12ClasseCHdesistMF = 0

            /* alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Humanas' && aluno.classe == '12ª Classe') {
                    matric12ClasseCH++
                    if(aluno.genero == "F"){feminino12CH++}
                }
            }); */

            // Verificar aproveitamento CH
            pautasFinalCH.forEach(pauta => {
                if (pauta.classe.designacao == "12ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF12CH++ }
                        if (aluno.estado == "APTA") { apvFeminino12CH++ }
                        if (aluno.estado == "DESISTENTE") { desistidos12MFCH++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos12FemininoCH++ }

                    });
                }

            });
            const semApv12MF = matric12ClasseCH.length - apvMF12CH - desistidos12MFCH
            const semApv12Feminino = feminino12CH.length - apvFeminino12CH
            matric12ClasseCHfeminino = feminino12CH.length
            matric12ClasseCHapvMF = apvMF12CH
            matric12ClasseCHapvFeminino = apvFeminino12CH
            matric12ClasseCHsemApvMF = matric12ClasseCH.length - apvMF12CH
            matric12ClasseCHsemApvFeminino = feminino12CH.length - apvFeminino12CH

            matric12ClasseCHdesistMF = desistidos12MFCH
            matric12ClasseCHdesistFeminino = desistidos12FemininoCH
            matric12ClasseCHchegadAoFimMF = matric12ClasseCH.length - desistidos12MFCH
            matric12ClasseCHchegadAoFimFeminino = feminino12CH.length - desistidos12FemininoCH




            const totalCH = {
                mf: matric10ClasseCH.length + matric11ClasseCH.length + matric12ClasseCH.length,
                feminino: matric10ClasseCHfeminino + matric11ClasseCHfeminino + matric12ClasseCHfeminino,
                totalComApMF: matric10ClasseCHapvMF + matric11ClasseCHapvMF + matric12ClasseCHapvMF,
                totalComApFeminino: matric10ClasseCHapvFeminino + matric11ClasseCHapvFeminino + matric12ClasseCHapvFeminino,
                totalSemApMF: matric10ClasseCHsemApvMF + matric11ClasseCHsemApvMF + matric12ClasseCHsemApvMF,
                totalSemApFeminino: matric10ClasseCHsemApvFeminino + matric11ClasseCHsemApvFeminino + matric12ClasseCHsemApvFeminino,
            }
            //return res.send({totalCH})


            /* CURSO DE CIENCIAS FISICO-BIOLÓGICAS */
            /* 10ª Classe CFB */

            /* 10ª Classe CH */
            //let matric10ClasseCFB = 0
            //let feminino10CFB = 0
            let apvMF10CFB = 0
            let apvFeminino10CFB = 0
            let desistidos10MFCFB = 0
            let desistidos10FemininoCFB = 0

            let matric10ClasseCFBfeminino = 0
            let matric10ClasseCFBdesistFeminino = 0
            let matric10ClasseCFBchegadAoFimMF = 0
            let matric10ClasseCFBchegadAoFimFeminino = 0
            let matric10ClasseCFBapvMF = 0
            let matric10ClasseCFBapvFeminino = 0
            let matric10ClasseCFBsemApvMF = 0
            let matric10ClasseCFBsemApvFeminino = 0
            let matric10ClasseCFBdesistMF = 0
            /* alunosMatrMF.forEach(aluno => {
                if (aluno.curso == 'Curso de Ciências Físicas e Biológicas' && aluno.classe == '10ª Classe') {
                    matric10ClasseCFB++
                    if(aluno.genero == "F"){feminino10CFB++}
                }
            }); */

            // Verificar aproveitamento CH
            pautasFinalCFB.forEach(pauta => {
                if (pauta.classe.designacao == "10ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF10CFB++ }
                        if (aluno.estado == "APTA") { apvFeminino10CFB++ }
                        if (aluno.estado == "DESISTENTE") { desistidos10MFCFB++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos10FemininoCFB++ }

                    });
                }

            });
            const semApv10MFCFB = matric10ClasseCFB.length - apvMF10CFB - desistidos10MFCFB
            const semApv10FemininoCFB = feminino10CFB.length - apvFeminino10CFB
            matric10ClasseCFBfeminino = feminino10CFB.length
            matric10ClasseCFBapvMF = apvMF10CFB
            matric10ClasseCFBapvFeminino = apvFeminino10CFB
            matric10ClasseCFBsemApvMF = matric10ClasseCFB.length - apvMF10CFB
            matric10ClasseCFBsemApvFeminino = feminino10CFB.length - apvFeminino10CFB

            matric10ClasseCFBdesistMF = desistidos10MFCFB
            matric10ClasseCFBdesistFeminino = desistidos10FemininoCFB
            matric10ClasseCFBchegadAoFimMF = matric10ClasseCFB.length - desistidos10MFCFB
            matric10ClasseCFBchegadAoFimFeminino = feminino10CFB.length - desistidos10FemininoCFB




            /* 11ª Classe CH */
            //let matric11ClasseCFB = []
            //let feminino11CFB = 0
            let apvMF11CFB = 0
            let apvFeminino11CFB = 0
            let desistidos11MFCFB = 0
            let desistidos11FemininoCFB = 0

            let matric11ClasseCFBfeminino = 0
            let matric11ClasseCFBdesistFeminino = 0
            let matric11ClasseCFBchegadAoFimMF = 0
            let matric11ClasseCFBchegadAoFimFeminino = 0
            let matric11ClasseCFBapvMF = 0
            let matric11ClasseCFBapvFeminino = 0
            let matric11ClasseCFBsemApvMF = 0
            let matric11ClasseCFBsemApvFeminino = 0
            let matric11ClasseCFBdesistMF = 0


            // Verificar aproveitamento CH
            pautasFinalCFB.forEach(pauta => {
                if (pauta.classe.designacao == "11ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF11CFB++ }
                        if (aluno.estado == "APTA") { apvFeminino11CFB++ }
                        if (aluno.estado == "DESISTENTE") { desistidos11MFCFB++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos11FemininoCFB++ }

                    });
                }

            });
            const semApv11MFCFB = matric11ClasseCFB.length - apvMF11CFB - desistidos11MFCFB
            const semApv11FemininoCFB = feminino11CFB.length - apvFeminino11CFB
            matric11ClasseCFBfeminino = feminino11CFB.length
            matric11ClasseCFBapvMF = apvMF11CFB
            matric11ClasseCFBapvFeminino = apvFeminino11CFB
            matric11ClasseCFBsemApvMF = matric11ClasseCFB.length - apvMF11CFB
            matric11ClasseCFBsemApvFeminino = feminino11CFB.length - apvFeminino11CFB

            matric11ClasseCFBdesistMF = desistidos11MFCFB
            matric11ClasseCFBdesistFeminino = desistidos11FemininoCFB
            matric11ClasseCFBchegadAoFimMF = matric11ClasseCFB.length - desistidos11MFCFB
            matric11ClasseCFBchegadAoFimFeminino = feminino11CFB.length - desistidos11FemininoCFB



            /* 12ª Classe CH */
            //let matric12ClasseCFB = []
            //let feminino12CFB = 0
            let apvMF12CFB = 0
            let apvFeminino12CFB = 0
            let desistidos12MFCFB = 0
            let desistidos12FemininoCFB = 0

            let matric12ClasseCFBfeminino = 0
            let matric12ClasseCFBdesistFeminino = 0
            let matric12ClasseCFBchegadAoFimMF = 0
            let matric12ClasseCFBchegadAoFimFeminino = 0
            let matric12ClasseCFBapvMF = 0
            let matric12ClasseCFBapvFeminino = 0
            let matric12ClasseCFBsemApvMF = 0
            let matric12ClasseCFBsemApvFeminino = 0
            let matric12ClasseCFBdesistMF = 0


            // Verificar aproveitamento CFB
            pautasFinalCFB.forEach(pauta => {
                if (pauta.classe.designacao == "12ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if ((aluno.estado == "APTO" || aluno.estado == "APTA") & aluno.naoApto == false) { apvMF12CFB++; console.log(aluno) }
                        if (aluno.estado == "APTA") { apvFeminino12CFB++ }
                        if (aluno.estado == "DESISTENTE") { desistidos12MFCFB++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos12FemininoCFB++ }

                    });
                }

            });
            const semApv12MFCFB = matric12ClasseCFB.length - apvMF12CFB - desistidos12MFCFB
            const semApv12FemininoCFB = feminino12CFB.length - apvFeminino12CFB
            matric12ClasseCFBfeminino = feminino12CFB.length
            matric12ClasseCFBapvMF = apvMF12CFB
            matric12ClasseCFBapvFeminino = apvFeminino12CFB
            matric12ClasseCFBsemApvMF = matric12ClasseCFB.length - apvMF12CFB - desistidos12MFCFB
            matric12ClasseCFBsemApvFeminino = feminino12CFB.length - apvFeminino12CFB

            matric12ClasseCFBdesistMF = desistidos12MFCFB
            matric12ClasseCFBdesistFeminino = desistidos12FemininoCFB
            matric12ClasseCFBchegadAoFimMF = matric12ClasseCFB.length - desistidos12MFCFB
            matric12ClasseCFBchegadAoFimFeminino = feminino12CFB.length - desistidos12FemininoCFB

            const totalCFB = {
                mf: matric10ClasseCFB.length + matric11ClasseCFB.length + matric12ClasseCFB.length,
                feminino: matric10ClasseCFBfeminino + matric11ClasseCFBfeminino + matric12ClasseCFBfeminino,
                totalComApMF: matric10ClasseCFBapvMF + matric11ClasseCFBapvMF + matric12ClasseCFBapvMF,
                totalComApFeminino: matric10ClasseCFBapvFeminino + matric11ClasseCFBapvFeminino + matric12ClasseCFBapvFeminino,
                totalSemApMF: matric10ClasseCFBsemApvMF + matric11ClasseCFBsemApvMF + matric12ClasseCFBsemApvMF,
                totalSemApFeminino: matric10ClasseCFBsemApvFeminino + matric11ClasseCFBsemApvFeminino + matric12ClasseCFBsemApvFeminino,
            }

            // return res.send({totalCFB})

            /* Curso de Ciências Económico-Jurídicas */
            /* 10ª Classe CEJ */
            //let matric10ClasseCEJ = 0
            //let feminino10CEJ = 0
            let apvMF10CEJ = 0
            let apvFeminino10CEJ = 0
            let desistidos10MFCEJ = 0
            let desistidos10FemininoCEJ = 0

            let matric10ClasseCEJfeminino = 0
            let matric10ClasseCEJdesistFeminino = 0
            let matric10ClasseCEJchegadAoFimMF = 0
            let matric10ClasseCEJchegadAoFimFeminino = 0
            let matric10ClasseCEJapvMF = 0
            let matric10ClasseCEJapvFeminino = 0
            let matric10ClasseCEJsemApvMF = 0
            let matric10ClasseCEJsemApvFeminino = 0
            let matric10ClasseCEJdesistMF = 0


            // Verificar aproveitamento CE
            pautasFinalCEJ.forEach(pauta => {
                if (pauta.classe.designacao == "10ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF10CEJ++ }
                        if (aluno.estado == "APTA") { apvFeminino10CEJ++ }
                        if (aluno.estado == "DESISTENTE") { desistidos10MFCEJ++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos10FemininoCEJ++ }

                    });
                }

            });
            const semApv10MFCEJ = matric10ClasseCEJ.length - apvMF10CEJ - desistidos10MFCEJ
            const semApv10FemininoCEJ = feminino10CEJ.length - apvFeminino10CEJ
            matric10ClasseCEJfeminino = feminino10CEJ.length
            matric10ClasseCEJapvMF = apvMF10CEJ
            matric10ClasseCEJapvFeminino = apvFeminino10CEJ
            matric10ClasseCEJsemApvMF = matric10ClasseCEJ.length - apvMF10CEJ - desistidos10MFCEJ
            matric10ClasseCEJsemApvFeminino = feminino10CEJ.length - apvFeminino10CEJ - desistidos10FemininoCEJ

            matric10ClasseCEJdesistMF = desistidos10MFCEJ
            matric10ClasseCEJdesistFeminino = desistidos10FemininoCEJ
            matric10ClasseCEJchegadAoFimMF = matric10ClasseCEJ.length - desistidos10MFCEJ
            matric10ClasseCEJchegadAoFimFeminino = feminino10CEJ.length - desistidos10FemininoCEJ




            /* 11ª Classe CE */
            //let matric11ClasseCEJ = []
            //let feminino11CEJ = 0
            let apvMF11CEJ = 0
            let apvFeminino11CEJ = 0
            let desistidos11MFCEJ = 0
            let desistidos11FemininoCEJ = 0

            let matric11ClasseCEJfeminino = 0
            let matric11ClasseCEJdesistFeminino = 0
            let matric11ClasseCEJchegadAoFimMF = 0
            let matric11ClasseCEJchegadAoFimFeminino = 0
            let matric11ClasseCEJapvMF = 0
            let matric11ClasseCEJapvFeminino = 0
            let matric11ClasseCEJsemApvMF = 0
            let matric11ClasseCEJsemApvFeminino = 0
            let matric11ClasseCEJdesistMF = 0



            // Verificar aproveitamento CE
            pautasFinalCEJ.forEach(pauta => {
                if (pauta.classe.designacao == "11ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if (aluno.estado == "APTO" || aluno.estado == "APTA") { apvMF11CEJ++ }
                        if (aluno.estado == "APTA") { apvFeminino11CEJ++ }
                        if (aluno.estado == "DESISTENTE") { desistidos11MFCEJ++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos11FemininoCEJ++ }

                    });
                }

            });
            const semApv11MFCEJ = matric11ClasseCEJ.length - apvMF11CEJ - desistidos11MFCEJ
            const semApv11FemininoCEJ = feminino11CEJ.length - apvFeminino11CEJ
            matric11ClasseCEJfeminino = feminino11CEJ.length
            matric11ClasseCEJapvMF = apvMF11CEJ
            matric11ClasseCEJapvFeminino = apvFeminino11CEJ
            matric11ClasseCEJsemApvMF = matric11ClasseCEJ.length - apvMF11CEJ - desistidos11MFCEJ
            matric11ClasseCEJsemApvFeminino = feminino11CEJ.length - apvFeminino11CEJ - desistidos11FemininoCEJ

            matric11ClasseCEJdesistMF = desistidos11MFCEJ
            matric11ClasseCEJdesistFeminino = desistidos11FemininoCEJ
            matric11ClasseCEJchegadAoFimMF = matric11ClasseCEJ.length - desistidos11MFCEJ
            matric11ClasseCEJchegadAoFimFeminino = feminino11CEJ.length - desistidos11FemininoCEJ



            /* 12ª Classe CE */
            //let matric12ClasseCEJ = []
            //let feminino12CEJ = 0
            let apvMF12CEJ = 0
            let apvFeminino12CEJ = 0
            let naoApvMF12CEJ = 0
            let naoApvFeminino12CEJ = 0
            let desistidos12MFCEJ = 0
            let desistidos12FemininoCEJ = 0

            let matric12ClasseCEJfeminino = 0
            let matric12ClasseCEJdesistFeminino = 0
            let matric12ClasseCEJchegadAoFimMF = 0
            let matric12ClasseCEJchegadAoFimFeminino = 0
            let matric12ClasseCEJapvMF = 0
            let matric12ClasseCEJapvFeminino = 0
            let matric12ClasseCEJsemApvMF = 0
            let matric12ClasseCEJsemApvFeminino = 0
            let matric12ClasseCEJdesistMF = 0


            // Verificar aproveitamento CEJ
            pautasFinalCEJ.forEach(pauta => {
                if (pauta.classe.designacao == "12ª Classe") {
                    pauta.dadosPauta.forEach(aluno => {
                        if ((aluno.estado == "APTO" || aluno.estado == "APTA") & aluno.naoApto == false) { apvMF12CEJ++ }
                        if (aluno.estado == "APTA") { apvFeminino12CEJ++ }
                        if (aluno.naoApto == true) { naoApvMF12CEJ++ }
                        if (aluno.naoApto == true & aluno.genero == "F") { naoApvFeminino12CEJ++ }
                        if (aluno.estado == "DESISTENTE") { desistidos12MFCEJ++ }
                        if (aluno.estado == "DESISTENTE" & aluno.genero == "F") { desistidos12FemininoCEJ++ }

                    });
                }

            });
            //return res.send({ naoApvMF12CEJ })
            //const semApv12MFCEJ = matric12ClasseCEJ.length - apvMF12CEJ - desistidos12MFCEJ
            //const semApv12FemininoCEJ = feminino12CEJ.length - apvFeminino12CEJ
            matric12ClasseCEJfeminino = feminino12CEJ.length
            matric12ClasseCEJapvMF = apvMF12CEJ
            matric12ClasseCEJapvFeminino = apvFeminino12CEJ
            matric12ClasseCEJsemApvMF = naoApvMF12CEJ
            matric12ClasseCEJsemApvFeminino = naoApvFeminino12CEJ

            matric12ClasseCEJdesistMF = desistidos12MFCEJ
            matric12ClasseCEJdesistFeminino = desistidos12FemininoCEJ
            matric12ClasseCEJchegadAoFimMF = matric12ClasseCEJ.length - desistidos12MFCEJ
            matric12ClasseCEJchegadAoFimFeminino = feminino12CEJ.length - desistidos12FemininoCEJ

            const totalCEJ = {
                mf: matric10ClasseCEJ.length + matric11ClasseCEJ.length + matric12ClasseCEJ.length,
                feminino: matric10ClasseCEJfeminino + matric11ClasseCEJfeminino + matric12ClasseCEJfeminino,
                totalComApMF: matric10ClasseCEJapvMF + matric11ClasseCEJapvMF + matric12ClasseCEJapvMF,
                totalComApFeminino: matric10ClasseCEJapvFeminino + matric11ClasseCEJapvFeminino + matric12ClasseCEJapvFeminino,
                totalSemApMF: matric10ClasseCEJsemApvMF + matric11ClasseCEJsemApvMF + matric12ClasseCEJsemApvMF,
                totalSemApFeminino: matric10ClasseCEJsemApvFeminino + matric11ClasseCEJsemApvFeminino + matric12ClasseCEJsemApvFeminino,
            }
            //return res.send({totalCEJ})

            const aproveitamentoII = {
                trimestre: trimestre,
                matric10ClasseCH: matric10ClasseCH,
                matric11ClasseCH: matric11ClasseCH,
                matric12ClasseCH: matric12ClasseCH,
                matric10ClasseCHfeminino: matric10ClasseCHfeminino,
                matric10ClasseCHdesistFeminino: matric10ClasseCHdesistFeminino,
                matric10ClasseCHchegadAoFimMF: matric10ClasseCHchegadAoFimMF,
                matric10ClasseCHchegadAoFimFeminino: matric10ClasseCHchegadAoFimFeminino,
                matric10ClasseCHapvMF: matric10ClasseCHapvMF,
                matric10ClasseCHapvFeminino: matric10ClasseCHapvFeminino,
                matric10ClasseCHsemApvMF: matric10ClasseCHsemApvMF,
                matric10ClasseCHsemApvFeminino: matric10ClasseCHsemApvFeminino,
                matric10ClasseCHdesistMF: matric10ClasseCHdesistMF,
                matric11ClasseCHfeminino: matric11ClasseCHfeminino,
                matric11ClasseCHapvMF: matric11ClasseCHapvMF,
                matric11ClasseCHapvFeminino: matric11ClasseCHapvFeminino,
                matric11ClasseCHsemApvMF: matric11ClasseCHsemApvMF,
                matric11ClasseCHsemApvFeminino: matric11ClasseCHsemApvFeminino,
                matric11ClasseCHdesistMF: matric11ClasseCHdesistMF,
                matric11ClasseCHdesistFeminino: matric11ClasseCHdesistFeminino,
                matric11ClasseCHchegadAoFimMF: matric11ClasseCHchegadAoFimMF,
                matric11ClasseCHchegadAoFimFeminino: matric11ClasseCHchegadAoFimFeminino,
                matric12ClasseCHfeminino: matric12ClasseCHfeminino,
                matric12ClasseCHapvMF: matric12ClasseCHapvMF,
                matric12ClasseCHapvFeminino: matric12ClasseCHapvFeminino,
                matric12ClasseCHsemApvMF: matric12ClasseCHsemApvMF,
                matric12ClasseCHsemApvFeminino: matric12ClasseCHsemApvFeminino,
                matric12ClasseCHdesistMF: matric12ClasseCHdesistMF,
                matric12ClasseCHdesistFeminino: matric12ClasseCHdesistFeminino,
                matric12ClasseCHchegadAoFimMF: matric12ClasseCHchegadAoFimMF,
                matric12ClasseCHchegadAoFimFeminino: matric12ClasseCHchegadAoFimFeminino,
                totalCH: totalCH,
                matric10ClasseCFB: matric10ClasseCFB,
                matric11ClasseCFB: matric11ClasseCFB,
                matric12ClasseCFB: matric12ClasseCFB,
                matric10ClasseCFBfeminino: matric10ClasseCFBfeminino,
                matric10ClasseCFBdesistFeminino: matric10ClasseCFBdesistFeminino,
                matric10ClasseCFBchegadAoFimMF: matric10ClasseCFBchegadAoFimMF,
                matric10ClasseCFBchegadAoFimFeminino: matric10ClasseCFBchegadAoFimFeminino,
                matric10ClasseCFBapvMF: matric10ClasseCFBapvMF,
                matric10ClasseCFBapvFeminino: matric10ClasseCFBapvFeminino,
                matric10ClasseCFBsemApvMF: matric10ClasseCFBsemApvMF,
                matric10ClasseCFBsemApvFeminino: matric10ClasseCFBsemApvFeminino,
                matric10ClasseCFBdesistMF: matric10ClasseCFBdesistMF,
                matric11ClasseCFBfeminino: matric11ClasseCFBfeminino,
                matric11ClasseCFBapvMF: matric11ClasseCFBapvMF,
                matric11ClasseCFBapvFeminino: matric11ClasseCFBapvFeminino,
                matric11ClasseCFBsemApvMF: matric11ClasseCFBsemApvMF,
                matric11ClasseCFBsemApvFeminino: matric11ClasseCFBsemApvFeminino,
                matric11ClasseCFBdesistMF: matric11ClasseCFBdesistMF,
                matric11ClasseCFBdesistFeminino: matric11ClasseCFBdesistFeminino,
                matric11ClasseCFBchegadAoFimMF: matric11ClasseCFBchegadAoFimMF,
                matric11ClasseCFBchegadAoFimFeminino: matric11ClasseCFBchegadAoFimFeminino,
                matric12ClasseCFBfeminino: matric12ClasseCFBfeminino,
                matric12ClasseCFBapvMF: matric12ClasseCFBapvMF,
                matric12ClasseCFBapvFeminino: matric12ClasseCFBapvFeminino,
                matric12ClasseCFBsemApvMF: matric12ClasseCFBsemApvMF,
                matric12ClasseCFBsemApvFeminino: matric12ClasseCFBsemApvFeminino,
                matric12ClasseCFBdesistMF: matric12ClasseCFBdesistMF,
                matric12ClasseCFBdesistFeminino: matric12ClasseCFBdesistFeminino,
                matric12ClasseCFBchegadAoFimMF: matric12ClasseCFBchegadAoFimMF,
                matric12ClasseCFBchegadAoFimFeminino: matric12ClasseCFBchegadAoFimFeminino,
                totalCFB: totalCFB,
                matric10ClasseCEJ: matric10ClasseCEJ,
                matric11ClasseCEJ: matric11ClasseCEJ,
                matric12ClasseCEJ: matric12ClasseCEJ,
                matric10ClasseCEJfeminino: matric10ClasseCEJfeminino,
                matric10ClasseCEJdesistFeminino: matric10ClasseCEJdesistFeminino,
                matric10ClasseCEJchegadAoFimMF: matric10ClasseCEJchegadAoFimMF,
                matric10ClasseCEJchegadAoFimFeminino: matric10ClasseCEJchegadAoFimFeminino,
                matric10ClasseCEJapvMF: matric10ClasseCEJapvMF,
                matric10ClasseCEJapvFeminino: matric10ClasseCEJapvFeminino,
                matric10ClasseCEJsemApvMF: matric10ClasseCEJsemApvMF,
                matric10ClasseCEJsemApvFeminino: matric10ClasseCEJsemApvFeminino,
                matric10ClasseCEJdesistMF: matric10ClasseCEJdesistMF,
                matric11ClasseCEJfeminino: matric11ClasseCEJfeminino,
                matric11ClasseCEJapvMF: matric11ClasseCEJapvMF,
                matric11ClasseCEJapvFeminino: matric11ClasseCEJapvFeminino,
                matric11ClasseCEJsemApvMF: matric11ClasseCEJsemApvMF,
                matric11ClasseCEJsemApvFeminino: matric11ClasseCEJsemApvFeminino,
                matric11ClasseCEJdesistMF: matric11ClasseCEJdesistMF,
                matric11ClasseCEJdesistFeminino: matric11ClasseCEJdesistFeminino,
                matric11ClasseCEJchegadAoFimMF: matric11ClasseCEJchegadAoFimMF,
                matric11ClasseCEJchegadAoFimFeminino: matric11ClasseCEJchegadAoFimFeminino,
                matric12ClasseCEJfeminino: matric12ClasseCEJfeminino,
                matric12ClasseCEJapvMF: matric12ClasseCEJapvMF,
                matric12ClasseCEJapvFeminino: matric12ClasseCEJapvFeminino,
                matric12ClasseCEJsemApvMF: matric12ClasseCEJsemApvMF,
                matric12ClasseCEJsemApvFeminino: matric12ClasseCEJsemApvFeminino,
                matric12ClasseCEJdesistMF: matric12ClasseCEJdesistMF,
                matric12ClasseCEJdesistFeminino: matric12ClasseCEJdesistFeminino,
                matric12ClasseCEJchegadAoFimMF: matric12ClasseCEJchegadAoFimMF,
                matric12ClasseCEJchegadAoFimFeminino: matric12ClasseCEJchegadAoFimFeminino,
                totalCEJ: totalCEJ
            }

            const veryAproveitamento = await findAproveitamentoByTrimestreService(trimestre)
            //return res.send("Actualizar")
            if (veryAproveitamento) {
                veryAproveitamento.aproveitamentoII = aproveitamentoII
                const idAp = veryAproveitamento._id
                const aproveitamentoActualizado = await findAproveitamentoAndApdateService(idAp, veryAproveitamento)
                req.flash("success_msg", "Aproveitamento do " + trimestre + " actualizado!")
                return res.redirect("/pedagogico/aproveitamentoTrimestral/IITrimestre")
            }

            const aproveitamento = {
                trimestre: trimestre,
                aproveitamentoII: aproveitamentoII,
                idAno: idAno
            }
            const newAproveitamento = await createAproveitamento(aproveitamento)

            //return res.send({ aproveitamento })
        }

        req.flash('success_msg', 'Aprroveitamento do Segundo trimestre gerado!')
        res.redirect('/pedagogico/aproveitamentoTrimestral/' + routerAprovTrimestral)

    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const actualizarAproveitamento = async (req, res) => {
    try {
        const { trimestre } = req.body
        const veryAproveitamento = await findAproveitamentoByTrimestreService(trimestre)
        let routerAprovTrimestral = ""
        if (trimestre == "Aproveitamento Final do Ano Lectivo") { routerAprovTrimestral = "aproveitaentoFinal" }
        return res.send("Actualizar")
        if (veryAproveitamento) {
            veryAproveitamento.aproveitamentoII = aproveitamentoII
            req.flash("success_msg", "Aproveitamento do " + trimestre + " actualizado!")
            return res.redirect("/pedagogico/aproveitamentoTrimestral/" + routerAprovTrimestral)
        }
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const aproveitamentoTrimestral = async (req, res) => {
    try {
        let trimestre = req.params.trimestre
        if (trimestre == "ITrimestre") { trimestre = "Iº Trimestre" }
        if (trimestre == "IITrimestre") { trimestre = "IIº Trimestre" }
        if (trimestre == "IIITrimestre") { trimestre = "IIIº Trimestre" }
        if (trimestre == "aproveitamentoFinal") { trimestre = "Aproveitamento Final do Ano Lectivo" }
        const estado = 'Activo'
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const idAno = anoAct._id
        let cursos = await findCursosByIdAnoService(idAno)
        cursos.forEach(curso => {
            curso.trimestre = trimestre
        });

        const aproveitamento = await findAproveitamentoByTrimestreService(trimestre)
        //return res.send({aproveitamento})
        /*  
        return res.send({aproveitamento}) */


        res.render('pedagogico/aproveitamentoTrimestral', { aproveitamento, cursos, trimestre })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const aproveitamentoCurso = async (req, res) => {
    try {
        const { curso, trimestre, idCurso } = req.body
        const estado = 'Activo'
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const idAno = anoAct._id
        const tdAlunos = await findAlunosByIdAnoService(idAno)
        const tdNotas = await findAllNotasDisciplina()

        let cursoCH = ""
        let cursoCFB = ""
        let cursoCEJ = ""

        let aproveitamento = await findAproveitamentoByTrimestreService(trimestre)
        aproveitamento = aproveitamento.aproveitamentoII

        //CONFERIR MATRICULADOS E APROVEITAMENDO POR CURSOS
        // CURSO CH
        if (curso == 'Curso de Ciências Humanas') {
            cursoCH = "Curso de Ciências Humanas"

            return res.render('pedagogico/relEstatistico', { aproveitamento, cursoCH, trimestre })
        }

        if (curso == 'Curso de Ciências Económico-Jurídicas') {
            cursoCEJ = 'Curso de Ciências Económico-Jurídicas'
            return res.render('pedagogico/relEstatistico', { aproveitamento, cursoCEJ, trimestre })
        }


        if (curso == 'Curso de Ciências Físicas e Biológicas') {
            cursoCFB = 'Curso de Ciências Físicas e Biológicas'
            return res.render('pedagogico/relEstatistico', { aproveitamento, cursoCFB, trimestre })
        }

        if (curso == 'Todos Cursos') {
            /* TODOS CURSOS */
            let aproveitamento = await findAproveitamentoByTrimestreService(trimestre)
            aproveitamento = aproveitamento.aproveitamentoII
            //return res.send({aproveitamento})

            res.render('pedagogico/relEstatisticoTD', { aproveitamento, trimestre })
        }


    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const outrasOpcoes = async (req, res) => {
    try {
        res.render('pedagogico/maisOpcoes')
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const classificacoesTrimestral = async (req, res) => {
    try {

        const estado = 'Activo'
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const cursos = await findCursosByIdAnoService(anoAct._id)

        res.render('pedagogico/classificacoesTrimestral', { cursos })

    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })

    }
}
export const classificarMedia = async (req, res) => {
    try {
        const { media, trimestre, curso } = req.body

        let descTrimestre = ''
        let mediaSelect = 0
        if (media == 'doze') { mediaSelect = 12 }
        if (media == 'treze') { mediaSelect = 13 }
        if (media == 'catorze') { mediaSelect = 14 }
        const estado = 'Activo'
        const anoAct = await findAnoLectivoByEstadoService(estado)
        const TDPautas = await findPautasByIdAnoLectivoService(anoAct._id)
        let mediaAlunos = []
        let pautas = []
        let pautaCurso = []

        if (media == 'selecionar' || trimestre == 'selecionar') {
            req.flash('error_msg', 'Erro! Média ou trimestre não selecionados')
            return res.redirect('/pedagogico/classificacoesTrimestral')
        } else {
            if (trimestre == 'trimestre1') {
                const trimest = "Primeiro Trimestre"
                descTrimestre = 'Iº Trimestre'
                TDPautas.forEach(pauta => {
                    if (pauta.trimestre == trimest) { pautas.push(pauta) }
                });
                let numeroOrd = 0

                if (curso == 'selecionar' || curso == 'todos') {
                    pautas.forEach(pauta => {
                        pauta.dadosPauta.forEach(dados => {
                            if (dados.media >= mediaSelect) {
                                numeroOrd += 1
                                dados.numeroOrd = numeroOrd
                                dados.turma = pauta.turma.codigo
                                dados.classe = pauta.classe.designacao
                                dados.curso = pauta.curso.descricao
                                mediaAlunos.push(dados)
                                console.log(dados)
                            }
                        });
                    });
                } else {
                    return res.send({ curso })
                    const pesqCurso = await findCursoByIdService(curso)
                    let descCurso = pesqCurso.descricao
                    const idCurso = pesqCurso._id
                    if (descCurso == 'Curso de Ciências Económico-Jurídicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Humanas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Físicas e Biológicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }
                }
                res.render('pedagogico/classificarMedia', { mediaAlunos, descTrimestre })

            }

            if (trimestre == 'trimestre2') {
                const trimest = "Segundo Trimestre"
                descTrimestre = 'IIº Trimestre'
                TDPautas.forEach(pauta => {
                    if (pauta.trimestre == trimest) { pautas.push(pauta) }
                });
                let numeroOrd = 0

                if (curso == 'selecionar' || curso == 'todos') {
                    pautas.forEach(pauta => {
                        pauta.dadosPauta.forEach(dados => {
                            if (dados.media >= mediaSelect) {
                                numeroOrd += 1
                                dados.numeroOrd = numeroOrd
                                dados.turma = pauta.turma.codigo
                                dados.classe = pauta.classe.designacao
                                dados.curso = pauta.curso.descricao
                                mediaAlunos.push(dados)
                                console.log(dados)
                            }
                        });
                    });
                } else {
                    return res.send({ curso })
                    const pesqCurso = await findCursoByIdService(curso)
                    let descCurso = pesqCurso.descricao
                    const idCurso = pesqCurso._id
                    if (descCurso == 'Curso de Ciências Económico-Jurídicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Humanas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Físicas e Biológicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }
                }
                res.render('pedagogico/classificarMedia', { mediaAlunos, descTrimestre })

            }

            if (trimestre == 'trimestre3') {
                const trimest = "Terceiro Trimestre"
                descTrimestre = 'IIIº Trimestre'
                TDPautas.forEach(pauta => {
                    if (pauta.trimestre == trimest) { pautas.push(pauta) }
                });
                let numeroOrd = 0

                if (curso == 'selecionar' || curso == 'todos') {
                    pautas.forEach(pauta => {
                        pauta.dadosPauta.forEach(dados => {
                            if (dados.media >= mediaSelect) {
                                numeroOrd += 1
                                dados.numeroOrd = numeroOrd
                                dados.turma = pauta.turma.codigo
                                dados.classe = pauta.classe.designacao
                                dados.curso = pauta.curso.descricao
                                mediaAlunos.push(dados)
                                console.log(dados)
                            }
                        });
                    });
                } else {
                    return res.send({ curso })
                    const pesqCurso = await findCursoByIdService(curso)
                    let descCurso = pesqCurso.descricao
                    const idCurso = pesqCurso._id
                    if (descCurso == 'Curso de Ciências Económico-Jurídicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Humanas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }

                    if (descCurso == 'Curso de Ciências Físicas e Biológicas') {
                        pautas.forEach(pauta => {
                            if (pauta.curso._id == '' + idCurso) {
                                pautaCurso.push(pauta)
                            }
                        });

                        pautaCurso.forEach(pauta => {
                            pauta.dadosPauta.forEach(dados => {
                                if (dados.media >= mediaSelect) {
                                    numeroOrd += 1
                                    dados.numeroOrd = numeroOrd
                                    dados.turma = pauta.turma.codigo
                                    dados.classe = pauta.classe.designacao
                                    dados.curso = pauta.curso.descricao
                                    mediaAlunos.push(dados)
                                    console.log(dados)
                                }
                            });
                        });
                    }
                }
                res.render('pedagogico/classificarMedia', { mediaAlunos, descTrimestre })

            }

            /* 
                        if (trimestre == 'trimestre2') {
                            const trimest = "Segundo Trimestre"
                            descTrimestre = 'IIº Trimestre'
                            const pautas = await findPautaTDByTrimestre(trimest)
                            let numeroOrd = 0
            
                            if (curso == 'selecionar' || curso == 'todos') {
            
                                pautas.forEach(pauta => {
                                    pauta.dadosPauta.forEach(dados => {
                                        if (dados.media >= mediaSelect) {
                                            numeroOrd += 1
                                            dados.numeroOrd = numeroOrd
                                            dados.turma = pauta.turma.codigo
                                            dados.classe = pauta.classe.designacao
                                            dados.curso = pauta.curso.descricao
                                            mediaAlunos.push(dados)
                                            console.log(dados)
                                        }
                                    });
                                });
                            } else {
            
                                const pesqCurso = await findCursoByIdService(curso)
                                let descCurso = pesqCurso.descricao
                                const idCurso = pesqCurso._id
                                if (descCurso == 'Curso de Ciências Económico-Jurídicas') {
                                    pautas.forEach(pauta => {
                                        if (pauta.curso._id == '' + idCurso) {
                                            pautaCurso.push(pauta)
                                        }
                                    });
            
                                    pautaCurso.forEach(pauta => {
                                        pauta.dadosPauta.forEach(dados => {
                                            if (dados.media >= mediaSelect) {
                                                numeroOrd += 1
                                                dados.numeroOrd = numeroOrd
                                                dados.turma = pauta.turma.codigo
                                                dados.classe = pauta.classe.designacao
                                                dados.curso = pauta.curso.descricao
                                                mediaAlunos.push(dados)
                                                console.log(dados)
                                            }
                                        });
                                    });
                                }
            
                                if (descCurso == 'Curso de Ciências Humanas') {
                                    pautas.forEach(pauta => {
                                        if (pauta.curso._id == '' + idCurso) {
                                            pautaCurso.push(pauta)
                                        }
                                    });
            
                                    pautaCurso.forEach(pauta => {
                                        pauta.dadosPauta.forEach(dados => {
                                            if (dados.media >= mediaSelect) {
                                                numeroOrd += 1
                                                dados.numeroOrd = numeroOrd
                                                dados.turma = pauta.turma.codigo
                                                dados.classe = pauta.classe.designacao
                                                dados.curso = pauta.curso.descricao
                                                mediaAlunos.push(dados)
                                                console.log(dados)
                                            }
                                        });
                                    });
                                }
            
                                if (descCurso == 'Curso de Ciências Físicas e Biológicas') {
                                    pautas.forEach(pauta => {
                                        if (pauta.curso._id == '' + idCurso) {
                                            pautaCurso.push(pauta)
                                        }
                                    });
            
                                    pautaCurso.forEach(pauta => {
                                        pauta.dadosPauta.forEach(dados => {
                                            if (dados.media >= mediaSelect) {
                                                numeroOrd += 1
                                                dados.numeroOrd = numeroOrd
                                                dados.turma = pauta.turma.codigo
                                                dados.classe = pauta.classe.designacao
                                                dados.curso = pauta.curso.descricao
                                                mediaAlunos.push(dados)
                                                console.log(dados)
                                            }
                                        });
                                    });
                                }
                            }
                            res.render('pedagogico/classificarMedia', { mediaAlunos, descTrimestre })
            
                        }
             */
        }

    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })

    }
}

export const pesquisarMinipautas = async (req, res) => {
    try {
        const { tipoPesquisa, descPesquisa } = req.body
        let resultado = []
        //const tdMinipautas = await findAllMinipautasService()

        //res.send({tdMinipautas})
        if (tipoPesquisa == "nomeMini") {
            resultado = await findMiniputasByNomeService(descPesquisa)
        } else if (tipoPesquisa == "nomeProfe") {
            const tdMinipautas = await findAllMinipautasService()
            tdMinipautas.forEach(minipauta => {
                if (minipauta.idProfessor.nome == descPesquisa) {
                    console.log({ minipauta })
                    resultado.push(minipauta)
                }
            });


        }

        //res.send({resultado})
        res.render('pedagogico/pesqMinipauta', { resultado })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const conselhoDeNotas = async (req, res) => {
    try {

        const idPresidente = req.params.id
        const turma = await findTurmaByIdPresidente(idPresidente)
        const presidente = await findFuncionariosByIdService(idPresidente)
        //return res.send({presidente})
        const idTurma = turma._id
        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const tdPautas = await findPautaByIdTurma(idTurma)// Pautas de todos anos
        const pautas = [] // Pautas deste ano
        tdPautas.forEach(pauta => {
            if (pauta.anoLectivo._id == dadosTurma.idAno) { pautas.push(pauta) }
        });

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        let pautaF = []
        let veriFyPautaFDoConselho = []

        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }

        //return res.send({classeExame})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        let pauataFinalConselhada = false
        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome
                    const estado = dado.estado

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media, "estado": estado }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }

            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome
                    const estado = dado.estado
                    let naoApto = false
                    let desistente = false
                    let recurso = false

                    if (estado == "N/APTO" || estado == "N/APTA") { naoApto = true }
                    if (estado == "DESISTENTE") { desistente = true }
                    if (estado == "RECURSO") { recurso = true }

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media, "estado": estado, "naoApto": naoApto, "recurso": recurso, "desistente": desistente }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                //idPautaFin = pauta._id
                idPautaFin = "pauta._id"

            }
            //Fim Pauta final
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                veriFyPautaFDoConselho = pauta
                idPautaFinConselhada = pauta._id
                /* if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true } */
                if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

            }
            //Fim Pauta final Conselhada
        });
        if (pauataFinalConselhada) {
            //idPautaFin = "Provisório"
            const pautaFConselhada = veriFyPautaFDoConselho
            const membrosConselho = pautaFConselhada.membrosConselho[0]
            // return res.send({veriFyPautaFDoConselho})
            return res.render('pedagogico/pautaFinalConselho', { disciplinasOrdenadas, disciplinas, dadosTurma, pautaFConselhada, anoLectivo, idPautaFin, presidente, idPresidente, membrosConselho, classeExame })
        }
        //return res.send({pautaFDoConselho})
        if (veriFyPautaFDoConselho.length != 0) {

            const pautaFDoConselho = veriFyPautaFDoConselho
            //return res.send({ pautaFDoConselho })
            //pautaFDoConselho = novaPautaCriada
            idPautaFinConselhada = pautaFDoConselho._id

            pautaFDoConselho.dadosPauta.forEach(aluno => {
                aluno.idPauta = idPautaFinConselhada
            });
            const membrosConselho = pautaFDoConselho.membrosConselho[0]
            res.render('pedagogico/iniciarConselhoDeNota', { pautaFDoConselho, membrosConselho, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente, classeExame })
        } else {
            //console.log("Não criou outra Pauta.....................") 
            /* const pautaFDoConselho = veriFyPautaFDoConselho
            pautaFDoConselho.dadosPauta.forEach(aluno => {
                aluno.idPauta = idPautaFinConselhada
            }); */
            //return res.send({pautaF})

            res.render('pedagogico/conselhoDeNota', { disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente, classeExame })
            // res.render('pedagogico/iniciarConselhoDeNota', { pautaFDoConselho, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente })
        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const iniciarConselhoDeNotas = async (req, res) => {
    try {
        const { idPresidente, nomePresidente, membro1, membro2, membro3 } = req.body
        //return res.send({idPresidente, nomePresidente, membro1, membro2, membro3})
        const turma = await findTurmaByIdPresidente(idPresidente)
        const presidente = await findFuncionariosByIdService(idPresidente)
        const idTurma = turma._id
        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const tdPautas = await findPautaByIdTurma(idTurma)// Pautas de todos anos
        const pautas = [] // Pautas deste ano
        tdPautas.forEach(pauta => {
            if (pauta.anoLectivo._id == dadosTurma.idAno) { pautas.push(pauta) }
        });

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []
        let veriFyPautaFDoConselho = []


        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        //return res.send({classeExame})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false
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
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }

            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    console.log({ dado })
                    numOrdem += 1
                    const idAluno = dado.idAluno
                    const nome = dado.nome
                    const estado = dado.estado
                    let naoApto = false
                    let genero = dado.genero

                    if (estado == "N/APTO" || estado == "N/APTA") { naoApto = true }

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, "idAluno": idAluno, 'nome': nome, "genero": genero, "notas": notas, "media": media, "idTurma": idTurma, "estado": estado, "naoApto": naoApto }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final

            //Se for pauta final Conselhada
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                veriFyPautaFDoConselho = pauta
                idPautaFinConselhada = pauta._id
                if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

            }
            //Fim Pauta final Conselhada
        });
        //return res.send({pautaF})
        if (veriFyPautaFDoConselho.length == 0) {

            const novaPautaFinal = {
                trimestre: "Pauta Final Conselhada",
                discsTurma: disciplinas,
                anoLectivo: turma.idAno,
                turma: idTurma,
                classe: turma.idClasse,
                curso: turma.idCurso,
                dadosPauta: pautaF,
                notasDisciplina: null,
                conselho: "Conselhando",
                membrosConselho: { idPresidente, nomePresidente, membro1, membro2, membro3 }
            }
            //return res.send({novaPautaFinal})

            const pautaFDoConselhoCriada = await createPautaService(novaPautaFinal)
            const idP = pautaFDoConselhoCriada._id
            const pautaFDoConselho = await findPautaByIdService(idP)

            //return res.send({pautaFDoConselho})
            //pautaFDoConselho = novaPautaCriada
            idPautaFinConselhada = pautaFDoConselho._id

            pautaFDoConselho.dadosPauta.forEach(aluno => {
                aluno.idPauta = idPautaFinConselhada
            });

            res.render('pedagogico/iniciarConselhoDeNota', { pautaFDoConselho, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente, classeExame })
        } else {
            console.log("Não criou outra Pauta.....................")
            const pautaFDoConselho = veriFyPautaFDoConselho
            pautaFDoConselho.dadosPauta.forEach(aluno => {
                aluno.idPauta = idPautaFinConselhada
            });
            //return res.send({membrosConselho})

            res.render('pedagogico/iniciarConselhoDeNota', { pautaFDoConselho, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente, classeExame })
        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const iniciarConselhoDeNotasComAdmin = async (req, res) => {
    try {
        const { idPresidente, nomePresidente, membro1, membro2, membro3, idTurma } = req.body
        //return res.send({idPresidente, nomePresidente, membro1, membro2, membro3})
        const turma = await findTurmaByIdService(idTurma)
        const presidente = membro1
        //const idTurma = turma._id
        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const tdPautas = await findPautaByIdTurma(idTurma)// Pautas de todos anos
        const pautas = [] // Pautas deste ano
        tdPautas.forEach(pauta => {
            if (pauta.anoLectivo._id == dadosTurma.idAno) { pautas.push(pauta) }
        });

        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []
        let veriFyPautaFDoConselho = []


        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        //return res.send({classeExame})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        let idPautaFinConselhada = ''
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false
        //return res.send({pautas})
        pautas.forEach(pauta => {

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    console.log({ dado })
                    numOrdem += 1
                    const idAluno = dado.idAluno
                    const nome = dado.nome
                    const estado = dado.estado
                    let naoApto = false
                    let genero = dado.genero

                    if (estado == "N/APTO" || estado == "N/APTA") { naoApto = true }

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, "idAluno": idAluno, 'nome': nome, "genero": genero, "notas": notas, "media": media, "idTurma": idTurma, "estado": estado, "naoApto": naoApto }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final

            //Se for pauta final Conselhada
            if (pauta.trimestre == 'Pauta Final Conselhada') {
                veriFyPautaFDoConselho = pauta
                idPautaFinConselhada = pauta._id
                if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

            }
            //Fim Pauta final Conselhada
        });
        //return res.send({pautaF})
        if (veriFyPautaFDoConselho.length == 0) {

            const novaPautaFinal = {
                trimestre: "Pauta Final Conselhada",
                discsTurma: disciplinas,
                anoLectivo: turma.idAno,
                turma: idTurma,
                classe: turma.idClasse,
                curso: turma.idCurso,
                dadosPauta: pautaF,
                notasDisciplina: null,
                conselho: "Finalizado",
                membrosConselho: { idPresidente, nomePresidente, membro1, membro2, membro3 }
            }
            //return res.send({novaPautaFinal})

            const pautaFDoConselhoCriada = await createPautaService(novaPautaFinal)

            req.flash('success_msg', 'Pauta Final do Conselho de Nota criada com sucesso!')
            return res.redirect('/pedagogico/pauta3/' + idTurma)

        } else {

            return res.send("Não criou outra pauta!")
        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const conselhoIndividual = async (req, res) => {
    try {
        const { idPauta, idTurma, numOrdemC } = req.body
        /* const turma = await findTurmaByIdPresidente(idPresidente)
        const presidente = await findFuncionariosByIdService(idPresidente)
        const idTurma = turma._id */
        const pautas = await findPautaByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        // return res.send({ idPauta, idTurma, numOrdemC})



        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        //return res.send({classeExame})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''
        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }

            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media, "idTurma": idTurma }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final
        });

        let pautaFDoConselho = await findPautaByIdService(idPauta)
        //return res.send({pautaFDoConselho})

        //disciplinasOrdenadas = pautaFDoConselho.discsTurma
        let notasIndividual = []
        pautaFDoConselho.dadosPauta.forEach(aluno => {
            if (aluno.numOrdem == numOrdemC) {
                aluno.idPauta = idPauta
                notasIndividual = aluno
            }

        });

        // const notasIndividual = pautaF.find(function (numOrdem) { return numOrdem === numOrdemC; });
        //return res.send({notasIndividual})


        res.render('pedagogico/conselhoIndividual', { idPresidente, notasIndividual, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, classeExame })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const salvarConselhoIndividual = async (req, res) => {
    try {
        /* const turma = await findTurmaByIdPresidente(idPresidente)
        const presidente = await findFuncionariosByIdService(idPresidente)
        const idTurma = turma._id */
        const { idTurma, numOrdemC, idPauta, presidente } = req.body
        const mediasT1 = req.body.mt1
        const mediasT2 = req.body.mt2
        const mediasT3 = req.body.mt3
        let pautas = await findPautaByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        let nomeAluno = ""
        //return res.send({idPauta})



        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        let pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const descCurso = curso.descricao
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }

        //return res.send({classeExame})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''

        pautas.forEach(pauta => {

            //Se for Primeiro trimestre
            if (pauta.trimestre == 'Primeiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT1.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT1 = pauta._id

            }

            //Fim do primeiro trimestre

            //Se for Segundo trimestre
            if (pauta.trimestre == 'Segundo Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT2.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT2 = pauta._id

            }//Fim do II Trimestre

            //Se for Terceiro trimestre
            if (pauta.trimestre == 'Terceiro Trimestre') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    const nome = dado.nome

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, 'nome': nome, "notas": notas, "media": media }

                    pautaT3.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaT3 = pauta._id

            }
            //Fim do III Trimestre

            //Se for pauta final
            if (pauta.trimestre == 'Pauta Final') {
                let numOrdem = 0
                let alunos = []
                pauta.dadosPauta.forEach(dado => {
                    numOrdem += 1
                    nomeAluno = dado.nome
                    const nome = dado.nome
                    const idAluno = dado.idAluno

                    const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                    const notas = dadosOrganizado[0]
                    disciplinasOrdenadas = dadosOrganizado[1]
                    console.log({ disciplinasOrdenadas })
                    const media = dado.media
                    const aluno = { "numOrdem": numOrdem, "idAluno": idAluno, 'nome': nome, "notas": notas, "media": media, "idTurma": idTurma }

                    pautaF.push(aluno)
                });
                disciplinas = pauta.discsTurma
                idPautaFin = pauta._id

            }
            //Fim Pauta final
        });
        let notasIndividual = []

        /* APLICANDO NOTAS DO CONSELHO */
        let pautaFDoConselho = await findPautaByIdService(idPauta)
        const membrosConselho = pautaFDoConselho.membrosConselho[0]
        //return res.send({membrosConselho})
        let idexConselho = 0

        pautaFDoConselho.dadosPauta.forEach(aluno => {
            const genero = aluno.genero

            if (aluno.numOrdem == numOrdemC) {
                let disciplinasChaves = []

                aluno.notas.forEach(notas => {
                    console.log({ notas })
                    /* Se for uma classe de exame, aplicar a regra das classe de exames */
                    if (classeExame) {

                        if (notas.medDosTrimestes || notas.medDosTrimestes == undefined || notas.medDosTrimestes == null || notas.medDosTrimestes == 0) { notas.medDosTrimestes = parseFloat(mediasT1[idexConselho]) }
                        if (notas.examePF || notas.examePF == undefined || notas.examePF == null || notas.examePF == 0) { notas.examePF = parseFloat(mediasT2[idexConselho]) }

                        const mf = Math.round((notas.medDosTrimestes * 0.4) + (notas.examePF * 0.6))
                        notas.cf = mf

                        if (notas.medDosTrimestes < 10) { notas.negativa1 = 'Sim' } else { notas.negativa1 = '' }
                        if (notas.examePF < 10) { notas.negativa2 = 'Sim' } else { notas.negativa2 = '' }
                        if (notas.cf < 10) { notas.negativa3 = 'Sim' } else { notas.negativa3 = '' }

                        const discipMediaFinal = { "disciplina": notas.disciplina, "mf": mf }
                        disciplinasChaves.push(discipMediaFinal)


                    } else {

                        if (notas.mt1 || notas.mt1 == undefined || notas.mt1 == null || notas.mt1 == 0) { notas.mt1 = notas.mt1 = parseFloat(mediasT1[idexConselho]) }
                        if (notas.mt2 || notas.mt2 == undefined || notas.mt2 == null || notas.mt2 == 0) { notas.mt2 = notas.mt2 = parseFloat(mediasT2[idexConselho]) }
                        if (notas.mt3 || notas.mt3 == undefined || notas.mt3 == null || notas.mt3 == 0) { notas.mt3 = notas.mt3 = parseFloat(mediasT3[idexConselho]) }

                        const mf = Math.round((notas.mt1 + notas.mt2 + notas.mt3) / 3)
                        notas.mf = mf

                        if (notas.mt1 < 10) { notas.negativa1 = 'Sim' } else { notas.negativa1 = '' }
                        if (notas.mt2 < 10) { notas.negativa2 = 'Sim' } else { notas.negativa2 = '' }
                        if (notas.mt3 < 10) { notas.negativa3 = 'Sim' } else { notas.negativa3 = '' }
                        if (notas.mf < 10) { notas.negativa4 = 'Sim' } else { notas.negativa4 = '' }

                        const discipMediaFinal = { "disciplina": notas.disciplina, "mf": mf }
                        disciplinasChaves.push(discipMediaFinal)
                    }

                    idexConselho++
                });

                let estado = estadoAprovadoReprovado(disciplinasChaves, descCurso, genero, classeExame)
                if (estado == "APTO" || estado == "APTA") { aluno.naoApto = false }
                aluno.estado = estado
                //aluno.notas = {notas: aluno.notas}
                notasIndividual = aluno
                //console.log(aluno)

            }

        });
        //return res.send({notasIndividual})
        await findPautaByIdAndUpdateServece(idPauta, pautaFDoConselho)


        /* Trocando as notas antigas pelas actuais do conselho */
        /*    pautas.forEach(pauta => {
               //Se for pauta final
               if (pauta.trimestre == 'Pauta Final') {
                   pautas.pauta = pautaF
               }
               //Fim Pauta final
           }); */
        // const notasIndividual = pautaF.find(function (numOrdem) { return numOrdem === numOrdemC; });

        /*   let pautaParaAct = await findPautaByIdService(idPautaFin)
          const dados = pautaParaAct.dadosPauta
          pautaParaAct.dadosPauta.forEach(dados => {
              //console.log(dados.idAluno)
              if(dados.idAluno == ""+notasIndividual.idAluno){
                  dados.notas = notasIndividual.notas
                  console.log({dados})
              }
          }); */
        //pautaParaAct.dadosPauta = pautaF
        //const pautasActualizada = await findPautaByIdAndUpdateServece(idPautaFin, pautaParaAct)
        //return res.send({pautaParaAct})
        // req.flash("success_msg", "Alteração confirmada para o aluno " + nomeAluno)
        res.render('pedagogico/salvoConselho', { membrosConselho, idPautaFin, idTurma })
        // res.render('pedagogico/iniciarConselhoDeNota', { pautaFDoConselho, disciplinasOrdenadas, disciplinas, dadosTurma, pautaF, anoLectivo, idPautaFin, presidente, idPresidente })


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const finalizarConseNotas = async (req, res) => {
    try {
        const { idPauta, idTurma } = req.body
        let pauta = await findPautaByIdService(idPauta)
        pauta.conselho = "Finalizado"
        await findPautaByIdAndUpdateServece(idPauta, pauta)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        //return res.send("Conselho de Notas encerrado com sucesso")
        req.flash("success_msg", "Conselho de Notas encerrado com sucesso")
        res.redirect("/pedagogico/conselhoDeNotas/" + idPresidente)
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const reabrirConselho = async (req, res) => {
    try {
        const { idPauta, idTurma } = req.body
        //return res.send({ idPauta, idTurma })
        let pauta = await findPautaByIdService(idPauta)
        pauta.conselho = "Conselhando"
        await findPautaByIdAndUpdateServece(idPauta, pauta)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        //return res.send("Conselho de Notas encerrado com sucesso")
        req.flash("success_msg", "Conselho de Notas Raberto para esta turma...")
        res.redirect("/pedagogico/pauta3/" + idTurma)
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const aplicarPrimeiroConseAutomatico = async (req, res) => {
    try {
        const { idPautaF, idTurma } = req.body
        //return res.send({idPauta, idPautaF, idTurma})
        if (!idPautaF) {
            req.flash("error_msg", "Erro! A Pauta Final ainda não foi gerada!")
            return res.redirect("/pedagogico/pauta3/" + idTurma)
        }
        let qtAlunos = 0
        let pauta = await findPautaByIdService(idPautaF)
        //return res.send({pauta})
        pauta.dadosPauta.forEach(aluno => {

            let achado = false
            aluno.notas.notas.forEach(nota => {
                if (nota.mt1 < 10 && nota.mt1 >= 7) { nota.mt1 = 10; achado = true }
                if (nota.mt2 < 10 && nota.mt2 >= 7) { nota.mt2 = 10; achado = true }
                if (nota.mt3 < 10 && nota.mt3 >= 7) { nota.mt3 = 10; achado = true }

                if (nota.mt1 < 10) { nota.negativa1 = 'Sim' }
                if (nota.mt2 < 10) { nota.negativa2 = 'Sim' }
                if (nota.mt3 < 10) { nota.negativa3 = 'Sim' }

                //nota.negativa1 = ""; nota.negativa2 = ""; nota.negativa3 = ""; nota.negativa4 = "";
                //Calcualar media
                nota.mf = Math.round((nota.mt1 + nota.mt2 + nota.mt3) / 3)
                if (nota.mf < 10) { nota.negativa4 = 'Sim' }

                //Se a média final for 8 ou 9, aplicar a regra do conselho de notas
                if (nota.mf == 8 || nota.mf == 9) {
                    nota.mt1 = 10; nota.mt2 = 10; nota.mt3 = 10; nota.mf = 10; achado = true; nota.negativa1 = ""; nota.negativa2 = ""; nota.negativa3 = ""; nota.negativa4 = "";
                }


            });

            /* Actualizar estado - Apto ou não Apto */
            pauta.dadosPauta.forEach(aluno => {
                let apto = true
                aluno.notas.notas.forEach(nota => {
                    if (nota.mf < 10) {
                        apto = false
                    }
                });
                if (apto && aluno.genero == "M") { aluno.estado = "APTO"; aluno.aprovar = "true"; aluno.reprovar = "" }
                if (apto && aluno.genero == "F") { aluno.estado = "APTA"; aluno.aprovar = "true"; aluno.reprovar = "" }

            });
            if (achado) { qtAlunos++ }



        });
        //return res.send({pauta})
        if (qtAlunos === 0) {
            pauta.conselhoAutomaticoAplicado = true
            await findPautaByIdAndUpdateServece(idPautaF, pauta)
            req.flash("error_msg", "Não ha aluno na condição especcificada nesta turma!")
            res.redirect("/pedagogico/pauta3/" + idTurma)
        } else {

            pauta.conselhoAutomaticoAplicado = true
            await findPautaByIdAndUpdateServece(idPautaF, pauta)
            //return res.send({pauta})
            req.flash("success_msg", "Conselho aplicado com exito a " + qtAlunos + "!")
            res.redirect("/pedagogico/pauta3/" + idTurma)
        }

        /* const idTurma =""
        pauta.conselho = "Finalizado"
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        req.flash("success_msg", "Conselho de Notas encerrado com sucesso")
        */
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}
export const aplicarConseAutomatico = async (req, res) => {
    try {
        const { idPauta, idPautaF, idTurma } = req.body
        //return res.send({idPauta, idPautaF, idTurma})
        let qtAlunos = 0
        let pauta = await findPautaByIdService(idPauta)
        pauta.dadosPauta.forEach(aluno => {
            if (aluno.estado == "APTO" || aluno.estado == "APTA") {
                let achado = false
                aluno.notas.forEach(nota => {
                    if (nota.mt1 < 10) { nota.mt1 = 10; achado = true }
                    if (nota.mt2 < 10) { nota.mt2 = 10; achado = true }
                    if (nota.mt3 < 10) { nota.mt3 = 10; achado = true }
                    nota.negativa1 = ""; nota.negativa2 = ""; nota.negativa3 = ""; nota.negativa4 = "";
                    //Calcualar media
                    nota.mf = Math.round((nota.mt1 + nota.mt2 + nota.mt2) / 3)

                });
                if (achado) { qtAlunos++ }

            }

        });
        if (qtAlunos === 0) {

            req.flash("error_msg", "Não ha aluno na condição especcificada nesta turma!")
            res.redirect("/pedagogico/pauta3/" + idTurma)
        } else {

            await findPautaByIdAndUpdateServece(idPauta, pauta)
            //return res.send({pauta})
            req.flash("success_msg", "Conselho aplicado com exito a " + qtAlunos + "!")
            res.redirect("/pedagogico/pauta3/" + idTurma)
        }

        /* const idTurma =""
        pauta.conselho = "Finalizado"
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        req.flash("success_msg", "Conselho de Notas encerrado com sucesso")
        */
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const aprovados = async (req, res) => {
    try {
        const idPauta = req.params.id
        let alunosAprovados = []
        let qtAlunos = 0
        let pauta = await findPautaByIdService(idPauta)
        let ano = await findAnoLectivoById(pauta.anoLectivo)
        let novaOrdem = 0
        let aprovado = false
        let novaClasse = ""
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
        if (pauta.classe.designacao == "10ª Classe") { novaClasse = "11ª Classe" }
        if (pauta.classe.designacao == "11ª Classe") { novaClasse = "12ª Classe" }
        //return res.send({ alunosAprovados })
        res.render("pedagogico/listaAprovados", { titulo, alunosAprovados, ano, novaClasse, pauta })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const editarPauta = async (req, res) => {
    try {
        const idPauta = req.params.id
        let pautaFDoConselho = await findPautaByIdService(idPauta)
        let anoLectivo = await findAnoLectivoById(pautaFDoConselho.anoLectivo)
        anoLectivo = anoLectivo.codigo
        let disciplinasOrdenadas = []
        let disciplinas = pautaFDoConselho.dadosPauta[0].notas
        let dadosTurma = pautaFDoConselho.turma
        let classe = await findClasseByIdService(dadosTurma.idClasse)
        classe = classe.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        let alunosDaTurma = await findAlunosByIdTurma(dadosTurma._id)
        let alunosPraAdicionar = []
        alunosDaTurma.forEach(aluno => {
            let achado = false
            pautaFDoConselho.dadosPauta.forEach(dado => {
                if (aluno.nome === dado.nome) { achado = true }
            });
            if (!achado) { alunosPraAdicionar.push(aluno) }
        });
        //return res.send({alunosPraAdicionar})

        let idPauaFin = ""

        disciplinas.forEach(dado => {
            disciplinasOrdenadas.push({ "disciplina": dado.disciplina })
        });
        pautaFDoConselho.dadosPauta.forEach(aluno => {
            aluno.idPauta = pautaFDoConselho._id

        });
        // return res.send({pautaFDoConselho})


        res.render('pedagogico/editarPauta', { pautaFDoConselho, disciplinasOrdenadas, anoLectivo, disciplinas, dadosTurma, idPauaFin, classeExame, alunosPraAdicionar })


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const pautaIndividual = async (req, res) => {
    try {
        const { idPauta, idTurma, numOrdemC } = req.body

        const turma = await findTurmaByIdService(idTurma)
        //        return res.send({ idPauta, idTurma, numOrdemC})



        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        const pautaF = []

        let pautaFDoConselho = await findPautaByIdService(idPauta)
        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const classe = dadosTurma.idClasse.designacao
        let idPauaFin = ""
        let disciplinasOrdenadas = []
        let disciplinas = pautaFDoConselho.dadosPauta[0].notas
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        //let dadosTurma = pautaFDoConselho.turma
        //return res.send({curso})


        disciplinas.forEach(dado => {
            disciplinasOrdenadas.push({ "disciplina": dado.disciplina })
        });


        //return res.send({pautaFDoConselho})

        //disciplinasOrdenadas = pautaFDoConselho.discsTurma
        let notasIndividual = []
        pautaFDoConselho.dadosPauta.forEach(aluno => {
            if (aluno.numOrdem == numOrdemC) {
                aluno.idPauta = idPauta
                notasIndividual = aluno
            }

        });

        //return res.send({notasIndividual})


        res.render('pedagogico/pautaIndividual', { notasIndividual, disciplinasOrdenadas, disciplinas, dadosTurma, anoLectivo, classeExame })

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const salvarPautaIndividual = async (req, res) => {
    try {

        const { idTurma, numOrdemC, idPauta, presidente } = req.body
        //return res.send({ idTurma, numOrdemC, idPauta, presidente })
        const mediasT1 = req.body.mt1
        const mediasT2 = req.body.mt2
        const mediasT3 = req.body.mt3
        let pautas = await findPautaByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        let nomeAluno = ""



        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        let pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const descCurso = curso.descricao
        const classe = dadosTurma.idClasse.designacao
        let classeExame = false; if (classe == "12ª Classe") { classeExame = true }
        //return res.send({descCurso})
        let disciplinas = []
        let disciplinasOrdenadas = []
        let idPautaT1 = ''
        let idPautaT2 = ''
        let idPautaT3 = ''
        let idPautaFin = ''


        let notasIndividual = []

        /* APLICANDO NOTAS DO CONSELHO */
        let pautaFDoConselho = await findPautaByIdService(idPauta)
        const membrosConselho = pautaFDoConselho.membrosConselho[0]
        //return res.send({membrosConselho})
        let idexConselho = 0

        pautaFDoConselho.dadosPauta.forEach(aluno => {
            if (aluno.genero == "Não definido") { aluno.genero = "M" }
            let genero = aluno.genero


            if (aluno.numOrdem == numOrdemC) {
                let disciplinasChaves = []

                aluno.notas.forEach(notas => {
                    console.log({ notas })
                    if (classeExame) {

                        if (notas.medDosTrimestes || notas.medDosTrimestes == undefined || notas.medDosTrimestes == null || notas.medDosTrimestes == 0) { notas.medDosTrimestes = parseFloat(mediasT1[idexConselho]) }
                        if (notas.examePF || notas.examePF == undefined || notas.examePF == null || notas.examePF == 0) { notas.examePF = parseFloat(mediasT2[idexConselho]) }
                        //if (notas.mt3 || notas.mt3 == undefined || notas.mt3 == null || notas.mt3 == 0) { notas.mt3 = notas.mt3 = parseFloat(mediasT3[idexConselho]) }

                        const mf = Math.round((notas.medDosTrimestes * 0.4) + (notas.examePF * 0.6))
                        notas.cf = mf

                        if (notas.medDosTrimestes < 10) { notas.negativa1 = 'Sim' } else { notas.negativa1 = '' }
                        if (notas.examePF < 10) { notas.negativa2 = 'Sim' } else { notas.negativa2 = '' }
                        if (notas.cf < 10) { notas.negativa3 = 'Sim' } else { notas.negativa3 = '' }

                        const discipMediaFinal = { "disciplina": notas.disciplina, "mf": mf }
                        disciplinasChaves.push(discipMediaFinal)
                    } else {

                        if (notas.mt1 || notas.mt1 == undefined || notas.mt1 == null || notas.mt1 == 0) { notas.mt1 = notas.mt1 = parseFloat(mediasT1[idexConselho]) }
                        if (notas.mt2 || notas.mt2 == undefined || notas.mt2 == null || notas.mt2 == 0) { notas.mt2 = notas.mt2 = parseFloat(mediasT2[idexConselho]) }
                        if (notas.mt3 || notas.mt3 == undefined || notas.mt3 == null || notas.mt3 == 0) { notas.mt3 = notas.mt3 = parseFloat(mediasT3[idexConselho]) }

                        const mf = Math.round((notas.mt1 + notas.mt2 + notas.mt3) / 3)
                        notas.mf = mf

                        if (notas.mt1 < 10) { notas.negativa1 = 'Sim' } else { notas.negativa1 = '' }
                        if (notas.mt2 < 10) { notas.negativa2 = 'Sim' } else { notas.negativa2 = '' }
                        if (notas.mt3 < 10) { notas.negativa3 = 'Sim' } else { notas.negativa3 = '' }
                        if (notas.mf < 10) { notas.negativa4 = 'Sim' } else { notas.negativa4 = '' }

                        const discipMediaFinal = { "disciplina": notas.disciplina, "mf": mf }
                        disciplinasChaves.push(discipMediaFinal)
                    }
                    idexConselho++
                });

                let estado = estadoAprovadoReprovado(disciplinasChaves, descCurso, genero, classeExame)
                if (estado == "APTO" || estado == "APTA") { aluno.naoApto = false }
                aluno.estado = estado
                //aluno.notas = {notas: aluno.notas}
                notasIndividual = aluno
                //console.log(aluno)

            }

        });
        //return res.send({ notasIndividual })
        await findPautaByIdAndUpdateServece(idPauta, pautaFDoConselho)



        const msdDeSucesso = 'Alteração efectuada com êxito!'
        const msdDeSucesso2 = '/pedagogico/editarPauta/' + idPauta
        return res.render('msgSuccess', { msdDeSucesso, msdDeSucesso2 })


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const adicionarAlunoPauta = async (req, res) => {
    try {

        const { idTurma, idPauta, idAluno, genero } = req.body
        //return res.send({ idTurma, idPauta, nome, genero })
        if (idAluno == "") {
            req.flash('error_msg', 'Erro! Selecione o nome do Aluno para adicionar a Pauta')
            return res.redirect('/pedagogico/editarPauta/' + idPauta)
        }
        let alunoNovo = await findAlunoByIdService(idAluno)

        const mediasT1 = req.body.mt1
        const mediasT2 = req.body.mt2
        const mediasT3 = req.body.mt3
        //return res.send({ alunoNovo })
        let pautas = await findPautaByIdTurma(idTurma)
        const turma = await findTurmaByIdService(idTurma)
        const idPresidente = turma.juriPresidente
        let nomeAluno = ""



        let pautaT1 = []
        const pautaT2 = []
        const pautaT3 = []
        let pautaF = []

        const dadosTurma = await findDadosTurmaByIdService(idTurma)
        let pautaFDoConselho = await findPautaByIdService(idPauta)
        const anoLectivo = await findAnoLectivoById(dadosTurma.idAno)
        const curso = await findCursoByIdService(dadosTurma.idCurso)
        const descCurso = curso.descricao
        const classe = dadosTurma.idClasse.designacao
        const idClasse = dadosTurma.idClasse._id
        //return res.send({pautaFDoConselho})

        let disciplinasOrdenadas = []
        let disciplinas = pautaFDoConselho.dadosPauta[0].notas
        //let dadosTurma = pautaFDoConselho.turma

        let notas = []
        let disciplinasChaves = []

        let idexConselho = 0

        disciplinas.forEach(dado => {
            notas.push({ "disciplina": dado.disciplina, "mt1": 0, "mt2": 0, "mt3": 0, "mf": 0, "negativa1": "", "negativa2": "", "negativa3": "", "negativa4": "" })

        });
        notas.forEach(notas => {
            //Sefor clsse de exame colocar outra regra
            /*  */

            if (notas.mt1 || notas.mt1 == undefined || notas.mt1 == null || notas.mt1 == 0) { notas.mt1 = notas.mt1 = parseFloat(mediasT1[idexConselho]) }
            if (notas.mt2 || notas.mt2 == undefined || notas.mt2 == null || notas.mt2 == 0) { notas.mt2 = notas.mt2 = parseFloat(mediasT2[idexConselho]) }
            if (notas.mt3 || notas.mt3 == undefined || notas.mt3 == null || notas.mt3 == 0) { notas.mt3 = notas.mt3 = parseFloat(mediasT3[idexConselho]) }

            const mf = Math.round((notas.mt1 + notas.mt2 + notas.mt3) / 3)
            notas.mf = mf

            if (notas.mt1 < 10) { notas.negativa1 = 'Sim' } else { notas.negativa1 = '' }
            if (notas.mt2 < 10) { notas.negativa2 = 'Sim' } else { notas.negativa2 = '' }
            if (notas.mt3 < 10) { notas.negativa3 = 'Sim' } else { notas.negativa3 = '' }
            if (notas.mf < 10) { notas.negativa4 = 'Sim' } else { notas.negativa4 = '' }

            const discipMediaFinal = { "disciplina": notas.disciplina, "mf": mf }
            disciplinasChaves.push(discipMediaFinal)
            idexConselho++
        });
        let media = 0
        let naoApto = true
        let estado = estadoAprovadoReprovado(disciplinasChaves, descCurso, genero)
        if (estado == "APTO" || estado == "APTA") { naoApto = false }
        let numOrdem = pautaFDoConselho.dadosPauta.length + 1
        //CRIAR USUÁRIO
        //const nomeArray = nome.split(" ")
        //const username0 = nomeArray[0] + '@ndunduma' + turma.codigo + '.' + nomeArray[1]
        //const username = username0.toLocaleLowerCase()
        //const senha = turma.codigo + '-' + nomeArray[1]

        //return res.send({ numOrdem })
        /* const novoUsuario = {
            username: username,
            senha: senha,
            categoria: 'aluno',
            telefone: ''
        } */

        // alunoNovo.nome = alunoNovo.nome + " (Reclamação " + numOrdem + "-" + dadosTurma.codigo + ")"
        /* let novoAluno = {
             nome: nome + " (Reclamação " + numOrdem + "-" + dadosTurma.codigo + ")",
             numBI: "000004",
             idTurma: idTurma,
             classe: classe,
             curso: curso.descricao,
             idClasse: idClasse,
             idCurso: curso._id,
             idAno: dadosTurma.idAno,
             genero: genero,
             foto: '',
             idade: 18,
             pai: 'Não definido',
             mae: 'Não definido',
             escolaAnt: 'Não definido',
             morada: 'Não definido',
             nomeEncarregado: 'Não definido',
             matricula: 'Confirmada',
             } */
        const veryUser = false // await findByUsernameService(username)
        if (veryUser) {
            //return res.send('Não foi possível adicionar aluno. Já ha um usuário com este nome!')
            req.flash('error_msg', 'Não foi possível adicionar aluno. Nome de usuário já existente! (Ao criar conta do aluno)')
            res.redirect('/turmas/turma/' + idTurma)
        } else {

            //const userAluno = await createUserService(novoUsuario)
            //novoAluno.usuario = userAluno._id;
            //await createAlunoService(novoAluno)
            //const alunoCriado = await findAlunoByNomeServce(novoAluno.nome)
            //return res.send({alunoCriado})

            alunoNovo.numOrdem = numOrdem
            alunoNovo.notas = notas
            alunoNovo.media = media
            alunoNovo.estado = estado
            alunoNovo.naoApto = naoApto
            const aluno = { "numOrdem": numOrdem, "idAluno": alunoNovo._id, 'nome': alunoNovo.nome, "genero": alunoNovo.genero, "notas": notas, "media": media, "idTurma": idTurma, "estado": estado, "naoApto": naoApto }
            pautaFDoConselho.dadosPauta.push(aluno)
            const pautaActualuzada = await findPautaByIdAndUpdateServece(idPauta, pautaFDoConselho)
            await findAlunoByIdAndUpdate(idAluno, alunoNovo)

            let msdDeSucesso = 'Novo Aluno dicionado na pauta com êxito!'
            const msdDeSucesso2 = '/pedagogico/editarPauta/' + idPauta
            if (alunoNovo.genero == "F") { msdDeSucesso = 'Nova Aluna dicionada na pauta com êxito!' }
            return res.render('msgSuccess', { msdDeSucesso, msdDeSucesso2 })

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const deleteNotas = async (req, res) => {
    try {

        const { idNotas, idAluno } = req.body
        const notaDisciplia = await findNotaDisciplinaByIdAndDeleteService(idNotas)
        req.flash("success_msg", "Notas deletadas com êxito!")
        return res.redirect("/alunos/ficha/" + idAluno)
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const editarNotasFicha = async (req, res) => {
    try {
        const idAluno = req.params.id
        const aluno = await findAlunoByIdService(idAluno)
        const anoLetActivo = await findAnoLectivoActivoService()

        const user = req.user
        let nivelPrivilegio01 = false
        let nivelPrivilegio02 = false
        let nivelPrivilegio03 = false
        let nivelPrivilegio04 = false
        /* Verificar o nível de privilégio no sistema */
        if (user.privilegio) {
            if (user.privilegio = 1) { nivelPrivilegio01 = true }
            if (user.privilegio = 2) { nivelPrivilegio02 = true }
            if (user.privilegio = 3) { nivelPrivilegio03 = true }
        }
        //return res.send({user})

        /* Veerificar se fez a reconfirmação */
        if (aluno.concluido != "Concluido" || aluno.concluido == undefined) {

            if (!aluno.matriculado && user.categoria == 'aluno') {
                let msdDeErro = "Dirija-se a instituição para efectuar a reconfirmação de Matrícula."
                let msdDeErro2 = "Para ter acesso a sua conta!"
                return res.render("msgError", { msdDeErro, msdDeErro2 })
            }
        }
        // return res.send("Sucess!")

        /* VERIFICAR DADOS DO ALUNO PARA ACTUALIZAR */
        if (aluno.numBI == '000Provisorio' && user.categoria == 'aluno') {
            return res.render('alunos/actualizaDadosAluno', { aluno })
        }

        const turma = await findTurmaByIdService(aluno.idTurma)
        const curso = await findCursoByIdService(turma.idCurso)
        let ano = await findAnoLectivoById(turma.idAno)
        ano = ano.codigo
        let classe = await findClasseByIdService(turma.idClasse)
        classe = classe.designacao
        const usuario = await findUserByIdService(aluno.usuario)
        let notasDisciplina = await findNotasDisciplinaByIdAlunoPerfil(idAluno)
        const tdFaltas = await findFaltaBayIdAlunoService(idAluno)
        const pautas = await findPautaByIdTurma(turma._id)
        let pautaFinal = []
        let dadosFinal = []
        let disciplinas = []
        let mediasDT1Array = []
        let mediasDT2Array = []
        let mediasDT3Array = []
        let somaMediaT1 = 0
        let somaMediaT2 = 0
        let somaMediaT3 = 0

        let pautaFDoConselho = []
        let disciplinasOrdenadas = []
        let idPautaFinConselhada = ""
        let idPautaFin = ""
        let pauataFinalEmConselho = false
        let pauataFinalConselhada = false



        notasDisciplina.forEach(notasD => {
            if (notasD.notas.mt1 >= 0) { mediasDT1Array.push(notasD.notas.mt1) }//Coletando as medias de cadadisciplina - T1
            if (notasD.notas.mt2 >= 0) { mediasDT2Array.push(notasD.notas.mt2) }//Coletando as medias de cadadisciplina - T2
            if (notasD.notas.mt3 >= 0) { mediasDT3Array.push(notasD.notas.mt3) }//Coletando as medias de cadadisciplina - T3

            //Marcando as negativas para destacar com a cor vermelha

            //Iº Trimestre
            if (notasD.notas.av1T1 < 10) { notasD.notas.negativaAv1T1 = 'Negativa' }
            if (notasD.notas.av2T1 < 10) { notasD.notas.negativaAv2T1 = 'Negativa' }
            if (notasD.notas.av3T1 < 10) { notasD.notas.negativaAv3T1 = 'Negativa' }
            if (notasD.notas.mac1 < 10) { notasD.notas.negativaMac1 = 'Negativa' }
            if (notasD.notas.pp1 < 10) { notasD.notas.negativaPP1 = 'Negativa' }
            if (notasD.notas.pt1 < 10) { notasD.notas.negativaPT1 = 'Negativa' }
            if (notasD.notas.mt1 < 10) { notasD.notas.negativaMT1 = 'Negativa' }

            //IIº Trimestre
            if (notasD.notas.av1T2 < 10) { notasD.notas.negativaAv1T2 = 'Negativa' }
            if (notasD.notas.av2T2 < 10) { notasD.notas.negativaAv2T2 = 'Negativa' }
            if (notasD.notas.av3T2 < 10) { notasD.notas.negativaAv3T2 = 'Negativa' }
            if (notasD.notas.mac2 < 10) { notasD.notas.negativaMac2 = 'Negativa' }
            if (notasD.notas.pp2 < 10) { notasD.notas.negativaPP2 = 'Negativa' }
            if (notasD.notas.pt2 < 10) { notasD.notas.negativaPT2 = 'Negativa' }
            if (notasD.notas.mt2 < 10) { notasD.notas.negativaMT2 = 'Negativa' }

            //IIIº Trimestre
            if (notasD.notas.av1T3 < 10) { notasD.notas.negativaAv1T3 = 'Negativa' }
            if (notasD.notas.av2T3 < 10) { notasD.notas.negativaAv2T3 = 'Negativa' }
            if (notasD.notas.av3T3 < 10) { notasD.notas.negativaAv3T3 = 'Negativa' }
            if (notasD.notas.mac3 < 10) { notasD.notas.negativaMac3 = 'Negativa' }
            if (notasD.notas.pp3 < 10) { notasD.notas.negativaPP3 = 'Negativa' }
            if (notasD.notas.pt3 < 10) { notasD.notas.negativaPT3 = 'Negativa' }
            if (notasD.notas.mt3 < 10) { notasD.notas.negativaMT3 = 'Negativa' }

            notasD.nivelPrivilegio01 = nivelPrivilegio01
            notasD.nivelPrivilegio02 = nivelPrivilegio02
            notasD.nivelPrivilegio03 = nivelPrivilegio03

        });


        //Somando as médias
        mediasDT1Array.forEach(media => { somaMediaT1 = somaMediaT1 + media });
        mediasDT2Array.forEach(media => { somaMediaT2 = somaMediaT2 + media });
        mediasDT3Array.forEach(media => { somaMediaT3 = somaMediaT3 + media });
        // mediasDT2Array.forEach(media => { somaMediaT2 = somaMediaT2 + media});
        //Calculando medias de cada trimestre
        const MediaDT1 = Number((somaMediaT1 / mediasDT1Array.length).toFixed(2));
        const MediaDT2 = Number((somaMediaT2 / mediasDT2Array.length).toFixed(2));
        const MediaDT3 = Number((somaMediaT3 / mediasDT3Array.length).toFixed(2));


        //return res.send({notasDisciplina})

        if (pautas) {
            pautas.forEach(pauta => {
                if (pauta.trimestre == 'Pauta Final' & pauta.anoLectivo == anoLetActivo._id) {
                    let numOrdem = 0
                    let alunos = []
                    pauta.dadosPauta.forEach(dado => {
                        numOrdem += 1
                        const idAluno = dado.idAluno
                        const nome = dado.nome
                        const estado = dado.estado
                        let naoApto = false
                        if (estado == "N/APTO" || estado == "N/APTA") { naoApto = true }
                        const dadosOrganizado = notasOrganizadas(dado, curso.descricao, classe)
                        const notas = dadosOrganizado[0]
                        disciplinasOrdenadas = dadosOrganizado[1]
                        console.log({ disciplinasOrdenadas })
                        const media = dado.media
                        /*  
                         const aluno = { "numOrdem": numOrdem, "idAluno": idAluno, 'nome': nome, "notas": notas, "media": media, "idTurma": idTurma, "estado": estado, "naoApto": naoApto }
     
                         pautaFinal.push(aluno) */
                        //return res.send("Sucesso!")
                    });
                    disciplinas = pauta.discsTurma
                    idPautaFin = pauta._id

                }
                if (pauta.trimestre == 'Pauta Final Conselhada' & pauta.anoLectivo == anoLetActivo._id) {
                    pautaFDoConselho = pauta
                    idPautaFinConselhada = pauta._id
                    if (pauta.conselho == "Conselhando") { pauataFinalEmConselho = true }
                    if (pauta.conselho == "Finalizado") { pauataFinalConselhada = true }

                }
            });
        }
        if (!(pautaFDoConselho.length == 0)) {
            // return res.send({pautaFDoConselho})
            pautaFDoConselho.dadosPauta.forEach(dado => {
                if (dado.idAluno == idAluno) {
                    //console.log('Sucesso!')
                    dadosFinal = dado
                }
            });
        }
        //return res.send({notasDisciplina})
        res.render("alunos/fichaAlunoEditar", { aluno, turma, ano, usuario, notasDisciplina, tdFaltas, dadosFinal, disciplinas, MediaDT1, MediaDT2, MediaDT3, disciplinasOrdenadas, pauataFinalEmConselho, curso, nivelPrivilegio01, nivelPrivilegio03 })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Esta função permite que qualquer um usuário com acesso a ficha dos alunos possa actualizar as médias. Sem alterar as notas */
export const actualizarMedias = async (req, res) => {
    try {
        const idAluno = req.params.id
        const aluno = await findAlunoByIdService(idAluno)
        const notas = await findNotasDisciplinaByIdAlunoPerfil(idAluno)
        let classe = aluno.classe
        const anoLetActivo = await findAnoLectivoActivoService()
        //return res.send({notas})
        notas.forEach(async nota => {
            const idNotaAch = nota.notas._id
            await calcularMedias(idNotaAch, classe)
            console.log("Executado!")
        });
        req.flash("success_msg", "Médias actualizadas!")
        return res.redirect("/alunos/ficha/" + idAluno)

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

/* Esta função permite que qualquer o professor actualiza as médias da minipauta se o sisstema falhar no cálculo */
export const actualizarMediasTDAlunos = async (req, res) => {
    try {
        const idMinipauta = req.params.id
        const minipauta = await findMinipautaByIdService(idMinipauta)
        const alunos = minipauta.alunos
        const classe = minipauta.idClasse.designacao
        const anoLetActivo = await findAnoLectivoActivoService()

        //const idAluno = req.params.id
        //const aluno = await findAlunoByIdService(idAluno)

        //return res.send({classe})
        alunos.forEach(async idAluno => {

            const notas = await findNotasDisciplinaByIdAlunoPerfil(idAluno)

            notas.forEach(async nota => {
                const idNotaAch = nota.notas._id
                await calcularMedias(idNotaAch, classe)
                console.log("Executado!")
            });
        });


        req.flash("success_msg", "Médias actualizadas!")
        return res.redirect("/professor/minipauta/" + idMinipauta)

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const vagasDisponiveis = async (req, res) => {
    try {


        let vagas = 0
        let vagas10CH = 0
        let vagas11CH = 0
        let vagas12CH = 0

        let vagas10CFB = 0
        let vagas11CFB = 0
        let vagas12CFB = 0

        let vagas10CEJ = 0
        let vagas11CEJ = 0
        let vagas12CEJ = 0

        let total10 = 0
        let total11 = 0
        let total12 = 0

        const matriculado = true
        let turmas = await findAllTurmasDetService()
        const anoLectivoActual = await findAnoLectivoActivoService()
        const alunosMatriculados = await findAlunosMatriculados(matriculado)

        const cursoCH = await findCursoByDescricaoService("Curso de Ciências Humanas")
        const cursoCFB = await findCursoByDescricaoService("Curso de Ciências Físicas e Biológicas")
        const cursoCEJ = await findCursoByDescricaoService("Curso de Ciências Económico-Jurídicas")

        /* Actualizar a vada em cada turma */
        turmas.forEach(async turma => {
            const alunos = await findAlunosByIdTurma(turma._id)
            let alunosMatriculados = []

            alunos.forEach(aluno => {
                if (aluno.matricula == "Confirmada" && aluno.idAno == anoLectivoActual._id) { alunosMatriculados.push(aluno) }
            });
            turma.totalAlunos = alunosMatriculados.length
            await findTurmaByIdAndUpdService(turma._id, turma)
        });

        turmas.forEach(turma => {
            //console.log(cursoCH._id)
            if (turma.idCurso.descricao == cursoCH.descricao) {

                if (turma.idClasse.designacao == "10ª Classe" && turma.totalAlunos > 0) {
                    vagas10CH = vagas10CH + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "11ª Classe" && turma.totalAlunos > 0) {
                    vagas11CH = vagas11CH + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "12ª Classe" && turma.totalAlunos > 0) {
                    vagas12CH = vagas12CH + 40 - turma.totalAlunos
                }
            }
            
            if (turma.idCurso.descricao == cursoCFB.descricao) {

                if (turma.idClasse.designacao == "10ª Classe" && turma.totalAlunos > 0) {
                    vagas10CFB = vagas10CFB + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "11ª Classe" && turma.totalAlunos > 0) {
                    vagas11CFB = vagas11CFB + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "12ª Classe" && turma.totalAlunos > 0) {
                    vagas12CFB = vagas12CFB + 40 - turma.totalAlunos
                }
            }
            if (turma.idCurso.descricao == cursoCEJ.descricao) {

                if (turma.idClasse.designacao == "10ª Classe" && turma.totalAlunos > 0) {
                    vagas10CEJ = vagas10CEJ + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "11ª Classe" && turma.totalAlunos > 0) {
                    vagas11CEJ = vagas11CEJ + 40 - turma.totalAlunos
                }
                if (turma.idClasse.designacao == "12ª Classe" && turma.totalAlunos > 0) {
                    vagas12CEJ = vagas12CEJ + 40 - turma.totalAlunos
                }
            }

        });

        total10 = vagas10CEJ + vagas10CFB + vagas10CH
        total11 = vagas11CEJ + vagas11CFB + vagas11CH
        total12 = vagas12CEJ + vagas12CFB + vagas12CH


        //return res.send({ vagas10CH })



        res.render("pedagogico/vagasDisponiveis", {vagas10CH, vagas11CH, vagas12CH, vagas10CFB, vagas11CFB, vagas12CFB, vagas10CEJ, vagas11CEJ, vagas12CEJ, total10, total11, total12})

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}










