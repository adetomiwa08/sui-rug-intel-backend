import express from 'express'
import { getTopTokens, getTokenByAddress, searchTokens, getRuggedTokens } from '../controllers/dexController.js'

const router = express.Router()

router.get('/tokens', getTopTokens)
router.get('/tokens/:address', getTokenByAddress)
router.get('/search', searchTokens)
router.get('/rugged', getRuggedTokens)

export default router