const orders = require("../models/Upload");
const User = require("../models/Creds");

module.exports = {
    viewOrders: async(req, res) => {
        try {
            const availableOrders = await orders.find({ orderStatus: false });
            const availOrder = [];
            await Promise.all(availableOrders.map(async (doc) => {
                const name = await User.findById(doc.userID);
                availOrder.push({
                  orderId: doc._id,
                  fileName: doc.fileName,
                  UserName: name.name,
                  preference: doc.preferences,
                  price: doc.price,
                  stationary: doc.stationary
                });
                
              }));
              res.status(200).render("mdashboard.ejs", {orders: availOrder});
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

            if(!updateOrder){
                return res.status(200).json({error: "sorry"});
            }
            
            const user = await User.findByIdAndUpdate(
                details.userID, 
                {$pull: {order_IDs: orderId}}, {new: true}
            );
            console.log("Order Status Updated!");
            res.redirect(303, "/mdashboard");
        }catch(e){
            console.log(e);
            res.status(500).json({message: "error"});
        }
    },
    downloadFile: async(req, res, orderId) => {
        try {
            // Find the document with the specified fileId
            const document = await orders.findById(orderId);
        
            if (!document) {
              return res.status(404).send('File not found');
            }
        
            // Access the file data (assuming it's stored as a Binary object)
            const fileData = document.fileData;
            const fileName = document.fileName;
            if (!fileData || fileData.length === 0) {
                return res.status(404).send('File data not found');
              }
          
              // Stream the file to the client for download
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
              return res.status(404).json("User not found");
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
            console.log(record);
          
            res.status(200).render("vieworders", { record: record });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
          }
          
          
    }    
}