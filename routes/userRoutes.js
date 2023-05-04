var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({ dest: 'public/images/' });

router.get('/', userController.list);
router.get('/register', userController.showRegister);
router.get('/login', userController.showLogin);
router.get('/profile', userController.profile);
router.get('/updatephoto', userController.updatePhoto);
router.get('/logout', userController.logout);

router.post('/', userController.create);
router.post('/login', userController.login);
router.post('/updatepfp', upload.single('image'), userController.updatePfp);

router.put('/:id', userController.update);

router.delete('/:id', userController.remove);

module.exports = router;
