import express from 'express'
import { getNetworkStats } from '../controllers/networkController.js'

const router = express.Router()

router.get('/stats', getNetworkStats)

export default router