const express=require('express');
const route=express.Router();

route.get('/',(req,res)=>{
    res.json({message:"Log page"});
})

module.exports=route;