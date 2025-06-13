import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-100 text-gray-600 text-sm mt-8">
            <div className="container mx-auto p-4 text-center border-t">
                <p>
                    &copy; {new Date().getFullYear()} Excel Analytics Platform. 
                </p>
            </div>
        </footer>
    );
};

export default Footer;
