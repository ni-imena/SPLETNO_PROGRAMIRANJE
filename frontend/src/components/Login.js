import { useContext, useState, useEffect } from "react";
import { UserContext } from "../userContext";
import { Link, Navigate } from "react-router-dom";
import './Login.css';
import "@fortawesome/fontawesome-free/css/all.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userContext = useContext(UserContext);
  const [rememberUsername, setRememberUsername] = useState(false);

  async function Login(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/users/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const token = data.token;
      const user = data.user;
      if (user._id !== undefined) {
        localStorage.setItem('token', token);
        userContext.setUserContext(user);
      }
      if (rememberUsername) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }
    } else {
      setUsername("");
      setPassword("");
      setError("Invalid username or password");
    }
  }

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberUsername(true);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={Login}>
          {userContext.user ? <Navigate replace to="/profile" /> : ""}

          <div className="error-group">
            <label>{error}</label>
          </div>

          <div className="form-group">
            <label htmlFor="nameInput">Username:</label>
            <input type="text" id="nameInput" name="username" placeholder="Enter your Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="passwordInput">Password:</label>
            <input type="password" id="passwordInput" name="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="submit-container">
            <div className="checkbox-group">
              <input type="checkbox" id="rememberUsername" name="rememberUsername" checked={rememberUsername} onChange={(e) => setRememberUsername(e.target.checked)} />
              <label htmlFor="rememberUsername">Remember me</label>
            </div>
            <div className="button-container">
              <input type="submit" name="submit" value="LOG IN" />
            </div>
          </div>
        </form>
        <div className="or-divider">
          <span className="line"></span>
          <span className="or-text">OR</span>
          <span className="line"></span>
        </div>

        <div className="outside-group" style={{ flexDirection: 'column' }}>
          <div className="button-row">
            <button className="form-button">
              <i className="fa-brands fa-google" style={{ fontSize: '24px', marginRight: '5px' }}></i>
              Login with Google</button>
          </div>
          <div className="button-row">
            <button className="form-button" >
              <i className="fa-brands fa-facebook" style={{ fontSize: "24px", marginRight: '5px' }}></i>
              Login with Facebook
            </button>
          </div>
        </div>

        <div className="or-divider">
          <span className="line"></span>
        </div>

        <div className="register-group">
          <h4>Don't have an account?</h4>
          <div className="register-row">
            <Link to="/register">
              <button className="register-button">SIGN UP</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );


  /*
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to Spotify</h2>
        <form>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button type="submit">Log In</button>
        </form>
        <p>Forgot your password?</p>
      </div>
    </div>
  );*/
  /*
  return (
    <div className="container">
      <form onSubmit={Login}>
        {userContext.user ? <Navigate replace to="/profile" /> : ""}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" name="submit" value="Log in" />
        <label>{error}</label>
      </form>
    </div>
  );
  */
}

export default Login;
