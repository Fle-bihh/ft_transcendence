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
  allChannels: Array<{
    index: number;
    privacy: string;
    name: string;
    password: string;
    description: string;
    owner: string;
  }>;
}) => {
  const [nameInputValue, setNameInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");
  const [nameSecurityDialog, setNameSecurityDialog] = useState(false);
  const [passwordSecurityDialog, setPasswordSecurityDialog] = useState(false);
  const [participantRole, setParticipantRole] = useState("");
  const [participants, setParticipants] = useState(Array<{
    login: string,
    admin: boolean,
  }>());
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

  useEffect(() => {
    utils.socket.emit("GET_PARTICIPANT_ROLE", {
      login: user.user?.username,
      channel: props.openConvName,
    });
    console.log("send GET_PARTICIPANT_ROLE to back from", user.user?.username);
    utils.socket.emit("GET_PARTICIPANTS", {
      login: user.user?.username,
      channel: props.openConvName,
    });
    console.log("send GET_PARTICIPANTS to back from", user.user?.username);
  }, [props.settingsDialogOpen]);

  utils.socket.removeListener("channel_left");
  utils.socket.on("channel_left", (data: { channelName: string }) => {
    console.log(user.user?.username, 'received channel_left from back with', )
    props.setSettingsDialogOpen(false);
    props.setOpenConvName("");
    handleClose();
  });

  utils.socket.removeListener("get_participant_role");
  utils.socket.on("get_participant_role", (data: { role: string }) => {
    setParticipantRole(data.role);
  });

  utils.socket.removeListener("get_participants");
  utils.socket.on("get_participants", (data:  Array<{
    login: string,
    admin: boolean
  }>) => {
    setParticipants([...data]);
  });

  return (
    <Dialog
      className="channelSettingsDialog"
      open={props.settingsDialogOpen}
      onClose={handleClose}
      fullScreen
    >
      <div className="rawContainer">
        {participantRole === "owner" ? (
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
        ) : (
          <div></div>
        )}
        {participantRole === "owner" ? (
          <div className="secondRaw">
            <div className="addAdmin">
              <div className="addAdminTitle">ADD ADMIN</div>
              <div className="addAdminContainer">
                {participants.map(participant => {
                  if (!participant.admin) {
                    return (
                      <div className="addAdminContent">{participant.login}</div>
                    )
                  }
                })}
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
        ) : (
          <div></div>
        )}
        {participantRole != "participant" ? (
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
        ) : (
          <div></div>
        )}
        <div
          className="leaveChannel"
          onClick={() => {
            utils.socket.emit("LEAVE_CHANNEL", {
              login: user.user?.username,
              channelName: props.openConvName,
            });
            console.log("send LEAVE_CHANNEL to back from ", user.user?.username);
            handleClose();
          }}
        >
          <div className="leaveChannelText">Leave This Channel</div>
        </div>
      </div>
      <Dialog open={nameSecurityDialog} onClose={handleCloseSecuName}>
        <div className="securityText">Are you sure ?</div>
        <div
          className="yesButton"
          onClick={() => {
            utils.socket.emit("CHANGE_CHANNEL_NAME", {
              login: user.user?.username,
              currentName: props.openConvName,
              newName: nameInputValue,
            });
            console.log(
              "send CHANGE_CHANNEL_NAME to back from ",
              user.user?.username
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
              login: user.user?.username,
              channelName: props.openConvName,
              newPassword: passwordInputValue,
            });
            console.log(
              "send CHANGE_CHANNEL_PASSWORD to back from ",
              user.user?.username
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
