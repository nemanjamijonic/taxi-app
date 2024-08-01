import React from "react";
import "./ChatApp.css"; // Ensure this path is correct

const ChatLegend: React.FC = () => {
  return (
    <div className="chat-legend-container">
      <div className="chat-legend-header">Chat Legend</div>
      <div className="chat-legend-item">
        <span className="chat-legend-color color-admin"></span>
        <b>Red color: </b> Admin Messages
      </div>
      <div className="chat-legend-item">
        <span className="chat-legend-color color-user"></span>
        <b>Blue color: </b> User Messages
      </div>
      <div className="chat-legend-item">
        <span className="chat-legend-color color-driver"></span>
        <b>Green color: </b> Driver Messages
      </div>
    </div>
  );
};

export default ChatLegend;
