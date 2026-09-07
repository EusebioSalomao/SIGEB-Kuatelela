
export const mensagemDeerros = (req, res) => {
    try {
        return res.render('msgError')
    } catch (error) {
        return res.status(500).send({mesage: error.mesage})
    }
}