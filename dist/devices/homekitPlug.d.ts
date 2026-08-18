import HomeKitDevice from './baseDevice.js';
import type KasaPythonPlatform from '../platform.js';
import type { CharacteristicDescriptor, Plug } from './deviceTypes.js';
export default class HomeKitDevicePlug extends HomeKitDevice {
    kasaDevice: Plug;
    constructor(platform: KasaPythonPlatform, kasaDevice: Plug);
    initialize(): Promise<void>;
    protected getPrimaryServiceType(): typeof import("@homebridge/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js").Outlet;
    protected buildPrimaryDescriptors(): CharacteristicDescriptor[];
    identify(): void;
}
