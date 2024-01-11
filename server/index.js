const express = require("express"); //Import the express, core, http, and WebSocket packages
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;  //Server runs on port 3001

const app = express();  //Create the express server and allow it to parse jsons
app.use(express.json());


let corsOptions = { //Create cors option to accept from all
    origin: ['*'],
}

app.use(cors(corsOptions)); //Set server to use those cors options

const server = http.createServer(app);  //Specify server to be http
const wss = new WebSocket.Server({ server });   //Connect server to websocket

let usernames = new Map();  //Map from userIds to their username
let users = new Map();  //Map from userIds to their websocket
let sockets = new Map();    //Map from websockets to their userId
let chatrooms = new Map();  //Map of chatroom string names to a map containing their connected userIds and websockets
let server_name = "Lord Boof Boof"; //Name that gets displayed for messages sent from the server


function validName(name, usernames_map) {   //Usernames are only valid if the provided map of usernames does not include it

    console.log("Checking " + displayValues(usernames_map) + " for " + name);

    for (let value of usernames_map.values()) {  //Cycle through each value in the provided map and check if the given name is equal

        if (name === value) {                     //If they are equal, the username is not valid so return false, otherwise that username

            return false;                       //does not exist and the name is valid so return true

        }

    }
    return true;

}


function switchRoom(userId, oldRoom, newRoom) {     //Function to switch a user from their old room to a new one

    if (oldRoom != null) {  //First check if they're joining from their initial connection to the server

        console.log(newRoom + " before joining: " + displayValues(chatrooms.get(newRoom).keys()));
        console.log(oldRoom + " before deleting " + userId + ": " + displayValues(chatrooms.get(oldRoom).keys()));
        chatrooms.get(oldRoom).delete(userId);  //Since they are in a pre-existing room, delete them from it

        if (chatrooms.get(oldRoom).size == 0) { //Check if the old room is now empty so that we can delete the room
            chatrooms.delete(oldRoom);
            console.log("Chatroom " + oldRoom + " was deleted.");
        } else {
            console.log("Chatroom " + oldRoom + " after deleting " + userId + ": " + displayValues(chatrooms.get(oldRoom).keys()));
        }
    }

    chatrooms.get(newRoom).set(userId, users.get(userId));  //Now set the new room to add the user and their socket from the users map
    console.log(newRoom + " after joining: " + displayValues(chatrooms.get(newRoom).keys()));
}


function displayValues(iterable) {  //Debug function that returns the toString() of an iterable object
    const array = Array.from(iterable);
    return array.toString();
}

function broadcastMessage(data) {
    const msg = JSON.parse(data);
    const room = msg.room;
    // const user_Id = sockets.get(ws);

    console.log("Messages sending to: " + displayValues(chatrooms.get(room).keys()));
    for (let socket of chatrooms.get(room).values()) {  //Use the chatrooms map to get the sockets inside that room
        socket.send(JSON.stringify({                    //and send a message to each one with the appropriate message and timestamp
            timestamp: msg.timestamp,
            // message: usernames.get(user_Id) + ": " + msg.message
            username: msg.username,
            message: msg.message
        }));
        console.log("Sent to: " + sockets.get(socket));
    }
}

/*FUNCTIONS FOR RUNNING THE WEBSOCKET SERVER */

wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    /*TODO: WHEN USER DELETES, REMOVE THEM FROM THE CHATROOM AND CHECK IF IT NEEDS TO BE DELETED */
    
    ws.on('close', function close(data) {   //When a connection to a client ws is closed, get their userId and remove them
        const userId = sockets.get(ws);     //from our maps
        usernames.delete(userId);
        sockets.delete(ws);
        users.delete(userId);
        console.log(userId + " deleted.");

    })

    ws.on('message', function message(data) {   //When a client ws sends a message, check what message type it is and perform the associated actions
        //Messages sent to the client can have a type, timestamp, message, userName, or newRoom field
        const msg = JSON.parse(data);
        console.log('received: %s', data);

        switch (msg.type) {
            case "api":                         //Default initialization type from when program was first created
                ws.send(JSON.stringify({        //Sends the basic welcome message
                    timestamp: msg.timestamp,
                    username: "server",
                    message: server_name + ": Welcome to the Chatrooms!"
                }));
                break;
            case "getID":                       //Called by the client when they first connect so they can get a unique userId
                usernames.set(usernames.size, "");  //Initialize the maps to have client's related identifiers
                sockets.set(ws, sockets.size);
                users.set(users.size, ws);
                ws.send(JSON.stringify({           //Send the client back their userId, no chatlog needed
                    type: msg.type,
                    message: sockets.size - 1
                }));
                break;
            case "createUser":                  //Called by the client to set their username
                const newName = msg.username;
                console.log("Users right now is: " + displayValues(users.keys()));
                if (!validName(newName, usernames)) {   //First check if the name is taken (not valid)
                    ws.send(JSON.stringify({            //If it is, chatlog back to them they have to try again
                        timestamp: Date.now(),
                        username: "server",
                        message: server_name + ": Name already taken, try again."
                    }));
                } else {
                    usernames.set(sockets.get(ws), newName);     //Otherwise, name is valid and we can change their username
                    console.log("Usernames is: " + displayValues(usernames.values()));
                    ws.send(JSON.stringify({        //Send the client back the acceptable name plus a welcome username message
                        type: msg.type,
                        timestamp: Date.now(),
                        newName: newName,
                        username: "server",
                        message: server_name + ": Welcome " + usernames.get(sockets.get(ws)) + " to the Chatroom!"
                    }));
                }
                break;
            case "createRoom":                  //Called by the client when they want to create a new room
                const new_room = msg.newRoom;
                const old_room = msg.oldRoom;
                if (chatrooms.has(new_room)) {      //Check if the new room already exists
                    ws.send(JSON.stringify({        //If it does, chatlog them to try again.
                        timestamp: Date.now(),
                        username: "server",
                        message: server_name + ": This room already exists, try again."
                    }));
                } else {                        //Otherwise, the room can be created and the user switched into it
                    chatrooms.set(new_room, new Map());
                    switchRoom(sockets.get(ws), old_room, new_room);
                    ws.send(JSON.stringify({    //Send the client back the acceptable room and chatlog that it was created
                        type: msg.type,
                        timestamp: Date.now(),
                        newRoom: new_room,
                        username: "server",
                        message: server_name + ": New room " + new_room + " created!"
                    }));
                }
                break;
            case "joinRoom":                //Called by the client when they want to join a room
                const newRoom = msg.newRoom;
                const oldRoom = msg.oldRoom;
                const userId = sockets.get(ws);
                const userName = usernames.get(userId);

                if (chatrooms.has(newRoom)) {   //Check if the room exists
                    if (validName(userName, chatrooms.get(newRoom))) {  //Now check if their name is unique in that room
                        switchRoom(userId, oldRoom, newRoom);   //If name is okay, switch them into the room
                        ws.send(JSON.stringify({            //Now send response for client to change room
                            type: msg.type,
                            newRoom: newRoom,
                        }));                                //Broadcast message welcoming user to the room
                        const broadcast_msg = JSON.stringify({
                            timestamp: Date.now(),
                            room: newRoom,
                            username: "server",
                            message: server_name + ": Welcome " + userName + " to " + newRoom + "!"
                        });
                        broadcastMessage(broadcast_msg);
                    } else {                        //If the name is taken, tell them to rename themselves and join again
                        ws.send(JSON.stringify({
                            timestamp: Date.now(),
                            username: "server",
                            message: server_name + ": This username is already taken, rejoin " + newRoom + " with new name."
                        }));
                    }
                } else {                        //Otherwise, room doesn't exist so chatlog to try again
                    ws.send(JSON.stringify({
                        timestamp: Date.now(),
                        username: "server",
                        message: server_name + ": " + newRoom + " does not exist, try again."
                    }));
                }
                break;
            case "sendMessage":                 //Called when the user wants to send a message
                const broadcast_msg = JSON.stringify({
                    timestamp: msg.timestamp,
                    room: msg.room,
                    username: usernames.get(sockets.get(ws)),
                    message: usernames.get(sockets.get(ws)) + ": " + msg.message
                })
                broadcastMessage(broadcast_msg);
                break;
            default:
                break;
        }
    });

});


server.listen(PORT, () => {   //Starting of the actual server on the specified port
    console.log(`Server listening on ${PORT}`);
});