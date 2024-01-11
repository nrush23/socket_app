import { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";


export default function GUI() {

  const [username, setName] = useState(null);   //Variables to store the client's username, Id, room, and chatlog
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);
  const [chat_log, setLog] = useState(new Map());

  const [socket, setSocket] = useState(new WebSocket('ws://localhost:3001'));    //The actual socket connected to the server

  const chat_display = useRef(null);

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



  async function receiveMessage(data) {     //Function to parse the message from the server by adding it to the chatlog based on its timestamp
    console.log(Array.from(chat_log.values()));
    const newMessages = new Map(chat_log);

    let timestamp = await (async () => {
      return new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    })();
    data.time = timestamp;

    newMessages.set(data.timestamp, data);
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
      <p className="room_display">{chatroom == null ? "Lobby" : "Chatroom is: " + chatroom}</p>
      <div id="chat_display" className="chat_display" ref={chat_display}>
        {
          Array.from(chat_log.entries()).map(([timestamp, data]) => {
            if (data.username === username) {
              return <p className="user" key={timestamp}><span className="time">{data.time}</span><span className="message">{data.message}</span></p>
            } else if (data.username === "server") {
              return <p className="server" key={timestamp}><span className="message">{data.message}</span><span className="time">{data.time}</span></p>
            } else {
              return <p className="other" key={timestamp}><span className="message">{data.message}</span><span className="time">{data.time}</span></p>
            }
          })
        }
      </div>
      <div className="input_area">
      <div className="button_bar">
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
      <div className="input_field">
        <p className="input_field">ID is: {userId == null ? "ID not set yet" : userId}<br />Username is: {username == null ? "Undefined" : username}</p>
        <label className="input_field">
          Write message below<br />
          <textarea id="message_box" rows={5} cols={100}></textarea>
        </label>
      </div>
      <button className="send_button" onClick={sendMessage}>Send</button>
      </div>
    </>
  );
}

