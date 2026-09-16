const { CronJob, CronTime } = require("cron");

module.exports = {
  name: "cron",

  settings: {
    cronJobs: []
  },

  created() {
    this.jobs = new Map();
    this.validateAndCreateJobs();
  },

  async started() {
    // Services created after broker.start() never see `$broker.started` again.
    if (this.broker.started) {
      this.startJobs();
    }
  },

  async stopped() {
    for (const job of this.jobs.values()) {
      job.stopJob();
    }
  },

  events: {
    "$broker.started": async function () {
      this.startJobs();
    }
  },

  methods: {
    validateAndCreateJobs() {
      if (!Array.isArray(this.settings.cronJobs)) {
        this.logger.warn("No cron jobs defined or invalid configuration");
        return;
      }

      const jobNames = new Set();

      for (const jobConfig of this.settings.cronJobs) {
        try {
          if (jobNames.has(jobConfig.name)) {
            throw new Error(`Duplicate cron job name: ${jobConfig.name}`);
          }

          jobNames.add(jobConfig.name);
          this.createJob(jobConfig);
        } catch (error) {
          const jobName = jobConfig?.name || "<unnamed>";
          this.logger.error(`Error creating cron job ${jobName}: ${error.message}`);
        }
      }
    },

    createJob(jobConfig) {
      if (!jobConfig?.name || !jobConfig.cronTime || typeof jobConfig.onTick !== "function") {
        throw new Error("Invalid job configuration. Required: name, cronTime, onTick");
      }

      const onInitialize = typeof jobConfig.onInitialize === "function" ? jobConfig.onInitialize : () => {};
      const onStart = typeof jobConfig.onStart === "function" ? jobConfig.onStart : () => {};
      const onStop = typeof jobConfig.onStop === "function" ? jobConfig.onStop : () => {};
      const onComplete = typeof jobConfig.onComplete === "function" ? jobConfig.onComplete : () => {};

      try {
        const job = new CronJob(
          jobConfig.cronTime,
          this.wrapOnTick(jobConfig.name, jobConfig.onTick),
          this.wrapOnComplete(jobConfig.name, onComplete),
          false,
          jobConfig.timeZone,
          this,
          false,
          jobConfig.utcOffset,
          jobConfig.unrefTimeout
        );

        const binderOnInitialize = onInitialize.bind(this);
        const binderOnStart = onStart.bind(this);
        const binderOnStop = onStop.bind(this);
        const binderOnComplete = onComplete.bind(this);
        const binderOnTick = jobConfig.onTick.bind(this);
    
        const jobWrapper = {
          name: jobConfig.name,
          cronJob: job,
          onInitialize: function() {
            if (jobConfig.onInitialize) binderOnInitialize();
          },
          onStart: function() {
            if (jobConfig.onStart) binderOnStart();
          },
          onStop: function() {
            if (jobConfig.onStop) binderOnStop();
          },
          onComplete: function() {
            if (jobConfig.onComplete) binderOnComplete();
          },
          onTick: function() {
            if (jobConfig.onTick) binderOnTick();
          },
          startJob: function() {
            this.cronJob.start();
            jobWrapper.onStart();
          },
          stopJob: function() {
            this.cronJob.stop();
            jobWrapper.onStop();
          },
          lastDate: function() {
            return this.cronJob.lastDate();
          },
          running: function() {
            return this.cronJob.running;
          },
          setTime: function(cronTime) {
            const time = cronTime instanceof CronTime ? cronTime : new CronTime(cronTime);
            return this.cronJob.setTime(time);
          },
          nextDates: function(count) {
            return this.cronJob.nextDates(count);
          },
          addCallback: function(callback) {
            return this.cronJob.addCallback(callback);
          },
          manualStart: jobConfig.manualStart || false
        };
    
        this.jobs.set(jobConfig.name, jobWrapper);
        this.logger.info(`Cron job created: ${jobConfig.name}`);
    
        jobWrapper.onInitialize();
        
      } catch (error) {
        this.jobs.delete(jobConfig.name);
        throw new Error(`Failed to create job ${jobConfig.name}: ${error.message}`);
      }
    },

    wrapOnTick(jobName, onTick) {
      return async () => {
        try {
          this.logger.debug(`Running cron job: ${jobName}`);
          await onTick.call(this);
        } catch (error) {
          this.logger.error(`Error in cron job ${jobName}: ${error.message}`);
        }
      };
    },

    wrapOnComplete(jobName, onComplete) {
      return () => {
        try {
          this.logger.debug(`Completed cron job: ${jobName}`);
          if (typeof onComplete === 'function') {
            onComplete.call(this);
          }
        } catch (error) {
          this.logger.error(`Error in onComplete for job ${jobName}: ${error.message}`);
        }
      };
    },

    startJobs() {
      for (const [name, job] of this.jobs) {
        if (!job.manualStart) {
          this.startJob(name);
        }
      }
    },
    
    startJob(name) {
      const job = this.jobs.get(name);
      if (job && !job.running()) {
        job.startJob();
        this.logger.info(`Started cron job: ${name}`);
      } else if (!job) {
        this.logger.warn(`Attempted to start non-existent job: ${name}`);
      }
    },
    
    stopJob(name) {
      const job = this.jobs.get(name);
      if (job && job.running()) {
        job.stopJob();
        this.logger.info(`Stopped cron job: ${name}`);
      } else if (!job) {
        this.logger.warn(`Attempted to stop non-existent job: ${name}`);
      }
    },
    
    getJob(name) {
      return this.jobs.get(name);
    },

    getCronTime(time) {
      return new CronTime(time);
    },

  }
};