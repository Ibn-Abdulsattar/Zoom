import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth.slice";
import { toast } from "react-toastify";

function Home() {
  const dispatch = useDispatch();

  const [meetingCode, setMeetingCode] = useState("");
  const navigate = useNavigate();

  const handleJoinVideoCall = () => {
    navigate(`/${meetingCode}`);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successsfuly!");
      navigate("/auth");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* NAV */}
      <nav>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 4, md: 6 },
            py: 2,
            borderBottom: "1px solid rgba(167,139,250,0.12)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Heading */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                background: "#000",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Vision Meet
            </Typography>
          </Box>

          {/* Button container */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              sx={{
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
              }}
            >
              <RestoreIcon sx={{ mr: 0.5, fontSize: "1rem" }} /> History
            </Button>
            <Button
              variant="text"
              onClick={handleLogout}
              sx={{
                fontWeight: 500,
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </nav>

      {/* Home Container */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column-reverse", md: "row" },
          gap: { xs: 4, md: 2 },
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, md: 0 },
          minHeight: "calc(100vh - 69px)",
        }}
      >
        {/* Left part */}
        <Box
          sx={{
            maxWidth: { xs: "100%", md: 500 },
            width: "100%",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.6rem" },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              mb: 3,
              background: "#000",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Premium Connectivity for the Next Generation of Scholars.
          </Typography>

          <Box
            component="form"
            sx={{
              display: "flex",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: { xs: "center", md: "flex-start" },
            }}
            onSubmit={handleJoinVideoCall}
          >
            <TextField
              value={meetingCode}
              id="outlined-basic"
              variant="outlined"
              label="Meeting Code"
              onChange={(e) => setMeetingCode(e.target.value)}
              sx={{
                flex: 1,
              }}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.2s",
              }}
            >
              Join
            </Button>
          </Box>
        </Box>

        {/* Right image */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Box
            component="img"
            src="./logo4.png"
            alt="videoFeature"
            sx={{
              width: { xs: "70%", sm: "50%", md: 420 },
              maxWidth: 460,
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
