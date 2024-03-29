const jwt = require("jsonwebtoken");
const Creds = require("../models/Creds")


const auth = async(req, res, next) => {

    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await Creds.findOne({_id: verifyUser._id});
        req.userID = verifyUser._id;
        req.user = user;
        next();
    } catch (error) {
        res.status(400).render("login");
    }
}

module.exports = auth;