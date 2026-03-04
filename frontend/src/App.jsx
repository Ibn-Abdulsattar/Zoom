import "./App.css";
import {Route, Routes} from "react-router-dom";
import Authenticate from "./landingPages/auth/Authenticate";
import GlobalAlert from "./components/GlobalAlert";
import VideoMeet from "./landingPages/video/VideoMeet";
import Landing from "./landingPages/landing/Landing";
import Home from "./landingPages/home/Home";

function App() {
  return (
    <>
    <GlobalAlert />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={<Authenticate />} />
        <Route path="/:url" element={<VideoMeet />} />
      </Routes>
    </>
  );
}

export default App;
