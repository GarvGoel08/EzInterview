import React, { useEffect, useState } from "react";
import "./Chat.css";
import io from "socket.io-client";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the socket server
    const newSocket = io("http://localhost:3000"); // Replace with your socket server URL
    setSocket(newSocket);

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("recieve message", (message, user) => {
        setMessages((prevMessages) => [{ message, user }, ...prevMessages]);
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && inputMessage.trim() !== "") {
      socket.emit("send message", inputMessage, "Garv Goel");
      setInputMessage("");
    }
  };

  return (
    <div className="ChatContainer">
      <div className="ChatUpper">
        <div className="ChatHeading">In-call messages</div>
        <button className="ChatClose">
          <span
            className="material-symbols-outlined"
            style={{ lineHeight: "normal" }}
          >
            close
          </span>
        </button>
      </div>
      <div className="ChatItems">
        {messages.map((message, index) => (
          <div key={index} className="ChatItem">
          <div className="ChatItemName">{message.user}</div>
          <div className="ChatItemMessage">{message.message}</div>
          </div>
        ))}
      </div>
      <div className="ChatSend">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message"
          className="ChatInput"
        ></input>
        <button className="ChatSendButton" onClick={sendMessage}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
