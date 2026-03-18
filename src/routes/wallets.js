import express from 'express'
import { getWalletInfo } from '../controllers/walletController.js'

const router = express.Router()

router.get('/:address', getWalletInfo)

export default router