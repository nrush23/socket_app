const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

let users = new Map();
let chatrooms = new Map();
let server_name = "Lord Boof Boof";

//Function to check if a username is valid (currently checks only if it's taken)
//Returns false if invalid or true if valid
function validName(name, usernames) {
    console.log(usernames);
    for (let username of usernames) {
        if (username == name) {
            return false;
        }
    }
    return true;
}

//Function to switch a user's room from one to the next
//given that the newRoom exists and the username is not taken
function switchRoom(userId, oldRoom, newRoom) {
    if (oldRoom != null) {
        console.log(oldRoom + " before deleting " + userId + ": " + chatrooms.get(oldRoom).keys);
        chatrooms.get(oldRoom).delete(userId);
        if (chatrooms.get(oldRoom).size == 0) {
            chatrooms.delete(oldRoom);
        }
        console.log(oldRoom + " after deleting " + userId + ": " + chatrooms.get(oldRoom).keys);
    }
    chatrooms.get(newRoom).set(userId, users.get(userId));
}

app.get("/api", (req, res) => {
    res.json({
        timestamp: Date.now(),
        message: server_name + ": Welcome to the Chatrooms!",
    });
    console.log(Date.now());
});

app.get("/getID", (req, res) => {
    const length = users.size;
    users.set(length, "");
    res.json({ message: length });
})

app.post("/createUser", (req, res) => {
    const newName = req.body.userName;
    if (!validName(newName, users.values())) {
        res.json({
            timestamp: Date.now(),
            userName: null,
            message: server_name + ": Name already taken, try again."
        })
    } else {
        users.set(req.body.userId, newName);
        res.json({
            timestamp: Date.now(),
            userName: newName,
            message: server_name + ": Welcome " + users.get(req.body.userId) + " to the Chatroom!"
        });
    }
});

app.post("/createRoom", (req, res) => {
    const newRoom = req.body.newRoom;
    const oldRoom = req.body.oldRoom;
    if (chatrooms.has(newRoom)) {
        res.json({
            timestamp: Date.now(),
            newRoom: -1,
            message: server_name + ": This room already exists, try again."
        });
    } else {
        chatrooms.set(newRoom, new Map());
        switchRoom(req.body.userId, oldRoom, newRoom);
        // if (oldRoom != null) {
        //     // chatrooms.delete(key);
        //     console.log("Room before deleting user: " + chatrooms.get(oldRoom));
        //     chatrooms.get(oldRoom).delete(req.body.userId);
        //     if (chatrooms.get(oldRoom).size == 0) {
        //         chatrooms.delete(oldRoom);
        //     }
        //     console.log("Room after deleting user: " + chatrooms.get(oldRoom));
        // }
        // chatrooms.set(newRoom, new Map().set(req.body.userId, users.get(req.body.userId)));
        res.json({
            timestamp: Date.now(),
            newRoom: newRoom,
            message: server_name + ": New room: " + newRoom + " created!"
        });
    }
});

app.post("/joinRoom", (req, res) => {
    const newRoom = req.body.newRoom;
    const oldRoom = req.body.oldRoom;
    const userId = req.body.userId;
    const userName = users.get(userId);

    if (chatrooms.has(newRoom)) {
        if (validName(userName, chatrooms.get(newRoom).values())) {
            switchRoom(userId, oldRoom, newRoom);
            res.json({
                timestamp: Date.now(),
                newRoom: newRoom,
                message: server_name + ": Welcome " + userName + " to " + newRoom + "!"
            })
        }else{
            res.json({
                timestamp: Date.now(),
                newRoom: null,
                message: server_name + ": This username is already taken, rejoin " + newRoom + " with new name."
            })
        }
    } else {
        res.json({
            timestamp: Date.now(),
            newRoom: null,
            message: server_name + ": " + newRoom+ " does not exist, try again."
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});