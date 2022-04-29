const mongoose = require('mongoose');

const apiSchema = mongoose.Schema({
    apiKey: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
    }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('Api', apiSchema)