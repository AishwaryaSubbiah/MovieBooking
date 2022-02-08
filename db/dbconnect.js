const {MongoClient} = require("mongodb");
const uri = "mongodb://localhost:27017/MovieTicketBooking";
const client = new MongoClient(uri);
const db = client.db("MovieTicketBooking");
client.connect();

module.exports.client = client;
module.exports.db = db;