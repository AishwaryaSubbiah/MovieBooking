const {logger} = require('../logging');
const {BookingSchema} = require('../models/bookingmodel');
const {db} = require('./dbconnect');
const dbdebuggger = require('debug')('app:db');

async function bookingdbconnect()
{
    try
    {
        const result = await db.command({ listCollections: 1 });
        const collectionsList = result.cursor.firstBatch;
        var collectionExist = false;
        collectionsList.forEach(collection => 
        {
            if(collection.name==="bookingdetails")
            {
                collectionExist = true;
            }
        });
        if(!collectionExist)
            await db.createCollection("bookingdetails",BookingSchema);
        dbdebuggger("Connected to ticket db");
        logger.info("Connected to bookingdetails db");
    }
    catch(e)
    {
        logger.error(e);
    }
}

module.exports.bookingdbconnect = bookingdbconnect;