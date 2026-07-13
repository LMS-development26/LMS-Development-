import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [academy, setAcademy] = useState("");
  const [terms, setTerms] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  const handleRegister = () => {

    let valid = true;

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");

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

    if(!terms){
      setTermsError("Please accept the Terms & Conditions");
      valid=false;
    }

    if(valid){
      navigate("/instructor/email-verification");
    }

  };
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Instructor</h1>
        <p>Create your academy and start teaching students.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Instructor Registration</h1>

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
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          {emailError && (
          <p style={{color:"red",marginBottom:"15px"}}>
            {emailError}
          </p>
          )}

          <input
            type="password"
            placeholder="Password"
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

          <input
            type="text"
            placeholder="Academy Name (Optional)"
            value={academy}
            onChange={(e)=>setAcademy(e.target.value)}
          />

          <label style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e)=>setTerms(e.target.checked)}
            style={{width:"18px",marginRight:"10px"}}
          />
          I agree to the Terms & Conditions
         </label>

         {termsError && (
         <p style={{color:"red",marginBottom:"15px"}}>
           {termsError}
         </p>
         )}

          <button onClick={handleRegister}>
            Register
          </button>

          <p className="signup-text">
            Already have an account?
            <Link to="/instructor/login">
              <span> Login</span>
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;