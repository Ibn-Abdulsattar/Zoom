import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { logout } from "../redux/slices/auth.slice";
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar(mode) {
  const dispatch = useDispatch();
  const m = mode.mode;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successsfuly!");
      navigate("/auth");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleHistory = (e) => {
    e.preventDefault();
    navigate(`/${m}`);
  };
  return (
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
            onClick={handleHistory}
            sx={{
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 500,
            }}
            startIcon={
              m === "history" ? (
                <RestoreIcon sx={{ fontSize: "1rem" }} />
              ) : (
                <HomeIcon sx={{ fontSize: "1rem" }} />
              )
            }
          >
            {m === "history" ? "History" : "Home"}
          </Button>

          <Button
            variant="text"
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ fontSize: "1rem" }}/>}
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
  );
}
