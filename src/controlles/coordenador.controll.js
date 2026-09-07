import { findAllCandidatosByCursoService, findAllCandidatosOrdDescMediaService, findCandByIdAndUpdateService, findCandByIdService, findCandByNumBIService, saveCandidatoService } from "../services/candidato.service.js"
import { findCursoByIdCoordenadorServce, findCursoByIdService } from "../services/curso.service.js"
import { findDefincoesAndUpdateService, findDefinicoesService } from "../services/definicao.service.js"
import { findFuncionariosUser, findFuucionarioByIdUser } from "../services/funcionario.service.js"



export const homeCoordenacao = async (req, res) => {
    try {
        const idCoord = req.params.id
        let curso = await findCursoByIdCoordenadorServce(idCoord)
        const idCurso = curso._id
        curso = curso.descricao
        //return res.send({curso})
        res.render("coordenador/coordenadorHome", { curso, idCurso })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const candidatos = async (req, res) => {
    try {
        const idCurso = req.params.id
        const definicoes = await findDefinicoesService()
        const date = new Date();
        let anoEconoAct = date.getFullYear();
        const curso = await findCursoByIdService(idCurso)
        let candidatosInscrito = await findAllCandidatosByCursoService(curso.descricao)
        const user = req.user
        const coordenador = await findFuncionariosUser(user._id)
        const idCoord = coordenador._id
        let numOrdem = 1

        candidatosInscrito.forEach(candidato => {
            if (candidato.dataNascimento) {
                candidato.idade = anoEconoAct - 0
            } else {
                candidato.idade = anoEconoAct - candidato.anoNascimento
            }
            if (candidato.media < 10) { candidato.negativa = true }
            if(candidato.estado == "Admitido" || candidato.estado == "Admitida"){candidato.admitido = true}
            candidato.numOrdem = numOrdem
            numOrdem++
        });

        //Buscar as vagas definidas pelo Administrador em cada curso
        let vagasRegular = 0
        let vagasAdultos = 0
        let vagasDisponivel = true

        if (curso.descricao == "Curso de Ciências Humanas") { vagasRegular = definicoes.vagasCHRegular; vagasAdultos = definicoes.vagasCHAdultos }
        if (curso.descricao == "Curso de Ciências Físicas e Biológicas") { vagasRegular = definicoes.vagasCFBRegular; vagasAdultos = definicoes.vagasCFBAdultos }
        if (curso.descricao == "Curso de Ciências Económico-Jurídicas") { vagasRegular = definicoes.vagasCEJRegular; vagasAdultos = definicoes.vagasCEJAdultos }
        if(vagasRegular == 0 & vagasAdultos == 0){vagasDisponivel = false}
        //return res.send({coordenador})
        res.render("alunos/candidatos", { curso, candidatosInscrito, idCoord, definicoes, vagasRegular, vagasAdultos, vagasDisponivel })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const adicionarCandidato = async (req, res) => {
    try {
        let { quantidade, idCoord, idCurso } = req.body
        let curso = await findCursoByIdService(idCurso)
        curso = curso.descricao

        let vagasCandidatos = []
        let numOrdem = 1
        while (quantidade > 0) {
            vagasCandidatos.push({ quantidade, numOrdem })
            numOrdem++
            quantidade--
        }
        //return res.send({vagasCandidatos})
        res.render("alunos/adVariosCandidatos", { idCoord, vagasCandidatos, idCurso, curso })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const adicionarCandidatoSave = async (req, res) => {
    try {
        let { nome, numBI, genero, anoNascimento, media, idCoord, idCurso } = req.body
        let curso = await findCursoByIdService(idCurso)

        let indexNome = 0
        let indexBI = 0
        let indexAnoNasceto = 0
        let indexGenero = 0
        let indexMedia = 0
        let listaCandidatos = []

        nome.forEach(element => {
            let candidato = {}
            let nomePrep = nome[indexNome]
            nomePrep = nomePrep.toLowerCase()
            nomePrep = nomePrep.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });

            candidato.nome = nomePrep
            candidato.numBI = numBI[indexBI]
            candidato.genero = genero[indexGenero]
            candidato.anoNascimento = parseInt(anoNascimento[indexAnoNasceto])
            candidato.media = parseInt(media[indexMedia])
            candidato.curso = curso.descricao
            listaCandidatos.push(candidato)

            indexNome++
            indexBI++
            indexAnoNasceto++
            indexGenero++
            indexMedia++
        });

        listaCandidatos.forEach(async candidato => {
            await saveCandidatoService(candidato)
        });
        //return res.send({ listaCandidatos })

        req.flash("success_msg", "Operção realizada com sucesso!")
        res.redirect("/homeCoordenacao/candidatos/" + idCurso)
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}


export const admissaoCandidaturas = async (req, res) => {
    try {
        let { criterioAdmissao, idadeMinima, idadeMaxima, qtAdmitirRegular, qtAdmitirAdultos, idCurso, idCoord } = req.body
        //return res.send({ criterioAdmissao, idadeMinima, idadeMaxima, qtAdmitirRegular, qtAdmitirAdultos, idCurso, idCoord })
        let alunosDoCurso = []
        const qtAdmitirRegularEnv = qtAdmitirRegular
        const qtAdmitirAdultosEnv = qtAdmitirAdultos

        let curso = await findCursoByIdService(idCurso)
        let alunosAdmitidosRegular = []
        let alunosAdmitidosAdultos = []
        if (criterioAdmissao == "porIdade") {
            const msdDeErro = 'Esta opção não está disponível no momento!'
            const msdDeErro2 = 'Se ainda deseja proceguir, por favor, contactar o Administrador.'
            return res.render('msgError', { msdDeErro, msdDeErro2 })
        } else {
            const date = new Date();
            let anoEconoAct = date.getFullYear();

            let alunos = await findAllCandidatosOrdDescMediaService()
            alunos.forEach(aluno => {//Calculando a idade e separando os alunos deste curso
                if (aluno.curso == curso.descricao) { aluno.idade = anoEconoAct - aluno.anoNascimento; alunosDoCurso.push(aluno) }
            });
            let indexAdmitirRegular = 0
            let indexAdmitirAdulto = 0
            while (qtAdmitirRegular > 0) {
                let aluno = alunosDoCurso[indexAdmitirRegular]
                if (aluno) {
                    if (aluno.idade < 20 & (aluno.estado != "Admitido" || aluno.estado != "Admitida" || aluno.estado == "Inscrito")) {
                        aluno.estado = 'Admitido'
                        aluno.periodo = 'Regular'
                        qtAdmitirRegular--
                        alunosAdmitidosRegular.push(aluno)
                    }
                    indexAdmitirRegular++
                } else { break }
            }

            while (qtAdmitirAdultos > 0) {
                let aluno = alunosDoCurso[indexAdmitirAdulto]
                if (aluno) {
                    if (aluno.idade > 20 & (aluno.estado != "Admitido" || aluno.estado != "Admitida" || aluno.estado == "Inscrito")) {
                        aluno.estado = 'Admitido'
                        aluno.periodo = 'Pós-Laboral'
                        qtAdmitirAdultos--
                        alunosAdmitidosAdultos.push(aluno)
                    }
                    indexAdmitirAdulto++
                } else { break }
            }
            //return res.send({alunos})
        }
        let numOrdem = 1
        alunosDoCurso.forEach(aluno => {
            aluno.numOrdem = numOrdem
            if(aluno.estado == "Inscrito"){
                aluno.naoAdmitido = true
                if(aluno.genero == "F"){aluno.estado = "N/Admitida"}else{aluno.estado = "N/Admitido"}
            }else{if(aluno.genero == "F"){aluno.estado = "Admitida"}}
            numOrdem++
        });
        
        //Fução que ordena a lista crescentemente
        function compare(a,b) {
            if (a.nome < b.nome)
               return -1;
            if (a.nome > b.nome)
              return 1;
            return 0;
          }          

        alunosDoCurso.sort(compare);
        res.render("alunos/previsaoCandidaturas", { alunosDoCurso, curso, criterioAdmissao, idadeMinima, idadeMaxima, qtAdmitirRegularEnv, qtAdmitirAdultosEnv, idCurso, idCoord })
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}

export const admissaoCandidaturasConf = async (req, res) => {
    try {
        let { criterioAdmissao, idadeMinima, idadeMaxima, qtAdmitirRegular, qtAdmitirAdultos, idCurso, idCoord } = req.body
        //return res.send({ criterioAdmissao, idadeMinima, idadeMaxima, qtAdmitirRegular, qtAdmitirAdultos, idCurso, idCoord })
        let alunosDoCurso = []
        const qtAdmitirRegularEnv = qtAdmitirRegular
        const qtAdmitirAdultosEnv = qtAdmitirAdultos

        let curso = await findCursoByIdService(idCurso)
        let alunosAdmitidosRegular = []
        let alunosAdmitidosAdultos = []
        if (criterioAdmissao == "porIdade") {
            const msdDeErro = 'Esta opção não está disponível no momento!'
            const msdDeErro2 = 'Se ainda deseja proceguir, por favor, contactar o Administrador.'
            return res.render('msgError', { msdDeErro, msdDeErro2 })
        } else {
            const date = new Date();
            let anoEconoAct = date.getFullYear();

            let alunos = await findAllCandidatosOrdDescMediaService()
            alunos.forEach(aluno => {//Calculando a idade e separando os alunos deste curso
                if (aluno.curso == curso.descricao) { aluno.idade = anoEconoAct - aluno.anoNascimento; alunosDoCurso.push(aluno) }
            });
            let indexAdmitirRegular = 0
            let indexAdmitirAdulto = 0
            while (qtAdmitirRegular > 0) {
                let aluno = alunosDoCurso[indexAdmitirRegular]
                if (aluno) {
                    if (aluno.idade < 20 & (aluno.estado != "Admitido" || aluno.estado != "Admitida" || aluno.estado == "Inscrito")) {
                        aluno.estado = 'Admitido'
                        aluno.periodo = 'Regular'
                        qtAdmitirRegular--
                        alunosAdmitidosRegular.push(aluno)
                    }
                    indexAdmitirRegular++
                } else { break }
            }

            while (qtAdmitirAdultos > 0) {
                let aluno = alunosDoCurso[indexAdmitirAdulto]
                if (aluno) {
                    if (aluno.idade > 20 & (aluno.estado != "Admitido" || aluno.estado != "Admitida" || aluno.estado == "Inscrito")) {
                        aluno.estado = 'Admitido'
                        aluno.periodo = 'Pós-Laboral'
                        qtAdmitirAdultos--
                        alunosAdmitidosAdultos.push(aluno)
                    }
                    indexAdmitirAdulto++
                } else { break }
            }
            //return res.send({alunos})
        }
        let numOrdem = 1
        let qtTotalAdmitidos = 0
        let qtTotalInscrito = 0
        alunosDoCurso.forEach(aluno => {
            aluno.numOrdem = numOrdem
            if(aluno.estado == "Inscrito"){
                aluno.naoAdmitido = true
                if(aluno.genero == "F"){aluno.estado = "N/Admitida"}else{aluno.estado = "N/Admitido"}
            }else{ qtTotalAdmitidos++; if(aluno.genero == "F"){aluno.estado = "Admitida"}}
            numOrdem++
        });
        qtTotalInscrito = numOrdem
        /* Actualizar estado de cada aluno */
        alunosDoCurso.forEach(async candidato => {
            await findCandByIdAndUpdateService(candidato._id, candidato)
        });

        /* Subitrair a quantidade de vagas disponibilizadas pelo Adminitrador */
        let definicoes = await findDefinicoesService()
        if(curso.descricao == "Curso de Ciências Económico-Jurídicas"){definicoes.vagasCEJRegular = definicoes.vagasCEJRegular - qtAdmitirRegularEnv; definicoes.vagasCEJAdultos = definicoes.vagasCEJAdultos - qtAdmitirAdultosEnv }
        if(curso.descricao == "Curso de Ciências Humanas"){definicoes.vagasCHRegular = definicoes.vagasCHRegular - qtAdmitirRegularEnv; definicoes.vagasCHAdultos = definicoes.vagasCHAdultos - qtAdmitirAdultosEnv }
        if(curso.descricao == "Curso de Ciências Físicas e Biológicas"){definicoes.vagasCFBRegular = definicoes.vagasCFBRegular - qtAdmitirRegularEnv; definicoes.vagasCFBAdultos = definicoes.vagasCFBAdultos - qtAdmitirAdultosEnv }
        await findDefincoesAndUpdateService(definicoes._id, definicoes)
        //Fução que ordena a lista crescentemente
        /* function compare(a,b) {
            if (a.nome < b.nome)
               return -1;
            if (a.nome > b.nome)
              return 1;
            return 0;
          }          

        alunosDoCurso.sort(compare); */
        req.flash("success_msg", "Operação realizada com sucesso! Foram admitidos "+qtTotalAdmitidos+" candidatos dos "+qtTotalInscrito+" inscritos no "+curso.descricao)
        res.redirect("/homeCoordenacao/candidatos/"+idCurso )
    } catch (error) {
        return res.status(500).send({ mesage: error.mesage })
    }
}