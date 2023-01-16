//
import "./ChannelSettingsDialog.scss";
import { RootState } from "../../../state";

//
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  AppBar,
  Dialog,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import RemoveModeratorIcon from "@mui/icons-material/RemoveModerator";
import ShieldIcon from "@mui/icons-material/Shield";

const ChannelSettingsDialog = (props: {
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: Function;
  openConvName: string;
  setOpenConvName: Function;
}) => {
  const [nameInputValue, setNameInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  const handleKeyDown = (event: any) => {
    if (event.key == "Escape") {
      window.removeEventListener("keydown", handleKeyDown);
    }
  };

  const handleClickOpen = () => {
    props.setSettingsDialogOpen(true);
  };

  const handleClose = () => {
    props.setSettingsDialogOpen(false);
  };

  return (
    <Dialog open={props.settingsDialogOpen} onClose={handleClose}>
      <div className="changeChannelName">
        <input
          type="text"
          placeholder="Change Name"
          className="newConvMessageInput"
          id="outlined-basic"
          value={nameInputValue}
          autoComplete={"off"}
          onChange={(event) => {
            setNameInputValue(event.currentTarget.value);
          }}
          autoFocus
          // onKeyDown={(event) => {
          //   if (event.key == "Enter") {
          //     utils.socket.emit('CHANGE_CHANNEL_NAME', {
          //       login: user.user?.login;
          //     })
          //   }
          // }}
        />
      </div>
      <div className="changeChannelPassword">Change Password</div>
      <div className="addAdmin">Add admin</div>
      <div className="removeAdmin">Remove Admin</div>
      <div className="banUser">Ban User</div>
      <div className="muteUser">Mute User</div>
      <div className="leaveChannel">Leave Channel</div>
    </Dialog>
  );
};

export default ChannelSettingsDialog;
