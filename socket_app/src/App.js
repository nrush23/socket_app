import { useEffect, useState } from "react";



export default function GUI() {

  const [test_data, setData] = useState(null);

  useEffect(() => {
    fetch("/api").then((res) => res.json()).then((data) => setData(data.message));
  }, []);

  return (
    <>
      <div id="chat_display">
        <p id="chat_log">{!test_data ? "Waiting for input" : test_data}</p>
      </div>
      <div id="input_field">
        <label>
          Write message below:
          <textarea name="input_text" rows={8} cols={100}></textarea>
        </label>
      </div>
    </>
  );
}
