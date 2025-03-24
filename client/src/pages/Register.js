import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styling/Login.css'

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    axios.defaults.withCredentials=true;
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/register`, {
                username,
                password
            });
            alert(data.Message);
            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate("/");
            }
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Register</h2>
            <form className="login-form" onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <h3>Already have an account? <span onClick={() => navigate("/login")}>Login</span></h3>
                <button type="submit" className="login-button">Register</button>
            </form>
        </div>
    );
};

export default Register;
