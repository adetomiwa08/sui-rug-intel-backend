import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'SUI RUG INTEL API is running 🚀' })
})

// Routes
import tokenRoutes from './routes/tokens.js'
import dexRoutes from './routes/dex.js'
import walletRoutes from './routes/wallets.js'
import alertRoutes from './routes/alerts.js'
import networkRoutes from './routes/network.js'
import searchRoutes from './routes/search.js'

app.use('/api/tokens', tokenRoutes)
app.use('/api/dex', dexRoutes)
app.use('/api/wallets', walletRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/network', networkRoutes)
app.use('/api/search', searchRoutes)

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Export io for use in other files
export { io }

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
  })