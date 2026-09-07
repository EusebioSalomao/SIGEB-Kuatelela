import { findAllAlunosService, findAlunoByIdAndUpdate, findAlunoByNumBIService, findAlunosByIdTurma, findAlunosByMatriculasService } from "../services/aluno.service.js"
import { findAnoLectivoByEstadoService, findAnoLectivoById } from "../services/anoLectivo.service.js"
import { findAllCandidatosByCursoService } from "../services/candidato.service.js"
import { findClasseByIdService } from "../services/classe.service.js"
import { findCursoByIdService } from "../services/curso.service.js"
import { findDefinicoesService } from "../services/definicao.service.js"
import { addReceitaService } from "../services/financas.service.js"
import { findAllNoticiasService, findByIdService } from "../services/news.services.js"
import { creaOcorrenciaService, findAllOcorrenciasService, findOcorrenciaByEstatoService, findOcorrenciaByIdAndUpdateServece, findSolicitacaoByIdService } from "../services/ocorrencias.service.js"
import { findAllPautasFinalService } from "../services/pauta.service.js"
import { findAllTurmasAndClasseService, findTurmaByIdDetalhadoService, findTurmaByIdService, findTurmasByIdAno } from "../services/turma.service.js"


export const homeSecret = async (req, res) => {
    try {

        const novasSolicitacoes = await findOcorrenciaByEstatoService('novaSolicitação')
        res.render('secretaria/homeSecre', { novasSolicitacoes })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const novasSolicitacoes = async (req, res) => {
    try {
        const novasSolicitacoes = await findOcorrenciaByEstatoService('novaSolicitação')
        res.render('secretaria/novasSolicitacoes', { novasSolicitacoes })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const aceitarSolicitacao = async (req, res) => {
    try {
        const solicitacao = req.body
        const ocorrencia = await findSolicitacaoByIdService(solicitacao.idSolic)
        ocorrencia.estado = 'Pendente'
        await findOcorrenciaByIdAndUpdateServece(solicitacao.idSolic, ocorrencia)

        let valorR = 0
        if (req.body.tipo == "Pedido de Certificado") {
            valorR = 1000
            const novaReceita = {
                descricao: ocorrencia.tipoOcorrencia,
                qt: 1,
                valor: valorR,
                // funcionario: 'secretario'
            }

            await addReceitaService(novaReceita)
        }
        if (req.body.tipo == "Pedido de Declaração") {
            valorR = 500
            const novaReceita = {
                descricao: ocorrencia.tipoOcorrencia,
                qt: 1,
                valor: valorR,
                // funcionario: 'secretario'
            }

            await addReceitaService(novaReceita)
        }

        if (req.body.tipo == "Justificação de faltas") {
            valorR = 300
            const novaReceita = {
                descricao: ocorrencia.tipoOcorrencia,
                qt: 1,
                valor: valorR,
                // funcionario: 'secretario'
            }

            await addReceitaService(novaReceita)
        }

        await addReceitaService(novaReceita)
        //return res.send({novaReceita})
        req.flash('success_msg', 'Solicitação aceite')
        res.redirect('/secretaria/novasSolicitacoes')

    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const ocorrencias = async (req, res) => {
    try {
        const tdOcorrencias = await findAllOcorrenciasService()
        const ocorrencias = []
        tdOcorrencias.forEach(element => {
            if (element.estado == 'Pendente') {
                ocorrencias.push(element)
            }
        });
        //return res.send({ocorrencias})
        res.render('secretaria/ocorrencias', { ocorrencias })
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}

export const novaOcorrencia = async (req, res) => {
    try {
        const estado = 'Activo'
        const anoActivo = await findAnoLectivoByEstadoService(estado)
        const idAno = anoActivo._id
        if (req.body.tipo == "emicaoDeCertif") {
            const tipoCer = 'Pedido de Certificado'
            res.render('secretaria/registrarOcorrencia', { tipoCer })
        }
        if (req.body.tipo == "emicaoDeDec") {
            const tipoDc = 'Pedido de Declaração'

            const turmas = await findTurmasByIdAno(idAno)
            res.render('secretaria/registrarOcorrencia', { tipoDc })
        }

        if (req.body.tipo == "justficativo") {
            //return res.send('Teste...')
            const tipoJust = 'Justificação de faltas'

            const turmas = await findTurmasByIdAno(idAno)
            //return res.send({turmas}) 
            res.render('secretaria/registrarOcorrencia', { tipoJust, turmas })
        }
        if (req.body.tipo == "recepcaoDoc") {
            const recepcaoDoc = 'Recepção de documento'

            const turmas = await findTurmasByIdAno(idAno)
            //return res.send({turmas}) 
            res.render('secretaria/registrarOcorrencia', { recepcaoDoc })
        }

    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}

export const servicos = async (req, res) => {
    try {
        res.render('secretaria/servicos')
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}
export const servicosInfo = async (req, res) => {
    try {
        res.render('secretaria/servicosInfo')
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}

export const enviarSolicitacao = async (req, res) => {
    try {
        //return res.send(req.file.filename)
        const oc = req.body
        if (oc.tipo == 'Recepção de documento') {
            const ocorrencia = {
                descricao: oc.desc,
                emissor: req.body.emissor,
                origem: req.body.origem,
                //copOcorrencia: req.file.filename,
                estado: 'Recebido'
            }
            //return res.send({ocorrencia})
            const ocSave = await creaOcorrenciaService(ocorrencia)
            req.flash('success_msg', 'Registrado com sucesso!')
            res.redirect('/secretaria/ocorrencias')
        } else {
            const numBI = req.body.numBI
            const aluno = await findAlunoByNumBIService(numBI)
            if (aluno) {

                //return res.send({aluno})

                const ocorrencia = {
                    descricao: req.body.descricao,
                    nomeDoSolicitante: req.body.nomeDoSolicitante,
                    numBI: req.body.numBI,
                    turma: req.body.turma,
                    numfaltas: req.body.numfaltas,
                    disciplina: req.body.disciplina,
                    dataFalta: req.body.dataFalta,
                    estado: 'Pendente'
                }
                //return res.send({ocorrencia})
                const turma = req.body.turma

                if (turma == "0") {
                    req.flash('error_msg', 'Erro! A turma não foi selecinada')
                    res.redirect('/secretaria/ocorrencias')
                } else {

                    const ocorrenciaCriada = await creaOcorrenciaService(ocorrencia)
                    req.flash('success_msg', 'Solicitação registrada com sucesso!')
                    res.redirect('/secretaria/ocorrencias')

                }
            } else {
                //return res.send('Número do bilhete invalido!')
                req.flash('error_msg', 'Erro! Número do bilhete invalido!')
                res.redirect('/secretaria/ocorrencias')
            }

        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const detalheOcorrencia = async (req, res) => {
    try {
        const idOc = req.params.id
        const ocorrencia = await findSolicitacaoByIdService(idOc)
        //res.send({ocorrencia})
        res.render('secretaria/detalheOcorr', { ocorrencia })
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}
export const detalheSolic = async (req, res) => {
    try {
        const idOc = req.params.id
        const ocorrencia = await findSolicitacaoByIdService(idOc)
        //res.send({ocorrencia})
        res.render('secretaria/detalheSolic', { ocorrencia })
    } catch (error) {
        res.status(500).send({ mesag: error.mesage })
    }
}

export const gerirInformacoes = async (req, res) => {
    try {
        const informacoes = await findAllNoticiasService()
        res.render('secretaria/informacoes', { informacoes })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const detalheNoticia = async (req, res) => {
    try {
        const idNot = req.params.id
        const informacao = await findByIdService(idNot)
        res.render('secretaria/detalheInfo', { informacao })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const informase = async (req, res) => {
    try {

        res.render('secretaria/informaAqui')
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}
export const turmas = async (req, res) => {
    try {

        return res.redirect("/turmas")
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const turma = async (req, res) => {
    try {
        const user = req.user
        let nivelPrivilegio01 = false
        let nivelPrivilegio02 = false
        let nivelPrivilegio03 = false
        let nivelPrivilegio04 = false
        const todasTurmas = await findAllTurmasAndClasseService()
        const date = new Date();
        let anoEconoAct = date.getFullYear();
        if (!user) {
            req.flash('error_msg', 'Inicie sua sessão!')
            res.redirect('/user/login')
        } else {
            let eProf = ''

            const idTurma = req.params.id
            const turma = await findTurmaByIdService(idTurma)
            const turmaDetalhado = await findTurmaByIdDetalhadoService(idTurma)
            turma.periodo = turma.periodo.toLocaleUpperCase();
            const idClasse = turma.idClasse
            const classe = await findClasseByIdService(idClasse)
            const ano = await findAnoLectivoById(turma.idAno)
            const curso = await findCursoByIdService(turma.idCurso)
            const candidatos = await findAllCandidatosByCursoService(curso.descricao)
            let alunos = await findAlunosByIdTurma(idTurma)
            const matriculado = true
            let tdAlunosMatriculados = await findAlunosByMatriculasService(matriculado)
            let tdAlunosGeral = await findAllAlunosService()
            const definicoes = await findDefinicoesService()

            // res.send({definicoes})
            let naoVagas = ''
            if (classe.numVagas < 1) {
                naoVagas = 'Não existe mais vagas nesta classe!'
            }
            let candMatricular = []
            let numeroOrd = 1
            candidatos.forEach(aluno => {
                aluno.numeroOrd = numeroOrd
                if (aluno.estado == "Admitido" || aluno.estado == "Admitida") {
                    if (aluno.idade == null) { aluno.idade = anoEconoAct - aluno.anoNascimento }
                    aluno.idTurma = idTurma
                    candMatricular.push(aluno)
                    numeroOrd++
                }
            });

            let classe10 = ''
            let classe11 = ''
            let classe12 = ''
            if (classe.designacao == "10ª Classe") {
                classe10 = classe.designacao
            }
            if (classe.designacao == "11ª Classe") {
                classe11 = classe.designacao
            }
            if (classe.designacao == "12ª Classe") {
                classe12 = classe.designacao
            }

            //PROCURAR ALUNOS SEM ATRIBUTO DO GENERO E ATRIBUIR IDADE
            let achado = ''
            let alunosSemGenero = []
            let numOrdem = 1
            alunos.forEach(aluno => {
                if (aluno.genero === undefined || aluno.genero == 'Não definido' || aluno.genero == 'Não definido' || aluno.genero == null) {
                    const anoNascimento = req.body.anoNascimento
                    if (aluno.anoNascimento) { aluno.idade = anoEconoAct - aluno.anoNascimento }
                    alunosSemGenero.push(aluno)
                    achado = 'Achado'
                }
                aluno.numOrdem = numOrdem
                numOrdem++
            });

            /* Verificar o nível de privilégio do sistema */
            if (user.privilegio) {
                if (user.privilegio = 1) { nivelPrivilegio01 = true }
                if (user.privilegio = 2) { nivelPrivilegio02 = true }
                if (user.privilegio = 3) { nivelPrivilegio03 = true }
            }

            /* Filtrar alunos matriculados */
            let alunosMatriculados = []
            let alunosNaoReconfirmados = []
            alunos.forEach(aluno => {

                if (aluno.matriculado == true) { alunosMatriculados.push(aluno) } else { alunosNaoReconfirmados.push(aluno) }

            });

            let turmas = []
            let classesPermitida = ""
            let finalistas = false
            if (turmaDetalhado.idClasse.designacao == "10ª Classe") { classesPermitida = "11ª Classe" }
            if (turmaDetalhado.idClasse.designacao == "11ª Classe") { classesPermitida = "12ª Classe" }
            if (turmaDetalhado.idClasse.designacao == "12ª Classe") { classesPermitida = "12ª Classe"; finalistas = true }
            todasTurmas.forEach(turma => {
                if ((turma.idClasse.designacao == classesPermitida || turma.idClasse.designacao == turmaDetalhado.idClasse.designacao) & turma.idCurso.descricao == turmaDetalhado.idCurso.descricao) { turmas.push(turma) }
            });

            /* Filtrar alunos suspeitos para esta classe */
            //return res.send({turmaDetalhado})

            let alunosSuspeitosTD = []
            let alunosSuspeitos = []
            if (turmaDetalhado.idClasse.designacao != "10ª Classe") {

                let classeAnterior = ""
                let classeActual = ""

                const pautas = await findAllPautasFinalService()
                const pauta = pautas[0]
                //return res.send({pauta})

                // Primeira checagem
                alunosMatriculados.forEach(alunoMatriculado => {
                    let suspeito = true
                    if (alunoMatriculado.classe == "11ª Classe") { classeAnterior = "10ª Classe"; classeActual = alunoMatriculado.classe }
                    if (alunoMatriculado.classe == "12ª Classe") { classeAnterior = "11ª Classe"; classeActual = alunoMatriculado.classe }
                    //console.log(classeAnterior)

                    pautas.forEach(pauta => {
                        if (pauta.classe.designacao == classeAnterior) {
                            //console.log(classeAnterior)
                            pauta.dadosPauta.forEach(aluno => {
                                if (alunoMatriculado._id == "" + aluno.idAluno & (aluno.estado == "APTO" || aluno.estado == "APTA")) { suspeito = false }
                            });
                        }
                    });
                    if (suspeito == true) { alunosSuspeitosTD.push(alunoMatriculado) }
                });

                //Segunda Checagem
                alunosSuspeitosTD.forEach(alunoSuspeito => {
                    let suspeito = true
                    if (alunoSuspeito.classe == "11ª Classe") { classeActual = alunoSuspeito.classe }
                    if (alunoSuspeito.classe == "12ª Classe") { classeActual = alunoSuspeito.classe }
                    //console.log(classeAnterior)

                    pautas.forEach(pauta => {
                        if (pauta.classe.designacao == classeActual) {
                            pauta.dadosPauta.forEach(aluno => {
                                if (alunoSuspeito._id == "" + aluno.idAluno) { suspeito = false }
                            });
                        }
                    });
                    if (suspeito == true) { alunosSuspeitos.push(alunoSuspeito) }
                });


            }
            /* 
                        alunos.forEach(aluno => {
                            alunosSuspeitos.forEach(alunoSuspeito => {
                                if(alunoSuspeito._id == aluno._id){aluno.suspeito = true}
                            });
                        }); */

            /*  let cont = 1
             alunosMatriculados.forEach( async aluno => {
                 aluno.idAno = ano._id
 
                 await findAlunoByIdAndUpdate(aluno._id, aluno)
                 cont++
             }); */

            //return res.send({alunosNaoReconfirmados})
            //console.log("Tamanho: "+alunos.length)

            return res.render('secretaria/turma', { tdAlunosGeral, alunos, tdAlunosMatriculados, alunosMatriculados, alunosNaoReconfirmados, turma, turmas, todasTurmas, classe, ano, curso, classe10, classe11, classe12, candMatricular, idTurma, naoVagas, alunosSemGenero, achado, definicoes, nivelPrivilegio01, nivelPrivilegio02, nivelPrivilegio03, nivelPrivilegio04, finalistas, alunosSuspeitos })
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}