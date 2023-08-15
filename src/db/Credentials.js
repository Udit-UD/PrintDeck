const mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://udgupta33:Uditmongo3@cluster0.p6qaizp.mongodb.net/creds?retryWrites=true&w=majority")
    .then(()=> {console.log("Connection Successful...")})
    .catch((e) => {console.log("Connection Failed...")})