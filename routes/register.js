const express = require('express');
const router = express.Router();
const {logger} = require('../logging');
const bcrypt = require('bcrypt');
const {validateuser} = require('../models/usermodel');
const {generateAuthToken} = require('../models/usermodel');
const {client} = require('../db/dbconnect');
const userconnect = require('../db/userdb');
userconnect.userdbconnect();

router.post('/', async (req,res) => {
    try
    {
        res.clearCookie("token");
        
        const {error} = validateuser(req.body);
        if(error)
        {
            logger.error(error);
            return res.status(400).send(error);
        }
        const user = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        }
        const isuser = await client.db("MovieTicketBooking").collection("users").findOne({email: req.body.email});
        if(isuser)
        { 
            logger.warn("Registered user tried to register again");
            return res.status(409).send("User already registered");
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        const result = await client.db("MovieTicketBooking").collection("users").insertOne(user);
        const token = generateAuthToken();
        logger.info("New user registered");
        res.header('x-auth-token',token).send(result);

    }
    catch(e)
    {
        logger.error(e);
        res.status(400).send(e);
    }

});


module.exports = router;

