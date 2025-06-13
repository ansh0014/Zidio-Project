import React, { useState } from 'react'
import API from '../services/api.js';
import { Link, useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth.js';


function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await API.post('/users/login', form); // Update endpoint
        setToken(res.data.token);
        navigate('/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80 space-y-4">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Login
                </button>
                <p className="text-center text-sm text-gray-600">
                    Register Yourself{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </form>
        </div>
    )
}

export default Login