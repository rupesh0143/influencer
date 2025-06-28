import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export const logIn = (formData) => API.post('/login', formData); 

export const signUp = (formData) => API.post('/auth/register', formData);