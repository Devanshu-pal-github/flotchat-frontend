import React, { useState } from 'react'
import { Box, Paper, Typography, TextField, IconButton, Stack, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { api } from '../../services/api.js'

function MessageBubble({ type, content }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: type === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
      <Paper elevation={1} sx={{ p: 1.5, maxWidth: '75%', bgcolor: type === 'user' ? 'primary.light' : 'background.paper' }}>
        <Typography variant="body2">{content}</Typography>
      </Paper>
    </Box>
  )
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'assistant', content: 'Ask me about ARGO data (e.g., "Show temperature profiles near Mumbai")' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { id: Date.now(), type: 'user', content: input }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
  const res = await api.post('/chat/query', { message: userMsg.content })
      setMessages((m) => [...m, { id: Date.now()+1, type: 'assistant', content: res.data.message || 'No response' }])
    } catch (e) {
      setMessages((m) => [...m, { id: Date.now()+2, type: 'assistant', content: 'Error contacting server.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>FloatChat</Typography>
      <Box sx={{ height: 320, overflowY: 'auto', border: '1px solid #eee', p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
        {messages.map((m) => <MessageBubble key={m.id} type={m.type} content={m.content} />)}
        {loading && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} /><Typography variant="caption">Thinking…</Typography></Stack>}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <TextField fullWidth placeholder="Type your question" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') send() }} />
        <IconButton color="primary" onClick={send} disabled={loading}><SendIcon /></IconButton>
      </Stack>
    </Paper>
  )
}
