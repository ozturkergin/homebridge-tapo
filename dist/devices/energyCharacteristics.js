const EnergyCharacteristicValues = {
    VOLTS: {
        name: 'Volts',
        uuid: 'E863F10A-079E-48FF-8F27-9C2605A29F52',
    },
    AMPERES: {
        name: 'Amperes',
        uuid: 'E863F126-079E-48FF-8F27-9C2605A29F52',
    },
    WATTS: {
        name: 'Watts',
        uuid: 'E863F10D-079E-48FF-8F27-9C2605A29F52',
    },
    KILOWATTHOURS: {
        name: 'KiloWattHours',
        uuid: 'E863F10C-079E-48FF-8F27-9C2605A29F52',
    },
};
export function createEnergyCharacteristics(hap) {
    const { Characteristic, Formats, Perms } = hap;
    const Volts = class extends Characteristic {
        static UUID = EnergyCharacteristicValues.VOLTS.uuid;
        static name = EnergyCharacteristicValues.VOLTS.name;
        constructor() {
            super(Volts.name, Volts.UUID, {
                format: "float" /* Formats.FLOAT */,
                unit: undefined,
                minValue: 0,
                maxValue: 65535,
                minStep: 0.1,
                perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */],
            });
            this.value = this.getDefaultValue();
        }
    };
    const Amperes = class extends Characteristic {
        static UUID = EnergyCharacteristicValues.AMPERES.uuid;
        static name = EnergyCharacteristicValues.AMPERES.name;
        constructor() {
            super(Amperes.name, Amperes.UUID, {
                format: "float" /* Formats.FLOAT */,
                unit: undefined,
                minValue: 0,
                maxValue: 65535,
                minStep: 0.01,
                perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */],
            });
            this.value = this.getDefaultValue();
        }
    };
    const Watts = class extends Characteristic {
        static UUID = EnergyCharacteristicValues.WATTS.uuid;
        static name = EnergyCharacteristicValues.WATTS.name;
        constructor() {
            super(Watts.name, Watts.UUID, {
                format: "float" /* Formats.FLOAT */,
                unit: undefined,
                minValue: 0,
                maxValue: 65535,
                minStep: 0.1,
                perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */],
            });
            this.value = this.getDefaultValue();
        }
    };
    const KiloWattHours = class extends Characteristic {
        static UUID = EnergyCharacteristicValues.KILOWATTHOURS.uuid;
        static name = EnergyCharacteristicValues.KILOWATTHOURS.name;
        constructor() {
            super(KiloWattHours.name, KiloWattHours.UUID, {
                format: "float" /* Formats.FLOAT */,
                unit: undefined,
                minValue: 0,
                maxValue: 65535,
                minStep: 0.001,
                perms: ["pr" /* Perms.PAIRED_READ */, "ev" /* Perms.NOTIFY */],
            });
            this.value = this.getDefaultValue();
        }
    };
    return {
        Volts: Volts,
        Amperes: Amperes,
        Watts: Watts,
        KiloWattHours: KiloWattHours,
    };
}
//# sourceMappingURL=energyCharacteristics.js.map