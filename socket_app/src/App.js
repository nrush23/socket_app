import { useEffect, useState } from "react";
import Popup from "reactjs-popup";


export default function GUI() {

  const [username, setName] = useState(null);   //Variables to store the client's username, Id, room, and chatlog
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);
  const [chat_log, setLog] = useState(new Map());

  const [socket, setSocket] = useState(new WebSocket('ws://192.168.0.31:3001'));    //The actual socket connected to the server

  socket.onmessage = (event) => {     //Define the actions the socket should take when it receives a message
    const data = JSON.parse(event.data);

    switch (data.type) {    //Switch statement to handle the different message types
      case "getID":         //getID returns the unique Id of the client
        setID(data.message);  //We return from the function here because getID has no chatlog
        return;
      case "createUser":    //createUser returns the new username of the client when the server accepts the change
        setName(data.userName);
        break;
      case "createRoom":    //createRoom returns the new room if the server accepts the room creation
        setRoom(data.newRoom);
        console.log("Chatroom " + data.newRoom + " accepted.");
        break;
      case "joinRoom":      //joinRoom returns the new room if the server accepts the client's addition
        setRoom(data.newRoom);
        console.log("Joined " + data.newRoom);
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

  function validText(text) {    //Function to check if the user input is safe
    if (text != null && text != '') {
      return true;
    }
    return false;
  }

  function sendMessage() {    //Function to send the message in the chatbox to the server
    const message = document.getElementById("message_box").value;
    if(validText(message) && chatroom != null){
      socket.send(JSON.stringify({
        type: "sendMessage",
        timestamp: Date.now(),
        room: chatroom,
        message: message
      }));
      document.getElementById("message_box").value = '';
    }
  }

  function receiveMessage(data) {     //Function to parse the message from the server by adding it to the chatlog based on its timestamp
    console.log(Array.from(chat_log.values()));
    const newMessages = new Map(chat_log);
    newMessages.set(data.timestamp, data.message);
    console.log(Array.from(newMessages.values()));
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
      <p>Chatroom is: {chatroom}</p>
      <div id="chat_display">
        {
          Array.from(chat_log.entries()).map(([timestamp, message]) => {
            return <p key={timestamp}>{message}</p>
          })
        }
      </div>
      <div id="button_bar">
        <Popup trigger={<button id="set_user">Set User Name</button>}>
          <div>
            <label>
              Enter your username:
              <textarea id="username_text" rows={1} cols={23}></textarea>
            </label>
            <div>
              <button onClick={setUsername}>
                Save
              </button>
              <button>
                Cancel
              </button>
            </div>
          </div>
        </Popup>
        <Popup trigger={<button>Create Chatroom</button>}>
          <div>
            <label>
              Enter your Room name:
              <textarea id="create_room" rows={1} cols={23}></textarea>
            </label>
            <div>
              <button onClick={createChatroom}>
                Save
              </button>
              <button>
                Cancel
              </button>
            </div>
          </div>
        </Popup>
        <Popup trigger={<button>Join Chatroom</button>}>
          <div>
            <label>
              Enter your Room name:
              <textarea id="join_room" rows={1} cols={23}></textarea>
            </label>
            <div>
              <button onClick={joinChatroom}>
                Save
              </button>
              <button>
                Cancel
              </button>
            </div>
          </div>
        </Popup>
      </div>
      <div id="input_field">
        <p>ID is: {userId}</p>
        <p>Username is: {username}</p>
        <label>
          Write message below:
          <textarea id="message_box" rows={8} cols={100}></textarea>
        </label>
      </div>
      <button onClick={sendMessage}>Send</button>
    </>
  );
}

