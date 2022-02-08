const express = require('express');
const router = express.Router();
const {logger} = require('../logging');
const bcrypt = require('bcrypt');
const {generateAuthToken} = require('../models/usermodel');
const {client} = require('../db/dbconnect');
const errordebugger = require('debug')('app:error');
const startupdebugger = require('debug')('app:startup');

router.post('/', async (req,res) => {

    const user = await client.db("MovieTicketBooking").collection("users").findOne({"email": req.body.email});
    if(!user)
    {
       startupdebugger("Register first to login the page!");
       logger.error("Register first to login the page!");
       return res.status(401).send("Register first to login the page!");
    }
    const isvalid = await bcrypt.compare(req.body.password,user.password);
    if(!isvalid)
    {
        logger.warn("Invalid password");
        errordebugger("Invalid password");
        return res.status(401).send("Invalid password");
    }
    const token = generateAuthToken(user._id,user.isAdmin);
    logger.info(`user is logged in`);
    startupdebugger("user is logged in");
    res.cookie("token",token);
    res.send(token);
});

module.exports = router;
