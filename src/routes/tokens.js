import express from 'express'
import { getTokenInfo, analyzeToken } from '../controllers/tokenController.js'

const router = express.Router()

router.get('/:address', getTokenInfo)
router.get('/:address/analyze', analyzeToken)

export default router