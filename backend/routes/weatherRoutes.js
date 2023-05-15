var express = require('express');
var router = express.Router();
var weatherController = require('../controllers/weatherController.js');

router.get('/', weatherController.list);
router.get('/:id', weatherController.show);

router.post('/', weatherController.create);

router.put('/:id', weatherController.update);

router.delete('/:id', weatherController.remove);

module.exports = router;
