import HomeKitParentDevice from './baseParent.js';
import { buildBrightnessDescriptor, buildFanActiveDescriptor, buildFanRotationDescriptor, buildOnDescriptor, } from './descriptorHelpers.js';
export default class HomeKitDeviceSwitchWithChildren extends HomeKitParentDevice {
    kasaDevice;
    constructor(platform, kasaDevice) {
        super(platform, kasaDevice, 8 /* Categories.SWITCH */, 'SWITCH');
        this.kasaDevice = kasaDevice;
        this.setupChildServices();
    }
    async initialize() {
        await this.startPolling();
    }
    getChildServiceType(child) {
        const { Lightbulb, Fanv2 } = this.platform.Service;
        return child.fan_speed_level !== undefined ? Fanv2 : Lightbulb;
    }
    buildChildDescriptors(child) {
        const C = this.platform.Characteristic;
        const descriptors = [];
        if (child.fan_speed_level !== undefined) {
            descriptors.push(buildFanActiveDescriptor(C, async (active, context) => {
                const idx = this.extractChildIndex(context.child ?? {});
                await this.deviceManager.controlDevice(context.device.host, 'state', active, idx);
            }), buildFanRotationDescriptor(C, async (percent, context) => {
                const idx = this.extractChildIndex(context.child ?? {});
                await this.deviceManager.controlDevice(context.device.host, 'fan_speed_level', percent, idx);
            }));
        }
        if (child.brightness !== undefined) {
            descriptors.push(buildOnDescriptor(C, async (value, context) => {
                const idx = this.extractChildIndex(context.child ?? {});
                await this.deviceManager.controlDevice(context.device.host, 'state', value, idx);
            }), buildBrightnessDescriptor(C, async (value, context) => {
                const idx = this.extractChildIndex(context.child ?? {});
                await this.deviceManager.controlDevice(context.device.host, 'brightness', value, idx);
            }));
        }
        return descriptors;
    }
    identify() {
        this.log.info('identify');
    }
}
//# sourceMappingURL=homekitSwitchWithChildren.js.map