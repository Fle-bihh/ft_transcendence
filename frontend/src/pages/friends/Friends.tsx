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
    Array<{
      index: number;
      username: string;
      profileImage: string;
    }>
  );
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    utils.socket.emit("GET_USER_FRIENDS", user.user?.username);
    console.log(user.user?.username, "send GET_USER_FRIENDS to backend");
    utils.socket.emit("GET_ALL_USERS_NOT_FRIEND", { username: user.user?.username });
    console.log(user.user?.username, "send GET_ALL_USERS to backend");
  }, []);

  utils.socket.removeListener("get_all_users_not_friend");
  utils.socket.on(
    "get_all_users_not_friend",
    (users: Array<{ username: string; profileImage: string }>) => {
      console.log(user.user?.username, "received get_all_users with", users);
      let tmpArray = Array<{
        index: number;
        username: string;
        profileImage: string;
      }>();
      users.map((user) => {
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
          <div className="friendsListTitle">
            Friends List
          </div>
          {friendsList.map((friend) => {
            return (
              <Tooltip title={`Go to ${friend.username}'s profile`}>
                <NavLink to={`/profileother?username=${friend.username}`}>
                  <IconButton>
                    <Avatar />
                  </IconButton>
                  <div className="friendsName">{friend.username}</div>
                </NavLink>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <div className="friendPageMain">
        <div className="usersListContainer">
          <div className="usersListTitle">
            Users List
          </div>
          {usersList.map((user) => (
            <Tooltip title={`Go to ${user.username}'s profile`} key={user.index}>
              <NavLink to={`/profileother?username=${user.username}`}>
                <IconButton>
                  <Avatar />
                </IconButton>
                <div className="usersName">{user.username}</div>
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
