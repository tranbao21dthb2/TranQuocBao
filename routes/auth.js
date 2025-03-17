var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');
const { check_authorization } = require('../Utils/check_auth');
const constants = require('../Utils/constants');
const bcrypt = require('bcrypt');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

})
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

})
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
})

router.get('/resetPassword/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res, next) {
    try {
        let userId = req.params.id;
        let user = await userController.getUserById(userId);
        if (user) {
            user.password = '123456'; // Reset password to '123456'
            await user.save();
            res.status(200).send({
                success: true,
                message: 'Password has been reset to 123456'
            });
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
});

router.post('/changePassword', check_authentication, async function(req, res, next) {
    try {
        let { password, newPassword } = req.body;
        let user = req.user;
        if (bcrypt.compareSync(password, user.password)) {
            user.password = newPassword; // Change password to newPassword
            await user.save();
            res.status(200).send({
                success: true,
                message: 'Password has been changed successfully'
            });
        } else {
            throw new Error('Current password is incorrect');
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router