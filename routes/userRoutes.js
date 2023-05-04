var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({ dest: 'public/images/' });
const verifyJWT = require('../verifyJWT.js');
const cookieParser = require('cookie-parser');

router.get('/', userController.list);
router.get('/register', userController.showRegister);
router.get('/login', userController.showLogin);
router.get('/profile', verifyJWT, userController.profile);
router.get('/updatephoto', verifyJWT, userController.updatePhoto);
router.get('/logout', userController.logout);

router.post('/', userController.create);
router.post('/login', userController.login);
router.post('/updatepfp', upload.single('image'), userController.updatePfp);

router.put('/:id', userController.update);

router.delete('/:id', userController.remove);

module.exports = router;
