import HomeKitParentDevice from './baseParent.js';
import type KasaPythonPlatform from '../platform.js';
import type { CharacteristicDescriptor, ChildDevice, Switch } from './deviceTypes.js';
export default class HomeKitDeviceSwitchWithChildren extends HomeKitParentDevice {
    kasaDevice: Switch;
    constructor(platform: KasaPythonPlatform, kasaDevice: Switch);
    initialize(): Promise<void>;
    protected getChildServiceType(child: ChildDevice): typeof import("@homebridge/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js").Lightbulb;
    protected buildChildDescriptors(child: ChildDevice): CharacteristicDescriptor[];
    identify(): void;
}
