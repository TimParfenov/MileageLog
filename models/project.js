const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema ({
    project: String,
    
});

module.exports = mongoose.model('Project', projectSchema);
