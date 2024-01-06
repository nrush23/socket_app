const { create } = require("domain");
const express = require("express");
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let usernames = new Map();
let users = new Map();
let sockets = new Map();
let chatrooms = new Map();
let server_name = "Lord Boof Boof";

//Function to check if a username is valid (currently checks only if it's taken)
//Returns false if invalid or true if valid
function validName(name, userIds) {
    console.log("Checking " + [userIds] + " for " + name);
    for (let user of userIds) {
        if (usernames.get(user) == name) {
            return false;
        }
    }
    return true;
}

//Function to switch a user's room from one to the next
//given that the newRoom exists and the username is not taken
function switchRoom(userId, oldRoom, newRoom) {
    if (oldRoom != null) {
        // console.log(oldRoom + " before deleting " + userId + ": " + [chatrooms.get(oldRoom).keys()]);
        console.log(oldRoom + " before deleting " + userId + ": " + displayValues(chatrooms.get(oldRoom).keys()));
        chatrooms.get(oldRoom).delete(userId);
        if (chatrooms.get(oldRoom).size == 0) {
            chatrooms.delete(oldRoom);
            console.log("Chatroom " + oldRoom + " was deleted.");
        } else {
            // console.log("Chatroom " + oldRoom + " after deleting " + userId + ": " + [chatrooms.get(oldRoom).keys()]);
            console.log("Chatroom " + oldRoom + " after deleting " + userId + ": " + displayValues(chatrooms.get(oldRoom).keys()));
        }
    }
    chatrooms.get(newRoom).set(userId, users.get(userId));
}

function displayValues(iterable) {
    const array = [iterable];
    return array.toString();
}

wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    ws.on('close', function close(data) {
        const userId = sockets.get(ws);
        usernames.delete(userId);
        sockets.delete(ws);
        console.log(userId + " deleted.");
    })

    ws.on('message', function message(data) {
        const msg = JSON.parse(data);
        console.log('received: %s', data);
        switch (msg.type) {
            case "api":
                ws.send(JSON.stringify({
                    timestamp: msg.timestamp,
                    message: server_name + ": Welcome to the Chatrooms!"
                }));
                break;
            case "getID":
                usernames.set(usernames.size, '');
                sockets.set(ws, sockets.size);
                users.set(users.size, ws);
                ws.send(JSON.stringify({
                    type: msg.type,
                    message: sockets.size - 1
                }));
                break;
            case "createUser":
                const newName = msg.username;
                if (!validName(newName, users.keys())) {
                    ws.send(JSON.stringify({
                        timestamp: Date.now(),
                        message: server_name + ": Name already taken, try again."
                    }));
                } else {
                    usernames.set(msg.userId, newName);
                    ws.send(JSON.stringify({
                        type: msg.type,
                        timestamp: Date.now(),
                        userName: newName,
                        message: server_name + ": Welcome " + usernames.get(msg.userId) + " to the Chatroom!"
                    }));
                }
                break;
            case "createRoom":
                const new_room = msg.newRoom;
                const old_room = msg.oldRoom;
                if (chatrooms.has(new_room)) {
                    ws.send(JSON.stringify({
                        timestamp: Date.now(),
                        message: server_name + ": This room already exists, try again."
                    }));
                } else {
                    chatrooms.set(new_room, new Map());
                    switchRoom(msg.userId, old_room, new_room);
                    ws.send(JSON.stringify({
                        type: msg.type,
                        timestamp: Date.now(),
                        newRoom: new_room,
                        message: server_name + ": New room: " + new_room + " created!"
                    }));
                }
                break;
            case "joinRoom":
                const newRoom = msg.newRoom;
                const oldRoom = msg.oldRoom;
                const userId = msg.userId;
                const userName = usernames.get(userId);

                if (chatrooms.has(newRoom)) {
                    if (validName(userName, chatrooms.get(newRoom).keys())) {
                        switchRoom(userId, oldRoom, newRoom);
                        ws.send(JSON.stringify({
                            type: msg.type,
                            timestamp: Date.now(),
                            newRoom: newRoom,
                            message: server_name + ": Welcome " + userName + " to " + newRoom + "!"
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            timestamp: Date.now(),
                            message: server_name + ": This username is already taken, rejoin " + newRoom + " with new name."
                        }));
                    }
                } else {
                    ws.send(JSON.stringify({
                        timestamp: Date.now(),
                        message: server_name + ": " + newRoom + " does not exist, try again."
                    }));
                }
                break;
            case "sendMessage":
                const room = msg.room;
                const user_Id = msg.userId;
                const timestamp = msg.timestamp;

                for(let wsc of chatrooms.get(room).values()){
                    wsc.send(JSON.stringify({
                        timestamp: timestamp,
                        message: usernames.get(user_Id) + ": " + msg.message
                    }));
                }
                break;
            default:
                break;
        }
    });

});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});