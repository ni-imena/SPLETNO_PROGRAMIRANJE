var express = require('express');
var router = express.Router();
var runController = require('../controllers/runController.js');

/*
 * GET
 */
router.get('/', runController.list);

/*
 * GET
 */
router.get('/:id', runController.show);

/*
 * POST
 */
router.post('/', runController.create);

/*
 * PUT
 */
router.put('/:id', runController.update);

/*
 * DELETE
 */
router.delete('/:id', runController.remove);

module.exports = router;
