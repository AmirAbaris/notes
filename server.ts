import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import router from './routes/notes.route.js'
import { errorHandler, notFound } from './middlewares/error-handler.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.use('/notes', router)

app.get('/', (_, res) => {
  res.json({ message: 'API running' })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
