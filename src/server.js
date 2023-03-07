const express = require('express')
const app =express();
const path= require('path')
require("./db/Credentials")
const Auth = require("./models/Creds");
const bcrypt = require("bcrypt");
const rte=require('../routes/auth.route')
const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, "../public");

app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.set("view engine", "hbs")
app.use('/',rte);
// app.get("/", (req, res) => {
//     res.status(201).render("login");
// })

// ----------LOGIN------------

app.get('/login', (req, res) => {
    res.status(201).render("login");

})

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const details = await Auth.findOne({email: email});
        const isMatch = bcrypt.compare(password, details.password);

        if(isMatch){
            res.status(200).render("home", {name: details.name});
        }else{
            res.send("Invalid Credentials!");
        }
    } catch (e) {
        res.status(400).send(e);
    }
})

// ----------SIGNUP--------------

app.get('/signup',(req,res)=>{
    res.status(201).render("signup");
})

app.post("/signup", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if(password === cpassword){
            const newUser = new Auth({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });
            const nameOfUser = req.body.name;
            const token = await newUser.generateAuthToken();
            const details = await newUser.save();
            res.status(201).render("login");
        }
    } catch (e) {
        res.status(400).send(e);
    }
})



app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})