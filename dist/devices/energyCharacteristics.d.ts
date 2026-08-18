import type { Characteristic, HAP, WithUUID } from 'homebridge';
export declare function createEnergyCharacteristics(hap: HAP): EnergyCharacteristics;
export interface EnergyCharacteristics {
    Volts: WithUUID<new () => Characteristic>;
    Amperes: WithUUID<new () => Characteristic>;
    Watts: WithUUID<new () => Characteristic>;
    KiloWattHours: WithUUID<new () => Characteristic>;
}
