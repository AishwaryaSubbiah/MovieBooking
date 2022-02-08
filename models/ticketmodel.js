const TicketSchema =
{
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["userid","movieid","tickets"],
         properties: {
            userid: {
               bsonType: "objectId",
               description: "must be an objectid and is required"
            },
            movieid: {
               bsonType: "objectId",
               description: "must be an objectid and is required"
            },
            tickets: {
               bsonType: "int",
               description: "must be an int and is required"
            }   
         }
      }  
   }
};

exports.TicketSchema = TicketSchema;
