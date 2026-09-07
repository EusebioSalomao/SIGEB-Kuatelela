import Definicao from "../src/models/definicoes.modell.js"

const syDefinicoes = async () => {
    const definicoes = await Definicao.find().lean()
    if(definicoes.length == 0 || definicoes.length == undefined){
        const definicao = {nome: "Definicoes"}
        Definicao(definicao).save()
        console.log("Definições do Systema criado com sucesso!")
    }
}


export default syDefinicoes