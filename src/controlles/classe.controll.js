import { findAnoLectivoById } from "../services/anoLectivo.service.js"
import { createClasseService, findAllClassesByIdCurso } from "../services/classe.service.js"
import { findCursoByIdAndUpdateService, findCursoByIdService } from "../services/curso.service.js"


export const addClasse = async (req, res) => {
    try {
        const idCurso = req.body.idCurso
        const idAno = req.body.idAno
        const classe = {
            designacao: req.body.designacao,
            numVagas: req.body.numVagas,
            idCurso: req.body.idCurso,
            idAno: req.body.idAno
        }
        if (req.body.designacao === 'selecionar') {
            return res.send('Selecione uma classe para adicionar...')
        }
        if (req.body.turnos === 'selecionar') {
            return res.send('Selecione o turno...')
        }
        const curso = await findCursoByIdService(idCurso)

        //Verificar se ja existe uma classe com a mesma designação
        let msg = ''
        let exist = ''
        const veriClasse = await findAllClassesByIdCurso(idCurso)
        veriClasse.forEach(element => {
            if (element.designacao == req.body.designacao) {
                exist = 'Esta classe já existe neste curso!'
            }
        });
        if (exist == '') {
            //return res.send('Poderá adiconar a classe!')
            const novaClasse = await createClasseService(classe)
            msg = 'Classe adicionada com secesso!'
            if (req.body.designacao === "10ª Classe") {
                curso.classe10 = novaClasse._id
            }
            if (req.body.designacao === '11ª Classe') {
                curso.classe11 = novaClasse._id
            }
            if (req.body.designacao === '12ª Classe') {
                curso.classe12 = novaClasse._id
            }
            const cursoAct = await findCursoByIdAndUpdateService(idCurso, curso)
            const ano = await findAnoLectivoById(idAno)
            const classes = await findAllClassesByIdCurso(idCurso)

            req.flash('success_msg', 'Nova classe adicionada com sucesso ao curso: ' + curso.descricao)
            res.render('admin/cursos/gerirCurso', { cursoAct, ano, classes, msg, curso })
        } else {
            //return res.send(exist)
            const ano = await findAnoLectivoById(idAno)
            const classes = await findAllClassesByIdCurso(idCurso)

            req.flash('success_msg', 'Nova classe adicionada com sucesso ao curso: ' + curso.descricao)
            res.render('admin/cursos/gerirCurso', { ano, classes, exist, curso })

        }
        //return res.redirect('/anosLectivo/config/' + idAno)


    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}