import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import PingPulseLogo from "../utils/App-Logo";
import { loginSuccess, setToken } from "../redux/user";
import toast from "react-hot-toast";
import ThreeBackground from "../Threejs/AuthBackground";
import { LoaderCircle } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    setisLoading(true)
    try {
      const serverUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${serverUrl}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      dispatch(loginSuccess(data.userinfo));
      dispatch(setToken(data.token));
      toast.success("Registered Successfully, Enter your details to Login!!");
      navigate("/");
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Registration failed");
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setisLoading(false)
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      <ThreeBackground />

      {/* Content */}

      <div className="flex flex-col items-center mb-8 select-none z-10">
        <PingPulseLogo className="w-20 h-20 text-cyan-400 drop-shadow-lg" />
        <h1 className="text-cyan-400 font-extrabold text-4xl mt-3 tracking-wide">
          Collaborative Code Editor
        </h1>
        <p className="text-cyan-300 mt-1 text-lg font-light">
          Create your developer account
        </p>
      </div>

      <div className="card w-full max-w-md shadow-2xl bg-opacity-20 backdrop-blur-lg rounded-3xl border border-white border-opacity-10 z-10">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center mb-6 drop-shadow-md text-white">
            Create Your Account
          </h2>

          <input
            type="text"
            placeholder="Username"
            className="input-field input input-bordered w-full bg-opacity-30 placeholder-white placeholder-opacity-80 text-white border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="email"
            placeholder="Email"
            className="input-field input input-bordered w-full mt-4 bg-white bg-opacity-30 placeholder-white placeholder-opacity-80 text-white border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-lg"
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
            autoComplete="new-password"
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
            {isLoading ? <LoaderCircle className="animate-spin" /> : "Register"}
          </button>

          <div className="mt-6 text-center text-cyan-300 font-light">
            <p>
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="underline hover:text-cyan-400 font-semibold cursor-pointer"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
      <style jsx={true}>{`
        @keyframes gradientBackground {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradientBackground {
          background-size: 400% 400%;
          animation: gradientBackground 15s ease infinite;
        }

        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.2);
          }
        }

        .animate-pulseSlow {
          animation: pulseSlow 8s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }

        .btn-pink {
          background-color: #ec4899;
        }
        .btn-pink:hover {
          background-color: #db2777;
        }
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
          border-color: #ec4899; /* Pink */
          background-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 8px #ec4899aa;
        }
      `}</style>
    </div>
  );
};

export default Register;
