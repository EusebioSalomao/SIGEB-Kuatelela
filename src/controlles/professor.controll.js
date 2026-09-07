import { calcularMedias } from "../middlewares/professor.middlewere.js"
import aluno from "../models/aluno.modell.js"
import { alunosIntrusosNaMiniPauta, veryNotaFalhas } from "../outrasF/minipauta.OutF.js"
import { fixarLancamentoNaMinipauta, verifySeJaLancouNotas } from "../outrasF/ocorrFunc.js"
import { findAllAlunosService, findAlunoByIdService, findAlunoByNumBIService, findAlunosByClasseService, findAlunosByConcluidoService, findAlunosByIdTurma, findAlunosByMatriculas2Service, findAlunosByMatriculasService, findAlunosMatriculadosService } from "../services/aluno.service.js"
import { findAnoLectivoByEstadoService } from "../services/anoLectivo.service.js"
import { findClasseByIdService } from "../services/classe.service.js"
import { findAllCursosService, findCursoByIdCoordenadorServce } from "../services/curso.service.js"
import { findAllDiscplinasDetService, findAllDiscplinasService, findDisciplinaByIdProfessorServece } from "../services/disciplina.service.js"
import { createFaltaService, findAllFaltasService, findFaltaBayIdAlunoService, findFaltaByIdAndUpdateService, findFaltaByIdService } from "../services/faltas.service.js"
import { findAllFuncionariosService, findFuncionarioByIdAndUpdateService, findFuncionarioByNumBIService, findFuncionariosByIdService, findFuncionariosUser } from "../services/funcionario.service.js"
import { findMinipautaByIdAndUpdateService, findMinipautaByIdService, findMinipautasByIdAnoService, findMinipautasByIdProfessorService } from "../services/minipauta.service.js"
import { createNotaTrimestral, findNotaByIdAndUpdateSerice, findNotasExistentByIdService } from "../services/notas.service.js"
import { createNotasDisciplinaService, findNotasDisciplinaByIdAluno, findNotasDisciplinaByIdMinipautaService } from "../services/notasDisciplina.service.js"
import { findOcorrenciaByEstatoService, findOcorrenciaByIdAndUpdateServece, findSolicitacaoByIdService } from "../services/ocorrencias.service.js"
import { findAllTurmasDetService, findAllTurmasService, findDadosTurmaByIdService, findTurmaByIdDetalhadoService, findTurmaByIdService } from "../services/turma.service.js"
import { findUserByIdService } from "../services/user.service.js"

