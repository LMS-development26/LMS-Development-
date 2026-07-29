import "./StudentEmailVerification.css";
import { useLocation, useNavigate } from "react-router-dom";

export function StudentEmailVerification() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;


  const handleVerify = () => {

    alert("Email Verified Successfully!");

    navigate("/student/login");

  };


  return (

    <div className="verification-container">

      <div className="verification-card">

        <div className="logo">
          📧
        </div>

        <h1>
          Verify Your Email
        </h1>


        <p>
          We have sent a verification link to:
        </p>


        <strong>
          {email || "your email"}
        </strong>


        <p className="info">
          Please verify your email address to activate your account.
        </p>


        <button
          className="verify-btn"
          onClick={handleVerify}
        >
          Verify Email
        </button>


      </div>

    </div>

  );

}