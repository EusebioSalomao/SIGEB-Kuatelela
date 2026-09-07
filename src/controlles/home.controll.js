import { dadosVisitante } from "../outrasF/visitantes.OutF.js"
import { findAnoLectivoByEstadoService } from "../services/anoLectivo.service.js"
import { findAllNoticiasService, ultimasInformacoes } from "../services/news.services.js"
import { createVisitanteService } from "../services/visitantes.servise.js"

export const inicio = async (req, res) => {
    try {
        /* Registrar visitante */
        const visita = await dadosVisitante()
        const v = await createVisitanteService(visita)
       // return res.render('admin/pago')
    
        /* Códigos proprios da tela início */
        const estado = 'Activo'
        const anoActivo = await findAnoLectivoByEstadoService(estado)
        let candidaturaAberta = ''
        const informacoes = await ultimasInformacoes()
        
        if(anoActivo != null && anoActivo.candidatura == 'Aberta'){
            candidaturaAberta = 'sim'
            res.render('home/principal', {candidaturaAberta, informacoes})
        }else{
            res.render('home/principal', {informacoes})

        }
        
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

export const sobreNos = async (req, res) => {
    try {
        res.render('home/sobreNos')
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}