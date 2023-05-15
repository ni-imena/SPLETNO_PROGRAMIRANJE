var express = require('express');
var router = express.Router();
var runController = require('../controllers/runController.js');


router.get('/', runController.list);
router.get('/:id', runController.show);

router.post('/', runController.create);

router.put('/:id', runController.update);

router.delete('/:id', runController.remove);

module.exports = router;
