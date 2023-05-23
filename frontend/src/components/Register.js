import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState([]);
  const [password, setPassword] = useState([]);
  const [email, setEmail] = useState([]);
  const [error, setError] = useState([]);

  async function Register(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      }),
    });
    const data = await res.json();
    if (data._id !== undefined) {
      window.location.href = "/";
    } else {
      setUsername("");
      setPassword("");
      setEmail("");
      setError("Registration failed");
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign Up For Free</h2>

        <form onSubmit={Register}>
          <div className="error-group">
            <label>{error}</label>
          </div>

          <div className="form-group">
            <label htmlFor="nameInput">What is your username?</label>
            <input type="text" id="nameInput" name="username" placeholder="Enter your Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="emailInput">What is your email?</label>
            <input type="email" id="emailInput" name="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="passwordInput">Create a password</label>
            <input type="password" id="passwordInput" name="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="submit-container">
            <div className="button-container" style={{ marginRight: 0, justifyContent: 'center' }}>
              <input type="submit" name="submit" value="Register" style={{ width: '50%' }} />
            </div>
          </div>

          <div className="or-divider">
            <span className="line"></span>
            <span className="or-text">OR</span>
            <span className="line"></span>
          </div>

          <div className="outside-group">
            <button className="form-button" style={{ marginRight: '15px' }}>
              <i class="fa-brands fa-google" style={{ fontSize: '24px', marginRight: '5px' }}></i>
              Sign up with Google</button>
            <button className="form-button" style={{ marginLeft: '15px' }}>
              <i class="fa-brands fa-facebook" style={{ fontSize: "24px", marginRight: '5px' }}></i>
              Sign up with Facebook
            </button>
          </div>


          <div className="or-divider">
            <span className="line"></span>
          </div>

          <div className="register-group">
            <h4>Already have an account?</h4>
            <div className="register-row">
              <Link to="/login">
                <button className="register-button">LOG IN</button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
