import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = () => {

    let valid = true;

    setEmailError("");
    setPasswordError("");

    if (email.trim() === "") {
      setEmailError("Email is required");
      valid = false;
    }
    else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    }
    else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    }

    if (valid) {
      navigate("/instructor/login");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Welcome!</h1>
        <p>Sign in to manage your academy and courses.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Instructor Login</h1>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {emailError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
              {emailError}  
            </p>
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {passwordError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
              {passwordError}  
            </p>
          )}  

          <div className="forgot">
            <Link to="/instructor/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button onClick={handleLogin}>
            Login
          </button>

          <p className="signup-text">
            Don't have an account?
            <Link to="/instructor/register">
              <span> Register</span>
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;