import { useState } from "react";
import {
  AppBar,
  Badge,
  Box,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import "./nav.scss";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  Home as HomeIcon,
  PersonAdd,
  AccountCircle,
  Notifications,
  Message,
  Menu as MenuIcon,
} from "@mui/icons-material/";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../state";
import { bindActionCreators } from "redux";
import Cookies from "universal-cookie";

const Navbar = (props: any) => {
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);
  const { setTwoFA } = bindActionCreators(actionCreators, dispatch);
  const persistantReducer = useSelector(
    (state: RootState) => state.persistantReducer
  );
  const StyledToolbar = styled(Toolbar)({
    display: "flex",
    justifyContent: "space-between",
  });
  const ItemsNav = styled(Box)({
    display: "flex",
    gap: 15,
  });
  const ItemsInNav = [
    { Name: <PersonAdd />, Link: "/Friends" },
    { Name: <Badge badgeContent={persistantReducer.notifReducer.notifArray.filter((notif) => !notif.seen).length} showZero={false} color="error" ><Notifications /></Badge>, Link: "/Notif" },
    { Name: <Message />, Link: "/Chat" },
    { Name: <AccountCircle />, Link: "/Profile" },
    { Name: <LogoutIcon />, Link: "/Signup" },
  ];

  const HomeBox = styled(Box)({
    display: "flex",
    gap: 15,
  });
  const HomeItems = [
    { Name: "Home", Link: "/" },
    { Name: "Pong", Link: "/pong" },
  ];
  const [open, Setopen] = useState(false);
  const [open2, Setopen2] = useState(false);

  return (
    <AppBar sx={{ background: "white", opacity: 0.8 }}>
      <StyledToolbar>
        {/* La barre des Items HOME */}
        <HomeBox sx={{ display: { xs: "none", sm: "none", md: "flex" } }}>
          {HomeItems.map((item) => (
            <NavLink key={item.Link} to={`${item.Link}`} className="link">
              <Typography
                sx={{ cursor: "pointer", frontSize: "14px", color: "black" }}
              >
                {item.Name}
              </Typography>
            </NavLink>
          ))}
        </HomeBox>
        <HomeIcon
          sx={{
            display: { xs: "block", sm: "block", md: "none" },
            color: "black",
          }}
          onClick={() => Setopen(!open)}
        />

        {/* La barre des Items NAV  (profil, deco etc*/}
        <ItemsNav sx={{ display: { xs: "none", sm: "none", md: "flex" } }}>
          {ItemsInNav.map((item) => {
            if (item.Link === "/Notif")
              return (
                <NavLink key={item.Link} to={`${item.Link}`} className="link">
                  <Badge
                    badgeContent={
                      persistantReducer.notifReducer.notifArray.filter(
                        (notif) => !notif.seen
                      ).length
                    }
                    showZero={false}
                    color={"error"}
                  >
                    <Typography
                      sx={{
                        cursor: "pointer",
                        frontSize: "14px",
                        color: "black",
                      }}
                    >
                      {item.Name}
                    </Typography>
                  </Badge>
                </NavLink>
              );
            else if (item.Link === "/Signup") {
              return (
                <div
                  key={item.Link}
                  className="link"
                  onClick={() => {
                    const cookies = new Cookies();
                    cookies.remove("jwt");
                    setUser(null);
                    setTwoFA(false);
                    window.history.pushState({}, window.location.toString());
                    window.location.replace("/");
                  }}
                >
                  <Typography
                    sx={{
                      cursor: "pointer",
                      frontSize: "14px",
                      color: "black",
                    }}
                  >
                    {item.Name}
                  </Typography>
                </div>
              );
            } else
              return (
                <NavLink key={item.Link} to={`${item.Link}`} className="link">
                  <Typography
                    sx={{
                      cursor: "pointer",
                      frontSize: "14px",
                      color: "black",
                    }}
                  >
                    {item.Name}
                  </Typography>
                </NavLink>
              );
          })}
        </ItemsNav>
        <MenuIcon
          sx={{
            display: { xs: "block", sm: "block", md: "none" },
            color: "black",
          }}
          onClick={() => Setopen2(!open2)}
        />
      </StyledToolbar>

      {/* Pour rétrécir la bar des Items Nav */}
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        open={open2}
        onClose={() => Setopen2(!open2)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ width: 150, height: "21vh" }}>
          {ItemsInNav.map((item) => {
           if (item.Link === "/Notif")
           return (
             <NavLink key={item.Link} to={`${item.Link}`}  className="little-link">
               {/* <Badge
                 badgeContent={
                   persistantReducer.notifReducer.notifArray.filter(
                     (notif) => !notif.seen
                   ).length
                 }
                 showZero={false}
                 color="error"
               > */}
                 <MenuItem
                   sx={{
                     cursor: "pointer",
                     frontSize: "14px",
                     color: "black",
                   }}
                 >
                   {item.Name}
                 </MenuItem>
               {/* </Badge> */}
             </NavLink>
           );

            else if (item.Link === "/Signup") {
              return (
                <div
                  key={item.Link}
                  className="little-link"
                  onClick={() => {
                    const cookies = new Cookies();
                    cookies.remove("jwt");
                    setUser(null);
                    setTwoFA(false);
                    window.history.pushState({}, window.location.toString());
                    window.location.replace("/");
                  }}
                >
                  <MenuItem
                    sx={{
                      cursor: "pointer",
                      frontSize: "14px",
                      color: "black",
                    }}
                  >
                    {item.Name}
                  </MenuItem>
                </div>
              );
            } else
              return (
                <NavLink
                  key={item.Link}
                  to={`${item.Link}`}
                  className="little-link"
                >
                  <MenuItem
                    sx={{ cursor: "pointer", frontSize: "14px", color: "black" }}
                  >
                    {item.Name}
                  </MenuItem>
                </NavLink>
              );
          })}
        </Box>
      </Menu>

      {/* Pour rétrécir la bar des Items Home */}
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        open={open}
        onClose={() => Setopen(!open)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ width: 150, height: "10vh" }}>
          {HomeItems.map((item) => (
            <NavLink
              key={item.Link}
              to={`${item.Link}`}
              className="little-link"
            >
              <MenuItem
                sx={{ cursor: "pointer", frontSize: "14px", color: "balck" }}
              >
                {item.Name}
              </MenuItem>
            </NavLink>
          ))}
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
