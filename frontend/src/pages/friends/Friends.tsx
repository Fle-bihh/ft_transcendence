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
  const [inputValue, setInputValue] = useState("");
  const [openFriendsPage, setOpenFriendsPage] = useState(true);
  const [friendsList, setFriendsList] = useState(
    Array<{
      index: number;
      login: string;
      login2: string;
      friendshipDate: Date;
    }>()
  );
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    if (openFriendsPage) {
      utils.socket.emit("GET_USER_FRIENDS", user.user?.login);
      console.log(user.user?.login, "send GET_USER_FRIENDS to backend");
    }
    setOpenFriendsPage(false);
  });

  utils.socket.removeListener("get_user_friends");
  utils.socket.on(
    "get_user_friends",
    (data: Array<{ login: string; login2: string; friendshipDate: Date }>) => {
      console.log(user.user?.login, "received get_user_friends with", data);
      let tmpArray = Array<{
        index: number;
        login: string;
        login2: string;
        friendshipDate: Date;
      }>();
      data.map((friend) => {
        tmpArray.push({
          index: tmpArray.length,
          login: friend.login,
          login2: friend.login2,
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
              //   let list = document.getElementById("listConv");

              //   if (list != null) {
              //     for (let i = 0; i < list.children.length; i++) {
              //       if (
              //         !event.currentTarget.value.length ||
              //         list.children[i].children[1].children[0].textContent
              //           ?.toUpperCase()
              //           .indexOf(event.currentTarget.value.toUpperCase())! > -1
              //       )
              //         list.children[i].classList.remove("hidden");
              //       else list.children[i].classList.add("hidden");
              //     }
              //   }

              setInputValue(event.currentTarget.value);
            }}
            autoFocus
            onKeyDown={(event) => {}}
          />
          <div className="friendsListContainer">
            {friendsList.map((friend) => {
				let friendLogin = (friend.login === user.user?.login ? friend.login2 : friend.login)
              return (
                <div className="friendsListItem">
                  <div className="friendsListAvatar">
                    <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                  {friendLogin[0]}
                </Avatar>
                  </div>
                  <div className="friendsListName">{friendLogin}</div>
                  <div className="friendsListStatus">friendsListStatus</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="friendPageMain">
          friendPageMain
          <input
            className="usersSearchBar"
            placeholder="usersSearchBar"
          ></input>
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
