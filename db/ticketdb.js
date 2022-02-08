const {logger} = require('../logging');
const {TicketSchema} = require('../models/ticketmodel');
const {db} = require('./dbconnect');
const dbdebuggger = require('debug')('app:db');

async function ticketdbconnect()
{
    try
    {
        const result = await db.command({ listCollections: 1 });
        const collectionsList = result.cursor.firstBatch;
        var collectionExist = false;
        collectionsList.forEach(collection => 
        {
            if(collection.name==="ticket")
            {
                collectionExist = true;
            }
        });
        if(!collectionExist)
            await db.createCollection("ticket",TicketSchema);
        dbdebuggger("Connected to ticket db");
        logger.info("Connected to ticket db");
    }
    catch(e)
    {
        logger.error(e);
    }
}

module.exports.ticketdbconnect = ticketdbconnect;