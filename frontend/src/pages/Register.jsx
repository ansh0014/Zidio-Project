import React, { useState } from 'react';
import API from '../services/api.js';
import { setToken } from '../utils/auth.js';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/users/register', form); // Update endpoint
            setToken(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            alert('Registration failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80 space-y-4">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                <input
                    type="username"
                    placeholder="username"
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    Sign Up
                </button>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
