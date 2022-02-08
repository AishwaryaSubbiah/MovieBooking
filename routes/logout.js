const express = require('express');
const router = express.Router();
const {logger} = require('../logging');
const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/', (req,res) => {

    const token = req.cookies.token;
    if(!token)
    {
        logger.error("Login first to logout!");
        return res.status(401).send("Login first to logout!");
    }
    try
    {
        const decoded = jwt.verify(token,config.get('privatekey'));
        req.user = decoded;
        res.clearCookie("token");
        res.send("You have been logged out");
     }
     catch(ex)
     {
        logger.error(ex);
        res.status(400).send(ex);
     }
});

module.exports = router;