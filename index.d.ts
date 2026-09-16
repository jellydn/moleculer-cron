import type { Service, ServiceSchema, ServiceSettingSchema } from "moleculer";
import type { CronJob as NodeCronJob, CronTime as NodeCronTime } from "cron";

declare module "moleculer" {
    interface ServiceSettingSchema {
        cronJobs?: CronJobConfig[];
    }

    interface Service {
        jobs?: Map<string, CronJobWrapper>;
        startJob(name: string): void;
        stopJob(name: string): void;
        getJob(name: string): CronJobWrapper | undefined;
        getCronTime(time: string | Date): NodeCronTime;
    }
}

export interface CronJobConfig {
    name: string;
    cronTime: string | Date;
    onTick: (this: Service) => void | Promise<void>;
    onComplete?: (this: Service) => void;
    onInitialize?: (this: Service) => void;
    onStart?: (this: Service) => void;
    onStop?: (this: Service) => void;
    manualStart?: boolean;
    timeZone?: string | null;
    utcOffset?: number | null;
    unrefTimeout?: boolean | null;
}

export interface CronJobWrapper {
    name: string;
    cronJob: NodeCronJob;
    onInitialize: () => void;
    onStart: () => void;
    onStop: () => void;
    onComplete: () => void;
    onTick: () => void;
    startJob: () => void;
    stopJob: () => void;
    lastDate: () => Date | null;
    running: () => boolean;
    setTime: (cronTime: string | Date | NodeCronTime) => void;
    nextDates: (count?: number) => unknown;
    addCallback: (callback: () => void) => void;
    manualStart: boolean;
}

export interface CronMixinSchema extends Partial<ServiceSchema<ServiceSettingSchema>> {
    name: "cron";
    settings?: {
        cronJobs?: CronJobConfig[];
    };
    methods: {
        validateAndCreateJobs: () => void;
        createJob: (jobConfig: CronJobConfig) => void;
        wrapOnTick: (jobName: string, onTick: CronJobConfig["onTick"]) => () => Promise<void>;
        wrapOnComplete: (jobName: string, onComplete?: CronJobConfig["onComplete"]) => () => void;
        startJobs: () => void;
        startJob: (name: string) => void;
        stopJob: (name: string) => void;
        getJob: (name: string) => CronJobWrapper | undefined;
        getCronTime: (time: string | Date) => NodeCronTime;
    };
}

declare const CronMixin: CronMixinSchema;

export default CronMixin;
