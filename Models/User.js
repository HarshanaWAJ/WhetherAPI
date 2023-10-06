const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userSchema);

//Export Module
module.exports = User;
