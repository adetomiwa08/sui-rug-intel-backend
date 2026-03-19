import express from 'express'
import { getTopTokens, getTokenByAddress, searchTokens } from '../controllers/dexController.js'

const router = express.Router()

router.get('/tokens', getTopTokens)
router.get('/tokens/:address', getTokenByAddress)
router.get('/search', searchTokens)

export default router