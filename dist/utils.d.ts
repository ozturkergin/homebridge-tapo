import type { Characteristic, Logger, Logging } from 'homebridge';
import { ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio } from 'node:child_process';
export declare function deferAndCombine<T, U>(fn: ((requestCount: number) => Promise<T>) | (() => Promise<T>), timeout: number, runNowFn?: (arg: U) => void): (arg?: U) => Promise<T>;
export declare function delay(ms: number): Promise<void>;
export declare function isObjectLike(candidate: unknown): candidate is Record<string, unknown>;
export declare function loadPackageConfig(logger: Logging): Promise<{
    name: string;
    version: string;
    engines: {
        node: string;
    };
}>;
export declare function lookup<T>(object: unknown, compareFn: undefined | ((objectProp: unknown, search: T) => boolean), value: T): string | undefined;
export declare function lookupCharacteristicNameByUUID(characteristic: typeof Characteristic, uuid: string): string | undefined;
export declare function prefixLogger(logger: Logger, prefix: string | (() => string)): Logging;
export declare function runCommand(logger: Logger, command: string, args?: readonly string[], options?: SpawnOptionsWithoutStdio, hideStdout?: boolean, hideStderr?: boolean, returnProcess?: boolean, suppressErrors?: string[]): Promise<[string, string, number | null, (ChildProcessWithoutNullStreams | null)?]>;
export declare function satisfiesVersion(currentVersion: string, requiredVersion: string): boolean;
export declare function waitForServer(url: string, log: Logging, timeout?: number, interval?: number, processToCheck?: ChildProcessWithoutNullStreams | null, apiToken?: string): Promise<void>;
export declare function getAvailablePort(): Promise<number>;
