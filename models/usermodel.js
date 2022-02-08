const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

const userSchema =
{
    validator: {
        $jsonSchema: {
           bsonType: "object",
           required: [ "name", "email", "password","isAdmin"],
           properties: {
              name: {
                 bsonType: "string",
                 description: "must be a string and is required"
              },
              email: {
                 bsonType: "string",
                 description: "must be a string and is required"
              },
              password: {
                 bsonType:"string",
                 description: "must be a string and is required"
              },
              isAdmin:{
                 bsonType: "bool",
                 description:"must be boolean"
              }      
           }
        }
     }
};

function generateAuthToken(id,admin)
{
    const token = jwt.sign({_id: id, isAdmin: admin}, config.get('privatekey'),{expiresIn: '1h'});
    return token;
}

function validateuser(users)
{
   const pattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#.])[A-Za-z\d$@$!%*?&.]{8,20}/;
   const schema = Joi.object({
      name : Joi.string().min(3).required(),
      email: Joi.string().required().email(),
      password: Joi.string().regex(pattern).required(),
      isAdmin: Joi.boolean().required()
   })
   return schema.validate(users);
}
module.exports.userSchema = userSchema;
module.exports.generateAuthToken = generateAuthToken;
module.exports.validateuser = validateuser;