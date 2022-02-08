const {logger} = require('../logging');
const {userSchema} = require('../models/usermodel');
const {db} = require('./dbconnect');
const dbdebuggger = require('debug')('app:db');

async function userdbconnect()
{
    try
    {
        const result = await db.command({ listCollections: 1 });
        const collectionsList = result.cursor.firstBatch;
        var collectionExist = false;
        collectionsList.forEach(collection => 
        {
            if(collection.name==="users")
            {
                collectionExist = true;
            }
        });
        if(!collectionExist)
            await db.createCollection("users",userSchema);
        dbdebuggger("Connected to user db");   
        logger.info("Connected to user db");
    }
    catch(e)
    {
        logger.error(e);
    }
}

module.exports.userdbconnect = userdbconnect;