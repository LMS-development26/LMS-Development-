import "./Login.css";
import { useNavigate } from "react-router-dom";

function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="login-container">

      <div className="left-side">
        <h1>Pending Approval</h1>
        <p>Your registration has been submitted successfully.</p>
      </div>

      <div className="right-side">

        <div className="login-box">

          <h1>Waiting for Approval</h1>

          <p style={{ marginBottom: "20px", textAlign: "center" }}>
            Your account is awaiting administrator approval.
          </p>

          <p style={{ marginBottom: "30px", textAlign: "center" }}>
            You'll receive an email once your account is approved.
          </p>

          <button onClick={() => navigate("/instructor/login")}>
            Go to Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default PendingApproval;