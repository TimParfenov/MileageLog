const { Timestamp } = require('bson');
const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema ({
    project: String,
    from: String,
    to: String,
    start: Number,
    finish: Number,
    }, {
        timestamps: true
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
