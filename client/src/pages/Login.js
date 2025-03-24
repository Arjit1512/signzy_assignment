import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styling/Login.css'

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    axios.defaults.withCredentials=true;
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/login`, {
                username,
                password
            });
            alert(data.Message);
            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate("/");
                return;
            }
            return(data.Message)
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
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
                <h3>Don't have an account? <span onClick={() => navigate("/register")}>Register</span></h3>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;
