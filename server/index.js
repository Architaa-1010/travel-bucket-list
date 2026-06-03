const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const destinationRoutes = require('./routes/destinations')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:5173', 'https://travel-bucket-list.vercel.app', /\.vercel\.app$/],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/destinations', destinationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Travel Bucket List API is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})