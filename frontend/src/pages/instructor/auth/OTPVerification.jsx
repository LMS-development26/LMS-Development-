import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function OTPVerification() {

  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleVerifyOTP = () => {

    let valid = true;

    setOtpError("");

    if (otp.trim() === "") {
      setOtpError("OTP is required");
      valid = false;
    }
    else if (!/^[0-9]{6}$/.test(otp)) {
      setOtpError("OTP must be exactly 6 digits");
      valid = false;
    }

    if (valid) {
      navigate("/instructor/reset-password");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>OTP Verification</h1>
        <p>Enter the OTP sent to your registered email.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Verify OTP</h1>

          <input
            type="text"
            placeholder="Enter 6-Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {otpError && (
            <p style={{ color: "red", marginBottom: "15px" }}>
              {otpError} 
            </p>
            )}

          <button onClick={handleVerifyOTP}>
            Verify OTP
          </button>

          <p className="signup-text">
            Didn't receive OTP?
            <Link to="/instructor/forgot-password">
              <span> Resend OTP</span>
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default OTPVerification;