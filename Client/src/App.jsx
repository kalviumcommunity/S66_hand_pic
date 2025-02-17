import "./index.css";
import AsapEntity from "./components/Home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/about" element={<AsapEntity />} />
      </Routes>
    </Router>
  );
}
