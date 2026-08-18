import type { Characteristic, CharacteristicValue } from 'homebridge';
import type { CharacteristicDescriptor, DescriptorContext } from './deviceTypes.js';
import type { EnergyCharacteristics } from './energyCharacteristics.js';
export declare function buildOnDescriptor(C: typeof Characteristic, setState?: (value: CharacteristicValue, context: DescriptorContext) => Promise<void>, syncGroup?: string): CharacteristicDescriptor;
export declare function buildBrightnessDescriptor(C: typeof Characteristic, setBrightness: (value: number, context: DescriptorContext) => Promise<void>): CharacteristicDescriptor;
export declare function buildColorTemperatureDescriptor(C: typeof Characteristic, setColorTemp: (value: number, context: DescriptorContext) => Promise<void>): CharacteristicDescriptor;
export declare function buildHSVDescriptors(C: typeof Characteristic, enqueueHSV: (partial: {
    hue?: number;
    saturation?: number;
}, context: DescriptorContext) => Promise<void>, syncGroup?: string): CharacteristicDescriptor[];
export declare function buildOutletInUseDescriptor(C: typeof Characteristic, useEnergyState: boolean, syncGroup?: string): CharacteristicDescriptor;
export declare function buildEnergyDescriptors(energyCharacteristics: EnergyCharacteristics): CharacteristicDescriptor[];
export declare function buildFanActiveDescriptor(C: typeof Characteristic, setActive: (active: boolean, context: DescriptorContext) => Promise<void>): CharacteristicDescriptor;
export declare function buildFanRotationDescriptor(C: typeof Characteristic, setRotation: (fan_speed_level: number, context: DescriptorContext) => Promise<void>): CharacteristicDescriptor;
