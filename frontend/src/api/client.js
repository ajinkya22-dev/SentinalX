import axios from 'axios';

const host = window.location.hostname; // network IP or hostname
const apiPort = import.meta.env.VITE_API_PORT || '8000';
const protocol = window.location.protocol;
const derived = `${protocol}//${host}:${apiPort}`;
const baseURL = import.meta.env.VITE_API_BASE || derived;

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export default api;
