//
import "./Friends.scss";
import { RootState } from "../../state";

//
import React, { useState, useEffect } from "react";
import Navbar from "../../components/nav/Nav";

const Friends = () => {
  return (
    <div className="friendsPage">
      friendsPage
      <div className="navSpace"></div>
      <Navbar />
      <div className="friendsPageContainer">
        <div className="friendsPageSide">
          friendsPageSide
          <input className="friendsSearchBar" placeholder="friendsSearchBar"></input>
          <div className="friendsListContainer">
            friendsListContainer
            <div className="friendsListItem">
              friendsListItem
              <div className="friendsListAvatar">friendsListAvatar</div>
              <div className="friendsListName">friendsListName</div>
              <div className="friendsListStatus">friendsListStatus</div>
            </div>
          </div>
        </div>
        <div className="friendPageMain">
          friendPageMain
          <input className="usersSearchBar" placeholder="usersSearchBar"></input>
          <div className="usersListContainer">
            usersListContainer
            <div className="usersListItem">
              usersListItem
              <div className="usersListAvatar">usersListAvatar</div>
              <div className="usersListName">usersListName</div>
            </div>
          </div>
        </div>
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
            <div className="userInfoStatsContainer">userInfoStatsContainer</div>
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
      </div>
    </div>
  );
};

export default Friends;
