const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('config');

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
       info => `{ level : ${info.level}, timestamp: ${info.timestamp}, message: ${info.message}`)
    );
 
const transport =  new winston.transports.DailyRotateFile({
    filename: config.get("logConfig.logFolder") + config.get("logConfig.logFile"),
    datePattern: 'DD-MM-YYYY',
    maxSize: '20m',
    maxFiles: '14d'
    });
    
const deletelog = winston.add(new winston.transports.File({
   filename: config.get("deleteConfig.deleteFolder")+config.get("deleteConfig.deleteFile")}));

const logger = winston.createLogger({
    format: logFormat,
    transports: [ transport ]});

const deletelogger = winston.createLogger({
    format: logFormat,
    transports: [ deletelog ]
}); 
module.exports.logger = logger;
module.exports.deletelogger = deletelogger;