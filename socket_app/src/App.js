import { useEffect, useState } from "react";



export default function GUI() {

  const [test_data, setData] = useState(null);
  const [userName, setUser] = useState('');
  const [userId, setID] = useState(null);

  useEffect(() => {
    fetch("/api").then((res) => res.json()).then((data) => setData(data.message));
    fetch("/getID").then((res) => res.json()).then((data) => {
      setID(data.message);
    });
  }, []);

  function setUserName(){
    setUser(prompt(""));
    // fetch("/createUser", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     userId: userId,
    //     userName: userName,
    //   }),
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8"
    //   }
    // }).then((res) => res.json()).then((data) => console.log(data));
  }

  return (
    <>
      <div id="chat_display">
        <p id="chat_log">{!test_data ? "Waiting for input" : test_data}</p>
      </div>
      <div id="button_bar">
        <button id="set_user" onClick={setUserName}>
          Set User Name
        </button>
        <button>
          Create Chatroom
        </button>
        <button>
          Join Chatroom
        </button>
      </div>
      <div id="input_field">
        <p>ID is: {userId}</p>
        <p>{userName}</p>
        <label>
          Write message below:
          <textarea name="input_text" rows={8} cols={100}></textarea>
        </label>
      </div>
    </>
  );
}
