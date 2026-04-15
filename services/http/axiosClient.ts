import axios from 'axios';
import {getSupabaseAccessToken} from '@/server/supabase/authToken';

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(async config => {
  const token = await getSupabaseAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
