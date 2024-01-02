import { useState } from "react";



export default function GUI() {

  return (
    <>
      <div id="chat_display">
        <p id="chat_log"></p>
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
