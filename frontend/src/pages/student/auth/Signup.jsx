import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Signup() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSignup = () => {

    let valid = true;

    setFullNameError("");
    setEmailError("");
    setMobileError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if(fullName.trim()===""){
      setFullNameError("Full Name is required");
      valid=false;
    }

    if(email.trim()===""){
      setEmailError("Email is required");
      valid=false;
    }
    else if(!/\S+@\S+\.\S+/.test(email)){
      setEmailError("Enter a valid email");
      valid=false;
    }

    if(mobile.trim()===""){
      setMobileError("Mobile Number is required");
      valid=false;
    }
    else if(!/^[0-9]{10}$/.test(mobile)){
      setMobileError("Enter a valid 10-digit mobile number");
      valid=false;
    }

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
      navigate("/student/login");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Join LMS</h1>
        <p>Create your account and start learning.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Student Signup</h1>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e)=>setFullName(e.target.value)}
          />
          
          {fullNameError && (
          <p style={{color:"red",marginBottom:"15px"}}>
          {fullNameError}
          </p>
          )}    

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          {emailError && (
          <p style={{color:"red",marginBottom:"15px"}}>
          {emailError}
          </p>
          )}    

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e)=>setMobile(e.target.value)}
          />

          {mobileError && (
          <p style={{color:"red",marginBottom:"15px"}}>
          {mobileError}
          </p>
          )}

          <input
            type="password"
            placeholder="Create Password"
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

          <button onClick={handleSignup}>
            Create Account
          </button>

          <p className="signup-text">
            Already have an account? <Link to="/student/login"> Login</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;