import { useEffect, useContext } from "react";
import { UserContext } from "../userContext";
import { Navigate } from "react-router-dom";

function Logout() {
  const userContext = useContext(UserContext);
  useEffect(function () {
    const logout = async function () {
      userContext.setUserContext(null);
      await fetch("http://localhost:3001/users/logout");
    };
    logout();
  }, [userContext]);

  return <Navigate replace to="/login" />;
}

export default Logout;
