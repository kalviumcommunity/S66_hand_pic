import { useState } from "react";
import Navbar from "../components/Navbar";
import PasswordInput from "../components/PasswordInput";
import { validateEmail } from "../utils/helper";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name) return setError("Enter name");
        if (!validateEmail(email)) return setError("Enter valid email");
        if (!password) return setError("Enter password");
        if (!age || isNaN(age) || age < 1) return setError("Enter valid age");

        try {
            const response = await axios.post("https://s66-hand-pic.onrender.com/signup", {
                username: name,
                email,
                password,
                age: parseInt(age)
            });

            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            setError(error.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <>
            <Navbar />

            <div className="flex items-center justify-center mt-28">
                <div className="w-96 border rounded bg-white px-7 py-10">
                    <form onSubmit={handleSignup}>
                        <h4 className="text-2xl mb-7">SignUp</h4>

                        <input
                            type="text"
                            placeholder="Name"
                            className="input-box"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Email"
                            className="input-box"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Age"
                            className="input-box"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />

                        {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

                        <button type="submit" className="btn-primary">Create an Account</button>

                        <p className="text-sm text-center mt-4">
                            Already having an Account{" "}
                            <Link to="/login" className="font-medium text-blue-400 underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignUp;
