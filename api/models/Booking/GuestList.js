let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let User = require("../Pay/User");
let Booking = require("./Booking");
let GuestListSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    Booking: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Booking,
        }
    ]
});
GuestListSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});
let GuestList = mongoose.model("guestList", GuestListSchema);
module.exports = GuestList;