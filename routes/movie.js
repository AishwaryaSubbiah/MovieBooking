const express = require('express');
const router = express.Router();
var moment = require('moment');
const {logger,deletelogger} = require('../logging');
var ObjectId = require('mongodb').ObjectId; 
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {validatemovie} = require('../models/moviemodel');
const {client} = require('../db/dbconnect');
const movieconnect = require('../db/moviedb');
movieconnect.moviedbconnect();
const ticketconnect = require('../db/ticketdb');
ticketconnect.ticketdbconnect();
const bookingconnect = require('../db/bookingdb');
bookingconnect.bookingdbconnect();


router.get('/',[auth,admin], async (req,res) => { 
    try
    {
      if(req.query.id === undefined)
      {
        const allmovies = await client.db("MovieTicketBooking").collection("movie").find({}).toArray();
        return res.send(allmovies);
      }               
      const result = await client.db("MovieTicketBooking").collection("movie").find({"_id":ObjectId(req.query.id)}).toArray();
      if(result.length == 0)
      {
        logger.info("Movie with the given id is not available!");
        return res.status(404).send("Movie with the given id is not available!");
      }
      const bookedresult = await client.db("MovieTicketBooking").collection("ticket").find({"movieid":ObjectId(req.query.id)}).toArray();
      if(bookedresult.length == 0)
      {
        logger.info("No one booked this movie!");
        return res.status(404).send("No one booked this movie!");
      }
      var userdetails = [];
      for(var ticket of bookedresult) 
      {
          var user = await client.db("MovieTicketBooking").collection("users").findOne({"_id": ObjectId(ticket.userid)});
          var users = {"Userid":user._id,"UserName": user.name,"UserEmail":user.email};
          var ticketcount = {"Tickets" : ticket.tickets};
          var bookeddetails = Object.assign(users,ticketcount); 
          userdetails.push(bookeddetails); 
      }
      logger.info("Getting booking details for a particular movie");
      res.send(userdetails);
    }
    catch(e)
    {
      logger.error(e);
      res.status(400).send(e);
    }
});

router.get('/user/',auth,async (req,res) => {
  try
  {

    if(req.query.date === undefined)
    {
      var users = await client.db("MovieTicketBooking").collection("users").findOne({"_id": ObjectId(req.user._id)});
      const ticketresult = await client.db("MovieTicketBooking").collection("ticket").find({"userid":ObjectId(req.user._id)}).toArray();
      if(ticketresult.length == 0)
      {
        return res.send(users);
      }
// overwrinting
      var userdetails = [];
      for(var ticket of ticketresult) 
      {
          var movie = await client.db("MovieTicketBooking").collection("movie").findOne({"_id": ObjectId(ticket.movieid)});
          var moviedetails = {"Movieid":movie._id,"MovieName": movie.name};
          var ticketcount = {"Tickets" : ticket.tickets};
          var bookeddetails = Object.assign(users,moviedetails,ticketcount); 
          userdetails.push(bookeddetails); 
      }
      logger.info("Getting booking details for logged in user");
      res.send(userdetails);
    }
    else
    {
      const result = await client.db("MovieTicketBooking").collection("movie").find({}).toArray();
      var movieondate = [];
      for(var date of result) 
      {
        var start = moment(date.StartDate,'DD/MM/YYYY');
        var end = moment(date.EndDate,'DD/MM/YYYY');
        var mdate = moment(req.query.date,'DD/MM/YYYY');

        if(moment(mdate).isBetween(start,end, null, '[]'))
        {
          movieondate.push(date);
        }
      }
      if(movieondate.length == 0)
      {
        logger.info("No movie is available on this particular date");
        return res.status(404).send("No movie is available on this particular date");
      }
      logger.info("Getting movie details for a particular date");
      res.send(movieondate);
    }  
  }
  catch(e)
  {
    logger.error(e);
    res.status(400).send(e);
  }
});

router.post('/', [auth,admin],async (req,res) => { 
    try
    {
      const {error} = validatemovie(req.body);
      if(error)
      {
        logger.error(error);
        return res.status(400).send(error);
      }
      const movie = {
        name:req.body.name,
        StartDate: req.body.StartDate,
        EndDate: req.body.EndDate,
        StartTime:req.body.StartTime,
        EndTime:req.body.EndTime,
        TotalSeats:req.body.TotalSeats,
        rate:req.body.rate,
        TheaterName: req.body.TheaterName
        }
      const isPresent = await client.db("MovieTicketBooking").collection("movie").findOne({"name": req.body.name,"TheaterName": req.body.TheaterName});
      if(isPresent)
      {
         logger.info("Movie is already inserted");
         return res.status(409).send("Movie is already inserted");
      }
      const result = await client.db("MovieTicketBooking").collection("movie").insertOne(movie);
      logger.info("Added a new movie");
      res.status(201).send(movie);
    }
    catch(e)
    {
      logger.error(e);
      res.status(400).send(e);
    }
});

