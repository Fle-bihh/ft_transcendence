//
import "./Friends.scss";
import { RootState } from "../../state";

//
import React, { useState, useEffect } from "react";
import Navbar from "../../components/nav/Nav";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { grey } from "@mui/material/colors";

const Friends = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [myUsername, setMyUsername] = useState('');
  const [inputValue, setInputValue] = useState("");
  const [openFriendsPage, setOpenFriendsPage] = useState(true);
  const [friendsList, setFriendsList] = useState(
    Array<{
      index: number;
      username: string;
      username2: string;
      friendshipDate: Date;
    }>()
  );
  const [usersList, setUsersList] = useState(Array<{
	index: number;
	username: string;
	username: string;
  }>)
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    if (openFriendsPage) {
      utils.socket.emit("GET_USER_FRIENDS", user.user?.login);
      console.log(user.user?.login, "send GET_USER_FRIENDS to backend");
	  utils.socket.emit("GET_USERNAME", user.user?.login);
      console.log(user.user?.login, "send GET_USERNAME to backend");
    }
    setOpenFriendsPage(false);
  });

  utils.socket.removeListener("get_username");
  utils.socket.on(
    "get_username",
    (username: string) => {
      console.log(user.user?.login, "received get_username with", username);
		setMyUsername(username);
    }
  );

  utils.socket.removeListener("get_user_friends");
  utils.socket.on(
    "get_user_friends",
    (data: Array<{ username: string; username2: string; friendshipDate: Date }>) => {
      console.log(user.user?.login, "received get_user_friends with", data);
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
				let friendUsername = (friend.username === myUsername ? friend.username2 : friend.username)
              return (
                <div className="friendsListItem">
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
          <div className="usersListContainer">
            usersListContainer
            <div className="usersListItem">
              usersListItem
              <div className="usersListAvatar">usersListAvatar</div>
              <div className="usersListName">usersListName</div>
            </div>
          </div>
        </div>

        {dialogOpen ? (
          <div className="userInfoDialog">
            userInfoDialog
            <div className="userInfoNavbar">
              userInfoNavbar
              <div className="exitUserInfoDialogButton">
                exitUserInfoDialogButton
              </div>
              <div className="userInfoName">userInfoName</div>
              <div className="userHandleFriendshipContainer">
                userHandleFriendshipContainer
              </div>
              <div className="userInviteGameButton">userInviteGameButton</div>
              <div className="userLaunchChatButton">userLaunchChatButton</div>
            </div>
            <div className="userInfoMainContainer">
              userInfoMainContainer
              <div className="userInfoStatsContainer">
                userInfoStatsContainer
              </div>
              <div className="userMatchHistoryContainer">
                userMatchHistoryContainer
                <div className="matchHistoryItem">matchHistoryItem</div>
              </div>
              <div className="mutualMatchHistoryContainer">
                mutualMatchHistoryContainer
                <div className="mutualMatchHistoryItem">
                  mutualMatchHistoryItem
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Friends;
