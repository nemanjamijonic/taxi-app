import React from "react";
import MessageContainer from "./MessageContainer";
import SendMessageForm from "./SendMessageForm";
import ChatLegend from "./ChatLegend";

interface Message {
  username: string;
  msg: string;
  createdAt: string;
  userType: string;
}

interface ChatRoomProps {
  messages: Message[];
  sendMessage: (msg: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, sendMessage }) => (
  <div className="chat-room-container">
    <div className="chat-room-header">
      <h2 style={{ color: "#45d9f5" }}>Drive Chat Room</h2>
    </div>
    <ChatLegend></ChatLegend>

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
