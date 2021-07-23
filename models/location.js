const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema ({
    location: String,
    
});

module.exports = mongoose.model('Location', locationSchema);
