import HomeKitDevice from './baseDevice.js';
import { buildBrightnessDescriptor, buildOnDescriptor, } from './descriptorHelpers.js';
export default class HomeKitDeviceSwitch extends HomeKitDevice {
    kasaDevice;
    hasBrightness;
    constructor(platform, kasaDevice) {
        super(platform, kasaDevice, 8 /* Categories.SWITCH */, 'SWITCH');
        this.kasaDevice = kasaDevice;
        this.hasBrightness = !!kasaDevice.feature_info.brightness;
        this.setupPrimaryService();
    }
    async initialize() {
        await this.startPolling();
    }
    getPrimaryServiceType() {
        const { Switch, Lightbulb } = this.platform.Service;
        return this.hasBrightness ? Lightbulb : Switch;
    }
    buildPrimaryDescriptors() {
        const C = this.platform.Characteristic;
        const list = [
            buildOnDescriptor(C, async (value, context) => {
                await this.deviceManager.controlDevice(context.device.host, 'state', value);
            }),
        ];
        if (this.hasBrightness) {
            list.push(buildBrightnessDescriptor(C, async (value, context) => {
                await this.deviceManager.controlDevice(context.device.host, 'brightness', value);
            }));
        }
        return list;
    }
    identify() {
        this.log.info('identify');
    }
}
//# sourceMappingURL=homekitSwitch.js.map