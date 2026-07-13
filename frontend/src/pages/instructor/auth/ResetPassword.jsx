import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function ResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleResetPassword = () => {

    let valid = true;

    setPasswordError("");
    setConfirmPasswordError("");

    if(password===""){
      setPasswordError("Password is required");
      valid=false;
    }
    else if(password.length<8){
      setPasswordError("Password must be at least 8 characters");
      valid=false;
    }
    else if(
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(password)
    ){
      setPasswordError(
        "Password must contain uppercase, lowercase, number and special character"
      );
      valid=false;
    }

    if(confirmPassword===""){
      setConfirmPasswordError("Confirm Password is required");
      valid=false;
    }
    else if(password!==confirmPassword){
      setConfirmPasswordError("Passwords do not match");
      valid=false;
    }

    if(valid){
      navigate("/instructor/login");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Reset Password</h1>
        <p>Create a strong password for your instructor account.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Reset Password</h1>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {passwordError && (
          <p style={{color:"red",marginBottom:"15px"}}>
            {passwordError}
          </p>
          )}  

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />

          {confirmPasswordError && (
          <p style={{color:"red",marginBottom:"15px"}}>
            {confirmPasswordError}
          </p>
          )}  

          <button onClick={handleResetPassword}>
            Reset Password
          </button>

          <p className="signup-text">
            <Link to="/instructor/login">
              Back to Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;