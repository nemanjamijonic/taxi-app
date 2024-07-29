import React from "react";
import { Row, Col } from "react-bootstrap";
import MessageContainer from "./MessageContainer";
import SendMessageForm from "./SendMessageForm";

interface Message {
  username: string;
  msg: string;
}

interface ChatRoomProps {
  messages: Message[];
  sendMessage: (msg: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, sendMessage }) => (
  <div className="chat-room-container">
    <div className="chat-room-header">
      <h2>Chat Room</h2>
    </div>
    <div className="chat-room-body">
      <div className="message-container-wrapper">
        <MessageContainer messages={messages} />
      </div>
      <div className="chat-room-footer">
        <SendMessageForm sendMessage={sendMessage} />
      </div>
    </div>
  </div>
);

export default ChatRoom;
