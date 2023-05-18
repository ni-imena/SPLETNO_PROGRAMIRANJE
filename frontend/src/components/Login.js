import { useContext, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userContext = useContext(UserContext);

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

    const data = await res.json();
    const token = data.token;
    const user = data.user;
    if (user._id !== undefined) {
      localStorage.setItem('token', token);
      userContext.setUserContext(user);
    } else {
      setUsername("");
      setPassword("");
      setError("Invalid username or password");
    }
  }

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
}

export default Login;
