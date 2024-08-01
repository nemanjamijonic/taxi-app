import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import ChatRoom from "./ChatRoom";
import { jwtDecode } from "jwt-decode";
import "./ChatApp.css"; // Import the new CSS file

interface Message {
  username: string;
  msg: string;
  createdAt: string;
  userType: string;
}

interface ChatAppProps {
  username: string;
  chatroom: string;
}

const ChatApp: React.FC<ChatAppProps> = ({ username, chatroom }) => {
  const [conn, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (message: string) => {
    try {
      if (conn) {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          console.log("No token found");
          return;
        }
        const decodedToken: any = jwtDecode(token);
        const userType = decodedToken.role;
        const newMessage: Message = {
          username,
          msg: message,
          createdAt: new Date().toISOString(),
          userType,
        };
        await conn.invoke("SendMessage", newMessage);
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

        connection.on("JoinSpecificChatRoom", (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        connection.on("ReceiveSpecificMessage", (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
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
