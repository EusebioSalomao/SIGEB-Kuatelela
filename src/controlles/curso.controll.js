import { addCursoAnoLectivoService, deleteCursoAnoService, findAnoLectivoById } from "../services/anoLectivo.service.js"
import { createCursoService, findAllCursosService, findCursoByIdAndUpdateService, findCursoByIdService, findCursosByIdAnoService } from "../services/curso.service.js"

export const allCursos = async (req, res) => {
    try {
        const cursos = await findAllCursosService()
        res.render('admin/cursos/tdCursos', { cursos })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const wAdCurso = async (req, res) => {
    try {
        const id = req.params.id
        const anoLectivo = await findAnoLectivoById(id)


        res.render('admin/cursos/addCurso', { anoLectivo })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })

    }
}

export const adCurso = async (req, res) => {
    try {
        const curso = req.body;
        const idAno = req.body.idAno
        curso.idAno = idAno
        const anoLectivo = await findAnoLectivoById(idAno)

        const verifyAllCurso = await findCursosByIdAnoService(idAno)
        let exist = ''
        verifyAllCurso.forEach(element => {
            if (element.descricao == req.body.descricao) {
                exist = 'Este curso já está adicionado!'
            }
        });
        if (exist == '') {
            const novoCurso = await createCursoService(curso);
            const idCurso = novoCurso._id
            const anoUpdade = await addCursoAnoLectivoService(idAno, idCurso)
            const anoLectivo2 = await findAnoLectivoById(idAno)
            req.flash('success_msg', "Curso adicionado com sucesso!")
            res.redirect('/anosLectivo/config/' + idAno)
        } else {
            req.flash('error_msg', "" + exist)
            res.redirect('/cursos/add/' + idAno)
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const wEditCurso = async (req, res) => {
    try {
        const id = req.params.id
        const curso = await findCursoByIdService(id)
        const ano = await findAnoLectivoById(curso.idAno)
        res.render('admin/cursos/editCurso', { curso, ano })
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const editCurso = async (req, res) => {
    try {
        const curso = req.body;
        const id = req.body.id;
        const idAno = req.body.idAno
        curso.idAno = idAno
        const anoLectivo = await findAnoLectivoById(idAno)

        const verifyAllCurso = await findCursosByIdAnoService(idAno)
        let exist = ''
        verifyAllCurso.forEach(element => {
            if (element.descricao == req.body.descricao && element._id != id) {
                exist = 'Este curso já está adicionado!'
            }
        });
        if (exist == '') {
            await findCursoByIdAndUpdateService(id, curso)
            req.flash('success_msg', "Curso editado com sucesso!")
            res.redirect('/anosLectivo/config/' + idAno)
        } else {
            req.flash('error_msg', "" + exist)
            res.redirect('/cursos/editar/'+id)
        }
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
    }
}

export const excluirCurso = async (req, res) => {
    try {
        const idCurso = req.params.id
        const curso = await findCursoByIdService(idCurso)
        const idAno = curso.idAno;
        const ano = await findAnoLectivoById(curso.idAno)
       
        //await deleteCursoAnoService(idAno, ano)

       res.send(ano)
    } catch (error) {
        res.status(500).send({ mesage: error.mesage })
        
    }
}