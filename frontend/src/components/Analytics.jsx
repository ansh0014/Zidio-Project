import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Analytics = () => {
    const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const res = await API.get('/excel/analytics');
            setAnalytics(res.data.stats);
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Analytics Summary</h3>
            <div className="space-y-2">
                {analytics.map((stat, i) => (
                    <div key={i} className="p-3 bg-gray-50 border rounded shadow-sm">
                        <p><span className="font-semibold">Uploaded:</span> {new Date(stat.uploadedAt).toLocaleString()}</p>
                        <p><span className="font-semibold">Rows:</span> {stat.rows}</p>
                        <p><span className="font-semibold">Fields:</span> {stat.fields}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analytics;
