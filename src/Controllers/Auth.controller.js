const Auth = require("../models/Creds");
const bcrypt = require("bcrypt");
const createError = require('http-errors');

module.exports = {
    signUp: async(req, res) => {
        try {
            const password = req.body.password;
            const cpassword = req.body.cpassword;
            const email = req.body.email;
            
            const doesExist = await Auth.findOne({email:email});
            if(doesExist){
                throw createError.Conflict(`A user with ${email} does exist!`);
            }

            if(password === cpassword){
                console.log("Saved!!");

                const newUser = new Auth({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                });

                const details = await newUser.save();
                console.log(details);

                const token = await newUser.generateAuthToken();
                console.log(`The token is: ${token}`)
                console.log("Saved!")
                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 60000),
                    httpOnly: true
                })
                res.status(201).render("login");
            }
            else{
                throw createError.Conflict(`Password doesn't match!`)
            }
        } catch (e) {
            console.log(e);
            res.status(400).render("signup", {error: e});
        }
    },
    login: async(req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const details = await Auth.findOne({email: email});
            if(!details){
                throw createError.NotFound("User not registered!");
            }
            const isMatch = await bcrypt.compare(password, details.password);
            
            const token = await details.generateAuthToken();
    
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60*60*100),
                httpOnly: true, 
            })
            if(isMatch){
                res.status(200).render("home");
            }else{
                throw createError.Unauthorized("Password is incorrect!");
            }
        } catch (e) {
            res.status(400).render("login", {error: e });
        }
    }
}