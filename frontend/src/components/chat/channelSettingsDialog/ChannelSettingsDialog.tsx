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
  const [nameSecurityDialog, setNameSecurityDialog] = useState(false);
  const [passwordSecurityDialog, setPasswordSecurityDialog] = useState(false);
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
    setNameInputValue("");
    setPasswordInputValue("");
  };

  const handleCloseSecuName = () => {
    setNameSecurityDialog(false);
  };

  const handleCloseSecuPassword = () => {
    setPasswordSecurityDialog(false);
  };

  return (
    <Dialog
      className="channelSettingsDialog"
      open={props.settingsDialogOpen}
      onClose={handleClose}
      fullScreen
    >
      <div className="rawContainer">
        <div className="firstRaw">
          <div className="changeChannelName">
            <input
              type="text"
              placeholder="Change Name"
              className="changeChannelNameInput"
              id="outlined-basic"
              value={nameInputValue}
              autoComplete={"off"}
              onChange={(event) => {
                setNameInputValue(event.currentTarget.value);
              }}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") setNameSecurityDialog(true);
              }}
            />
          </div>
          <div className="changeChannelPassword">
            <input
              type="text"
              placeholder="Change Password"
              className="changeChannelPasswordInput"
              id="outlined-basic"
              value={passwordInputValue}
              autoComplete={"off"}
              onChange={(event) => {
                setPasswordInputValue(event.currentTarget.value);
              }}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") setPasswordSecurityDialog(true);
              }}
            />
          </div>
        </div>
        <div className="secondRaw">
          <div className="addAdmin">
            <div className="addAdminTitle">ADD ADMIN</div>
            <div className="addAdminContainer">
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
              <div className="addAdminContent">PARTICIPANTS LIST ...</div>
            </div>
          </div>
          <div className="removeAdmin">
            <div className="removeAdminTitle">REMOVE ADMIN</div>
            <div className="removeAdminContainer">
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
              <div className="removeAdminContent">ADMIN LIST ...</div>
            </div>
          </div>
        </div>
        <div className="thirdRaw">
          <div className="banUser">
            <div className="banUserTitle">BAN PARTICIPANT</div>
            <div className="banUserContainer">
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
              <div className="banUserContent">PARTICIPANTS LIST ...</div>
            </div>
          </div>
          <div className="muteUser">
            <div className="muteUserTitle">MUTE PARTICIPANT</div>
            <div className="muteUserContainer">
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
              <div className="muteUserContent">PARTICIPANTS LIST ...</div>
            </div>
          </div>
        </div>
        <div className="leaveChannel">Leave Channel</div>
      </div>
      <Dialog open={nameSecurityDialog} onClose={handleCloseSecuName}>
        <div className="securityText">Are you sure ?</div>
        <div
          className="yesButton"
          onClick={() => {
            utils.socket.emit("CHANGE_CHANNEL_NAME", {
              login: user.user?.login,
              currentName: props.openConvName,
              newName: nameInputValue,
            });
            console.log(
              "send CHANGE_CHANNEL_NAME to back from ",
              user.user?.login
            );
            props.setOpenConvName(nameInputValue);
            handleCloseSecuName();
            handleClose();
          }}
        >
          Yes
        </div>
        <div className="noButton" onClick={handleCloseSecuName}>
          No
        </div>
      </Dialog>
      <Dialog open={passwordSecurityDialog} onClose={handleCloseSecuPassword}>
        <div className="securityText">Are you sure ?</div>
        <div
          className="yesButton"
          onClick={() => {
            utils.socket.emit("CHANGE_CHANNEL_PASSWORD", {
              login: user.user?.login,
              channelName: props.openConvName,
              newPassword: passwordInputValue,
            });
            console.log(
              "send CHANGE_CHANNEL_PASSWORD to back from ",
              user.user?.login
            );
            handleCloseSecuPassword();
            handleClose();
          }}
        >
          Yes
        </div>
        <div className="noButton" onClick={handleCloseSecuPassword}>
          No
        </div>
      </Dialog>
    </Dialog>
  );
};

export default ChannelSettingsDialog;
