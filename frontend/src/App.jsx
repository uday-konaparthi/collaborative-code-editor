// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Register from "./auth/register";
import Login from "./auth/login";
import Dashboard from "./pages/Dashboard";
import JoinRoom from "./pages/JoinRoom";
import EditorRoom from "./pages/EditorRoom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Routes>
        //authentication
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />

        //main paths
        <Route path="/" element={<Dashboard />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/editor/:roomId" element={<EditorRoom />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
