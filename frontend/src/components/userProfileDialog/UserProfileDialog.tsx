import "./UserProfileDialog.scss";
import { RootState } from "../../state";
import { useSelector } from "react-redux";
import {
  Dialog,
} from "@mui/material";

const UserProfileDialog = (props: {
  profileDialogOpen: boolean;
  setProfileDialogOpen: Function;
}) => {
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
    props.setProfileDialogOpen(true);
  };

  const handleClose = () => {
    props.setProfileDialogOpen(false);
  };

  return (
    <Dialog
      className="userInfoDialog"
      fullScreen
      open={props.profileDialogOpen}
      onClose={handleClose}
    >
        <div>
            {/* TU PEUX METTRE TA PAGE PROFILE ICI */}
        </div>
    </Dialog>
  );
};

export default UserProfileDialog;
