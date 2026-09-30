import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { APP_CONFIG } from '../../app/config';

export const httpClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);
