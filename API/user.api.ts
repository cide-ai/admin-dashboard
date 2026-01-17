import { AxiosError } from 'axios';
import api from './middleware';
import { QuerySchema } from '@/schema/common.schema';

export const getUsers = async (query: QuerySchema) => {
  try {
    const { data } = await api.get('/user/all', { params: query, withCredentials: true });
    if (data?.success) {
      return { success: true, response: data.data };
    } else {
      return { success: false, response: data?.message || 'Failed to get users' };
    }
  } catch (error: AxiosError | unknown) {
    if (error instanceof AxiosError) {
      return { success: false, response: error.response?.data?.message || 'Failed to get users' };
    }
    return { success: false, response: 'Failed to get users' };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get(`/user/me`, { withCredentials: true });
    if (data?.success) {
      return { success: true, response: data.data };
    } else {
      return { success: false, response: data?.message || 'Failed to get user' };
    }
  } catch (error: AxiosError | unknown) {
    if (error instanceof AxiosError) {
      return { success: false, response: error.response?.data?.message || 'Failed to get user' };
    }
    return { success: false, response: 'Failed to get user' };
  }
};
