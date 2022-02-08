const Joi = require("joi")
.extend(require('@joi/date'));

const BookingSchema =
{
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["movieid","date","AvailableSeats"],
         properties: {
            movieid: {
               bsonType: "objectId",
               description: "must be a objectid and is required"
            },
            date:
            {
                bsonType: "string",
                description: "must be a string and is required"  
            },
            AvailableSeats: {
               bsonType: "int",
               description: "must be an int and is required"
            }   
         }
      }  
   }
};

function validatebooking(movie)
{
   const schema = Joi.object({
      name : Joi.string().required(),
      Date: Joi.date().format('DD-MM-YYYY').required()
   })
   return schema.validate(movie);
}


exports.validatebooking = validatebooking;
exports.BookingSchema = BookingSchema;