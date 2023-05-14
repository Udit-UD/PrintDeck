const orders = require("../models/Upload");
const User = require("../models/Creds");

module.exports = {
    deleteOrder: async(req, res) => {
        
        const orderId = req.body.orderID;
        try{
            const delOrder = await orders.findOneAndDelete({_id: orderId});
            if(!delOrder){
                return res.status(200).json({error: "sorry"});
            }
            const user = await User.findByIdAndUpdate(
                delOrder.userID,
                {$pull: {order_IDs: orderId}}, {new: true}
            );
            console.log(user);
            res.status(200).json({message: "Success!"})
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

            res.status(200).json({message: "Success!"});
        }catch(e){
            console.log(e);
            res.status(500).json({message: "error"});
        }
    }
}