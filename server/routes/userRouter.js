const userController = require('../controllers/userController')
const auth = require('../middleware/auth')


const router= require('express').Router()

router.post('/register',userController.register);
router.get('/refresh_token',userController.refreshtoken)
router.post('/login',userController.login)
router.get('/logout',userController.logout)
router.get('/infor',auth,userController.getUser)

module.exports = router