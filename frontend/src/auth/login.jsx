import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import PingPulseLogo from "../utils/App-Logo";
import { loginSuccess, setToken } from "../redux/user";
import toast from "react-hot-toast";
import ThreeBackground from "../Threejs/AuthBackground";
import { LoaderCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    setisLoading(true)
    try {
      const serverUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess(data.userinfo));
        dispatch(setToken(data.token));
        console.log(data);
        toast.success("Logged in successfully!");
        navigate("/");
      } else{
        toast.error(data.message || "Login failed !!")
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Login failed");
      setError(err.message || "Login failed");
    } finally {
      setisLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <ThreeBackground />

      <div className="flex flex-col items-center mb-8 select-none z-10">
        <PingPulseLogo className="w-20 h-20 text-cyan-400 drop-shadow-lg" />
        <h1 className="text-cyan-400 font-extrabold text-4xl mt-3 tracking-wide">
          Collaborative Code Editor
        </h1>
        <p className="text-cyan-300 mt-1 text-lg font-light">
          Welcome Back, Developer!
        </p>
      </div>

      <div className="card w-full max-w-md shadow-2xl bg-opacity-20 backdrop-blur-lg rounded-3xl border border-white border-opacity-10 z-10">
        <form className="card-body" onSubmit={handleLogin}>
          <h2 className="text-3xl font-bold text-center mb-6 drop-shadow-md text-white">
            Login to Your Account
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="input-field input input-bordered w-full bg-opacity-30 placeholder-white placeholder-opacity-80 text-white border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field input input-bordered w-full mt-4 bg-white bg-opacity-30 placeholder-white placeholder-opacity-80 text-white border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-400 mt-3 font-semibold text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn mt-8 w-full text-white font-bold bg-cyan-500 hover:bg-cyan-600 transition rounded-lg shadow-lg"
          >
            {isLoading ? <LoaderCircle className="animate-spin" /> : "Login"}
          </button>

          <div className="mt-6 text-center text-cyan-300 font-light">
            <p>
              Don't have an account?{" "}
              <Link
                to={"/register"}
                className="underline hover:text-cyan-400 font-semibold cursor-pointer"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style jsx={true}>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 0.75rem;
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1rem;
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .input-field:focus {
          outline: none;
          border-color: #ec4899;
          background-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 8px #ec4899aa;
        }
      `}</style>
    </div>
  );
};

export default Login;
