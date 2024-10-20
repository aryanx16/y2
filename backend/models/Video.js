const mongoose = require("mongoose")

const VideoSchema = new mongoose.Schema({
        _id:{
            type:mongoose.Schema.Types.ObjectId
        },
        Title:{
            type:String,
            required:true,
        },
        Description:{
            type:String,
            required:true,
        },
        UserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        VideoUrl:{
            type:String,
            required:true,
        },
        VideoId:{
            type:String,
            required:true,
        },
        ThumbnailUrl:{
            type:String,
            required:true,
        },
        ThumbnailId:{
            type:String,
            required:true,
        },
        Category:{
            type:String,
            requried:true,
        },
        Tags:[{type:String}],
        Likes:{
            type:Number,
            default:0,
        },
        Dislikes:{
            type:Number,
            default:0,
        },
        Views:{
            type:Number,
            default:0,
        },
        LikedBy:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
        DislikedBy:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
        ViewedBy:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],  
},{timestamps:true})

module.exports = mongoose.model("Video",VideoSchema)