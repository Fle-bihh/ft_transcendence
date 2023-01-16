import Chat from "./pages/chat/Chat";
import Versions from "./components/versions/Versions";
import Profile from "./pages/profile/Profile";
import Pong from "./pages/pong/Pong";
import Home from "./pages/home/Home";
import Signin from "./pages/signin/Signin";
import Signup from "./pages/signup/Signup";
import Friends from "./pages/friends/Friends";

import { Routes, Route } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./state/store";
import NotifInterceptor from "./components/NotifInterceptor/NotifInterceptor";
import Notif from "./pages/notif/Notif";

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
              <NotifInterceptor>
                <Home />
              </NotifInterceptor>
            }
          />
          <Route
            path="/versions"
            element={
              <NotifInterceptor>
                <Versions />
              </NotifInterceptor>
            }
          />
          <Route
            path="/pong"
            element={
              <NotifInterceptor>
                <Pong />
              </NotifInterceptor>
            }
          />
          <Route
            path="/friends"
            element={
              <NotifInterceptor>
                <Friends />
              </NotifInterceptor>
            }
          />
          <Route
            path="/profile"
            element={
              <NotifInterceptor>
                <Profile />
              </NotifInterceptor>
            }
          />
          <Route
            path="/notif"
            element={
              <NotifInterceptor>
                <Notif />
              </NotifInterceptor>
            }
          />
          <Route
            path="/chat"
            element={
              <NotifInterceptor>
                <Chat />
              </NotifInterceptor>
            }
          />
        </Routes>
      </PersistGate>
    </div>
  );
}

export default App;
