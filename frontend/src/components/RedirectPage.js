import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../userContext";
import { Navigate } from "react-router-dom";
import queryString from "query-string";

const CLIENT_ID = "105822";
const CLIENT_SECRET = "e549180fe8992b629caffa80702bd9339759eff7";
const REDIRECT_URI = "http://localhost:3000/stravaAuth";

function RedirectPage() {
  const userContext = useContext(UserContext);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  const exchangeCodeForToken = useCallback(async () => {
    const queryParams = queryString.parse(window.location.search);
    const code = queryParams.code;
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });
    const data = await response.json();
    setAccessToken(data.access_token);
  }, []);

  const getAthlete = useCallback(async function () {
    const res = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setAthlete(data.id);
  }, [accessToken]);

  const saveAthleteId = useCallback(async function () {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3001/users/strava/${userContext.user._id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        stravaId: athlete,
      }),
    }
    );
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    if (data.message === "Token expired.") {
      setTokenExpired(true);
    }
    else {
      setTokenExpired(false);
    }
  }, [userContext.user._id, athlete]);

  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);
    const code = queryParams.code;

    if (code) {
      exchangeCodeForToken();
    } else {
      navigate("/");
    }
  }, [navigate, exchangeCodeForToken]);

  useEffect(() => {
    if (accessToken !== null) {
      getAthlete();
    }
  }, [accessToken, getAthlete]);

  useEffect(() => {
    if (athlete !== null) {
      saveAthleteId();
      navigate("/profile");
    }
  }, [athlete, navigate, saveAthleteId]);

  if (tokenExpired) {
    return <Navigate replace to="/logout" />;
  }
  return null;
}

export default RedirectPage;
