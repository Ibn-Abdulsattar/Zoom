import { useNavigate } from "react-router-dom";
import { useState } from "react";
import RestoreIcon from "@mui/icons-material/Restore";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { isAuth, logout } from "../redux/slices/auth.slice";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar(mode) {
  const auth = useSelector(isAuth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const m = mode.mode;
  const navigate = useNavigate();

  const icon = m === "home" ?  <HomeIcon/> : <RestoreIcon/>

  const handleAuth = async () => {
    if (auth) {
      try {
        await dispatch(logout()).unwrap();
        toast.success("Logged out successsfuly!");
        navigate("/auth");
      } catch (e) {
        toast.error(e.message);
      }
    } else {
      navigate("/auth");
    }
  };

  const navItems = [
    { label: "Join as Guest", path: "/aljk23" },
    { label: "Register", path: "/auth" },
  ];

  const authItems =
    m === "home"
      ? [{ label: "Home", path: "/home" }]
      : [{ label: "History", path: "/history" }];

  const items = auth ? authItems : navItems;

  return (
    <nav>
      {/* ── Navbar ── */}
      <Box
        component="nav"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2.5, md: 6 },
          py: 2,
          borderBottom: "1px solid #1e3a5f",
          position: "relative",
          zIndex: 100,
          // background: "#0d1117",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: 16, md: 18 },
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "monospace",
              letterSpacing: "0.06em",
            }}
          >
            VISION MEET
          </Typography>
        </Box>

        {/* Desktop nav */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
          }}
        >
          {items.map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "none",
                px: 2,
                py: 1,
                borderRadius: "8px",
                "&:hover": {
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
              startIcon={(auth && m) ? icon : undefined}
            >
              {item.label}
            </Button>
          ))}
          <Button
            onClick={handleAuth}
            sx={{
              ml: 1,
              bgcolor: "#2563eb",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "none",
              px: 2.5,
              py: 1,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
            endIcon={auth ? <LogoutIcon /> : undefined}
          >
            {auth ? "Logout" : "Login"}
          </Button>
        </Box>

        {/* Mobile hamburger */}
        <IconButton
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          sx={{
            display: { xs: "flex", md: "none" },
            color: "rgba(255,255,255,0.7)",
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            p: 1,
          }}
        >
          {isMenuOpen ? (
            <CloseIcon fontSize="small" />
          ) : (
            <MenuIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Mobile menu */}
      {isMenuOpen && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            px: 2.5,
            py: 2,
            borderBottom: "1px solid #1e3a5f",
            background: "#111827",
            gap: 0.5,
            zIndex: 99,
            position: "absolute",
            width: "100%",
            transition: "all 1s ease"
          }}
        >
          {items.map((item) => (
            <Button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setIsMenuOpen(false);
              }}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "none",
                px: 2,
                py: 1.25,
                borderRadius: "8px",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              {item.label}
            </Button>
          ))}
                    <Button
            onClick={handleAuth}
            sx={{
                justifyContent: "flex-start",
              ml: 1,
              bgcolor: "#2563eb",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "none",
                px: 2,
                py: 1.25,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
            endIcon={auth ? <LogoutIcon /> : undefined}
          >
            {auth ? "Logout" : "Login"}
          </Button>
        </Box>
      )}
    </nav>
  );
}
