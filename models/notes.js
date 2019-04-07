
const mongoose = require("mongoose");

let noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    },

    user: {
        type: String,
        required: true
    },

    color: {
        type: String,
        enum: ['primary', 'warning', 'danger', 'success'],
        required: true
    }
});

let note = mongoose.model("Note", noteSchema);

module.exports = note;