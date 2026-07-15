import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSendOTP = () => {

    let valid = true;

    setEmailError("");

    if (email.trim() === "") {
      setEmailError("Email is required");
      valid = false;
    }
    else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    if (valid) {
      navigate("/instructor/otp");
    }

  };  
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Forgot Password?</h1>
        <p>Enter your registered email to receive a verification code.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Forgot Password</h1>

          <input
            type="email"
            placeholder="Enter Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {emailError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
              {emailError}  
            </p>
            )}

          <button onClick={handleSendOTP}>
            Send OTP
          </button>

          <p className="signup-text">
            Remember your password?
            <Link to="/instructor/login">
              <span> Login</span>
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;