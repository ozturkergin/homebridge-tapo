import HomeKitDevice from './baseDevice.js';
import { buildEnergyDescriptors, buildOnDescriptor, buildOutletInUseDescriptor, } from './descriptorHelpers.js';
export default class HomeKitDevicePlug extends HomeKitDevice {
    kasaDevice;
    constructor(platform, kasaDevice) {
        super(platform, kasaDevice, 7 /* Categories.OUTLET */, 'OUTLET');
        this.kasaDevice = kasaDevice;
        this.setupPrimaryService();
    }
    async initialize() {
        await this.startPolling();
    }
    getPrimaryServiceType() {
        return this.platform.Service.Outlet;
    }
    buildPrimaryDescriptors() {
        const C = this.platform.Characteristic;
        const energyChars = this.platform.energyCharacteristics;
        const syncGroup = 'outletState';
        const supportsEnergy = !!(this.kasaDevice.feature_info.energy || this.kasaDevice.sys_info.energy);
        const includeEnergyCharacteristics = !!(this.platform.config.energyOptions.enableEnergyMonitoring &&
            energyChars &&
            supportsEnergy);
        const onDescriptor = buildOnDescriptor(C, async (value, context) => {
            await this.deviceManager.controlDevice(context.device.host, 'state', value);
        }, supportsEnergy ? undefined : syncGroup);
        const list = [
            onDescriptor,
            buildOutletInUseDescriptor(C, supportsEnergy, syncGroup),
        ];
        if (includeEnergyCharacteristics) {
            list.push(...buildEnergyDescriptors(energyChars));
        }
        return list;
    }
    identify() {
        this.log.info('identify');
    }
}
//# sourceMappingURL=homekitPlug.js.map