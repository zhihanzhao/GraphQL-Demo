const mongoose = require('mongoose');
const { bookings } = require('../graphql/resolvers');

const Schema = mongoose.Schema;

const bookingSchema = Schema(
    {
        event:{
            type: Schema.Types.ObjectId,
            ref:'Event'
        },
        user:{
            type: Schema.Types.ObjectId,
            ref:'User'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Booking', bookingSchema);