import { createService, findAllNoticiasService, contNews, topNewsService, findByIdService, searchByTitleService, byUserService, updateNewsService, eraseService, likesNewsService, deleteLikesNewsService, addComentsService, deleteComentsService } from '../services/news.services.js'

const newNova = (req, res) => {
    res.render('news/new')
}

const create = async (req, res) => {
    try {
        const capa = req.file.filename 
        //return res.send(capaNot)

        const { title, text } = req.body;
        if (!title || !text || !capa) {
            return res.status(400).send({ message: 'Preencha todos os campos' })
        }

        await createService({
            title,
            text,
            capa,
            //user: req.userId
        })

        res.send(201 + ' - Criado')

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const findtAll = async (req, res) => {
    try {
        const notiPrincipal = await topNewsService()
        const noticias = await findAllNoticiasService()
       // return res.send({notiPrincipal})
        res.render('news/tdNoticias', {notiPrincipal, noticias})
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

const topNews = async (req, res) => {
    try {
        const news = await topNewsService()
        if (!news) {
            return res.status(400).send('Não ha noticia registrada')
        }
        res.send({
            news: {
                id: news._id,
                title: news.title,
                text: news.text,
                banner: news.banner,
                likes: news.likes,
                coments: news.coments,
                nome: news.user.nome,
                userName: news.user.email
            }
        })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const findById = async (req, res) => {
    try {
        const id = req.body.idNews;

        console.log(id)
        const news = await findByIdService(id)
        if (!news) {
            res.status(400).send('Noticia não encontrada!')
        }
        res.send({
            news: {
                id: news._id,
                title: news.title,
                text: news.text,
                banner: news.banner,
                likes: news.likes,
                coments: news.coments,
                nome: news.user.nome,
                userName: news.user.email
            }
        })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const searchByTitle = async (req, res) => {
    try {
        const { title } = req.body
        console.log(title)
        const news = await searchByTitleService(title)
        if (!news) {
            return res.status(400).send({ message: 'Nenhum resultado encontrado' })
        }
        //return res.send({news})
        res.send({
            results: news.map(item => ({
                id: item._id,
                title: item.title,
                text: item.text,
                banner: item.banner,
                likes: item.likes,
                coments: item.coments,
                user: item.user.nome
            }))
        })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const byUser = async (req, res) => {
    try {
        const id = req.userId
        const news = await byUserService(id)
        if (!news) {
            return res.status(400).send({ message: 'Nenhum resuçtado encontrado' })
        }
        res.send({
            results: news.map(item => ({
                id: item._id,
                title: item.title,
                text: item.text,
                banner: item.banner,
                likes: item.likes,
                coments: item.coments,
                user: item.user.nome
            }))
        })

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

//NÃO TERMINADO
const updateNews = async (req, res) => {
    try {
        const informacao = req.body
        const id = informacao.id

        const news = await findByIdService(id)
        //return res.send({news})

       /*  if (news.user._id != req.userId) {
            return res.status(400).send({ message: 'Não tens autorização de alterar!' })
        } */
        await updateNewsService(id, informacao)
        req.flash( 'success_msg', 'Notícia actualizada com sucesso!')
        res.redirect('/secretaria/gerirInformacoes')

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

//NÇAO CONCLUIDO
const erase = async (req, res) => {
    try {
        const id = req.body.id
        const news = await findById(id)
        if (news) {
            return res.send('Noticia encontrada, Agora tem de se apagar...')
        }

    } catch (error) {
        res.status(500).send({ message: error.message + ' em Delete News!' })
    }
}

const likesNews = async (req, res) => {
    try {
        const id  = req.body.idNews
        const user = req.user
        const idUser = user._id
        console.log(typeof id)



        const newsLike = await likesNewsService(id, idUser)

        if (!newsLike) {
            await deleteLikesNewsService(id, idUser)
            res.redirect('/noticias')
        }else{   
            res.redirect('/noticias')
        }
    } catch (error) {
        res.status(500).send({ message: error.message + ' em LikeNews' })

    }
}

export const wEdtNew = async (req, res) => {
    try {
        const idInf = req.params.id
        const informacao = await findByIdService(idInf)
        res.render('news/editNews', {informacao})
    } catch (error) {
        res.status(500).send({mesage: error.mesage})
    }
}

//Não está a visualizar os comentários...(em findAll)
const addComents = async (req, res) => {
    try {
        const id = req.id
        const userId = req.userId
        const coment = req.body.coment
        if(!coment){
            res.status(400).send({message: 'Escreva um comentário!'})
        }

        await addComentsService(id, coment, userId);
        res.send({message: 'Comentário adicionado com sucesso!'})

    } catch (error) {
        res.status(500).send({ message: error.message + ' em addComents' })
    }
}
const deleteComents = async (req, res) => {
    try {
        const {idNews, idComent} = req.body
        const userId = req.userId
       

        await deleteComentsService(idNews, idComent, userId);
        res.send({message: 'Comentário removido com sucesso!'})

    } catch (error) {
        res.status(500).send({ message: error.message + ' em deleteComents' })
    }
}



export { newNova, create, findtAll, topNews, findById, searchByTitle, byUser, updateNews, erase, likesNews, addComents, deleteComents }