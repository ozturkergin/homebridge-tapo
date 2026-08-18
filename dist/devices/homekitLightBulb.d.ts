import HomeKitDevice from './baseDevice.js';
import type KasaPythonPlatform from '../platform.js';
import type { CharacteristicDescriptor, LightBulb } from './deviceTypes.js';
export default class HomeKitDeviceLightBulb extends HomeKitDevice {
    kasaDevice: LightBulb;
    private hasBrightness;
    private hasColorTemp;
    private hasHSV;
    private pendingHSV;
    private hsvFlushTimer;
    private hsvFlushInProgress;
    private hsvWaiters;
    constructor(platform: KasaPythonPlatform, kasaDevice: LightBulb);
    initialize(): Promise<void>;
    protected getPrimaryServiceType(): typeof import("@homebridge/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js").Lightbulb;
    protected buildPrimaryDescriptors(): CharacteristicDescriptor[];
    private scheduleHSVFlush;
    private flushPendingHSV;
    identify(): void;
}
