const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

let users =  new Map();

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the Chatrooms!" });
});

app.get("/getID", (req, res) => {
    const length = users.size;
    users.set(length, "");
    res.json({message: length});
})

app.get("/createUser", (req, res) => {

});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});