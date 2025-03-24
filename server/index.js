import express from 'express'
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from "./authMiddleware.js";

dotenv.config();
const app = express()

const allowedOrigins = [
    "http://localhost:3000",
    "https://signzy-assignment-client.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));
app.all('', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    //Auth Each API Request created by user.
    next();
});
const ObjectId = mongoose.Types.ObjectId;

//register and login section
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ Message: "Username and password are required!" })
        }
        const user = await User.findOne({ username: username });
        if (user) {
            return res.status(200).json({ Message: "User already exists with same username" })
        }
        const newUser = new User({ username, password });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        return res.status(200).json({ Message: "Registration successful!", token: token });
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ Message: "Username and password are required!" })
        }
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.json({ Message: "User does not exists!" })
        }
        if (password !== user.password) {
            return res.json({ Message: "Incorrect password!" })
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        return res.status(200).json({ Message: "Login successful!", token: token })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})


// feed
app.get("/users", verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ Message: "Users fetched successfully!", users: users });
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})

//search-users
app.get("/search", verifyToken,  async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json({ Message: "Query is required!" })
        }
        const users = await User.find({ username: { $regex: query, $options: "i" } });
        return res.status(200).json({ Message: "Users fetched successfully!", users: users });
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})


//sending friend request
app.post("/send-request", verifyToken,  async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.json({ Message: "Sender and Receiver are required!" })
        }
        const sender = await User.findById(senderId)
        const receiver = await User.findById(receiverId)
        if (!sender || !receiver) {
            return res.json({ Message: "User not found!" });
        }

        if (receiver.friendRequests.includes(senderId)) {
            return res.json({ Message: "Friend request had already been sent!" });
        }

        receiver.friendRequests.push(senderId)
        await receiver.save()

        return res.status(200).json({ Message: "Friend request sent successfully!" })

    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})


//responding to friend request
app.post("/respond-request", verifyToken, async (req, res) => {
    try {
        const { senderId, receiverId, action } = req.body;
        if (!senderId || !receiverId) {
            return res.json({ Message: "Sender and Receiver are required!" })
        }
        const sender = await User.findById(senderId)
        const receiver = await User.findById(receiverId)
        if (!sender || !receiver) {
            return res.json({ Message: "User not found!" });
        }

        if (action === 'accept') {
            sender.friends.push(receiverId)
            receiver.friends.push(senderId)
        }

        receiver.friendRequests.pull(senderId);
        await sender.save();
        await receiver.save()

        return res.status(200).json({ Message: `Friend request ${action}ed successfully!` })

    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})

//removing friend
app.post("/remove-friend", verifyToken, async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.json({ Message: "Sender and Receiver are required!" })
        }
        const sender = await User.findById(senderId)
        const receiver = await User.findById(receiverId)
        if (!sender || !receiver) {
            return res.json({ Message: "User not found!" });
        }

        if (!receiver.friends.includes(senderId)) {
            return res.json({ Message: "Both are not friends previously!" });
        }

        sender.friends.pull(receiverId)
        receiver.friends.pull(senderId)
        await sender.save()
        await receiver.save()

        return res.status(200).json({ Message: "Friend removed successfully!" })

    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})

//displaying user's friends
app.get("/:userId/friends", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.json({ Message: "User ID is required!" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ Message: "User does not exists!" });
        }

        return res.status(200).json({ Message: "Friends fetched successfully!", friends: user.friends });
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})

//recommending friends
app.get("/:userId/recommendations", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.json({ Message: "User ID is required!" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ Message: "User does not exists!" });
        }

        const friendsOfFriends = new Map();

        for (const friendId of user.friends) {
            const friendUser = await User.findById(friendId).populate("friends");
            for (const mutual of friendUser.friends) {
                if (!user.friends.includes(mutual._id) && userId !== mutual._id.toString()) {
                    friendsOfFriends.set(mutual._id.toString(), mutual.username)
                }
            }
        }
        const recommendedFriends = Array.from(friendsOfFriends, ([id, username]) => ({ id, username }));

        return res.status(200).json({ Message: "Recommended friends fetched successfully!", recommendedFriends });


    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ Message: "Internal server error!" });
    }
})


//get user's details
app.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate("friendRequests", "username")
            .populate("friends", "username");  

        if (!user) {
            return res.status(404).json({ Message: "User not found!" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ Message: "Internal server error!" });
    }
});







const PORT = process.env.PORT || 5001

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`)
        })
    })
    .catch((error) => {
        console.log('Error: ', error);
    })