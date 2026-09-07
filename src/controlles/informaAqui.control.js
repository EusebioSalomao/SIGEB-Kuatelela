import { findAlunoByBIService } from "../services/aluno.service.js"
import { findAnoLectivoByEstadoService } from "../services/anoLectivo.service.js"
import { findDisciplinaByIdClasse } from "../services/disciplina.service.js"
import { findFuncionarioByNumBIService } from "../services/funcionario.service.js"
import { creaOcorrenciaService } from "../services/ocorrencias.service.js"
import { findTurmasByIdAno } from "../services/turma.service.js"

export const solicitar = async (req, res) => {
    try {
        const numBI = req.body.numBI
        const sizeBI = numBI.length
        let erro = ''
        if (sizeBI != 14) {
            erro = 'Número do Bilhete invalido'
        }
        if (req.body.tipo == 'selecionar') {
            erro = 'Erro! Não foi selecionado o tipo de solicitação!'

        }
        if (erro != '') {
            req.flash('error_msg', '' + erro)
            res.redirect('/secretaria/informase')
        } else {

            const estado = 'Activo'
            const anoActivo = await findAnoLectivoByEstadoService(estado)
            const idAno = anoActivo._id
            if (req.body.tipo == "emicaoDeCertif") {
                const tipoCer = 'Pedido de Certificado'
                const validBI = await findAlunoByBIService(numBI)
                if (validBI == null) {
                    req.flash('error_msg', 'Lamentamos! Não foi achado nenhum aluno com este número de BI.')
                    res.redirect('/secretaria/informase')
                } else {
                    if (validBI.classe != 'Concluido') {
                        req.flash('error_msg', 'Apenas alunos que concluiram a 12ª Classe podem solicitar certificado. Certifique-se que já concluiste, ou entre em contacto conosco!')
                        res.redirect('/secretaria/informase')
                    } else {

                        res.render('secretaria/registrarSolicitacao', { tipoCer, validBI })
                    }
                }
            }
            if (req.body.tipo == "emicaoDeDec") {
                const tipoDc = 'Pedido de Declaração'
                const validBI = await findAlunoByBIService(numBI)
                if (validBI == null) {
                    req.flash('error_msg', 'Lamentamos! Não foi achado nenhum aluno com este número de BI.')
                    res.redirect('/secretaria/informase')
                } else {
                    const turmas = await findTurmasByIdAno(idAno)
                    res.render('secretaria/registrarSolicitacao', { tipoDc, validBI })
                }
            }

            if (req.body.tipo == "justficativo") {
                //return res.send('Teste...')
                const tipoJust = 'Justificação de faltas'
                const validBI = await findAlunoByBIService(numBI)
                if (validBI == null) {
                    req.flash('error_msg', 'Lamentamos! Não foi achado nenhum aluno com este número de BI.')
                    res.redirect('/secretaria/informase')
                } else {
                    const disciplinas = await findDisciplinaByIdClasse(validBI.idClasse)

                    // return res.send({disciplinas}) 
                    const turmas = await findTurmasByIdAno(idAno)
                    res.render('secretaria/registrarSolicitacao', { tipoJust, turmas, validBI, disciplinas })
                }
            }
            //declaração para funcionario
            if (req.body.tipo == "decServiço") {
                const DecServico = 'Declaração de Serviço'
                const validBI = await findFuncionarioByNumBIService(numBI)
                //return res.send({validBI})
                if (validBI == null) {
                    req.flash('error_msg', 'Lamentamos! Não foi achado nenhum funcionário com este número de BI.')
                    res.redirect('/secretaria/informase')
                } else {

                    // return res.send({disciplinas}) 
                    res.render('secretaria/registrarSolicitacao', { DecServico, validBI })
                }
            }
            if (req.body.tipo == "recepcaoDoc") {
                const recepcaoDoc = 'Recepção de documento'

                const turmas = await findTurmasByIdAno(idAno)
                //return res.send({turmas}) 
                res.render('secretaria/registrarSolicitacao', { recepcaoDoc })
            }
            if (req.body.tipo == "RUPE") {
                const soliRUPE = 'Solicitação da RUPE'
                const validBI = await findAlunoByBIService(numBI)
                if (validBI == null) {
                    req.flash('error_msg', 'Lamentamos! Não foi achado nenhum aluno com este número de BI.')
                    res.redirect('/secretaria/informase')
                } else{

                    //return res.send({turmas}) 
                    res.render('secretaria/registrarSolicitacao', { soliRUPE, validBI })
                }
            }
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const salvarSolicitacao = async (req, res) => {
    try {
        const solicitacao = req.body
        const anoActivo = await findAnoLectivoByEstadoService('Activo')
        //SE FOR PEDIDO DE DECLARAÇÃO
        if (solicitacao.tipo == 'Pedido de Declaração') {

            const NovaSolicitacao = {
                descricao: solicitacao.tipo,
                anoLectivo: anoActivo._id,
                tipoOcorrencia: solicitacao.tipo,
                nomeDoSolicitante: solicitacao.nomeAluno,
                numBI: solicitacao.numBI,
                estado: "novaSolicitação",
                comNotas: 'Não',
                classe: solicitacao.classe,
                contacto: solicitacao.contacto,
                copOcorrencia: req.file.filename

            }
            const solicCriada = await creaOcorrenciaService(NovaSolicitacao)
            //return res.send({solicCriada})
            req.flash('success_msg', 'Solicitação enviada com sucesso!')
            res.redirect('/secretaria/informase')
        }
        //SE FOR PEDIDO DE CERTIFICADO
        if (solicitacao.tipo == 'Pedido de Certificado') {

            const NovaSolicitacao = {
                descricao: solicitacao.tipo,
                anoLectivo: anoActivo._id,
                anoDeConclusao: solicitacao.ano,
                tipoOcorrencia: solicitacao.tipo,
                nomeDoSolicitante: solicitacao.nomeAluno,
                numBI: solicitacao.numBI,
                estado: "novaSolicitação",
                contacto: solicitacao.contacto,
                copOcorrencia: req.file.filename
                
            }
            //return res.send(req.file.filename)
            const solicCriada = await creaOcorrenciaService(NovaSolicitacao)
            req.flash('success_msg', 'Solicitação enviada com sucesso!')
            res.redirect('/secretaria/informase')
        }
        //SE FOR JUSTIFICAÇÃO DE FALTAS
        if (solicitacao.tipo == 'Justificação de faltas') {
            if (req.body.disciplina == 'selecionar' || req.body.numfaltas == 0 || req.body.turma == 'selecionar') {
                req.flash('error_msg', 'Erro! Não foi possivel enviar a solicitação (turma, disciplina ou numero de falata não foram bem infoemado)')
                res.redirect('/secretaria/informase')

            } else {

                const NovaSolicitacao = {
                    descricao: solicitacao.tipo,
                    anoLectivo: anoActivo._id,
                    tipoOcorrencia: solicitacao.tipo,
                    nomeDoSolicitante: solicitacao.nomeAluno,
                    numBI: solicitacao.numBI,
                    estado: "novaSolicitação",
                    contacto: solicitacao.contacto,
                    turma: req.body.turma,
                    numfaltas: req.body.numfaltas,
                    disciplina: req.body.disciplina,
                    dataFalta: req.body.dataFalta,
                copOcorrencia: req.file.filename
                }
                const solicCriada = await creaOcorrenciaService(NovaSolicitacao)
                //return res.send({ solicCriada })
                req.flash('success_msg', 'Solicitação enviada com sucesso!')
                res.redirect('/secretaria/informase')
            }
        }

        //SE FOR DECLARAÇÃO DE SERVIÇO
        if (solicitacao.tipo == 'Declaração de Serviço') {

                const NovaSolicitacao = {
                    descricao: solicitacao.tipo,
                    anoLectivo: anoActivo._id,
                    tipoOcorrencia: solicitacao.tipo,
                    nomeDoSolicitante: solicitacao.nomeDoSolicitante,
                    numBI: solicitacao.numBI,
                    estado: "novaSolicitação",
                    contacto: solicitacao.contacto,
                    paraEfeito: solicitacao.paraEfeito
                }
                //return res.send({ NovaSolicitacao })
                const solicCriada = await creaOcorrenciaService(NovaSolicitacao)
                req.flash('success_msg', 'Solicitação enviada com sucesso!')
                res.redirect('/secretaria/informase')
            }

        //SE FOR SILICITAÇÃO DE RUPE
        if (solicitacao.tipo == 'Solicitação da RUPE') {

                const NovaSolicitacao = {
                    descricao: solicitacao.tipo,
                    anoLectivo: anoActivo._id,
                    tipoOcorrencia: solicitacao.tipo,
                    nomeDoSolicitante: solicitacao.nomeDoSolicitante,
                    numBI: solicitacao.numBI,
                    estado: "novaSolicitação",
                    contacto: solicitacao.contacto,
                    paraEfeito: solicitacao.paraEfeito
                }
                //return res.send({ NovaSolicitacao })
                const solicCriada = await creaOcorrenciaService(NovaSolicitacao)
                req.flash('success_msg', 'Solicitação enviada com sucesso!')
                res.redirect('/secretaria/informase')
            }
        
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}