//
import "./Friends.scss";
import { RootState } from "../../state";
import UserProfileDialog from "../../components/userProfileDialog/UserProfileDialog";

//
import React, { useState, useEffect } from "react";
import Navbar from "../../components/nav/Nav";
import { useSelector } from "react-redux";
import { Avatar, Dialog } from "@mui/material";
import { grey } from "@mui/material/colors";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CloseIcon from "@mui/icons-material/Close";
import MessageIcon from "@mui/icons-material/Message";

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
    utils.socket.emit("GET_ALL_USERS_NOT_FRIEND", user.user?.username);
    console.log(user.user?.username, "send GET_ALL_USERS to backend");
  }, []);

  // utils.socket.removeListener("get_username");
  // utils.socket.on("get_username", (username: string) => {
  //   console.log(user.user?.username, "received get_username with", username);
  //   setMyUsername(username);
  // });

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
          <input
            className="searchBar"
            type="text"
            id="outlined-basic"
            placeholder="Research"
            value={inputValue}
            autoComplete={"off"}
            onChange={(event) => {
              // let list = document.getElementById("listFriends");

              // if (list != null) {
              //   for (let i = 0; i < list.children.length; i++) {
              //     if (
              //       !event.currentTarget.value.length ||
              //       list.children[i].children[1].children[0].textContent
              //         ?.toUpperCase()
              //         .indexOf(event.currentTarget.value.toUpperCase())! > -1
              //     )
              //       list.children[i].classList.remove("hidden");
              //     else list.children[i].classList.add("hidden");
              //   }
              // }
              setInputValue(event.currentTarget.value);
            }}
            autoFocus
            onKeyDown={(event) => {}}
          />
          <div className="friendsListContainer">
            {friendsList.map((friend) => {
              return (
                <div
                  className="friendsListItem"
                  onClick={() => {
                    window.location.replace(
                      `http://127.0.0.1:3000/profileother?username=${friend.username}`
                    );
                  }}
                >
                  <div className="friendsListAvatar">
                    <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                      {friend.username[0]}
                    </Avatar>
                  </div>
                  <div className="friendsListName">{friend.username}</div>
                  <div className="friendsListStatus">friendsListStatus</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="friendPageMain">
          <input
            className="userSearchBar"
            type="text"
            id="outlined-basic"
            placeholder="Research"
            value={rightInputValue}
            autoComplete={"off"}
            onChange={(event) => {
              // let list = document.getElementById("listFriends");

              // if (list != null) {
              //   for (let i = 0; i < list.children.length; i++) {
              //     if (
              //       !event.currentTarget.value.length ||
              //       list.children[i].children[1].children[0].textContent
              //         ?.toUpperCase()
              //         .indexOf(event.currentTarget.value.toUpperCase())! > -1
              //     )
              //       list.children[i].classList.remove("hidden");
              //     else list.children[i].classList.add("hidden");
              //   }
              // }
              setRightInputValue(event.currentTarget.value);
            }}
            autoFocus
            onKeyDown={(event) => {}}
          />
          <div className="usersListContainer">
            {usersList.map((user) => (
              <div
                key={user.username}
                className="usersListItem"
                onClick={() => {
                  window.location.replace(
                    `http://127.0.0.1:3000/profileother?username=${user.username}`
                  );
                }}
              >
                <div className="usersListAvatar">
                  <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                    {user.username[0]}
                  </Avatar>
                </div>
                <div className="usersListName">{user.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
