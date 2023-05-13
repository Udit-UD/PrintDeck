const express = require('express')
const app =express();
const path= require('path')
require("./db/Credentials")
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 8000;
const auth = require("./Middleware/auth")
const upload = require("./Middleware/uploads");
const hbs = require("hbs");
const bodyParser = require("body-parser");

// chudap
const authController = require("./Controllers/Auth.controller");
const uploadController = require("./Controllers/Upload.controller");


const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views")
const partial_path = path.join(__dirname, "../templates/partials")

// MiddleWares!

app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:false}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "hbs")
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
    res.status(201).render("login");
})

// ----------LOGIN------------

app.get('/login', (req, res) => {
    res.status(201).render("login");

})

app.post("/login", async(req, res) => {
    authController.login(req, res);
})

// ----------SIGNUP--------------

app.get('/signup',(req,res)=>{
    res.status(201).render("signup");
})

app.post("/signup", async(req, res) => {
    authController.signUp(req, res);
})

app.get("/logout", auth, async(req, res) =>{
    try{
        res.clearCookie("jwt");
        console.log("Logout Successfully!");
        await req.user.save();
        res.status(200).render("login");
    }catch(e){
        res.send(e);
    }
});


// Pages after Authentications!

app.get('/accessed', auth ,(req, res) => {
    res.status(201).render("index");
})

app.get('/dashboard', auth, (req, res) => {
    res.status(201).render("dashboard");
})

// For file upload

app.post("/upload", auth,upload.single("fileName") , async(req, res) => {
    try{
        uploadController.addOrder(req, res, req.userID);
    }catch(e){
        console.log(e); 
    }
})



app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})