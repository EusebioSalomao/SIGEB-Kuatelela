import mongoose from "mongoose";

const NewSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    text: {
        type: String,
        require: true
    },
    capa: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    /* user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true 
    }, */
    likes: {
        type: Array,
        required: true
    },
    coments: {
        type: Array,
        required: true
    }
})

const New = mongoose.model('news', NewSchema);

export default New;