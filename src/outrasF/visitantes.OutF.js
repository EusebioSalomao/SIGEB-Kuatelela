import { findAllVisitantesServece } from "../services/visitantes.servise.js";

export const dadosVisitante = async () => {
    try {

        const visitantes = await findAllVisitantesServece()
        const date = new Date();
        let dia = date.getDate();
        let mes = date.toLocaleString('default', { month: 'long' });
        let ano = date.getFullYear();
        let numVisitas = visitantes.length + 1
        const visita = {
            nome: "Visitante "+numVisitas,
            data: ""+dia+"-"+mes+"-"+ano
        }
        return visita
    } catch (error) {
        console.log(error)
        return error
    }
}