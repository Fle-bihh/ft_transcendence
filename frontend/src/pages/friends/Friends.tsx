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
      index: number;
      username: string;
      username2: string;
      friendshipDate: Date;
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
    if (openFriendsPage) {
      utils.socket.emit("GET_USER_FRIENDS", user.user?.username);
      console.log(user.user?.username, "send GET_USER_FRIENDS to backend");
      utils.socket.emit("GET_ALL_USERS", user.user?.username);
      console.log(user.user?.username, "send GET_ALL_USERS to backend");
    }
    setOpenFriendsPage(false);
  });

  utils.socket.removeListener("get_username");
  utils.socket.on("get_username", (username: string) => {
    console.log(user.user?.username, "received get_username with", username);
    setMyUsername(username);
  });

  utils.socket.removeListener("get_all_users");
  utils.socket.on("get_all_users", (users: Array<{ username: string }>) => {
    console.log(user.user?.username, "received get_all_users with", users);
    let tmpArray = Array<{ index: number; username: string }>();
    users.map((user) => {
      tmpArray.push({
        index: tmpArray.length,
        username: user.username,
      });
    });
    setUsersList(tmpArray);
  });

  utils.socket.removeListener("get_user_friends");
  utils.socket.on(
    "get_user_friends",
    (
      data: Array<{ username: string; username2: string; friendshipDate: Date }>
    ) => {
      console.log(user.user?.username, "received get_user_friends with", data);
      let tmpArray = Array<{
        index: number;
        username: string;
        username2: string;
        friendshipDate: Date;
      }>();
      data.map((friend) => {
        tmpArray.push({
          index: tmpArray.length,
          username: friend.username,
          username2: friend.username2,
          friendshipDate: friend.friendshipDate,
        });
      });
    }
  );

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
              let friendUsername =
                friend.username === myUsername
                  ? friend.username2
                  : friend.username;
              return (
                <div
                  className="friendsListItem"
                  onClick={() => {
                    setDialogOpen(true);
                    setUserInfo(friendUsername);
                  }}
                >
                  <div className="friendsListAvatar">
                    <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                      {friendUsername[0]}
                    </Avatar>
                  </div>
                  <div className="friendsListName">{friendUsername}</div>
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
            {usersList.map((user) => {
              let isFriend = false;
              friendsList.map((friend) => {
                friend.username === user.username ||
                friend.username2 === user.username
                  ? (isFriend = true)
                  : (isFriend = false);
              });
              return user.username === myUsername || isFriend ? (
                <div></div>
              ) : (
                <div
                  className="usersListItem"
                  onClick={() => {
                    setDialogOpen(true);
                    setUserInfo(user.username);
                  }}
                >
                  <div className="usersListAvatar">
                    <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                      {user.username[0]}
                    </Avatar>
                  </div>
                  <div className="usersListName">{user.username}</div>
                </div>
              );
            })}
          </div>
        </div>

        <UserProfileDialog
          profileDialogOpen={dialogOpen}
          setProfileDialogOpen={setDialogOpen}
        />
      </div>
    </div>
  );
};

export default Friends;
