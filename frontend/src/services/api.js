import axios from 'axios';


const API = axios.create({
    baseURL: "http://localhost:8080/api"
});


//ATTACH JWT TO HEADERS
API.interceptors.request.use((mergeConfig) => {
    const token = localStorage.getItem('token');
    if (token) mergeConfig.headers.Authorization = `Bearer ${token}`;
    return mergeConfig;
});


export default API;