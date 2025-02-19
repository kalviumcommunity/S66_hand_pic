import "./index.css";
import AsapEntity from "./components/Home";
import PostList from "./components/Posts";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/about" element={<AsapEntity />} />
        <Route path="/posts" element={<PostList />} />
      </Routes>
    </Router>
  );
}
