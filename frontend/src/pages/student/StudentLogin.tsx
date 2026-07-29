import "./StudentLogin.css";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


export function StudentLogin() {

  const navigate = useNavigate();

  const { login } = useAuth();


  const [showPassword, setShowPassword] = useState(false);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [error,setError] = useState("");



  const handleSubmit = (e: React.FormEvent)=>{

    e.preventDefault();


    if(!email || !password){

      setError("Email and Password are required");
      return;

    }


    login({
  first_name: "Student",
  last_name: "",
  email: email,
  role: "STUDENT"
});



    alert("Login Successful!");


    navigate("/student/dashboard");


  };



  return (

    <div className="login-container">

      <div className="login-card">


        <div className="logo">
          🎓
        </div>


        <h1>
          Welcome Back
        </h1>


        <p className="subtitle">
          Login to continue your learning journey
        </p>


        {error && (
          <p className="error">
            {error}
          </p>
        )}



        <form onSubmit={handleSubmit}>


          <div className="input-group">

            <label>Email Address</label>

            <div className="input-box">

              <Mail size={18} className="icon"/>


              <input

                type="email"

                placeholder="Enter your email"

                value={email}

                onChange={(e)=>setEmail(e.target.value)}

              />

            </div>

          </div>




          <div className="input-group">

            <label>Password</label>

            <div className="input-box">


              <Lock size={18} className="icon"/>


              <input

                type={showPassword ? "text":"password"}

                placeholder="Enter your password"

                value={password}

                onChange={(e)=>setPassword(e.target.value)}

              />



              <button

                type="button"

                className="eye-btn"

                onClick={()=>setShowPassword(!showPassword)}

              >

              {
                showPassword 
                ?
                <EyeOff size={18}/>
                :
                <Eye size={18}/>
              }

              </button>


            </div>

          </div>




          <div className="login-options">

            <label>

              <input type="checkbox"/>

              Remember Me

            </label>


            <a href="#">
              Forgot Password?
            </a>


          </div>




          <button 
            type="submit"
            className="login-btn"
          >

            Login

          </button>




          <p className="signup-text">

            Don't have an account?{" "}


            <Link to="/student/signup">

              Sign Up

            </Link>


          </p>



        </form>


      </div>

    </div>

  );

}