export const professor = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            req.flash('error_msg', 'Faça login no seu perfil')
            res.redirect('/user/login')
        } else {

            const usuario = user._id
            let desatualizado = false
            const professor = await findFuncionariosUser(usuario)
            if (professor.numBI == null || professor.numBI == undefined || professor.numBI == "") {
                desatualizado = true
            }
            //return res.send({professor})
            const estado = 'Activo'
            const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
            const idAno = anoLectivoActivo._id
            const estadoSolicitacao = 'Pendente'
            const tdOcorrencias = await findOcorrenciaByEstatoService(estadoSolicitacao)
            const ocorrencias = []
            tdOcorrencias.forEach(ocorrencia => {
                professor.turmas.forEach(turma => {
                    if (turma == ocorrencia.turma) {
                        ocorrencias.push(ocorrencia)
                    }
                });
            });
            /* Checar o cargo do professor */
            let juriPresidente = false
            let coordCurso = false
            let curso = []
            if (professor.cargo == "Júri Presidente") { juriPresidente = true }
            if (professor.cargo == "Coordenador de Curso") {
                coordCurso = true
                curso = await findCursoByIdCoordenadorServce(professor._id)
            }

            //return res.send({curso})

            res.render('professor/professor', { professor, ocorrencias, desatualizado, juriPresidente, coordCurso, curso })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const actualizarDados = async (req, res) => {
    try {
        const { idProfessor } = req.body
        const professor = await findFuncionariosByIdService(idProfessor)
        return res.render('admin/funcionarios/actualizDadoF', { professor })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const turmasDoProf = async (req, res) => {
    try {
        const id = req.params.id
        const professor = await findFuncionariosByIdService(id)
        const idTurmas = professor.turmas
        const tdTurmas = await findAllTurmasService()

        const turmas = []
        professor.turmas.forEach(turmP => {
            tdTurmas.forEach(turma => {
                if (turma._id == turmP) {
                    turma.idProfessor = id
                    turmas.push(turma)
                }
            });
        });

        //return res.send({turmas})
        res.render('professor/gerirTurmas', { professor, turmas })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const listaAlunos = async (req, res) => {
    try {
        const idTurma = req.params.id
        const professores = await findAllFuncionariosService()
        let idProfessor = 0


        const alunos = await findAlunosByIdTurma(idTurma)
        const faltas = await findAllFaltasService()
        // return res.send({faltas})
        professores.forEach(professor => {
            professor.turmas.forEach(turma => {
                let numF = 0
                alunos.forEach(aluno => {
                    /* faltas.forEach(fal => {
                        console.log(fal.aluno)
                        if (fal.aluno == aluno._id) {
                            numF += 1
                        }
                        aluno.faltas = numF
                    }); */
                    if (turma == idTurma) {
                        idProfessor = professor._id
                        aluno.idProfessor = idProfessor
                    }
                });
            });
        });
        const disciplinas = await findMinipautasByIdProfessorService(idProfessor)
        let nomeDisciplina = ''
        disciplinas.forEach(element => {
            if (element.idTurma._id == idTurma) {
                nomeDisciplina = element.nomeDisciplina
            }
        });

        /* Tentando contar faltas */
        /*  faltas.forEach(f => {
         alunos.forEach(aluno => {
                 let idP = 0
                 idP = f.professor
                 if(f.aluno == aluno._id){
                     console.log('Testou')
                     if(f.aluno === aluno._id){
                     }
                     console.log(typeof aluno._id)
                     aluno.faltas = f.faltas.length
                 }
             });
         }); */
        //return res.send({ nomeDisciplina })
        res.render('professor/listaAlunos', { alunos })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const miniPautas = async (req, res) => {
    try {
        const id = req.params.id
        const professor = await findFuncionariosByIdService(id)
        const idTurmas = professor.turmas
        const idProfessor = id
        const minipautas = await findMinipautasByIdProfessorService(idProfessor)

        //return res.send({ minipautas })
        res.render('professor/minipautas', { professor, minipautas })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const minipautasCadPAdmin = async (req, res) => {
    try {
        
        const id = req.params.id
        const user = req.user
        const professor = await findFuncionariosByIdService(id)
        const idTurmas = professor.turmas
        const idProfessor = id
        const estado = 'Activo'
        const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
        const idAno = anoLectivoActivo._id
        const tdMinipautas = await findMinipautasByIdAnoService(idAno)
        const minipautas = await findMinipautasByIdProfessorService(idProfessor)
        let disciplinas = await findAllDiscplinasDetService()
        const cursos = await findAllCursosService()
        const turmas = await findAllTurmasDetService()

        disciplinas.forEach(disciplina => {
            cursos.forEach(curso => {
                if (disciplina.idCurso == "" + curso._id) { disciplina.curso = curso.descricao }
            });
        });

        //return res.send({professor})

        /* Falta aprimorar para que não selecione minipauta de outros anos, apenas do ano activo */
        /* tdMinipautas.forEach(minipauta => {
            if (minipauta.idProfessor === professor._id) {
                console.log('É do professor........................')
            }
        }); */


        res.render('pedagogico/minipautas-prof', { user, professor, minipautas, disciplinas, turmas, idAno })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const miniPauta = async (req, res) => {
    try {
        const user = req.user
        let lancarNota = ''
        const id = req.params.id
        let minipauta = await findMinipautaByIdService(id)
        const idTurma = minipauta.idTurma._id
        let alunosTurma = await findAlunosByIdTurma(idTurma)
       
        //const notasDisciplina = await findNotasDisciplinaByIdMinipautaService(id)
        const usuario = minipauta.idProfessor.usuario
        const VeryNotasDisciplina = await findNotasDisciplinaByIdMinipautaService(id)
        let notasDisciplina = await findNotasDisciplinaByIdMinipautaService(id)
        /* VERIFICANDO SE HA NOTAS QUE FALHARAM NO LANÇAMENTO */

        let alunosTurmaFalha = []
        const falhaNota = await veryNotaFalhas(notasDisciplina, minipauta)
        const msgFalhaLancada = falhaNota.message
        const trimestre = falhaNota.trimestre
        const avalDe = falhaNota.avF
        if (falhaNota.trimestre == 'primeiro') {
            if (falhaNota.notaDe == 'avaliacao1') {
                alunosTurmaFalha = falhaNota.alunosSemAV1
            }
            if (falhaNota.notaDe == 'avaliacao2') {
                alunosTurmaFalha = falhaNota.alunosSemAV2
            }
            if (falhaNota.notaDe == 'avaliacao3') {
                alunosTurmaFalha = falhaNota.alunosSemAV3
            }
            if (falhaNota.notaDe == 'mac1') {
                alunosTurmaFalha = falhaNota.alunosSemMac1
            }
            if (falhaNota.notaDe == 'provaDoProfessor') {
                alunosTurmaFalha = falhaNota.alunosSemPP
            }
            if (falhaNota.notaDe == 'provaDoTrimestre') {
                alunosTurmaFalha = falhaNota.alunosSemPT
            }
        }//Falta outros trimestre





        //return res.send({falhaNota})

        /* Numerar */
        let numeroOrd = 1
        let numeroOrd2 = 1
        notasDisciplina.forEach(aluno => {
            aluno.numeroOrd = numeroOrd++
        });
        alunosTurma.forEach(aluno => {
            aluno.numeroOrd = numeroOrd2++
        });


        if (user) {

            if (user._id == usuario) {
                lancarNota = 'Autorisado'
            }
        }

        /* Marcar as negativas a vermelhp */
        notasDisciplina.forEach(notasD => {
            /* I Trimestre */
            if (notasD.notas.av1T1 < 10) { notasD.notas.negativaAv1T1 = 'Negativa' }
            if (notasD.notas.av2T1 < 10) { notasD.notas.negativaAv2T1 = 'Negativa' }
            if (notasD.notas.av3T1 < 10) { notasD.notas.negativaAv3T1 = 'Negativa' }
            if (notasD.notas.mac1 < 10) { notasD.notas.negativaMac1 = 'Negativa' }
            if (notasD.notas.pp1 < 10) { notasD.notas.negativaPP1 = 'Negativa' }
            if (notasD.notas.pt1 < 10) { notasD.notas.negativaPT1 = 'Negativa' }
            if (notasD.notas.mt1 < 10) { notasD.notas.negativaMT1 = 'Negativa' }

            /* II Trimestre */
            if (notasD.notas.av1T2 < 10) { notasD.notas.negativaAv1T2 = 'Negativa' }
            if (notasD.notas.av2T2 < 10) { notasD.notas.negativaAv2T2 = 'Negativa' }
            if (notasD.notas.av3T2 < 10) { notasD.notas.negativaAv3T2 = 'Negativa' }
            if (notasD.notas.mac2 < 10) { notasD.notas.negativaMac2 = 'Negativa' }
            if (notasD.notas.pp2 < 10) { notasD.notas.negativaPP2 = 'Negativa' }
            if (notasD.notas.pt2 < 10) { notasD.notas.negativaPT2 = 'Negativa' }
            if (notasD.notas.mt2 < 10) { notasD.notas.negativaMT2 = 'Negativa' }

            /* III Trimestre */
            if (notasD.notas.av1T3 < 10) { notasD.notas.negativaAv1T3 = 'Negativa' }
            if (notasD.notas.av2T3 < 10) { notasD.notas.negativaAv2T3 = 'Negativa' }
            if (notasD.notas.av3T3 < 10) { notasD.notas.negativaAv3T3 = 'Negativa' }
            if (notasD.notas.mac3 < 10) { notasD.notas.negativaMac3 = 'Negativa' }
            if (notasD.notas.pp3 < 10) { notasD.notas.negativaPP3 = 'Negativa' }
            if (notasD.notas.pt3 < 10) { notasD.notas.negativaPT3 = 'Negativa' }
            if (notasD.notas.mt3 < 10) { notasD.notas.negativaMT3 = 'Negativa' }

            if (notasD.notas.medDosTrimestes < 10) { notasD.notas.negativaMt = 'Negativa' }
            if (notasD.notas.examePF < 10) { notasD.notas.negativaExame = 'Negativa' }
            if (notasD.notas.cf < 10) { notasD.notas.negativaCf = 'Negativa' }

        });
       /*  const intrusos =  */await alunosIntrusosNaMiniPauta(notasDisciplina)
        //console.log(notasDisciplina.length)
        
        //return res.send({minipauta})
        /* Mais restrições no lançamento de notas */
        const privilegio = user.privilegio
        if(user.eAdmin && privilegio < 2){ minipauta.idProfessor.lancamentoDeNotas = false }
        
        res.render('professor/minipauta', {user, privilegio, minipauta, alunosTurma, notasDisciplina, lancarNota, msgFalhaLancada, trimestre, avalDe, falhaNota, alunosTurmaFalha })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const lancarNota = async (req, res) => {
    try {
        const notas = req.body.notas
        const idTurma = req.body.idTurma
        const idProfessor = req.body.idProfessor
        const idMinipauta = req.body.idMinipauta
        const idClasse = req.body.idClasse
        const trimeste = req.body.trimestre
        const notaDe = req.body.notaDe
        const notaString = req.body.nota
        const alunos = await findAlunosByIdTurma(idTurma)
        let classe = await findClasseByIdService(idClasse)
        classe = classe.designacao
        let notaFalsa = false
        /* VERIFICANDO SE A NOTA JA FOI LANÇADA */
        const lancada = await verifySeJaLancouNotas(trimeste, notaDe, idMinipauta)
        const pass = false  // Uma constante temporária só para tirar a trave do lançamento, para usar em vez da costante lancada

        /* Bloquear o lançamento de nota do III trimestre para classe de exame  */
        /* if (notaDe == "provaDoTrimestre" & trimeste == "terceiro" & classe == "12ª Classe") {
            const msdDeErro = "As classes de exames não fazem prova do Terceiro trimestre. Lance apenas as avaliações e a prova do professor do terceiro Trimestre"
            return res.render('msgError', { msdDeErro })

        } */

        if (pass) {
            const msdDeErro = "Ja se fez o lançamento das notas que esta tentando inserir novamente. Certifica-se de que selecionou o Trimestre e a avaliação correctamente. Por favor, volte e tente novamente"
            return res.render('msgError', { msdDeErro })

        } else {
            //return res.send('Ainda não se lançou estas notas!')
            let ind = 0
            const notasCap = []
            notas.forEach(async notaRec => {
                if (notaRec < 0 || notaRec > 20) {
                    notaFalsa = true
                } else {

                    //console.log(alunos[ind].nome+": "+nota)
                    const aluno = { id: alunos[ind]._id, nome: alunos[ind].nome, nota: notaRec }
                    notasCap.push({ aluno })
                    ind++
                }
            });
            /* VERIFICAR SE HA NOTAS MENOR QUE ZERO OU MAIOR QUE 20 */
            if (notaFalsa) {
                const msdDeErro = "Digitaste nota maior que VINTE ou menor que ZERO! VOLTA E VERIFICA, OU LANÇA CORECTAMENTE.\n (Só deves inserir notas entre 0 à 20)"
                return res.render('msgError', { msdDeErro })
            }

            notasCap.forEach(notaC => {
                alunos.forEach(async aluno => {
                    if (aluno._id == notaC.aluno.id) {
                        let idAluno = notaC.aluno.id
                        let notaR = notaC.aluno.nota
                        //console.log('Localizaou: '+notaC.aluno.nome)
                        await lancarNotaExec(idTurma, idAluno, idMinipauta, notaR, idProfessor, idClasse, trimeste, notaDe)

                    }
                });
            });



            /* FIXAR NA MINIPAUTA QUE JÁ SE FEZ LANÇAMENTO DE UMA DETERMINADA NOTA */
            await fixarLancamentoNaMinipauta(trimeste, notaDe, idMinipauta)



            //return res.send('Sucesso!')
            req.flash('success_msg', 'Nota lançada com exito! \nActualiza a pagina por favor.')
            res.redirect("/professor/minipauta/" + idMinipauta)
        }


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const lancarNotaRep = async (req, res) => {
    try {

        const idTurma = req.body.idTurma
        const idProfessor = req.body.idProfessor
        const idMinipauta = req.body.idMinipauta
        const idClasse = req.body.idClasse
        const trimeste = req.body.trimestre
        const notaDe = req.body.notaDe

        const minipauta = await findMinipautaByIdService(idMinipauta)
        const notasDisciplina = await findNotasDisciplinaByIdMinipautaService(idMinipauta)

        let alunosTurmaFalha = []
        let falhaNota = await veryNotaFalhas(notasDisciplina, minipauta)
        const msgFalhaLancada = falhaNota.message
        const trimestre = falhaNota.trimestre
        const avalDe = falhaNota.avF
        if (falhaNota.trimestre == 'primeiro') {
            if (falhaNota.notaDe == 'avaliacao1') {
                alunosTurmaFalha = falhaNota.alunosSemAV1
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'avaliacao1'
                });

            }
            if (falhaNota.notaDe == 'avaliacao2') {
                alunosTurmaFalha = falhaNota.alunosSemAV2
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'avaliacao2'
                });
            }
            if (falhaNota.notaDe == 'avaliacao3') {
                alunosTurmaFalha = falhaNota.alunosSemAV3
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'avaliacao3'
                });
            }
            if (falhaNota.notaDe == 'mac1') {
                alunosTurmaFalha = falhaNota.alunosSemMac1
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'avaliacao3'
                });
            }
            if (falhaNota.notaDe == 'provaDoProfessor') {
                alunosTurmaFalha = falhaNota.alunosSemPP
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'provaDoProfessor'
                });
            }
            if (falhaNota.notaDe == 'provaDoTrimestre') {
                alunosTurmaFalha = falhaNota.alunosSemPT
                alunosTurmaFalha.forEach(aluno => {
                    aluno.trimestre = 'primeiro'
                    aluno.notaDe = 'provaDoTrimestre'
                });
            }
        }//Falta outros trimestre

        // const notaString = req.body.alunosTurmaFalha
        //return res.send({alunosTurmaFalha})

        res.render('professor/repeatLancaNota', { minipauta, falhaNota, alunosTurmaFalha })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const lancarNotaRepSalve = async (req, res) => {
    try {
        const idAluno = req.body.idAluno
        const idProfessor = req.body.idProfessor
        const idMinipauta = req.body.idMinipauta
        const idClasse = req.body.idClasse
        const idTurma = req.body.idTurma

        const trimeste = req.body.trimestre
        const notaDe = req.body.notaDe
        const notaString = req.body.nota
        let nota = parseInt(notaString)

        const notasDisciplina = await findNotasDisciplinaByIdMinipautaService(idMinipauta)
        const notasDoAluno = await findNotasDisciplinaByIdAluno(idAluno)
        //return res.send({notasDoAluno})

        let verifNota = ''
        let notasAchada = ''
        notasDoAluno.forEach(element => {
            if (element.idMinipauta == idMinipauta) {
                verifNota = 'Ja'
                notasAchada = element.notas
            }
        });


        //const xxx = await createNotaTrimestral(testNotas)

        //const verNotasTrim = await findAllNotasTrimSercice()
        if (verifNota == '') {
            //return res.send("O aluno ainda não tem notas nesta discplina")
            let novaNotasDoaluno = {
                aluno: idAluno,
                professor: idProfessor,
                idMinipauta: idMinipauta,
                idClasse: idClasse,
                idTurma: idTurma
            }
            let notaTrimestral = {}
            if (trimeste == 'primeiro') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no primeiro trimestre - av1")
                        notaTrimestral.av1T1 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no primeiro trimestre - av2")
                        notaTrimestral.av2T1 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notaTrimestral.av3T1 = nota

                        break;
                    case "mac1":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notaTrimestral.mac1 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notaTrimestral.pp1 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notaTrimestral.pt1 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')
                        break;
                }
            }
            if (trimeste == 'segundo') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no segungo trimestre - av1")
                        notaTrimestral.av1T2 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no segungo trimestre - av2")
                        notaTrimestral.av2T2 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notaTrimestral.av3T2 = nota

                        break;
                    case "mac2":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notaTrimestral.mac2 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notaTrimestral.pp2 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notaTrimestral.pt2 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }
            if (trimeste == 'terceiro') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no terceiro trimestre - av1")
                        notaTrimestral.av1T3 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no terceiro trimestre - av2")
                        notaTrimestral.av2T3 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notaTrimestral.av3T3 = nota

                        break;
                    case "mac3":
                        //   return res.send("Lançar nota no terceiro trimestre - mac3")
                        notaTrimestral.mac3 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notaTrimestral.pp3 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notaTrimestral.pt3 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }
            if (trimeste == 'outro') {
                switch (notaDe) {
                    case "provaOral":
                        //return res.send("Lançar nota de prova oral, final ou exame")
                        notaTrimestral.pOral = nota
                        break;
                    case "exame":
                        // return res.send("Lançar nota de prova oral, final ou exame")
                        notaTrimestral.examePF = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }
            const notasTrimCread = await createNotaTrimestral(notaTrimestral)
            novaNotasDoaluno.notas = notasTrimCread._id
            const notasDoAlunoCriada = await createNotasDisciplinaService(novaNotasDoaluno)
            //return res.send('Sucesso!!!!!!!!!!')
            req.flash('success_msg', 'Nota lançada com exito!')
            // res.redirect("/professor/minipauta/" + idMinipauta)
        } else {
            const idNotaAch = notasAchada._id
            const notasExist = await findNotasExistentByIdService(idNotaAch)
            if (notasExist) {
                //return res.send('Actualizar as notas do auno!')
                if (trimeste == 'primeiro') {
                    switch (notaDe) {
                        case "avaliacao1":
                            //return res.send("Lançar nota no primeiro trimestre - av1")
                            notasExist.av1T1 = nota
                            break;
                        case "avaliacao2":
                            // return res.send("Lançar nota no primeiro trimestre - av2")
                            notasExist.av2T1 = nota

                            break;
                        case "avaliacao3":
                            //   return res.send("Lançar nota no primeiro trimestre - av3")
                            notasExist.av3T1 = nota

                            break;
                        case "mac1":
                            //   return res.send("Lançar nota no primeiro trimestre - mac1")
                            notasExist.mac1 = nota

                            break;
                        case "provaDoProfessor":
                            //   return res.send("Lançar nota no primeiro trimestre - av3")
                            notasExist.pp1 = nota

                            break;
                        case "provaDoTrimestre":
                            //   return res.send("Lançar nota no primeiro trimestre - av3")
                            notasExist.pt1 = nota

                            break;

                        default:
                            return res.send('Selecione os campos correctamente!')
                            break;
                    }
                }
                if (trimeste == 'segundo') {
                    switch (notaDe) {
                        case "avaliacao1":
                            //return res.send("Lançar nota no segungo trimestre - av1")
                            notasExist.av1T2 = nota
                            break;
                        case "avaliacao2":
                            // return res.send("Lançar nota no segungo trimestre - av2")
                            notasExist.av2T2 = nota

                            break;
                        case "avaliacao3":
                            //   return res.send("Lançar nota no segungo trimestre - av3")
                            notasExist.av3T2 = nota

                            break;
                        case "mac2":
                            //   return res.send("Lançar nota no segungo trimestre - mac2")
                            notasExist.mac2 = nota

                            break;
                        case "provaDoProfessor":
                            //   return res.send("Lançar nota no segungo trimestre - av3")
                            notasExist.pp2 = nota

                            break;
                        case "provaDoTrimestre":
                            //   return res.send("Lançar nota no segungo trimestre - av3")
                            notasExist.pt2 = nota

                            break;

                        default:
                            return res.send('Selecione os campos correctamente!')

                            break;
                    }
                }
                if (trimeste == 'terceiro') {
                    switch (notaDe) {
                        case "avaliacao1":
                            //return res.send("Lançar nota no terceiro trimestre - av1")
                            notasExist.av1T3 = nota
                            break;
                        case "avaliacao2":
                            // return res.send("Lançar nota no terceiro trimestre - av2")
                            notasExist.av2T3 = nota

                            break;
                        case "avaliacao3":
                            //   return res.send("Lançar nota no terceiro trimestre - av3")
                            notasExist.av3T3 = nota

                            break;
                        case "mac3":
                            //   return res.send("Lançar nota no terceiro trimestre - mac3")
                            notasExist.mac3 = nota

                            break;
                        case "provaDoProfessor":
                            //   return res.send("Lançar nota no terceiro trimestre - av3")
                            notasExist.pp3 = nota

                            break;
                        case "provaDoTrimestre":
                            //   return res.send("Lançar nota no terceiro trimestre - av3")
                            notasExist.pt3 = nota

                            break;

                        default:
                            return res.send('Selecione os campos correctamente!')

                            break;
                    }
                }
                if (trimeste == 'outro') {
                    switch (notaDe) {
                        case "provaOral":
                            //return res.send("Lançar nota de prova oral, final ou exame")
                            notasExist.pOral = nota
                            break;
                        case "exame":
                            // return res.send("Lançar nota de prova oral, final ou exame")
                            notasExist.examePF = nota

                            break;

                        default:
                            return res.send('Selecione os campos correctamente!')

                            break;
                    }
                }

                //CÁLCULOS DAS MÉDIAS - MAC MT1, MT2, MT3, MT, CF


                //return res.send('Actualozação das notas do aluno')
                const notasUpdate = await findNotaByIdAndUpdateSerice(idNotaAch, notasExist)
                const mediasActulizadas = await calcularMedias(idNotaAch)
                // return res.send({mediasActulizadas})
                req.flash('success_msg', 'Nota lançada com exito!')
                // res.redirect("/professor/minipauta/" + idMinipauta)
            } else {
                return res.send('As notas do aluno foram apagadas do sistea')

            }
        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

const lancarNotaExec = async (idTurma, idAluno, idMinipauta, notaR, idProfessor, idClasse, trimeste, notaDe) => {
    //const idAluno = idAluno
    console.log({ idTurma, idAluno, idMinipauta, notaR, idProfessor, idClasse, trimeste, notaDe })
    let nota = parseInt(notaR)
    const notasDisciplina = await findNotasDisciplinaByIdMinipautaService(idMinipauta)
    const notasDoAluno = await findNotasDisciplinaByIdAluno(idAluno)
    let verifNota = ''
    let notasAchada = ''
    notasDoAluno.forEach(element => {
        if (element.idMinipauta == idMinipauta) {
            verifNota = 'Ja'
            notasAchada = element.notas
        }
    });
    if (verifNota == '') {
        //return res.send("O aluno ainda não tem notas nesta discplina")
        console.log('O aluno ainda não tem notas nesta discplina')
        let novaNotasDoaluno = {
            aluno: idAluno,
            professor: idProfessor,
            idMinipauta: idMinipauta,
            idClasse: idClasse,
            idTurma: idTurma
        }
        let notaTrimestral = {}
        if (trimeste == 'primeiro') {
            switch (notaDe) {
                case "avaliacao1":
                    //return res.send("Lançar nota no primeiro trimestre - av1")
                    notaTrimestral.av1T1 = nota
                    break;
                case "avaliacao2":
                    // return res.send("Lançar nota no primeiro trimestre - av2")
                    notaTrimestral.av2T1 = nota

                    break;
                case "avaliacao3":
                    //   return res.send("Lançar nota no primeiro trimestre - av3")
                    notaTrimestral.av3T1 = nota

                    break;
                case "mac1":
                    //   return res.send("Lançar nota no primeiro trimestre - mac1")
                    notaTrimestral.mac1 = nota

                    break;
                case "provaDoProfessor":
                    //   return res.send("Lançar nota no primeiro trimestre - av3")
                    notaTrimestral.pp1 = nota

                    break;
                case "provaDoTrimestre":
                    //   return res.send("Lançar nota no primeiro trimestre - av3")
                    notaTrimestral.pt1 = nota

                    break;

                default:
                    return res.send('Selecione os campos correctamente!')
                    break;
            }
        }
        if (trimeste == 'segundo') {
            switch (notaDe) {
                case "avaliacao1":
                    //return res.send("Lançar nota no segungo trimestre - av1")
                    notaTrimestral.av1T2 = nota
                    break;
                case "avaliacao2":
                    // return res.send("Lançar nota no segungo trimestre - av2")
                    notaTrimestral.av2T2 = nota

                    break;
                case "avaliacao3":
                    //   return res.send("Lançar nota no segungo trimestre - av3")
                    notaTrimestral.av3T2 = nota

                    break;
                case "mac2":
                    //   return res.send("Lançar nota no segungo trimestre - mac2")
                    notaTrimestral.mac2 = nota

                    break;
                case "provaDoProfessor":
                    //   return res.send("Lançar nota no segungo trimestre - av3")
                    notaTrimestral.pp2 = nota

                    break;
                case "provaDoTrimestre":
                    //   return res.send("Lançar nota no segungo trimestre - av3")
                    notaTrimestral.pt2 = nota

                    break;

                default:
                    return res.send('Selecione os campos correctamente!')

                    break;
            }
        }
        if (trimeste == 'terceiro') {
            switch (notaDe) {
                case "avaliacao1":
                    //return res.send("Lançar nota no terceiro trimestre - av1")
                    notaTrimestral.av1T3 = nota
                    break;
                case "avaliacao2":
                    // return res.send("Lançar nota no terceiro trimestre - av2")
                    notaTrimestral.av2T3 = nota

                    break;
                case "avaliacao3":
                    //   return res.send("Lançar nota no terceiro trimestre - av3")
                    notaTrimestral.av3T3 = nota

                    break;
                case "mac3":
                    //   return res.send("Lançar nota no terceiro trimestre - mac3")
                    notaTrimestral.mac3 = nota

                    break;
                case "provaDoProfessor":
                    //   return res.send("Lançar nota no terceiro trimestre - av3")
                    notaTrimestral.pp3 = nota

                    break;
                case "provaDoTrimestre":
                    //   return res.send("Lançar nota no terceiro trimestre - av3")
                    notaTrimestral.pt3 = nota

                    break;

                default:
                    return res.send('Selecione os campos correctamente!')

                    break;
            }
        }
        if (trimeste == 'outro') {
            switch (notaDe) {
                case "provaOral":
                    //return res.send("Lançar nota de prova oral, final ou exame")
                    notaTrimestral.pOral = nota
                    break;
                case "exame":
                    // return res.send("Lançar nota de prova oral, final ou exame")
                    notaTrimestral.examePF = nota

                    break;

                default:
                    return res.send('Selecione os campos correctamente!')

                    break;
            }
        }
        //console.log('CRIOU NOTAS!...................................................')
        const notasTrimCread = await createNotaTrimestral(notaTrimestral)
        novaNotasDoaluno.notas = notasTrimCread._id
        const notasDoAlunoCriada = await createNotasDisciplinaService(novaNotasDoaluno)
        const idNotaAch = notasDoAlunoCriada._id
        const notasExist = await findNotasExistentByIdService(idNotaAch)
        const notasUpdate = await findNotaByIdAndUpdateSerice(idNotaAch, notasExist)
        const aluno = await findAlunoByIdService(idAluno)
        let classe = await findClasseByIdService(aluno.idClasse)
        classe = classe.designacao
        console.log(classe)
        const mediasActulizadas = await calcularMedias(idNotaAch, classe)


        //return res.send({ notasDoAlunoCriada })
        // req.flash('success_msg', 'Nota lançada com exito!')
        //res.redirect("/professor/minipauta/" + idMinipauta)
    } else {

        const idNotaAch = notasAchada._id
        const notasExist = await findNotasExistentByIdService(idNotaAch)
        if (notasExist) {
            //return res.send('Actualizar as notas do auno!')
            if (trimeste == 'primeiro') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no primeiro trimestre - av1")
                        notasExist.av1T1 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no primeiro trimestre - av2")
                        notasExist.av2T1 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notasExist.av3T1 = nota

                        break;
                    case "mac1":
                        //   return res.send("Lançar nota no primeiro trimestre - mac1")
                        notasExist.mac1 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notasExist.pp1 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no primeiro trimestre - av3")
                        notasExist.pt1 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')
                        break;
                }
            }
            //return res.send('oK!')
            if (trimeste == 'segundo') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no segungo trimestre - av1")
                        notasExist.av1T2 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no segungo trimestre - av2")
                        notasExist.av2T2 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notasExist.av3T2 = nota

                        break;
                    case "mac2":
                        //   return res.send("Lançar nota no segungo trimestre - mac2")
                        notasExist.mac2 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notasExist.pp2 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no segungo trimestre - av3")
                        notasExist.pt2 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }
            if (trimeste == 'terceiro') {
                switch (notaDe) {
                    case "avaliacao1":
                        //return res.send("Lançar nota no terceiro trimestre - av1")
                        notasExist.av1T3 = nota
                        break;
                    case "avaliacao2":
                        // return res.send("Lançar nota no terceiro trimestre - av2")
                        notasExist.av2T3 = nota

                        break;
                    case "avaliacao3":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notasExist.av3T3 = nota

                        break;
                    case "mac3":
                        //   return res.send("Lançar nota no terceiro trimestre - mac3")
                        notasExist.mac3 = nota

                        break;
                    case "provaDoProfessor":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notasExist.pp3 = nota

                        break;
                    case "provaDoTrimestre":
                        //   return res.send("Lançar nota no terceiro trimestre - av3")
                        notasExist.pt3 = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }
            if (trimeste == 'outro') {
                switch (notaDe) {
                    case "provaOral":
                        //return res.send("Lançar nota de prova oral, final ou exame")
                        notasExist.pOral = nota
                        break;
                    case "exame":
                        // return res.send("Lançar nota de prova oral, final ou exame")
                        notasExist.examePF = nota

                        break;

                    default:
                        return res.send('Selecione os campos correctamente!')

                        break;
                }
            }


            //CÁLCULOS DAS MÉDIAS - MAC MT1, MT2, MT3, MT, CF
            //return res.send('Actualozação das notas do aluno')
            const notasUpdate = await findNotaByIdAndUpdateSerice(idNotaAch, notasExist)

            console.log('ACTUALIZOU! .....................................')
            const aluno = await findAlunoByIdService(idAluno)
            const classe = aluno.classe
            const mediasActulizadas = await calcularMedias(idNotaAch, classe)
            // return res.send({mediasActulizadas})
            //req.flash('success_msg', 'Nota lançada com exito!')
            // res.redirect("/professor/minipauta/" + idMinipauta)
        } else {
            console.log('As notas do aluno foram apagadas do sistea')

        }
    }


}

export const config = async (req, res) => {
    try {
        res.send("Testar config...")
    } catch (error) {

    }
}

export const aplicarFalta = async (req, res) => {
    try {
        const user = req.user
        const prof = await findFuncionariosUser(user._id)
        const idProfessor = prof._id
        const idAluno = req.body.idAluno
        const idTurma = req.body.idTurma
        const disciplinas = await findMinipautasByIdProfessorService(idProfessor)
        const disciplina = []
        let nomeDisciplina = ''
        disciplinas.forEach(element => {
            if (element.idTurma._id == idTurma) {

                nomeDisciplina = element.nomeDisciplina
            }
        });
        //return res.send({nomeDisciplina})
        let eProfDaD = ''

        const verifFaltas = await findFaltaBayIdAlunoService(idAluno)
        const turma = await findTurmaByIdService(idTurma)

        const falta = {
            dataFalfa: Date.now(),
            numFalta: 1
        }
        const faltaNova = {
            disciplina: nomeDisciplina,
            professor: idProfessor,
            aluno: idAluno,
            faltas: falta,
            turma: turma._id
        }
        // return res.send({ faltaNova })
        if (!verifFaltas) {
            //return res.send('Vai criar, verificando')
            const novaFalta = await createFaltaService(faltaNova)
            //return res.send('Vai actualizar, verificando')
        } else {
            //return res.send("Testar...")
            let eMesmoProf = ''
            let idFalta = ''
            verifFaltas.forEach(element => {
                if (element.disciplina == nomeDisciplina) {
                    eMesmoProf = 'Sim'
                    console.log('É mesmo professor')
                    idFalta = element._id
                }
            });
            if (eMesmoProf) {
                const faltaAchada = await findFaltaByIdService(idFalta)
                faltaAchada.faltas.push(falta)
                const faltaUp = await findFaltaByIdAndUpdateService(idFalta, faltaAchada)
                req.flash('error_msg', 'Falta marcada!')
                res.redirect("/professor/listaAlunos/" + idTurma)
            } else {
                //return res.send({faltaNova})
                const novaFalta = await createFaltaService(faltaNova)
                req.flash('error_msg', 'Falta marcada!')
                res.redirect("/professor/listaAlunos/" + idTurma)
            }


        }


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const solicitacoesProf = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            req.flash('error_msg', 'Faça login no seu perfil')
            res.redirect('/user/login')
        } else {
            const usuario = user._id
            const professor = await findFuncionariosUser(usuario)
            // return res.send({professor})
            const estado = 'Activo'
            const anoLectivoActivo = await findAnoLectivoByEstadoService(estado)
            const idAno = anoLectivoActivo._id
            const estadoSolicitacao = 'Pendente'
            const tdOcorrencias = await findOcorrenciaByEstatoService(estadoSolicitacao)
            const ocorrencias = []
            tdOcorrencias.forEach(ocorrencia => {
                professor.turmas.forEach(turma => {
                    if (turma == ocorrencia.turma) {
                        ocorrencias.push(ocorrencia)
                    }
                });
            });

            res.render('professor/solicitacoesProf', { ocorrencias })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const justificarFaltaDoAluno = async (req, res) => {
    try {
        const numBI = req.body.numBI
        const idSolicitacao = req.body.idSolicitacao
        const disciplina = req.body.disciplina
        const numfaltasString = req.body.numfaltas
        const numfaltas = parseInt(numfaltasString)
        const aluno = await findAlunoByNumBIService(numBI)
        const idAluno = aluno._id
        const faltas = await findFaltaBayIdAlunoService(idAluno)
        let falta = ''
        let idFalta = ''
        faltas.forEach(element => {
            if (element.disciplina == disciplina) {
                idFalta = element._id
                for (var i = 0; i < numfaltas; i++) {
                    element.faltas.pop()
                    // more statements
                }
                falta = element
            }
        });
        await findFaltaByIdAndUpdateService(idFalta, falta)
        const solicitacao = await findSolicitacaoByIdService(idSolicitacao)
        solicitacao.estado = 'Justificada'
        const ocorrenciaUp = await findOcorrenciaByIdAndUpdateServece(idSolicitacao, solicitacao)
        req.flash('success_msg', 'Falta justificada com sucesso!')
        res.redirect('/pedagogico/solicitacoes')

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const saveActualizarDadosProf = async (req, res) => {
    try {
        const { idProfessor, numBI, contacto, dataNascimento, genero, morada, especialidade } = req.body
        //return res.send({numBI, contacto, dataNascimento, genero, morada, especialidade})
        let erroMsg = ''
        // Verificar se já existe um professor com o mesmo BI
        let professor = await findFuncionariosByIdService(idProfessor)
        const verifyBI = await findFuncionarioByNumBIService(numBI)
        if (verifyBI) {
            erroMsg += 'O número de identidade que está inserir já pertence à um outro funcionário;\n'
        }
        // verificar se o BI é válido
        const sizeBI = numBI.length
        if (sizeBI != 14) {
            erroMsg += 'Número do Bilhete invalido;\n'
        }
        //return res.send('Exito!')
        const data = req.body.dataNascimento
        const anoString = data.slice(0, 4)
        const anoInt = parseInt(anoString)
        const dataActual = new Date().getFullYear()

        const idade = dataActual - anoInt
        if (idade < 25 || idade > 80) {
            erroMsg += 'A data de nascimento não corresponde com a sua idade;\n'
        }
        if (genero == 'selecionar') {
            erroMsg += 'O Genero não foi selecionado;\n'
        }
        if (erroMsg) {
            const msdDeErro = 'Volta e verifica os dados, insere corretamente:\n' + erroMsg
            return res.render('msgError', { msdDeErro })
        } else {
            professor.numBI = numBI
            professor.contacto = contacto
            professor.genero = genero
            professor.dataNascimento = dataNascimento
            professor.idade = idade
            professor.especialidade = especialidade
            professor.morada = morada

            await findFuncionarioByIdAndUpdateService(idProfessor, professor)
            req.flash('success_msg', 'Dados actualizado com sucesso!')
            res.redirect('/professor/' + idProfessor)

        }

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const coordenacao = async (req, res) => {
    try {
        res.send("Rota abandonada")
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const alunosConcluido = async (req, res) => {
    try {
        const concluido = "Concluido"
        //const tdAlunos = await findAllAlunosService()
        //return res.send({tdAlunos})
        const alunos = await findAlunosByConcluidoService(concluido)
        res.render("pedagogico/alunosConcluido", { alunos })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const alunosNaoMatriculados = async (req, res) => {
    try {
        const matriculado = false
        const alunos = await findAlunosByMatriculasService(matriculado)
        res.render("pedagogico/alunosNaoMatriculados", { alunos })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const avaliacoes = async (req, res) => {
    try {
        const idProfessor = req.params.id
        let professor = await findFuncionariosByIdService(idProfessor)
        let minipautas = await findMinipautasByIdProfessorService(professor._id) 
        let allAlunos = await findAlunosMatriculadosService()
        let alunos = []
        let turmas = []

        //return res.send({minipautas})

        /* Filtrar alunos e turma do Professor */
        minipautas.forEach(dados => {
            dados.alunos.forEach(idAluno => {
                allAlunos.forEach(aluno => {
                    if(""+aluno._id == idAluno){alunos.push(aluno)}
                });
            });

            dados.idTurma.classe = dados.idClasse.designacao
            turmas.push(dados.idTurma) // Filtrar a turma
        });
        //return res.send({turmas})
        res.render("professor/avaliacoes", {turmas, alunos, idProfessor})
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const criarAvaliacao = async (req, res) => {
    try {
        let {idProfessor, tipo, destinatario, numPerguntas} = req.body
        let coletivo = true
        let individual = true
        let tipoLogica = false
        
        if(tipo == "" || destinatario == ""){return res.send("Seleciona Destinatário e o tipo de avaliação")}
        const turma = await findTurmaByIdDetalhadoService(destinatario)
        const aluno = await findAlunoByIdService(destinatario)
        let arrayDePerguntas = []
        let nomeDestinatario = ""
        let idDestinatario = ""
       //return res.send({turma, tipo, destinatario})

       /* Montando o array de Perguntas */
       let cont = 1
       while (numPerguntas > 0) {
        arrayDePerguntas.push({numPergunta: cont})
        cont++
        numPerguntas--
       }
       /* ----- FIM ---- */

        if(turma == null){
            coletivo = false 
            nomeDestinatario = aluno.nome 
            idDestinatario = aluno._id
        }else{
            individual = false
            nomeDestinatario = "Todos alunos da " + turma.idClasse.designacao +" turma " + turma.codigo 
            idDestinatario = turma._id
        }

        if(tipo == "logica" && individual == true){
            tipoLogica = true
            
            return res.render("professor/criarAvaliacao", {tipoLogica, aluno, nomeDestinatario, idDestinatario, arrayDePerguntas })
        }
        if(tipo == "logica" && coletivo == true){
            tipoLogica = true

            return res.render("professor/criarAvaliacao", {tipoLogica, turma, nomeDestinatario, idDestinatario, arrayDePerguntas })
        } 
        
        return res.send({turma, aluno})
        req.flash("success_msg", "Avaliação criada co sucesso!")
        res.redirect("/professor/avaliacoes/"+idProfessor)
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}
