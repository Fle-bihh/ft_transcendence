import "./Friends.scss";
import { RootState } from "../../state";
import { useState, useEffect } from "react";
import Navbar from "../../components/nav/Nav";
import { useSelector } from "react-redux";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { NavLink } from "react-router-dom";

const Friends = () => {
  const [friendsList, setFriendsList] = useState(
    Array<{
      username: string;
    }>()
  );
  const [usersList, setUsersList] = useState(
    Array<{ index: number; username: string; profileImage: string }>
  );
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    utils.socket.emit("GET_USER_FRIENDS", { username: user.user?.username});
    utils.socket.emit("GET_ALL_USERS_NOT_FRIEND", { username: user.user?.username});
  }, [user.user?.username, utils.socket]);

  utils.socket.removeListener("get_all_users_not_friend");
  utils.socket.on(
    "get_all_users_not_friend",
    (users: Array<{ username: string; profileImage: string }>) => {
      let tmpArray = Array<{
        index: number;
        username: string;
        profileImage: string;
      }>();
      users.forEach((user) => {
        tmpArray.push({
          index: tmpArray.length,
          username: user.username,
          profileImage: user.profileImage,
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
            <div className="friendsListTitle">Friends List</div>
            {friendsList.map((friend, index) => {
              return (
                <Tooltip key={index} title={`Go to ${friend.username}'s profile`}>
                  <NavLink to={`/profileother?username=${friend.username}`}>
                    <div className="friendListItem">
                      <IconButton>
                        <Avatar />
                      </IconButton>
                      <div className="friendsName">{friend.username}</div>
                    </div>
                  </NavLink>
                </Tooltip>
              );
            })}
          </div>
        </div>
        <div className="friendPageMain">
          <div className="usersListContainer">
            <div className="usersListTitle">Users List</div>
            {usersList.map((user, index) => (
              <Tooltip key={index} title={`Go to ${user.username}'s profile`}>
              <NavLink to={`/profileother?username=${user.username}`}>
                <div className="friendListItem">
                  <IconButton>
                    <Avatar />
                  </IconButton>
                  <div className="friendsName">{user.username}</div>
                </div>
              </NavLink>
            </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
