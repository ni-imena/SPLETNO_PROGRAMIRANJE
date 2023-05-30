// authMiddleware.js

function verifyUser(req, res, next) {
    // Perform user authentication logic here
    // For example, you might check if the user is logged in or validate a token

    // Assuming you have a session-based authentication with a 'user' property set on successful login
    if (req.session && req.session.userId) {
        // User is authenticated, allow access to the next middleware or route
        next();
    } else {
        // User is not authenticated, send an error response
        var err = new Error();
        err.status = 401;
        err.message = "Unauthorized"
        return next(err);
        // Alternatively, you can send an error response
        // res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = {
    verifyUser: verifyUser,
};

