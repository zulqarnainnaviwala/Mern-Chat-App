import React, { useContext } from "react";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipientUser";
import { Stack } from "react-bootstrap";
import Avatar from "../../assets/avatar.svg";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotfications";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({ chat, user }) => {
  const { recepientUser } = useFetchRecipientUser(chat, user);
  const { onlineUsers, notifications, markThisUserNotificationsAsRead } =
    useContext(ChatContext);

  const unreadNotifications = unreadNotificationsFunc(notifications);

  const thiUserNotifications = unreadNotifications?.filter(
    (notification) => notification?.senderId === recepientUser?._id
  );

  const isOnline = onlineUsers?.some(
    (user) => user?.userId === recepientUser?._id
  );

  const { latestMessage } = useFetchLatestMessage(chat);

  const truncateText = (text) => {
    let shortText = text.substring(0, 20);
    if (text.length > 20) shortText = shortText + "...";
    return shortText;
  };

  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={() => {
        if (thiUserNotifications?.length !== 0) {
          markThisUserNotificationsAsRead(thiUserNotifications, notifications);
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={Avatar} alt="Avatar" height="40px" />
        </div>
        <div className="text-content">
          <div className="name">{recepientUser?.name}</div>
          <div className="text">
            {latestMessage?.text && (
              <span>{truncateText(latestMessage?.text)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">{moment(latestMessage?.createAt).calendar()}</div>
        <div
          className={
            thiUserNotifications?.length > 0 ? "this-user-notifications" : ""
          }
        >
          {thiUserNotifications?.length > 0 ? thiUserNotifications?.length : ""}
        </div>
        <span className={isOnline ? "user-online" : ""}></span>
      </div>
    </Stack>
  );
};

export default UserChat;
