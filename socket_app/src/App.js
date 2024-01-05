import { useEffect, useState } from "react";
import Popup from "reactjs-popup";


export default function GUI() {

  const [userName, setName] = useState(null);
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);
  const [chat_log, setLog] = useState(new Map());

  useEffect(() => {
    fetch("/api").then((res) => res.json()).then((data) => receiveMessage(data));
    fetch("/getID").then((res) => res.json()).then((data) => {
      setID(data.message);
    });
  }, []);

  function receiveMessage(data) {
    const newMessages = new Map(chat_log);
    newMessages.set(data.timestamp, data.message);
    setLog(newMessages);
    // console.log(newMessages);
  }

  function setUserName() {
    const name = document.getElementById("username_text").value;
    console.log(name);
    if (name != null && name != '') {
      // setName(name);
      fetch("/createUser", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          userId: userId,
          userName: name,
        }),
      }).then((res) => res.json()).then((data) => {
        if(data.userName != null){
          setName(data.userName);
        }
        receiveMessage(data);
        // setChatDebug(data.message);
      });
    }
  }

  function setChatroom() {
    const name = document.getElementById("chatroom_name").value;
    if (name != null && name!='') {
      console.log("Chatroom: " + name);
      // setRoom(name);

      fetch("/createRoom", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          userId: userId,
          oldRoom: chatroom,
          newRoom: name,
        })
      }).then((res) => res.json()).then((data) => {
        // setChatDebug(data.message);
        if (data.newRoom != -1) {
          setRoom(data.newRoom);
        }
        receiveMessage(data);
      });
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
              <button onClick={setUserName}>
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
              <textarea id="chatroom_name" rows={1} cols={23}></textarea>
            </label>
            <div>
              <button onClick={setChatroom}>
                Save
              </button>
              <button>
                Cancel
              </button>
            </div>
          </div>
        </Popup>
        <button>
          Join Chatroom
        </button>
      </div>
      <div id="input_field">
        <p>ID is: {userId}</p>
        <p>Username is: {userName}</p>
        <label>
          Write message below:
          <textarea name="input_text" rows={8} cols={100}></textarea>
        </label>
      </div>
      <button id="submit">Send</button>
    </>
  );
}
