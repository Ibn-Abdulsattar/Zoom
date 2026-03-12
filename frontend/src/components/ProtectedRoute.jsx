import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAuth } from "../redux/slices/auth.slice";

export default function ProtectedRoute() {
  const auth = useSelector(isAuth);


  return auth ? <Outlet /> : <Navigate to="/auth"/>;
}
