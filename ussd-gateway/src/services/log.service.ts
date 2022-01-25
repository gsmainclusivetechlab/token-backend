import winston from "winston";

// https://www.npmjs.com/package/winston

enum LogLevels {
  EMERG = "emerg",
  ALERT = "alert",
  CRIT = "crit",
  ERROR = "error",
  WARNING = "warning",
  NOTICE = "notice",
  INFO = "info",
  DEBUG = "debug",
}
const customLevels = {
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  colors: {
    emerg: "red",
    alert: "red",
    crit: "red",
    error: "red",
    warning: "yellow",
    notice: "green",
    info: "blue",
    debug: "white",
  },
};
class LogService {
  // private logEntries: any;
  private localLogs: any;
  // private correlationId: string = uuid.v1();
  constructor() {
    // Local logs
    this.localLogs = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      levels: customLevels.levels,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.prettyPrint()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
    winston.addColors(customLevels.colors);
  }
  public log(
    level: LogLevels = LogLevels.INFO,
    message = "Log",
    obj = {}
  ): void {
    if (Object.keys(obj).length > 0) {
      this.localLogs.log({ level, message, obj });
    } else {
      this.localLogs.log({ level, message });
    }
  }
}
const logService = new LogService();
export { logService, LogLevels };
