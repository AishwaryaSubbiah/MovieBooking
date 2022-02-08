const {logger} = require('../logging');
const {MovieSchema} = require('../models/moviemodel');
const {db} = require('./dbconnect');
const dbdebuggger = require('debug')('app:db');
async function moviedbconnect()
{
  try
  {
    const result = await db.command({ listCollections: 1 });
    const collectionsList = result.cursor.firstBatch;
    var collectionExist = false;
    collectionsList.forEach(collection => 
    {
        if(collection.name==="movie")
        {
            collectionExist = true;
        }
    });
    if(!collectionExist)
       await db.createCollection("movie",MovieSchema);
    dbdebuggger("Connected to movie db");
    logger.info("Connected to movie db");   
  }
  catch(e)
  {
    logger.error(e);
  }
}

module.exports.moviedbconnect = moviedbconnect;