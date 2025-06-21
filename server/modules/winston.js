const path = require('path')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

const logFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}] ${message}\n`;
})
const transport = new transports.DailyRotateFile({
  level: 'info',
  filename: '%DATE%_server.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  dirname: path.join('/', process.env.FOLDER, process.env.APP_NAME, 'logs')
});

const logger = createLogger({
  format: combine(
    timestamp({format: 'YY-MM-DD HH:mm:ss'}),
    logFormat,
  ),
  transports: [ transport ],
  exceptionHandlers: [ transport ]
});

// if(process.env.NODE_ENV === 'development'){
//   logger.add(
//     new transports.Console({
//       format: format.combine(
//         format.colorize(),
//       ),
//     })
//   )
// }

module.exports = logger;