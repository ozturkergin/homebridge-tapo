import HomeKitDevice from './baseDevice.js';
import type KasaPythonPlatform from '../platform.js';
import type { KasaDevice } from './deviceTypes.js';
export default function createDevice(platform: KasaPythonPlatform, kasaDevice: KasaDevice): Promise<HomeKitDevice | undefined>;
