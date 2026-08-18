import type { HAP, PlatformAccessory, Service } from 'homebridge';
import type HomeKitDevice from './baseDevice.js';
export default function accessoryInformation(hap: HAP): (accessory: PlatformAccessory, homekitDevice: HomeKitDevice) => Service | undefined;
