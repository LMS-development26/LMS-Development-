import "./Login.css";
import { useNavigate } from "react-router-dom";

function EmailVerification() {
  const navigate = useNavigate();
  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Verify Your Email</h1>
        <p>Your account has been created successfully.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Email Verification</h1>

          <p style={{marginBottom:"20px",textAlign:"center"}}>
            We've sent a verification link to your registered email address.
          </p>

          <p style={{marginBottom:"30px",textAlign:"center"}}>
            Please verify your email before logging in.
          </p>

          <button>
            Resend Verification Email
          </button>

          <button 
            style={{marginTop:"15px"}}
            onClick={() => navigate("/instructor/pending-approval")}
          >
            Go to Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default EmailVerification;