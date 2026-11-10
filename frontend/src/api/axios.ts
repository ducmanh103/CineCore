import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    // Return the response data body directly if wrapped by backend TransformInterceptor
    if (response.data && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi, vui lòng thử lại sau.';
    return Promise.reject(new Error(message));
  },
);

