import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import ChatRoom from "./ChatRoom";
import "./ChatApp.css"; // Import the new CSS file

interface Message {
  username: string;
  msg: string;
}

interface ChatAppProps {
  username: string;
  role: string;
  chatroom: string;
}

const ChatApp: React.FC<ChatAppProps> = ({ username, role, chatroom }) => {
  const [conn, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  console.log(role);

  const sendMessage = async (message: string) => {
    try {
      if (conn) {
        await conn.invoke("SendMessage", message);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const joinChatRoom = async () => {
      try {
        const connection = new HubConnectionBuilder()
          .withUrl("https://localhost:44381/chat")
          .build();

        connection.on("JoinSpecificChatRoom", (admin, msg) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { username: admin, msg },
          ]);
        });

        connection.on("ReceiveSpecificMessage", (username, msg) => {
          setMessages((prevMessages) => [...prevMessages, { username, msg }]);
        });

        await connection.start();
        await connection.invoke("JoinSpecificChatRoom", {
          userName: username,
          chatRoom: chatroom,
        });
        setConnection(connection);
      } catch (e) {
        console.log("Greska: ", e);
      }
    };

    joinChatRoom();

    return () => {
      if (conn) {
        conn.stop();
      }
    };
  }, [username]);

  return (
    <Container className="chat-app-container">
      <ChatRoom messages={messages} sendMessage={sendMessage} />
    </Container>
  );
};

export default ChatApp;
