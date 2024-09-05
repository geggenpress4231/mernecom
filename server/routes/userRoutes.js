const userController = require('../controllers/userController')


const router= require('express').Router()

router.post('/register',userController.register);
router.get('/refresh_token',userController.refreshtoken)

module.exports = router