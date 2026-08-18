import HomeKitParentDevice from './baseParent.js';
import { buildEnergyDescriptors, buildOnDescriptor, buildOutletInUseDescriptor, } from './descriptorHelpers.js';
export default class HomeKitDevicePowerStrip extends HomeKitParentDevice {
    kasaDevice;
    hasEnergy;
    constructor(platform, kasaDevice) {
        super(platform, kasaDevice, 7 /* Categories.OUTLET */, 'OUTLET');
        this.kasaDevice = kasaDevice;
        this.hasEnergy = !!kasaDevice.feature_info.energy;
        this.setupChildServices();
    }
    async initialize() {
        await this.startPolling();
    }
    getChildServiceType(_child) {
        return this.platform.Service.Outlet;
    }
    buildChildDescriptors(_child) {
        const C = this.platform.Characteristic;
        const energyChars = this.platform.energyCharacteristics;
        const syncGroup = 'outletState';
        const supportsEnergy = !!(_child.energy || this.hasEnergy);
        const includeEnergyCharacteristics = !!(this.platform.config.energyOptions.enableEnergyMonitoring &&
            energyChars &&
            supportsEnergy);
        const list = [
            buildOnDescriptor(C, async (value, context) => {
                const idx = this.extractChildIndex(context.child ?? {});
                await this.deviceManager.controlDevice(context.device.host, 'state', value, idx);
            }, supportsEnergy ? undefined : syncGroup),
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
//# sourceMappingURL=homekitPowerStrip.js.map