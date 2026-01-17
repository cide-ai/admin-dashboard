import { LoginSchema } from '@/schema/auth.schema';
import api from './middleware';
import { AxiosError } from 'axios';

export const login = async (payload: LoginSchema) => {
  try {
    const { data } = await api.post('/auth/login', payload, {
      withCredentials: true,
    });
    if (data?.success) {
      return {
        success: true,
        response: data.data,
      };
    } else {
      return {
        success: false,
        response: data?.message || 'Login failed',
      };
    }
  } catch (error: AxiosError | unknown) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        response: error.response?.data?.message || 'An unknown error occurred',
      };
    }
    return { success: false, response: 'An unknown error occurred' };
  }
};

export const logout = async () => {
  try {
    const { data } = await api.post('/auth/logout', {}, { withCredentials: true });
    if (data?.success) {
      return {
        success: true,
        response: data.message || 'Logout successful',
      };
    }
    return {
      success: false,
      response: data?.message || 'Logout failed',
    };
  } catch (error: AxiosError | unknown) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        response: error.response?.data?.message || 'An unknown error occurred',
      };
    }
    return { success: false, response: 'An unknown error occurred' };
  }
};
