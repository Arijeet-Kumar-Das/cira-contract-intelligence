import axios from 'axios';

// Centralized Axios instance pointing to the FastAPI backend
const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Upload a file for analysis
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// Analyze raw text
export const analyzeText = (text) => {
  return API.post('/analyze', { text });
};

// Fetch all contracts
export const getContracts = () => {
  return API.get('/contracts');
};

// Fetch a single contract by ID
export const getContractById = (id) => {
  return API.get(`/contracts/${id}`);
};

export default API;
