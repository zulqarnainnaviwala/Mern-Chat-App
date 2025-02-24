import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const PotentialChats = () => {
  const { potentialChats, createChat, onlineUsers } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  return (
    <div className="all-users">
      {potentialChats &&
        potentialChats?.map((pChatUser, index) => {
          return (
            <div
              className="single-user"
              key={index}
              onClick={() => createChat(user._id, pChatUser._id)}
            >
              {pChatUser.name}
              <span
                className={
                  onlineUsers?.some((user) => user.userId === pChatUser._id)
                    ? "user-online"
                    : ""
                }
              ></span>
            </div>
          );
        })}
    </div>
  );
};

export default PotentialChats;
