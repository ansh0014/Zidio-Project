import React, { useState } from 'react';
import FileUpload from '../components/FileUpload.jsx';
import Analytics from '../components/Analytics.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const Dashboard = () => {
    const [uploadedData, setUploadedData] = useState([]);

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Excel Analytics Dashboard</h2>
                    <FileUpload onUploadSuccess={setUploadedData} />
                    {uploadedData.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">Uploaded Data Preview</h3>
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full border">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            {Object.keys(uploadedData[0]).map((key, i) => (
                                                <th key={i} className="px-4 py-2 border">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uploadedData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-100">
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} className="px-4 py-2 border">{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-sm mt-2 text-gray-500">Showing first 5 rows.</p>
                            </div>
                        </div>
                    )}
                    <Analytics />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;