import type { CharacteristicValue } from 'homebridge';
import { EventEmitter } from 'node:events';
import KasaPythonPlatform from '../platform.js';
import type { HSV, SysInfo } from './deviceTypes.js';
export declare const deviceEventEmitter: EventEmitter<any>;
type ControlValue = CharacteristicValue | HSV;
export default class DeviceManager {
    private platform;
    private log;
    private apiUrl;
    private username;
    private password;
    private additionalBroadcasts;
    private manualDeviceHosts;
    private excludeMacs;
    private includeMacs;
    private apiToken;
    constructor(platform: KasaPythonPlatform);
    refreshConfigSnapshot(): void;
    private getHeaders;
    discoverDevices(): Promise<void>;
    getSysInfo(host: string): Promise<SysInfo | undefined>;
    controlDevice(host: string, feature: string, value: ControlValue, childNum?: number): Promise<void>;
    private mapFeatureToAction;
    private performDeviceAction;
    private updateDeviceAlias;
    private handleAxiosError;
}
export {};
