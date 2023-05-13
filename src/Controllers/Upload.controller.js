const Creds = require("../models/Creds");
const Upload = require("../models/Upload");

module.exports = {
    addOrder: async(req, res, userID) => {
        const preferences = req.body.Preferences;
        const stationary = req.body.Stationary;

        const newOrder = new Upload({   
            userID,
            fileName: req.file.filename, 
            preferences, 
            stationary
        })
        try{
            newOrder.save();
            const user = await Creds.findOne({_id:userID});
            user.order_IDs.push(newOrder._id);
            await user.save();
            console.log("Order saved!!!");
            res.status(200).render("checkout");
        }
        catch(e){
            console.log(e);
        }
    }
}