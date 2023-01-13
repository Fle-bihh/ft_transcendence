import Chat from "./pages/chat/Chat";
import Versions from "./components/versions/Versions";
import Profile from "./pages/profile/Profile";
import Pong from "./pages/pong/Pong";
import Home from "./pages/home/Home";
import Signin from "./pages/signin/Signin";
import Signup from "./pages/signup/Signup";


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
          <Route path="/" element={<Home />} />
          <Route path="/versions" element={<Versions />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />

        </Routes>
      </PersistGate>
  </div>
  )
}

export default App;