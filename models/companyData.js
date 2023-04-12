const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companyDataSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    symbol:{
        type:String,
        required:true
    },
    market:{
        type:String,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    primarySource:{
        type:String,
        required:true
    },
    data:{
        type:Array,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("companyData", companyDataSchema);