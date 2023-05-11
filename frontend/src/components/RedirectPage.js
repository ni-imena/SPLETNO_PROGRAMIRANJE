import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../userContext';
import queryString from 'query-string';

const CLIENT_ID = '105822';
const CLIENT_SECRET = 'e549180fe8992b629caffa80702bd9339759eff7';
const REDIRECT_URI = 'http://localhost:3000/stravaAuth';
const temp = "https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all";

function RedirectPage() {
    const userContext = useContext(UserContext);
    const [accessToken, setAccessToken] = useState(null);
    const navigate = useNavigate();
    const [athlete, setAthlete] = useState(null);

    const exchangeCodeForToken = async () => {
        const queryParams = queryString.parse(window.location.search);
        const code = queryParams.code;
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            }),
        });
        const data = await response.json();
        setAccessToken(data.access_token);
    };

    const getAthlete = async function () {
        const res = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setAthlete(data.id);
    }

    const saveAthleteId = async function () {
        const res = await fetch(`http://localhost:3001/users/${userContext.user._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stravaId: athlete
            })
        });
        await res.json();
    }

    useEffect(() => {
        const queryParams = queryString.parse(window.location.search);
        const code = queryParams.code;

        if (code) {
            exchangeCodeForToken();
        } else {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (accessToken !== null) {
            getAthlete();
        }
    }, [accessToken]);

    useEffect(() => {
        if (athlete !== null) {
            saveAthleteId();
            navigate('/profile');
        }
    }, [athlete]);

    return null;
}

export default RedirectPage;
