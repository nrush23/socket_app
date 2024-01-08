import { useEffect, useState } from "react";
import Popup from "reactjs-popup";


export default function GUI() {

  const [username, setName] = useState(null);
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);
  const [chat_log, setLog] = useState(new Map());

  const [socket, setSocket] = useState(new WebSocket('ws://192.168.0.31:3001'));

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "getID":
        setID(data.message);
        return;
      case "createUser":
        setName(data.userName);
        break;
      case "createRoom":
        setRoom(data.newRoom);
        console.log("Chatroom " + data.newRoom + " accepted.");
        break;
      case "joinRoom":
        setRoom(data.newRoom);
        console.log("Joined " + data.newRoom);
      default:
        break;
    }
    receiveMessage(data);
  };

  useEffect(() => {
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

  function validText(text) {
    if (text != null && text != '') {
      return true;
    }
    return false;
  }

  function sendMessage() {
    const message = document.getElementById("message_box").value;
    if(validText(message) && chatroom != null){
      socket.send(JSON.stringify({
        type: "sendMessage",
        timestamp: Date.now(),
        userId: userId,
        room: chatroom,
        message: message
      }));
      document.getElementById("message_box").value = '';
    }
  }

  function receiveMessage(data) {
    console.log(Array.from(chat_log.values()));
    const newMessages = new Map(chat_log);
    newMessages.set(data.timestamp, data.message);
    console.log(Array.from(newMessages.values()));
    setLog(newMessages);
  }

  function setUsername() {
    const name = document.getElementById("username_text").value;
    if (validText(name)) {
      socket.send(JSON.stringify({
        type: "createUser",
        userId: userId,
        username: name
      }));
    }
  }

  function createChatroom() {
    const name = document.getElementById("create_room").value;
    if (validText(name)) {
      console.log("Chatroom: " + name + " being requested...");
      socket.send(JSON.stringify({
        type: "createRoom",
        userId: userId,
        oldRoom: chatroom,
        newRoom: name,
      }));
    }
  }

  function joinChatroom() {
    const name = document.getElementById("join_room").value;
    if (validText(name)) {
      socket.send(JSON.stringify({
        type: "joinRoom",
        userId: userId,
        oldRoom: chatroom,
        newRoom: name
      }));
    }
  }


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

