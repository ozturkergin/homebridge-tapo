import type { WithUUID } from 'homebridge';
import HomeKitDevice from './baseDevice.js';
import type { CharacteristicDescriptor, ChildDevice } from './deviceTypes.js';
export default abstract class HomeKitParentDevice extends HomeKitDevice {
    private childDescriptorMap;
    protected setupChildServices(): void;
    private ensureChildService;
    private childKey;
    private resolveLiveChild;
    protected updateChildField<K extends keyof ChildDevice>(childId: string, key: K, value: ChildDevice[K]): void;
    private buildChildDescriptorContext;
    private childOnGet;
    private childOnSet;
    private getChildService;
    private executeChildDescriptorSet;
    private shouldBypassChildSetLock;
    protected updateAllServicesAndCharacteristics(forceUpdate: boolean): Promise<void>;
    protected abstract getChildServiceType(child: ChildDevice): WithUUID<typeof this.platform.Service>;
    protected abstract buildChildDescriptors(child: ChildDevice): CharacteristicDescriptor[];
}
