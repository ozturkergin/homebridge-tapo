import HomeKitDevice from './baseDevice.js';
import { buildBrightnessDescriptor, buildColorTemperatureDescriptor, buildHSVDescriptors, buildOnDescriptor, } from './descriptorHelpers.js';
export default class HomeKitDeviceLightBulb extends HomeKitDevice {
    kasaDevice;
    hasBrightness;
    hasColorTemp;
    hasHSV;
    pendingHSV = {};
    hsvFlushTimer = null;
    hsvFlushInProgress = false;
    hsvWaiters = [];
    constructor(platform, kasaDevice) {
        super(platform, kasaDevice, 5 /* Categories.LIGHTBULB */, 'LIGHTBULB');
        this.kasaDevice = kasaDevice;
        this.hasBrightness = !!kasaDevice.feature_info.brightness;
        this.hasColorTemp = !!kasaDevice.feature_info.color_temp;
        this.hasHSV = !!kasaDevice.feature_info.hsv;
        this.setupPrimaryService();
    }
    async initialize() {
        await this.startPolling();
    }
    getPrimaryServiceType() {
        return this.platform.Service.Lightbulb;
    }
    buildPrimaryDescriptors() {
        const C = this.platform.Characteristic;
        const hsvSyncGroup = 'hsv';
        const onDescriptor = buildOnDescriptor(C, async (value, context) => {
            await this.deviceManager.controlDevice(context.device.host, 'state', value);
        });
        const list = [onDescriptor];
        if (this.hasBrightness) {
            list.push(buildBrightnessDescriptor(C, async (value, context) => {
                await this.deviceManager.controlDevice(context.device.host, 'brightness', value);
            }));
        }
        if (this.hasColorTemp) {
            list.push(buildColorTemperatureDescriptor(C, async (value, context) => {
                await this.deviceManager.controlDevice(context.device.host, 'color_temp', value);
            }));
        }
        if (this.hasHSV) {
            list.push(...buildHSVDescriptors(C, async (partial, context) => {
                Object.assign(this.pendingHSV, partial);
                const promise = new Promise((resolve, reject) => {
                    this.hsvWaiters.push({ resolve, reject });
                });
                this.scheduleHSVFlush(context.device.host);
                await promise;
            }, hsvSyncGroup));
        }
        return list;
    }
    scheduleHSVFlush(host) {
        if (this.hsvFlushInProgress) {
            return;
        }
        if (this.hsvFlushTimer) {
            clearTimeout(this.hsvFlushTimer);
        }
        this.hsvFlushTimer = setTimeout(() => {
            void this.flushPendingHSV(host);
        }, 40);
    }
    async flushPendingHSV(host) {
        if (this.hsvFlushInProgress) {
            return;
        }
        const hasPendingHSV = this.pendingHSV.hue !== undefined || this.pendingHSV.saturation !== undefined;
        if (!hasPendingHSV) {
            return;
        }
        this.hsvFlushInProgress = true;
        this.hsvFlushTimer = null;
        const pendingHSV = { ...this.pendingHSV };
        const waiters = this.hsvWaiters;
        this.pendingHSV = {};
        this.hsvWaiters = [];
        const currentHSV = this.kasaDevice.sys_info.hsv ?? { hue: 0, saturation: 0 };
        const hue = pendingHSV.hue ?? currentHSV.hue ?? 0;
        const saturation = pendingHSV.saturation ?? currentHSV.saturation ?? 0;
        try {
            await this.deviceManager.controlDevice(host, 'hsv', { hue, saturation });
            this.kasaDevice.sys_info.hsv = { hue, saturation };
            waiters.forEach(waiter => waiter.resolve());
        }
        catch (error) {
            waiters.forEach(waiter => waiter.reject(error));
            throw error;
        }
        finally {
            this.hsvFlushInProgress = false;
            if (this.pendingHSV.hue !== undefined || this.pendingHSV.saturation !== undefined) {
                this.scheduleHSVFlush(host);
            }
        }
    }
    identify() {
        this.log.info('identify');
    }
}
//# sourceMappingURL=homekitLightBulb.js.map