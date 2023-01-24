import Chat from "./pages/chat/Chat";
import Versions from "./components/versions/Versions";
import Profile from "./pages/profile/Profile";
import ProfileOther from "./pages/profilOther/ProfileOther";
import Pong from "./pages/pong/Pong";
import Home from "./pages/home/Home";
import Signin from "./pages/signin/Signin";
import Signup from "./pages/signup/Signup";
import Friends from "./pages/friends/Friends";
import ConnectionChecker from "./modules/ConnectionChecker";
import { Routes, Route } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./state/store";
import NotifInterceptor from "./components/NotifInterceptor/NotifInterceptor";
import Notif from "./pages/notif/Notif";
import { io } from "socket.io-client";
import Connect from "./pages/signup/Connect";

export const ip = window.location.hostname;
export const gameSocket = io(`ws://${ip}:5002`, { transports: ['websocket'] });


function App() {
  return (
    <div className="app">
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route
            path="/home"
            element={
              <ConnectionChecker sign={false} >
                <NotifInterceptor>
                  <Connect />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          {/* <Route
            path="/Signin"
            element={
              <ConnectionChecker sign={true} >
                <NotifInterceptor>
                  <Signin />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          /> */}
          <Route
            path="/signup"
            element={
              <ConnectionChecker sign={true}>
                <NotifInterceptor>
                  <Signup />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Home />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/versions"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Versions />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/pong"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Pong />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/friends"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Friends />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/profile"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Profile />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
                 <Route
            path="/profileother"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <ProfileOther />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/notif"
            element={
              <ConnectionChecker sign={false}>
                <NotifInterceptor>
                  <Notif />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
          <Route
            path="/chat"
            element={
              <ConnectionChecker sign={false}>
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
