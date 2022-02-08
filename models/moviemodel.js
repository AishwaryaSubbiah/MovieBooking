const Joi = require("joi")
.extend(require('@joi/date'));
const MovieSchema =
{
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: [ "name", "StartDate","EndDate", "StartTime","EndTime","TotalSeats","rate","TheaterName"],
         properties: {
            name: {
               bsonType: "string",
               description: "must be a string and is required"
            },
            StartDate: {
               bsonType:"string",
               description: "must be a string and is required"
            },
            EndDate: {
               bsonType:"string",
               description: "must be a string and is required"
            },
            StartTime: {
               bsonType:"string",
               description: "must be a string and is required"
            },
            EndTime: {
               bsonType:"string",
               description: "must be a string and is required"
            },
            TotalSeats: {
               bsonType:"int",
               description: "must be a string and is required"
            },
            rate: {
                bsonType:"int",
                description: "must be a string and is required"
             },
            TheaterName: {
               bsonType:"string",
               description: "must be a string and is required"
            }  
         }
      }  
   }
};

function validatemovie(movie)
{
   const schema = Joi.object({
      name : Joi.string().required(),
      StartDate: Joi.date().format('DD/MM/YYYY').required(),
      EndDate: Joi.date().format('DD/MM/YYYY').required(),
      StartTime: Joi.string().required(),
      EndTime: Joi.string().required(),
      TotalSeats: Joi.number().min(10).required(),
      rate: Joi.number().required(),
      TheaterName: Joi.string().required()
     })
   return schema.validate(movie);
}

exports.MovieSchema = MovieSchema;
exports.validatemovie = validatemovie;