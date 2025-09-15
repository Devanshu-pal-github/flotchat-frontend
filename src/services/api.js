import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
// All API paths are under /api on the backend
export const api = axios.create({ baseURL: `${API_BASE}/api` })

export async function getProfiles(params = {}) {
  const { data } = await api.get('/argo/profiles', { params })
  return data
}

export async function postChatQuery(message) {
  const { data } = await api.post('/chat/query', { message })
  return data
}
