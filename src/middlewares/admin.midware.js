
export const confDelete = (req, res, next) => {
    try {
        alert('Vai apagar aluno!')
        next();
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}