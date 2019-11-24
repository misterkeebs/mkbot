const LEVELS = ['debug', 'warn', 'info', 'error'];

class Debug {
  static isTest() {
    return !!(process.env.npm_lifecycle_event && process.env.npm_lifecycle_event.indexOf('test') > -1);
  }

  static log(...s) {
    if (!is(Debug.DEBUG)) return;
    console.log(s);
  }

  static info(...s) {
    if (!is(Debug.INFO)) return;
    console.info(s);
  }

  static error(...s) {
    if (!is(Debug.ERROR)) return;
    console.error(s);
  }
}

Debug.DEBUG = 0;
Debug.WARN = 1;
Debug.INFO = 2;
Debug.ERROR = 3;

const key = Debug.isTest() ? 'TEST_LOG_LEVEL' : 'LOG_LEVEL';

function is(level) {
  if (!process.env.hasOwnProperty(key)) return false;
  const idx = LEVELS.indexOf(process.env[key]);
  return level >= idx;
}

module.exports = Debug;
