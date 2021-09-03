const express = require("express")
const userController = require('../controllers/authController')


const router = express.Router()

router.route('/signup').post(userController.signUp)
router.route('/login').post(userController.login)

module.exports = router