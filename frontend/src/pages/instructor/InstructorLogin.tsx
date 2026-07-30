import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "@/context/AuthContext";

export default function InstructorLogin() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await login(email, password);

    console.log("Full Response:", response);
    console.log("Response Data:", response.data);

    const user = response.data.data.user;
    const token = response.data.data.token;

    console.log("User:", user);
    console.log("Role:", user.role);

    localStorage.setItem("token", token);
    authLogin(user);

    alert("Login Successful");

    navigate("/instructor/dashboard");

  } catch (error: any) {
  console.error(error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
    alert(error.response.data.error || "Login Failed");
  } else {
    alert(error.message);
  }
}
};

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
    <div className="w-[420px] bg-white rounded-3xl shadow-2xl p-8">

      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-700 to-violet-500 flex items-center justify-center text-4xl">
          🎓
        </div>
      </div>

      <h2 className="text-center text-2xl font-bold text-purple-700 mt-5">
        Welcome Back
      </h2>

      <p className="text-center text-gray-500 mb-8">
        Login to continue your teaching journey
      </p>

      <form onSubmit={handleLogin} className="space-y-5">

        <div>
          <label className="font-medium text-gray-700">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full mt-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full mt-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-between text-sm">
          <label>
            <input type="checkbox" className="mr-2" />
            Remember Me
          </label>

          <a href="#" className="text-purple-600">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-700 to-violet-500 hover:opacity-90 transition"
        >
          Login
        </button>

      </form>

      <p className="text-center mt-6 text-gray-600">
        Don't have an account?
        <span className="text-purple-600 cursor-pointer">
          {" "}Sign Up
        </span>
      </p>

    </div>
  </div>
);

}