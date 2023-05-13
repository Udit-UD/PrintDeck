const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        default: "N/A",
    },
    preferences:{
        type: String,
        enum: ["Black&White", "Colored"],
    },
    stationary:{
        type: String,
        enum: ["NCT-4", "C3", "Tagore"],

    }
});

const uploadFile = mongoose.model("fileUpload", uploadSchema);

module.exports = uploadFile;
