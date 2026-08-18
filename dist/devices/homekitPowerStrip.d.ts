import HomeKitParentDevice from './baseParent.js';
import type KasaPythonPlatform from '../platform.js';
import type { CharacteristicDescriptor, ChildDevice, PowerStrip } from './deviceTypes.js';
export default class HomeKitDevicePowerStrip extends HomeKitParentDevice {
    kasaDevice: PowerStrip;
    private hasEnergy;
    constructor(platform: KasaPythonPlatform, kasaDevice: PowerStrip);
    initialize(): Promise<void>;
    protected getChildServiceType(_child: ChildDevice): typeof import("@homebridge/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js").Outlet;
    protected buildChildDescriptors(_child: ChildDevice): CharacteristicDescriptor[];
    identify(): void;
}
