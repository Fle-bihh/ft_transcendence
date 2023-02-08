import Chat from "./pages/chat/Chat";
import Profile from "./pages/profile/Profile";
import ProfileOther from "./pages/profilOther/ProfileOther";
import Pong from "./pages/pong/Pong";
import Home from "./pages/home/Home";
import NotFoundPage from "./pages/error_404/NotFoundPage";
import Signup from "./pages/signup/Signup";
import Friends from "./pages/friends/Friends";
import ConnectionChecker from "./modules/ConnectionChecker";
import { Routes, Route } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./state/store";
import NotifInterceptor from "./components/NotifInterceptor/NotifInterceptor";
import Notif from "./pages/notif/Notif";
import Connect from "./pages/signup/Connect";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "./state";
import { bindActionCreators } from "redux";
import { NotifType } from "./state/type";
import { useEffect } from "react";

export const ip = window.location.hostname;

function App() {
  const utils = useSelector((state: RootState) => state.utils);
  const { addNotif } = bindActionCreators(actionCreators, useDispatch());
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  utils.gameSocket.removeListener("invite_game");
  utils.gameSocket.on("invite_game", (data: { sender: string; gameMap: string; receiver: string }) => {
      console.log("received invitation data : ", data);
      addNotif({ type: NotifType.INVITEGAME, data: data });
    }
  );

  useEffect(() => {
    if (user.user)
    {
      utils.socket.emit("STORE_CLIENT_INFO", { user: user.user });
      utils.gameSocket.emit("CHECK_RECONNEXION", {username : user.user?.username});
    }
  });

  return (
    <div className="app">
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/home" element={<Connect />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Home />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
        <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/pong"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Pong />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/friends"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Friends />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/profile"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Profile />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/profileother/*"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <ProfileOther />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/notif"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Notif />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/chat"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Chat />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
        </Routes>
      </PersistGate>
    </div>
  );
}

export default App;
