import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  login,
  verifyOtp,
  forgot,
} from "../../redux/slices/auth.slice.js";
import { error, loader } from "../../redux/slices/auth.slice";
import { clearError } from "../../redux/slices/auth.slice";
import { toast } from "react-toastify";

export default function Authenticate() {
  const apiError = useSelector(error);
  const loading = useSelector(loader);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [formState, setFormState] = useState(0);
  const switchFormState = (state) => {
    setFormState(state);
  };

  useEffect(() => {
    if (apiError) {
      toast.error(apiError);
      dispatch(clearError());
    }
  }, [apiError, dispatch]);

  const getTitle = () => {
    switch (formState) {
      case 0:
        return "Sign In";
      case 1:
        return "Sign Up";
      case 2:
        return "Forgot Password";
      case 3:
        return "Verify OTP";
      default:
        return "Sign In";
    }
  };

  const getButtonText = () => {
    switch (formState) {
      case 0:
        return "Sign In";
      case 1:
        return "Sign Up";
      case 2:
        return "Send OTP";
      case 3:
        return "Verify OTP";
      default:
        return "Submit";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formState === 3) {
        await dispatch(
          verifyOtp({ email: formData.email, code: formData.otp }),
        ).unwrap();
        console.log(origin);
        navigate("/home");
        toast.success("Verified successfully!");
      } else if (formState === 1) {
        await dispatch(register(formData)).unwrap();
        setFormState(3);
      } else if (formState === 2) {
        await dispatch(forgot(formData.email)).unwrap();
        toast.success("OTP sent!");
        setFormState(3);
      } else if (formState === 0) {
        await dispatch(login(formData)).unwrap();
        console.log(origin);
        navigate("/home");
        toast.success("Welcome Back!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          size={{ xs: false, md: 7 }}
          sx={{
            backgroundImage: `url( /jonatan-pie.jpg)`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid size={{ xs: 12, md: 5 }} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: "auto",
              height: "100vh",
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography
              variant="h4"
              sx={{ fontWeight: "700" }}
              component="h1"
              gutterBottom
              align="center"
            >
              {getTitle()}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              {/* Username */}
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  disabled={loading}
                  autoFocus
                  value={formData.username}
                  onChange={handleChange}
                />
              )}

              {/* Email  */}
              {(formState === 0 || formState === 1 || formState === 2) && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  disabled={loading}
                  autoFocus={formState !== 1}
                  value={formData.email}
                  onChange={handleChange}
                />
              )}

              {/* Password */}
              {(formState === 0 || formState === 1) && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  id="password"
                />
              )}

              {/* OTP */}
              {formState === 3 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="Enter OTP"
                  name="otp"
                  value={formData.otp}
                  disabled={loading}
                  autoFocus
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {getButtonText()}
              </Button>

              {/* Links to switch between forms */}
              <Box
                sx={{
                  mt: 2,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {formState === 0 && (
                  <>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => switchFormState(2)}
                      sx={{ mr: 2 }}
                    >
                      Forgot password?
                    </Link>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => switchFormState(1)}
                    >
                      Don't have an account? Sign Up
                    </Link>
                  </>
                )}

                {formState === 1 && (
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => switchFormState(0)}
                  >
                    Already have an account? Sign In
                  </Link>
                )}

                {formState === 2 && (
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => switchFormState(0)}
                  >
                    Back to Sign In
                  </Link>
                )}

                {formState === 3 && (
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => switchFormState(formState === 3 ? 2 : 1)}
                  >
                    Resend OTP
                  </Link>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
