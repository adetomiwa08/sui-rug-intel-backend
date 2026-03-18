import express from 'express'
import { searchQuery } from '../controllers/searchController.js'

const router = express.Router()

router.get('/', searchQuery)

export default router