import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在这里可以添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('未授权，请登录');
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求地址不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(data.message || '请求失败');
      }
    } else {
      message.error('网络错误，请检查您的网络连接');
    }
    return Promise.reject(error);
  }
);

export default request; 