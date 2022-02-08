const {logger} = require('../logging');

module.exports = function(req,res,next)
{
    if(!req.user.isAdmin)
    {
        logger.error("Access Denied! Only admin can access this!");
        return res.status(403).send("Access Denied! Only admin can access this!");
    }
    next();
}