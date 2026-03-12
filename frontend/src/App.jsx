import "./App.css";
import { Route, Routes } from "react-router-dom";
import Authenticate from "./landingPages/auth/Authenticate";
import VideoMeet from "./landingPages/video/VideoMeet";
import Landing from "./landingPages/landing/Landing";
import Home from "./landingPages/home/Home";
import { ToastContainer } from "react-toastify";
import History from "./landingPages/history/History";
import ProtectedRoute from "./components/protectedRoute";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="/auth" element={<Authenticate />} />
        <Route path="/:url" element={<VideoMeet />} />
      </Routes>
    </>
  );
}

export default App;
