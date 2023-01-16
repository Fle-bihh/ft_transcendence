import Chat from "./pages/chat/Chat";
import Versions from "./components/versions/Versions";
import Profile from "./pages/profile/Profile";
import Pong from "./pages/pong/Pong";
import Home from "./pages/home/Home";
import Signin from "./pages/signin/Signin";
import Signup from "./pages/signup/Signup";
import Friends from "./pages/friends/Friends";
import ConnectionChecker from './modules/ConnectionChecker';


import {Routes, Route} from "react-router-dom"
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from './state/store'

function App() {

return (
  <div className='app'>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/' element={<ConnectionChecker component={<Home />} />} />
          <Route path="/versions" element={<ConnectionChecker component={<Versions />} />} />
          <Route path="/pong" element={<ConnectionChecker component={<Pong />} />} />
          <Route path="/friends" element={<ConnectionChecker component={<Friends />} />} />
          <Route path="/profile" element={<ConnectionChecker component={<Profile />} />} />
          <Route path="/chat" element={<ConnectionChecker component={<Chat />} />} />

        </Routes>
      </PersistGate>
  </div>
  )
}

export default App;