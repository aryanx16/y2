const express = require("express")
const CheckAuth = require("../middleware/CheckAuth")
const cloudinary = require("cloudinary").v2
const jwt = require('jsonwebtoken')
require("dotenv").config()
const VideoRouter = express.Router()
const Video =  require("../models/Video")
const { default: mongoose } = require("mongoose")
cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME , 
    api_key:process.env.API_KEY , 
    api_secret: process.env.API_SECRET,
})
VideoRouter.post("/",CheckAuth,async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]
        const user = jwt.verify(token,process.env.jwtSecret)
        
        const UploadedVideo = await cloudinary.uploader.upload(req.files.Video.tempFilePath,{
            resource_type:'video'
        })
        const UploadedThumbnail = await cloudinary.uploader.upload(req.files.Thumbnail.tempFilePath,{
            resource_type:"image"
        })
        const newvideo = new Video({
            _id:new mongoose.Types.ObjectId,
            Title: req.body.Title,
            UserId:user._id,
            Description:req.body.Description,
            VideoUrl:UploadedVideo.secure_url,
            VideoId:UploadedVideo.public_id,
            Tags:req.body.Tags.split(","),
            ThumbnailUrl:UploadedThumbnail.secure_url,
            ThumbnailId:UploadedThumbnail.public_id,
            Category:req.body.Category,
        })
        const CreatedVideo = await newvideo.save();
        console.log(CreatedVideo);
        // console.log(UploadedThumbnail)
        // console.log(UploadedVideo)
        console.log("/upload working perfectly...")
    }catch(e){
        console.log("ERROR IN UPLOADIND VIDEO..."+e.message)
        return res.status(400).json({message:"ERROR IN UPLOADING VIDEO..."})
    }
})
VideoRouter.put("/:VideoId",async(req,res)=>{
    try{
        const VideoId = req.params.VideoId;
        const token = req.headers.authorization.split(" ")[1]
        const user = jwt.verify(token,process.env.jwtSecret)
        const video = await Video.findById({_id:VideoId})
        if(!video){
            return res.json({message:"Video not found"})
        }
        console.log(video)
        if(user._id!=video.UserId){
            console.log("USER DOSENT HAVE ACCESS TO EDIT THIS VIDEO")
            return res.status(401).json({message:"You dont have acccess to edit this video"})
        }
        if(req.files){
            await cloudinary.uploader.destroy(video.ThumbnailId)
            const UpdatedThumbnail = await cloudinary.uploader.upload(req.files.Thumbnail.tempFilePath)
            const UpdatedData = {
                Title:req.body.Title,
                Description:req.body.Description,
                Category:req.body.Category,
                Tags:req.body.Tags.split(","),
                ThumbnailId:UpdatedThumbnail.public_id,
                ThumbnailUrl:UpdatedThumbnail.secure_url,  
            }
            console.log(UpdatedData)
            const UpdatedVideo = await Video.findByIdAndUpdate(VideoId,UpdatedData,{new:true})
            console.log(UpdatedVideo)
        }else{
            const UpdatedData = {
                Title:req.body.Title,
                Description:req.body.Description,
                Category:req.body.Category,
                Tags:req.body.Tags.split(","),
            }
            const UpdatedVideo = await Video.findByIdAndUpdate(req.params.VideoId,UpdatedData)
            console.log(UpdatedVideo)
        }
        console.log("/upload working perfectly...")
    }catch(e){
        console.log("ERROR IN UPDATING VIDEO..."+e)
        return res.status(401).json({message:"Token invalid"})
    }
})
VideoRouter.delete("/:vid",async(req,res)=>{
    try{
        const video = await Video.findById(req.params.vid)
        if(!video){
            console.log("VIDEO NOT FOUND...")
            return res.json({message:"VIDEO NOT FOUND"})
        }
        const token = await req.headers.authorization.split(" ")[1]
        const verifyToken = await jwt.verify(token,process.env.jwtSecret)
        if(!verifyToken){
            return res.json({message:"INVALID TOKEN"})
        }
        console.log(verifyToken)
        console.log(video)
        // if(verifyToken._id != video.UserId){
        //     return res.json({message:"YOU DONT HAVE ACCESS TO DELETE THIS VIDEO"})
        // }
        const deletedVideo = await cloudinary.uploader.destroy(video.VideoId,{resource_type:'video'})
        const deletedThumbnail = await cloudinary.uploader.destroy(video.ThumbnailId,{resource_type:'image'})
        const deletedVideoData = await Video.findByIdAndDelete(req.params.vid)
        console.log(deletedVideoData);
        console.log("/delte working perfectly...")
    }catch(e){
        console.log("ERROR WHILE DELETING THE VIDEO...",e)
        return res.status(401).json({message:"ERROR WHILE DELETING VIDEO..."})
    }
})
VideoRouter.put("/like/:vid",async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]
        console.log(token)
        if(!token){
            console.log("TOKEN ERROR WHILE LIKING THE VIDEO")
            return res.json({message:"TOKEN ERROR WHILE LIKING THE VIDEO"})
        }
        const user =await jwt.verify(token,process.env.jwtSecret)
        // console.log(user)
        if(!user){
            return res.json({message:"User not found"})
        }
        const video = await Video.findById(req.params.vid);
        // console.log(video)
        console.log(video.LikedBy)
        const isLiked = video.LikedBy.includes(user._id)
        const isDisliked = video.DislikedBy.includes(user._id)
        console.log(isLiked)
        if(!isLiked && !isDisliked){
            video.LikedBy.push(user._id)
            video.Likes+=1;
        }else if(isDisliked){
            video.DislikedBy = video.DislikedBy.filter(uid=>uid.toString()!==user._id.toString())
            video.Dislikes-=1;
            video.LikedBy.push(user._id)
            video.Likes+=1;
        }else if(isLiked){
            video.LikedBy = video.LikedBy.filter(uid=>uid.toString()!== user._id.toString())
            video.Likes-=1;
        }
        await video.save()
        
        console.log("likedby",video.LikedBy)
        console.log("Dislikedby",video.DislikedBy)
        console.log("/upload working perfectly...")
    }catch(e){
        console.log("ERROR WHILE LIKING THE VIDEO",e)
        return res.json({message:"ERROR WHILE LIKING THE VIDEO"})
    }
})
VideoRouter.put("/dislike/:vid",async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1]
        console.log(token)
        if(!token){
            console.log("TOKEN ERROR WHILE LIKING THE VIDEO")
            return res.json({message:"TOKEN ERROR WHILE LIKING THE VIDEO"})
        }
        const user =await jwt.verify(token,process.env.jwtSecret)
        // console.log(user)
        if(!user){
            return res.json({message:"User not found"})
        }
        const video = await Video.findById(req.params.vid);
        // console.log(video)
        console.log(video.LikedBy)
        const isLiked = video.LikedBy.includes(user._id)
        const isDisLiked = video.DislikedBy.includes(user._id)
        console.log(isLiked)
        console.log(isDisLiked)
        if(!isLiked && !isDisLiked){
            video.DislikedBy.push(user._id)
            video.Dislikes+=1;
        }
        else if(isLiked){
            video.LikedBy = video.LikedBy.filter(uid=>uid.toString()!== user._id.toString())
            video.Likes-=1;
            video.DislikedBy.push(user._id)
            video.Dislikes+=1;
        }else if(isDisLiked){
            video.DislikedBy = video.DislikedBy.filter(uid=>uid.toString()!== user._id.toString())
            video.Dislikes-=1;
        }
        
        await video.save()
        console.log("likedby",video.LikedBy)
        console.log("Dislikedby",video.DislikedBy)
        console.log(video.LikedBy)
        console.log("/upload working perfectly...")
    }catch(e){
        console.log("ERROR WHILE LIKING THE VIDEO",e)
        return res.json({message:"ERROR WHILE LIKING THE VIDEO"})
    }
})
VideoRouter.get("/:id",(req,res)=>{
    console.log("/upload working perfectly...")
})
VideoRouter.get("/:category",(req,res)=>{
    console.log("/upload working perfectly...")
})
VideoRouter.get("/:tags",(req,res)=>{
    console.log("/upload working perfectly...")
})

module.exports = VideoRouter