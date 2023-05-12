var express = require('express');
var router = express.Router();
var cloudinessController = require('../controllers/cloudinessController.js');

/*
 * GET
 */
router.get('/', cloudinessController.list);

/*
 * GET
 */
router.get('/:id', cloudinessController.show);

/*
 * POST
 */
router.post('/', cloudinessController.create);

/*
 * PUT
 */
router.put('/:id', cloudinessController.update);

/*
 * DELETE
 */
router.delete('/:id', cloudinessController.remove);

module.exports = router;
