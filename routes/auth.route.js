const express=require('express');
const router=express.routerr();
const auth = require("../src/Controllers/Auth.controller")

router.post("/signup", auth.signUp);
router.post("/login", auth.login);

module.exports=router;