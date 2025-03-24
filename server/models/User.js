import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        min: 5
    },
    password: {
        type: String,
        min: 5
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
})


const User = mongoose.model('User', userSchema);
export default User;
