const orders = require("../models/Upload");
const User = require("../models/Creds");
const completedOrders = require("../models/CompletedOrders")
module.exports = {
    viewOrders: async (req, res) => {
        try {
          let result = 0;
          const documents = await completedOrders.find({});
          documents.forEach(function(doc) {
            result += doc.price;
          });
      
      
          const availableOrders = await orders.find({ orderStatus: false });
          const availOrder = [];
          await Promise.all(
            availableOrders.map(async (doc) => {
              const name = await User.findById(doc.userID);
              availOrder.push({
                orderId: doc._id,
                fileName: doc.fileName,
                UserName: name.name,
                preference: doc.preferences,
                price: doc.price,
                stationary: doc.stationary,
                total: result,
              });
            })
          );
          res.status(200).render("mdashboard.ejs", { orders: availOrder, total: result });
        } catch (error) {
          console.log(error);
        }
      },
      
    deleteOrder: async(req, res) => {
        
        const orderId = req.body.orderId;
        try{
            const delOrder = await orders.findOneAndDelete({_id: orderId});

            if(!delOrder){
                return res.status(200).json({error: "sorry"});
            }

            const user = await User.findByIdAndUpdate(
                delOrder.userID,    
                {$pull: {order_IDs: orderId}}, {new: true}
            );
            console.log("Order Deleted!");
            res.redirect(303, "/mdashboard");

        }
        catch(e){
            res.status(500).json({message: "error"});
        }
    },
    terminateOrder: async(req, res) => {
        const orderId = req.body.orderId;
        try{
            const delOrder = await orders.findOneAndDelete({_id: orderId});
            if(!delOrder){
                return res.status(200).json({error: "sorry"});
            }
            const user = await User.findByIdAndUpdate(
                delOrder.userID,    
                {$pull: {order_IDs: orderId}}, {new: true}
            );
            console.log("Order Deleted!");
            res.redirect(303, "/dashboard");

        }
        catch(e){
            res.status(500).json({message: "error"});
        }
    },

    completeOrder: async(req, res) => {
        const orderId = req.body.orderId;
        const orderStatus = true;
        try{
            const updateOrder = await orders.updateOne({_id: orderId}, {$set: {orderStatus}});
            const details = await orders.findById({_id: orderId});
            const delOrder = await orders.findById({_id:orderId});
            const doneOrder = new completedOrders({
                userID: delOrder.userID,
                fileName: delOrder.fileName,
                preferences: delOrder.preferences,
                stationary: delOrder.stationary,
                numPages: delOrder.numPages, 
                price: delOrder.price, 
                orderStatus: delOrder.orderStatus
            });
            doneOrder.save();
            console.log("Order Completed!")
            if(!updateOrder){
                return res.status(200).json({error: "sorry"});
            }
            
            console.log("Order Status Updated!");
            res.redirect(303, "/mdashboard");
        }catch(e){
            console.log(e);
            res.status(500).json({message: "error"});
        }
    },
    downloadFile: async(req, res, orderId) => {
        try {
            const document = await orders.findById(orderId);
        
            if (!document) {
              return res.status(404).send('File not found');
            }
        
            const fileData = document.fileData;
            const fileName = document.fileName;
            if (!fileData || fileData.length === 0) {
                return res.status(404).send('File data not found');
              }
          
              res.set('Content-Type', 'application/pdf');
              
              res.set('Content-Disposition', `attachment; filename="${fileName}"`);
              res.send(Buffer.from(fileData.buffer));
          } catch (error) {
            console.error('Error retrieving file:', error);
            res.status(500).send('Internal Server Error');
          }
    },
    clientOrder: async(req, res, userID)=>{
        try {
            const user = await User.findById(userID);
            if (!user) {
              return res.status(404).render("vieworders",{record: " "});
            }
          
            const orderIds = user.order_IDs;
          
            if (!orderIds) {
              return res.status(200).render("vieworders", { record: " " });
            }
          
            const pendingOrders = await orders.find({ _id: { $in: orderIds } });
            
            const record = [];
            pendingOrders.forEach((data) => {
              record.push({
                filename: data.fileName,
                stationary: data.stationary,
                price: data.price,
                numPages: data.numPages,
                status: data.orderStatus,
              });
            });
          
            res.status(200).render("vieworders", { record: record });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
          
          
    }    
}