var express = require('express');
var router = express.Router();
var setRunController = require('../controllers/setRunController.js');

router.get('/', setRunController.list);
router.get('/:id', setRunController.show);

router.post('/', setRunController.create);

router.put('/:id', setRunController.update);

router.delete('/:id', setRunController.remove);

module.exports = router;
