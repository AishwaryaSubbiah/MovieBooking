const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const errordebugger = require('debug')('app:error');
const movies = require('./routes/movie');
const register = require('./routes/register');
const login = require('./routes/login');
const logout = require('./routes/logout');
const config = require('config');
const {logger} = require('./logging');

 
if(!config.get('privatekey'))
{
    errordebugger("Private Key is not defined");
    process.exit(1);
}

app.use(express.json());
app.use(cookieParser());
app.use('/movies',movies);
app.use('/register',register);
app.use('/login',login);
app.use('/logout',logout);


const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Listening on port ${port}...`));
