import mongoose from "mongoose"
const Schema = mongoose.Schema;

const NotaTrimestral = new Schema({
    av1T1: {
        type: Number,
        require: true
    },
    av2T1: {
        type: Number,
        require: true
    },
    av3T1: {
        type: Number,
        require: true
    },
    av1T2: {
        type: Number,
        require: true
    },
    av2T2: {
        type: Number,
        require: true
    },
    av3T2: {
        type: Number,
        require: true
    },
    av1T3: {
        type: Number,
        require: true
    },
    av2T3: {
        type: Number,
        require: true
    },
    av3T3: {
        type: Number,
        require: true
    },
    mac1: {
        type: Number,
        require: true
    },
    mac2: {
        type: Number,
        require: true
    },
    mac3: {
        type: Number,
        require: true
    },
    mt1: {
        type: Number,
        require: true
    },
    mt2: {
        type: Number,
        require: true
    },
    mt3: {
        type: Number,
        require: true
    },
    pp1: {
        type: Number,
        require: true
    },
    pp2: {
        type: Number,
        require: true
    },
    pp3: {
        type: Number,
        require: true
    },
    pt1: {
        type: Number,
        require: true
    },
    pt2: {
        type: Number,
        require: true
    },
    pt3: {
        type: Number,
        require: true
    },
    medDosTrimestes: {
        type: Number,
        require: true
    },
    pOral: {
        type: Number,
        require: true
    },
    examePF: {
        type: Number,
        require: true
    },
    cf: {
        type: Number,
        require: true
    }
    
    
})


const notaTrimestral  = mongoose.model("notasTrimestrais", NotaTrimestral)
export default notaTrimestral