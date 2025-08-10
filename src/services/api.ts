import axios from 'axios'
import { Platform } from 'react-native'
import { getToken } from './storage'

const DEFAULT_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

export const api = axios.create({ baseURL: DEFAULT_BASE })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
