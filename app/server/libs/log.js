const winston = require('winston'),
      ENV     = process.env.NODE_ENV;

function getLogger(module) {
  let path = module.filename;

  // formatting log info
  if ( path.includes('\\') ) {
    path = path.split('\\').slice(-2).join('/');
  } else if (path.includes('/')) {
    path = path.split('/').slice(-2).join('/');
  }

  const {format} = winston;
  const { combine, timestamp, label, printf } = format;
  const fileFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });
  const consoleFormat = printf(({ level, message, label, timestamp }) => {
    return `[${label}] ${level}: ${message}`;
  });


  // create transports
  let transports = [
    new winston.transports.Console({
      level     : ENV == 'development' ? 'debug' : 'error',
      format    : winston.format.combine(
        label({ label: path }),
        winston.format.colorize(),
        consoleFormat
      )
    }),
    new winston.transports.File({
      filename  :'logs/debug.log',
      level     : 'debug',
      format    : winston.format.combine(
        label({ label: path }),
        timestamp(),
        fileFormat
      )
    }),
    new winston.transports.File({
      filename  :'logs/error.log',
      level     : 'error',
      format    : winston.format.combine(
        label({ label: path }),
        timestamp(),
        fileFormat
      )
    })
  ];

  return new winston.createLogger({
    // format: combine(
    //     label({ label: path }),
    //     timestamp(),
    //     fileFormat
    //   ),
    transports: transports
  });
}

module.exports = getLogger;