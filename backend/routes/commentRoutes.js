var express = require('express');
var router = express.Router();
var commentController = require('../controllers/commentController.js');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', commentController.list);
router.get('/photo/:id', commentController.listFromPhoto);
router.get('/:id', commentController.show);

router.post('/', requiresLogin, commentController.create);

router.put('/:id', commentController.update);

router.delete('/:id', commentController.remove);

module.exports = router;
