const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    firstname : {
        type:String,
        required:true
    },
    lastname : {
        type:String,
        require
    },
   
   username:{
    type:String
   },

    password : {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    phone : {
        type:Number,
        required:true
    },
   
   token:{
    type:String,
    default:""
   }
   

})

const User = mongoose.model('users' , userSchema)

module.exports=User