const { resolve } = require("path");
const Creds = require("../models/Creds");
const Upload = require("../models/Upload");
const fs = require("fs");
const PdfParse = require("pdf-parse");


module.exports = {
    addOrder: async(req, res, userID) => {
        
        const preferences = req.body.Preferences;
        const stationary = req.body.Stationary;
        const filePath = `./uploads/${req.file.filename}`;
        const fileBuffer = fs.readFileSync(filePath);
        const handlePDF = async() => {
            const newOrder = new Upload({   
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
                const user = await Creds.findOne({_id:userID});
                user.order_IDs.push(newOrder._id);
                await user.save();
                console.log("Order saved!!!");
                res.status(200).render("checkout", {numPages: numPages,
                                                    fileName: req.file.originalname, 
                                                    colorPreference: preferences, 
                                                    stationary: stationary,
                                                    price: price});
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
        console.log(numPages+ " " + price);
    


    }
}