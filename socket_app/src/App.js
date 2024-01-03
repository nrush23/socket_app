import { useEffect, useState } from "react";
import Popup from "reactjs-popup";


export default function GUI() {

  const [chat_log, setData] = useState(null);
  const [userName, setName] = useState(null);
  const [userId, setID] = useState(null);
  const [chatroom, setRoom] = useState(null);

  useEffect(() => {
    fetch("/api").then((res) => res.json()).then((data) => setData(data.message));
    fetch("/getID").then((res) => res.json()).then((data) => {
      setID(data.message);
    });
  }, []);

  function setUserName() {
    const name = document.getElementById("username_text").value;
    console.log(name);
    setName(name);
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
      setData(data.message);
    });
  }

  function setChatroom() {
    const name = document.getElementById("chatroom_name").value;
    console.log("Chatroom: " + name);
    setChatroom(name);

    fetch("/createRoom", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        userId: userId,
        roomName: name,
      })
    }).then((res) => res.json()).then((data) => {
      setData(data.message);
    });
  }

  return (
    <>
      <div id="chat_display">
        <p id="chat_log">{!chat_log ? "Waiting for Server response" : chat_log}</p>
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
