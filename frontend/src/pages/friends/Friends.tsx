//
import "./Friends.scss";
import { RootState } from "../../state";
import UserProfileDialog from "../../components/userProfileDialog/UserProfileDialog";

//
import React, { useState, useEffect } from "react";
import Navbar from "../../components/nav/Nav";
import { useSelector } from "react-redux";
import { Avatar, Button, Dialog, IconButton } from "@mui/material";
import { grey } from "@mui/material/colors";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CloseIcon from "@mui/icons-material/Close";
import MessageIcon from "@mui/icons-material/Message";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { NavLink } from "react-router-dom";

const Friends = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [rightInputValue, setRightInputValue] = useState("");
  const [openFriendsPage, setOpenFriendsPage] = useState(true);
  const [friendsList, setFriendsList] = useState(
    Array<{
      username: string;
    }>()
  );
  const [usersList, setUsersList] = useState(
    Array<{
      index: number;
      username: string;
    }>
  );
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [myUsername, setMyUsername] = useState(user.user?.username);

  const handleClose = () => {
    setDialogOpen(false);
    setInputValue("");
    setRightInputValue("");
  };

  useEffect(() => {
    utils.socket.emit("GET_USER_FRIENDS", user.user?.username);
    console.log(user.user?.username, "send GET_USER_FRIENDS to backend");
    utils.socket.emit("GET_ALL_USERS_NOT_FRIEND", { username: user.user?.username });
    console.log(user.user?.username, "send GET_ALL_USERS to backend");
  }, []);

  utils.socket.removeListener("get_all_users_not_friend");
  utils.socket.on(
    "get_all_users_not_friend",
    (users: Array<{ username: string }>) => {
      console.log(user.user?.username, "received get_all_users with", users);
      let tmpArray = Array<{ index: number; username: string }>();
      users.map((user) => {
        tmpArray.push({
          index: tmpArray.length,
          username: user.username,
        });
      });
      setUsersList(tmpArray);
    }
  );

  utils.socket.removeListener("get_user_friends");
  utils.socket.on("get_user_friends", (data: Array<{ username: string }>) => {
    setFriendsList(data);
  });

  return (
    <div className="friendsPage">
      <div className="navSpace"></div>
      <Navbar />
      <div className="friendsPageContainer">
        <div className="friendsPageSide">
          <div className="friendsListContainer">
            <div className="friendsListTitle">
              Friends List
            </div>
            {friendsList.map((friend) => {
              return (
                <NavLink to={`/profileother?username=${friend.username}`}>
                  <IconButton>
                    <Avatar />
                  </IconButton>
                  <div className="friendsName">{friend.username}</div>
                </NavLink>
              );
            })}
          </div>
        </div>
        <div className="friendPageMain">
          <div className="usersListContainer">
          <div className="friendsListTitle">
              Users List
            </div>
            {usersList.map((user) => (
              <NavLink to={`/profileother?username=${user.username}`}>
                <IconButton>
                  <Avatar />
                </IconButton>
                <div className="UserName">{user.username}</div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
