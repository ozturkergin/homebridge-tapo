import type { ConfigDevice } from './devices/deviceTypes.js';
export declare class ConfigParseError extends Error {
    errors?: string[] | null | undefined;
    unknownError?: unknown | undefined;
    constructor(message: string, errors?: string[] | null | undefined, unknownError?: unknown | undefined);
    private formatMessage;
}
export interface KasaPythonConfigInput {
    name?: string;
    enableCredentials?: boolean;
    username?: string;
    password?: string;
    enableEnergyMonitoring?: boolean;
    powerThreshold?: number;
    logEnergyMonitoring?: boolean;
    hideHomeKitMatter?: boolean;
    pollingInterval?: number;
    discoveryPollingInterval?: number;
    offlineInterval?: number;
    additionalBroadcasts?: string[];
    manualDevices?: (string | ConfigDevice)[];
    excludeMacAddresses?: string[];
    includeMacAddresses?: string[];
    waitTimeUpdate?: number;
    pythonPath?: string;
    advancedPythonLogging?: boolean;
}
export type KasaPythonConfig = {
    name: string;
    enableCredentials: boolean;
    username: string;
    password: string;
    energyOptions: {
        enableEnergyMonitoring: boolean;
        powerThreshold: number;
        logEnergyMonitoring: boolean;
    };
    homekitOptions: {
        hideHomeKitMatter: boolean;
    };
    discoveryOptions: {
        pollingInterval: number;
        discoveryPollingInterval: number;
        offlineInterval: number;
        additionalBroadcasts: string[];
        manualDevices: ConfigDevice[];
        excludeMacAddresses: string[];
        includeMacAddresses: string[];
    };
    advancedOptions: {
        waitTimeUpdate: number;
        pythonPath?: string;
        advancedPythonLogging: boolean;
    };
};
export declare const defaultConfig: KasaPythonConfig;
export declare function parseConfig(config: Record<string, unknown>): KasaPythonConfig;
