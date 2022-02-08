const jwt = require('jsonwebtoken');
const config = require('config');
const {logger} = require('../logging');

module.exports = function(req,res,next)
{
    const token = req.cookies.token;
    if(!token)
    {
        logger.info("Login to use this page!");
        return res.status(401).send("Login to use this page!");
    }
    try
    {
        const decoded = jwt.verify(token,config.get('privatekey'));
        req.user = decoded;
        next();
     }
    catch(ex)
    {
        logger.error("Your session expired. Login to use this page!");
        res.clearCookie("token").status(401).send("Your session expired. Login to use this page!");
    }
}