router.post('/book',auth, async (req,res) => { 
  try
  {
    var result = await client.db("MovieTicketBooking").collection("movie").findOne({"name": req.body.name});
    var start = moment(result.StartDate,'DD/MM/YYYY');
    var end = moment(result.EndDate,'DD/MM/YYYY');
    var mdate = moment(req.body.date,'DD/MM/YYYY');

    if(moment(mdate).isBetween(start,end, null, '[]'))
    {
      if(result)
      {
        const booking = await client.db("MovieTicketBooking").collection("bookingdetails").findOne({"movieid": result._id, "date":req.body.date});
        var tickets = {
          userid: ObjectId(req.user._id),
          movieid: result._id,
          MovieDate: req.body.date,
          tickets: req.body.tickets,
          BookingDate: new Date()
        }
        if(booking)
        {
          if(booking.AvailableSeats >= req.body.tickets)
          {
            var book1 = {
              '$set': {
                AvailableSeats: booking.AvailableSeats - req.body.tickets
              }
            }
        
            const updated = await client.db("MovieTicketBooking").collection("bookingdetails").updateOne({"movieid": result._id, "date":req.body.date},book1);   
            const insertdoc = await client.db("MovieTicketBooking").collection("ticket").insertOne(tickets);
            logger.info(`${req.body.name} movie is booked`);
            res.send(`${req.body.name} movie is booked`);
          }
          else
          {
            logger.info(`Sorry! Only ${booking.AvailableSeats} seats available`);
            res.status(500).send(`Sorry! Only ${booking.AvailableSeats} seats available`);
          }
        }
        else
        {
          var book2 = {
             movieid: result._id, 
             date:req.body.date,
             AvailableSeats: result.TotalSeats - req.body.tickets
          }
          const insertdoc = await client.db("MovieTicketBooking").collection("ticket").insertOne(tickets);
          const insertnew = await client.db("MovieTicketBooking").collection("bookingdetails").insertOne(book2);
          logger.info(`${req.body.name} movie is booked`);
          res.send(`${req.body.name} movie is booked`);
        }
      }
      else
      {
         logger.info("Sorry! Movie is not available");
         res.status(404).send("Sorry! Movie is not available");
      }
    }
    else
    {
      logger.info("Movie is not available on this date");
      res.send("Movie not available on this date");
    }
  }
  catch(e)
  {
    logger.error(e);
    res.status(400).send(e);
  }
});


router.post('/cancel/:id',auth, async (req,res) => { 
  try
  {
    const result = await client.db("MovieTicketBooking").collection("ticket").findOne({"_id": ObjectId(req.params.id)});
    if(!result)
    {
        logger.info("Ticket Id does not exist");
        return res.status(404).send("Ticket Id does not exist");
    }
    const booked = await client.db("MovieTicketBooking").collection("bookingdetails").findOne({"movieid":result.movieid, "date": result.MovieDate});

    const cancel = {
          '$set': {
            AvailableSeats: booked.AvailableSeats + result.tickets
          }
    }
    const updated = await client.db("MovieTicketBooking").collection("bookingdetails").updateOne({"movieid":result.movieid, "date": result.MovieDate},cancel);      
    const deletebooking = await client.db("MovieTicketBooking").collection("ticket").deleteOne({"_id": ObjectId(req.params.id)});
  
    logger.info(`User with user id ${req.user._id} cancelled movie!`);    
    res.send(`You cancelled movie!`);
  }
  catch(e)
  {
    logger.error(e);
    res.status(400).send(e);
  }


});

router.put('/:id',[auth,admin], async (req,res) => { 
    try
    {
        const movie ={
          name:req.body.name,
          StartDate:req.body.StartDate,
          EndDate:req.body.EndDate,
          StartTime:req.body.StartTime,
          EndTime:req.body.EndTime,
          TotalSeats:req.body.TotalSeats,
          rate:req.body.rate,
          TheaterName: req.body.TheaterName
        }
        const result = await client.db("MovieTicketBooking").collection("movie").findOne({"_id": ObjectId(req.params.id)});
        if(!result)
        {
          logger.warn("Movie with the given ID is not available.")
          return res.status(404).send("Movie with the given ID is not available");
        }
        const update = await client.db("MovieTicketBooking").collection("movie").updateOne({"_id": ObjectId(req.params.id)}, { $set: movie }, {returnOriginal: true});
        logger.info(`${req.body.name} movie has been updated`);
        res.send(result);
    }
    catch(e)
    {
        logger.error(e);
        res.status(400).send(e);
    }
});

router.delete('/:movieid',[auth,admin], async (req,res) => { 
    try
    {
        const result = await client.db("MovieTicketBooking").collection("movie").findOne({"_id": ObjectId(req.params.movieid)});     
        if(result)
        {
          var movie = {
            "Movieid": result._id,
            "Movie name": result.name,
            "Movie date": result.date
          };
          const userbooked = await client.db("MovieTicketBooking").collection("ticket").find({"movieid": ObjectId(req.params.movieid)}).toArray();
          userbooked.forEach(async ticket => 
            {
              var user = await client.db("MovieTicketBooking").collection("users").findOne({"_id": ObjectId(ticket.userid)});
              var users = {"Userid":user._id,"UserName": user.name,"User email":user.email};
              var ticketcount = {"Tickets" : ticket.tickets};
              var delmovie = Object.assign(movie,users,ticketcount); 
              deletelogger.warn(delmovie);
            });
          const response = await client.db("MovieTicketBooking").collection("movie").deleteOne({"_id": ObjectId(req.params.movieid)});
          const deletebooking = await client.db("MovieTicketBooking").collection("bookingdetails").deleteOne({"movieid": ObjectId(req.params.movieid)});
          const delusers = await client.db("MovieTicketBooking").collection("ticket").deleteMany({"movieid": ObjectId(req.params.movieid)});
          logger.info(`${result.name} movie has been deleted`);
          res.send(`${result.name} movie deleted.`);
        }
        else
        {
           logger.warn("An attempt to delete the movie which is not present");
           res.status(404).send("Movie with the given ID is not available");
        }
      }
      catch(e)
      {
        logger.error(e);
        res.status(400).send(e);
      }    
});


module.exports = router;