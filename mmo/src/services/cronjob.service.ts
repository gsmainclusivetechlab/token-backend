import { CronJob } from 'cron';
import { LogLevels, logService } from './log.service';
import { QueriesService } from './queries.service';

class CronJobService {
  cronJob: CronJob;

  constructor() {
    this.cronJob = new CronJob('0 0 * * * *', async () => {
      try {
        await QueriesService.deleteAllUsers();
      } catch (err: any) {
        logService.log(LogLevels.ERROR, err.message);
      }
    });
  }

  init() {
    // Start job
    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }
}

const cronJobService = new CronJobService();
export { cronJobService as CronJobService };
