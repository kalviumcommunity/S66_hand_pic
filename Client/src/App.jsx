import EditPage from "./components/EditDelete/EditPage";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostList from "./pages/Posts";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import SignUp from "./pages/SignUp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/edit/:id" element={<EditPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
