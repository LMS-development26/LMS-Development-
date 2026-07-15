import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

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

    // Email Required
    if (email.trim() === "") {
      setEmailError("Email is required");
      valid = false;
    }

    // Email Format
    else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    // Password Required
    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    }

    // Password Length
    else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    }

    if (valid) {
      navigate("/student/login");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Welcome to LMS</h1>
        <p>Learn Anytime, Anywhere.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Student Login</h1>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
              {emailError}
            </p>
          )}

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
                {passwordError}
            </p>
          )}

          <div className="forgot">
            <Link to="/student/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button onClick={handleLogin}>
            Login
          </button>

          <p className="signup-text">
            Don't have an account?
            <Link to="/student/signup"> Sign Up</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;