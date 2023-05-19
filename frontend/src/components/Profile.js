import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate } from "react-router-dom";

const CLIENT_ID = "105822";
const REDIRECT_URI = "http://localhost:3000/stravaAuth";

function Profile() {
  const userContext = useContext(UserContext);
  const [profile, setProfile] = useState({});
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:3001/users/profile", {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data.message === "Token expired.") {
        setTokenExpired(true);
      }
      else {
        setTokenExpired(false);
        setProfile(data.user);
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  const handleLogin = () => {
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all`;
    window.location.href = stravaAuthUrl;
  };

  if (tokenExpired) {
    return <Navigate replace to="/logout" />;
  }

  if (loading) {
    return <p></p>;
  }

  return (
    <div className="container">
      {!userContext.user ? <Navigate replace to="/login" /> : ""}
      <h1>User profile</h1>
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      {!profile.stravaId && <button className="btn btn-primary" onClick={handleLogin}>
        Authorize Strava
      </button>}
    </div>
  );
}

export default Profile;
