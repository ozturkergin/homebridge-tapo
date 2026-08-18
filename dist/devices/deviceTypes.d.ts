import type { Characteristic, CharacteristicValue, WithUUID } from 'homebridge';
import type KasaPythonPlatform from '../platform.js';
export interface Energy {
    current: number;
    voltage: number;
    power: number;
    total: number;
    today: number;
    month: number;
}
export interface HSV {
    hue: number;
    saturation: number;
}
export interface ChildDevice {
    alias: string;
    brightness?: number;
    color_temp?: number;
    energy?: Energy;
    fan_speed_level?: number;
    hsv?: HSV;
    id: string;
    state: boolean;
    [key: string]: string | number | boolean | Energy | HSV | undefined;
}
export interface SysInfo {
    alias: string;
    brightness?: number;
    children?: ChildDevice[];
    child_num: number;
    color_temp?: number;
    device_id: string;
    device_type: string;
    energy?: Energy;
    fan_speed_level?: number;
    host: string;
    hw_ver: string;
    hsv?: HSV;
    mac: string;
    model: string;
    state?: boolean;
    sw_ver: string;
    [key: string]: string | number | boolean | ChildDevice[] | Energy | HSV | undefined;
}
export interface FeatureInfo {
    brightness?: boolean;
    color_temp?: boolean;
    energy?: boolean;
    fan?: boolean;
    hsv?: boolean;
}
export interface LightBulb {
    sys_info: SysInfo;
    feature_info: FeatureInfo;
    last_seen: Date;
    offline: boolean;
}
export interface Plug {
    sys_info: SysInfo;
    feature_info: FeatureInfo;
    last_seen: Date;
    offline: boolean;
}
export interface PowerStrip {
    sys_info: SysInfo;
    feature_info: FeatureInfo;
    last_seen: Date;
    offline: boolean;
}
export interface Switch {
    sys_info: SysInfo;
    feature_info: FeatureInfo;
    last_seen: Date;
    offline: boolean;
}
export type KasaDevice = LightBulb | Plug | PowerStrip | Switch;
export interface DeviceConfig {
    host: string;
    timeout: number;
    credentials?: {
        username: string;
        password: string;
    };
    connection_type: {
        device_family: string;
        encryption_type: string;
        https: boolean;
    };
    uses_http: boolean;
}
export interface ConfigDevice {
    host: string;
}
export declare const Plugs: string[];
export declare const PowerStrips: string[];
export declare const Switches: string[];
export declare const LightBulbs: string[];
export declare const Unsupported: string[];
export interface DescriptorContext {
    platform: KasaPythonPlatform;
    device: SysInfo;
    child?: ChildDevice;
    alias: string;
}
export interface CharacteristicDescriptor {
    type: WithUUID<new () => Characteristic>;
    name?: string;
    writable?: boolean;
    syncGroup?: string;
    debouncePolls?: number;
    syncHomeKitValueAfterSet?: boolean;
    getInitial(context: DescriptorContext): CharacteristicValue;
    getCurrent(context: DescriptorContext): CharacteristicValue;
    applySet?(value: CharacteristicValue, context: DescriptorContext): Promise<void>;
}
