import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service, WithUUID } from 'homebridge';
import { EventEmitter } from 'node:events';
import DeviceManager from './devices/deviceManager.js';
import { TaskQueue } from './taskQueue.js';
import type { KasaPythonConfig } from './config.js';
import type { EnergyCharacteristics } from './devices/energyCharacteristics.js';
export type KasaPythonAccessoryContext = {
    deviceId?: string;
    lastSeen?: Date;
    offline?: boolean;
};
export default class KasaPythonPlatform implements DynamicPlatformPlugin {
    readonly log: Logging;
    readonly api: API;
    readonly Characteristic: typeof Characteristic;
    readonly configuredAccessories: Map<string, PlatformAccessory<KasaPythonAccessoryContext>>;
    readonly offlineAccessories: Map<string, PlatformAccessory<KasaPythonAccessoryContext>>;
    readonly Service: typeof Service;
    readonly storagePath: string;
    config: KasaPythonConfig;
    deviceManager: DeviceManager | undefined;
    energyCharacteristics: EnergyCharacteristics | undefined;
    isShuttingDown: boolean;
    periodicDeviceDiscovering: boolean;
    periodicDeviceDiscoveryEmitter: EventEmitter;
    port: number;
    taskQueue: TaskQueue;
    venvPythonExecutable: string;
    apiToken: string;
    private readonly homekitDevicesById;
    private deviceDiscoveredHandler?;
    private discoveryInterval?;
    private hideHomeKitMatter;
    private kasaProcess;
    private platformInitialization;
    constructor(log: Logging, config: PlatformConfig, api: API);
    private setupDeviceEventEmitter;
    initializePlatform(): Promise<void>;
    private logInitializationDetails;
    private verifyEnvironment;
    private didFinishLaunching;
    private setupPeriodicDiscovery;
    private discoverDevices;
    private periodicDeviceDiscovery;
    private processDevice;
    private handleOfflineDevices;
    private handleOfflineAccessory;
    private findPlatformAccessory;
    private updateExistingDevice;
    private addNewDevice;
    private updateAccessoryStatus;
    private checkPython;
    private startKasaApi;
    private stopKasaApi;
    lsc(serviceOrCharacteristic: Service | Characteristic | {
        UUID: string;
    }, characteristic?: Characteristic | {
        UUID: string;
    }): string;
    getServiceName(service: {
        UUID: string;
    }): string | undefined;
    getCharacteristicName(characteristic: WithUUID<{
        name?: string | null;
        displayName?: string | null;
    }>): string | undefined;
    registerPlatformAccessory(accessory: PlatformAccessory<KasaPythonAccessoryContext>): void;
    configureAccessory(accessory: PlatformAccessory<KasaPythonAccessoryContext>): void;
    private foundDevice;
    private createHomeKitDevice;
}
