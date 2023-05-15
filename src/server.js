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


// controllers

const authController = require("./Controllers/Auth.controller");
const uploadController = require("./Controllers/Upload.controller");
const orderController = require("./Controllers/Order.controller");


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


app.set("view engine", "ejs");
app.set("view engine", "hbs")
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
    res.status(201).render("login");
})

app.get("/home", auth ,(req, res) => {
    res.status(201).render("home");
})



// -----------------------------------------For Client -------------------------

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

app.get('/vieworders',auth, async(req, res) => {
    const userID = req.userID;
    orderController.clientOrder(req, res, userID);
})


app.get('/dashboard', auth, (req, res) => {
    res.status(201).render("dashboard");
})

app.get("/success", auth, (req, res) => {
    res.status(201).render("orderPlaced");
})

app.get("/aboutus",auth, (req, res) => {
    res.status(200).render("aboutus");
})
app.get("/contactus", (req, res)=>{
    res.status(200).render("contactus");
})

// For file upload

app.post("/upload", auth, upload.single("fileName") , async(req, res) => {
    try{
        console.log(req.file);
        await uploadController.addOrder(req, res, req.userID);
    }catch(e){
        console.log(e); 
    }
})


app.post("/terminate", (req, res)=> {
    orderController.terminateOrder(req, res);
});

// --------------------------------- For Stationary Owner ---------------------------------
app.get("/mlogin", (req, res) => {
    res.status(200).render("mlogin");
});

app.post("/mlogin", (req, res) => {
    authController.mlogin(req, res);
});

app.get("/mdashboard", (req, res) => {
    orderController.viewOrders(req, res);
})

app.post("/delete", async(req, res)=>{
    orderController.deleteOrder(req,res);
})

app.post("/update", async(req, res)=>{
    orderController.completeOrder(req, res);
})

app.get('/download-pdf/:fileId', async (req, res) => {
    const orderId = req.params.fileId;
    console.log(orderId);
    orderController.downloadFile(req, res, orderId);
    
  });

app.get("*", (req, res) => {
    res.status(404).send("404 Page not found");
})
app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})