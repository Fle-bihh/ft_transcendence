import Chat from "./pages/chat/Chat";
import Versions from "./components/versions/Versions";
import Profile from "./pages/profile/Profile";
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

export const gameSocket = io(`ws://127.0.0.1:5002`, { transports: ['websocket'] });

function App() {
  return (
    <div className="app">
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route
            path="/signin"
            element={
              <NotifInterceptor>
                <Signin />
              </NotifInterceptor>
            }
          />
          <Route
            path="/signup"
            element={
              <NotifInterceptor>
                <Signup />
              </NotifInterceptor>
            }
          />
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
          <Route
            path="/versions"
            element={
              <ConnectionChecker>
                <NotifInterceptor>
                  <Versions />
                </NotifInterceptor>
              </ConnectionChecker>
            }
          />
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
