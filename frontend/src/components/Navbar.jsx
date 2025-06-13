import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth.js';

const Navbar = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!getToken();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                    Excel Analytics
                </Link>
                <div className="space-x-4">
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-gray-700 hover:text-blue-600">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
