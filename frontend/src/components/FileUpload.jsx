import React, { useState } from 'react';
import API from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        const res = await API.post('/excel/upload', formData);
        setLoading(false);
        onUploadSuccess(res.data.data);
    };

    return (
        <div className="my-4">
            <label className="block mb-2 font-semibold">Upload Excel File</label>
            <input
                type="file"
                accept=".xlsx,.xls"
                className="w-full p-2 border rounded bg-white"
                onChange={handleFile}
            />
            {loading && <p className="text-blue-500 mt-2">Processing...</p>}
        </div>
    );
};

export default FileUpload;
