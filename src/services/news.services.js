import News from '../models/New.js'

const createService = (news) => News.create(news)

const findAllNoticiasService = ()=> News.find().sort({_id: -1}).lean();

const contNews = () => News.countDocuments();

const topNewsService = () => News.findOne().sort({_id: -1}).lean()

const ultimasInformacoes = () => News.find().limit(2).lean()

const findByIdService = (id) => News.findById(id).lean()

const searchByTitleService = (title) => News.find({
    title: {$regex: `${title || " "}`, $options: "i"}
}).sort({_id: -1}).populate('user').lean();

const byUserService = (id) => News.find({user: id}).sort({_id: -1}).populate('user')

const updateNewsService = (id, informacao) => News.findByIdAndUpdate(id, informacao).lean()

const eraseService = (id) => News.findByIdAndDelete({_id: id})

const likesNewsService = (idNews, userId) => News.findOneAndUpdate({_id: idNews, "likes.userId": {$nin: [userId]}}, {$push: {likes: {userId, created: new Date()}}}).lean()

const deleteLikesNewsService = (idNews, userId) => News.findOneAndUpdate({_id: idNews}, {$pull: {likes: {userId}}}).lean()

const addComentsService = (idNews, coment, userId) => {
    const idComent = Math.floor(Date.now() * Math.random()).toString(36);

    return News.findOneAndUpdate({_id: idNews}, {$push: {coments: {idComent, userId, coment, createAt: new Date()}}})
}

const deleteComentsService = (idNews, idComent, userId) => News.findOneAndUpdate({_id: idNews}, {$pull: {coments: {idComent, userId}}})

export {createService, ultimasInformacoes, findAllNoticiasService, contNews, topNewsService, findByIdService, searchByTitleService, byUserService, updateNewsService, eraseService, likesNewsService, deleteLikesNewsService, addComentsService, deleteComentsService}