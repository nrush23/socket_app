const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

let users =  new Map();
let chatrooms = new Map();

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the Chatrooms!" });
});

app.get("/getID", (req, res) => {
    const length = users.size;
    users.set(length, "");
    res.json({message: length});
})

app.post("/createUser", (req, res) => {
    users.set(req.body.userId, req.body.userName);
    res.json({message: "Welcome " + users.get(req.body.userId) + " to the Chatroom!"});
});

app.post("/createRoom", (req, res) => {
    chatrooms.set(req.body.roomName, new Map().set(req.body.userId, users.get(req.body.userId)));
    res.json({message: "New room: " + req.body.roomName + " created!"});
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});