const { resolve } = require("path");
const Creds = require("../models/Creds");
const Upload = require("../models/Upload");
const tempUpload = require("../models/tempOrders");
const fs = require("fs");
const PdfParse = require("pdf-parse");


module.exports = {
    addOrder: async(req, res, orderID) => {
        try{
            const order = await tempUpload.findById(orderID);
            console.log(order);

            const newOrder = new Upload({
                userID: order.userID,
                fileName: order.fileName,
                preferences: order.preferences,
                stationary: order.stationary,
                fileData: order.fileData, 
                numPages: order.numPages,
                price: order.price,
                orderStatus: order.orderStatus
            })
            newOrder.save();
            const user = await Creds.findById(order.userID);
            user.order_IDs.push(newOrder._id);
            await user.save();
            console.log("Order Saved!!!!");

        }
        
        catch(e){
            console.log(e);
        }

    },

    tempAddOrder: async(req, res, userID) => {
        
        const preferences = req.body.Preferences;
        const stationary = req.body.Stationary;
        const filePath = `./uploads/${req.file.filename}`;
        const fileBuffer = fs.readFileSync(filePath);
        const handlePDF = async() => {
            const newOrder = new tempUpload({   
                userID,
                fileName: req.file.filename, 
                preferences, 
                stationary,
                fileData: fileBuffer, 
                numPages: numPages,
                price: price,
                orderStatus: false
            })
            try{
                newOrder.save();
                
                res.status(200).render("checkout", {numPages: numPages,
                                                    fileName: req.file.originalname, 
                                                    colorPreference: preferences, 
                                                    stationary: stationary,
                                                    price: price, 
                                                    orderId: newOrder._id});
            }
            catch(e){
                console.log(e);
            }
        }

        var numPages;
        var price = 0;

        
        PdfParse(fileBuffer).then((data)=>{
            numPages =  data.numpages;
            if(preferences == "Black&White"){
                price = Number(numPages) * 2.5;
            }else{
                price = Number(numPages) * 6;
            }
            handlePDF();
            
        }).catch((e) => {
            res.json({error: e});
        })
    }


}