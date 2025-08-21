const mongoose = require('mongoose');

const StatsSchema = mongoose.Schema({
    totalViews: {
        type: Number,
        default: 0
    },
    dailyActiveUsers: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const StatsModel = mongoose.model('Stats', StatsSchema);

module.exports = StatsModel;
