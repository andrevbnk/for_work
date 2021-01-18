const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
require('mongoose-uuid2')(mongoose);
const UUID = mongoose.Types.UUID;



const Room = mongoose.model(
    "Room",
    new mongoose.Schema({
    // name: { type: String, lowercase: true, unique: true },
    _id: { type: UUID, default: uuidv4 },
    users: [{type:String}], 
    messages: [{
        from:{type:String},
        body:{type:String},
        date:{ type: Date, default: Date.now },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    })
);

module.exports = Room;