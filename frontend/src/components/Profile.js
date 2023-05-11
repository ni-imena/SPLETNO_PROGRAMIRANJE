import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';


const CLIENT_ID = '105822';
const REDIRECT_URI = 'http://localhost:3000/stravaAuth';

function LoginButton() {

    const handleLogin = () => {
        const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all`;
        window.location.href = stravaAuthUrl;
    };
    return (
        <button className="btn btn-primary" onClick={handleLogin}>Authorize Strava</button>
    );
}

function Profile() {
    const userContext = useContext(UserContext);
    const [profile, setProfile] = useState({});

    useEffect(function () {
        const getProfile = async function () {
            const res = await fetch("http://localhost:3001/users/profile", { credentials: "include" });
            const data = await res.json();
            setProfile(data);
        }
        getProfile();
    }, []);

    return (
        <div className="container">
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            <h1>User profile</h1>
            <p>Username: {profile.username}</p>
            <p>Email: {profile.email}</p>
            {profile.stravaId ? "" : <LoginButton />}
        </div>
    );
}

export default Profile;