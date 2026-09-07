

export const rhHome = async (req, res) => {
    try {
        res.render('RH/RHHome')
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}