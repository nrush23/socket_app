import { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import Message from "./Message.js"
import Test from "./Test.js";


export default function GUI() {

  const [username, setName] = useState(null);   //Variables to store the client's username, Id, room, and chatlog
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);
  const [chat_log, setLog] = useState(new Map());
  const [colorIndex, setColor] = useState(0);
  const [clients, setClients] = useState(new Map());

  const [set_name, nameDialog] = useState(false);
  const [create_room, createDialog] = useState(false);
  const [join_room, joinDialog] = useState(false);

  const [socket, setSocket] = useState(new WebSocket('ws://localhost:3001'));    //The actual socket connected to the server

  const chat_display = useRef(null);

  const colors = ["rgb(64, 156, 255)", "rgb(125, 122, 255)", "rgb(218, 143, 255)", "rgb(255, 100, 130)", "rgb(181, 148, 105)", "rgb(152, 152, 157)", "rgb(255, 105, 97)", "rgb(255, 179, 64)", "rgb(255, 212, 38)", "rgb(49, 222, 75)", "rgb(102, 21, 207)", "rgb(93, 230, 255)", "rgb(112, 215, 255)"];

  socket.onmessage = (event) => {     //Define the actions the socket should take when it receives a message
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {    //Switch statement to handle the different message types
      case "getID":         //getID returns the unique Id of the client
        setID(data.message);  //We return from the function here because getID has no chatlog
        return;
      case "createUser":    //createUser returns the new username of the client when the server accepts the change
        setName(data.newName);
        break;
      case "createRoom":    //createRoom returns the new room if the server accepts the room creation
        setRoom(data.newRoom);
        console.log("Chatroom " + data.newRoom + " accepted.");
        break;
      case "joinRoom":      //joinRoom returns the new room if the server accepts the client's addition
        setRoom(data.newRoom);
        console.log("Joined " + data.newRoom);
        return;
      default:
        break;
    }
    receiveMessage(data); //In all cases except getID, we will have a chatlog so always receive the message
  };

  useEffect(() => {       //On app startup, call two messages: api and getID, to get the standard welcome message and userId
    socket.onopen = (event) => {
      socket.send(JSON.stringify({
        type: "api",
        timestamp: Date.now()
      }));
      socket.send(JSON.stringify({
        type: "getID",
        timestamp: Date.now()
      }));
    }
  }, []);

  useEffect(() => {     //Updates the app so that when a new chat is received the log displays from the bottom instead of the top
    if (chat_display.current != null) {
      chat_display.current.scrollTop = chat_display.current.scrollHeight;
    }
  });

  function validText(text) {    //Function to check if the user input is safe
    if (text != null && text != '') {
      return true;
    }
    return false;
  }

  function sendMessage() {    //Function to send the message in the chatbox to the server
    const message = document.getElementById("message_box").value;
    if (validText(message) && chatroom != null) {
      socket.send(JSON.stringify({
        type: "sendMessage",
        timestamp: Date.now(),
        room: chatroom,
        message: message
      }));
      document.getElementById("message_box").value = '';
    }
  }

  function getBubbleColor(name) {
    if (!clients.has(name)) {
      clients.set(name, colors[colorIndex]);
      if (colorIndex == colors.length - 1) {
        setColor(0);
      } else {
        setColor(colorIndex + 1);
      }
    }
    return clients.get(name);
  }



  async function receiveMessage(data) {     //Function to parse the message from the server by adding it to the chatlog based on its timestamp
    console.log(Array.from(chat_log.values()));
    const newMessages = new Map(chat_log);

    let timestamp = await (async () => {
      return new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    })();

    data.time = timestamp;

    if (data.username != "server" && data.username != username) {
      data.color = getBubbleColor(data.username);
    }

    newMessages.set(data.timestamp, data);
    console.log(data);
    setLog(newMessages);
  }

  function setUsername() {    //Function to change the username by sending a request to the server
    const name = document.getElementById("username_text").value;
    if (validText(name)) {
      socket.send(JSON.stringify({
        type: "createUser",
        username: name
      }));
    }
    document.getElementById("username_text").value = "";
  }

  function createChatroom() {   //Function to create a new chatroom by sending a request to the server
    const name = document.getElementById("create_room").value;
    if (validText(name)) {
      console.log("Chatroom: " + name + " being requested...");
      socket.send(JSON.stringify({
        type: "createRoom",
        oldRoom: chatroom,
        newRoom: name,
      }));
    }
  }

  function joinChatroom() {   //Function to join an existing chatroom by sending a request to the server
    const name = document.getElementById("join_room").value;
    if (validText(name)) {
      socket.send(JSON.stringify({
        type: "joinRoom",
        oldRoom: chatroom,
        newRoom: name
      }));
    }
  }

  /* CODE TO CREATE THE REACT HTML */
  return (
    <>
      <div className="app">
        <p className="room_display">{chatroom == null ? "Lobby" : "Chatroom is: " + chatroom}</p>
        <div id="chat_display" className="chat_display" ref={chat_display}>
          {
            Array.from(chat_log.entries()).map(([timestamp, data]) => {
              return <Message key={timestamp} type={data.username === username ? "user" : (data.username === "server" ? "server" : "other")} time={data.time} message={data.message} username={data.username} color={data.color} />
            })
          }
        </div>
        <div className="input_area">
          <div className="button_bar">
            <p className="debug">ID is: {userId == null ? "ID not set yet" : userId}<br />Username is: {username == null ? "Undefined" : username}</p>
            <button id="set_user" onClick={() => { nameDialog(true); }}>Set Username</button>
            <Test inputId="username_text" close={() => {nameDialog(false);}} submit={() => {setUsername();nameDialog(false);}} opener={set_name} label="Enter your username"></Test>
            <button id="create_chatroom" onClick={() => {createDialog(true);}}>Create Chatroom</button>
            <Test opener={create_room} label="Enter your room name"inputId="create_room" close={() => {createDialog(false)}} submit={()=>{createChatroom(); createDialog(false);}}></Test>
            <button id="join_chatroom" onClick={()=>{joinDialog(true);}}>Join Chatroom</button>
            <Test opener={join_room} label="Enter your room name" inputId="join_room" close={()=> {joinDialog(false)}} submit={()=>{joinChatroom(); joinDialog(false);}}></Test>
          </div>
          <div className="input_field">
            <textarea id="message_box" className="message_box" rows={5} cols={100} placeholder="Message"></textarea>
            <button className="send_button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}

