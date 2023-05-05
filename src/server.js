const express = require('express')
const app =express();
const path= require('path')
require("./db/Credentials")
const Auth = require("./models/Creds");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 8000;
const auth = require("./Middleware/auth")
const hbs = require("hbs");

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views")
const partial_path = path.join(__dirname, "../templates/partials")

app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:false}));


app.set("view engine", "hbs")
app.set("views", template_path);
hbs.registerPartials(partial_path);


app.get("/", (req, res) => {
    res.status(201).render("login");
})
app.get('/accessed', auth ,(req, res) => {
    console.log(`The cookie is: ${req.cookies.jwt}`);
    res.status(201).render("index");
})

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
        const token = await details.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 10000),
            httpOnly: true, 
            // secure: true
        })
        if(isMatch){
            res.status(200).render("home");
        }else{
            res.send("Invalid Credentials!");
        }
    } catch (e) {
        res.status(400).send(e);
        console.log("Error"+e);
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
            const details = await newUser.save();
            console.log(details)
            const token = await newUser.generateAuthToken();
            console.log(`The token is: ${token}`)
            console.log("Saved!")
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 10000),
                httpOnly: true
            })
            res.status(201).render("login");
        }
    } catch (e) {
        res.status(400).send(e);
    }
})


app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})