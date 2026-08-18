import HomeKitDevice from './baseDevice.js';
import type KasaPythonPlatform from '../platform.js';
import type { CharacteristicDescriptor, Switch } from './deviceTypes.js';
export default class HomeKitDeviceSwitch extends HomeKitDevice {
    kasaDevice: Switch;
    private hasBrightness;
    constructor(platform: KasaPythonPlatform, kasaDevice: Switch);
    initialize(): Promise<void>;
    protected getPrimaryServiceType(): typeof import("@homebridge/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js").Lightbulb;
    protected buildPrimaryDescriptors(): CharacteristicDescriptor[];
    identify(): void;
}
