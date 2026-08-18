export default function accessoryInformation(hap) {
    const { Characteristic, Service: { AccessoryInformation } } = hap;
    return (accessory, homekitDevice) => {
        const infoService = accessory.getService(AccessoryInformation) ?? accessory.addService(AccessoryInformation);
        const nameCharacteristic = infoService.getCharacteristic(Characteristic.Name);
        const manufacturerCharacteristic = infoService.getCharacteristic(Characteristic.Manufacturer);
        const modelCharacteristic = infoService.getCharacteristic(Characteristic.Model);
        const serialCharacteristic = infoService.getCharacteristic(Characteristic.SerialNumber);
        const firmwareCharacteristic = infoService.getCharacteristic(Characteristic.FirmwareRevision);
        const currentName = nameCharacteristic.value ?? '';
        const deviceName = homekitDevice.name ?? '';
        if (!currentName) {
            infoService.setCharacteristic(Characteristic.Name, deviceName);
        }
        if ((manufacturerCharacteristic.value ?? '') !== (homekitDevice.manufacturer ?? '')) {
            infoService.setCharacteristic(Characteristic.Manufacturer, homekitDevice.manufacturer);
        }
        if ((modelCharacteristic.value ?? '') !== (homekitDevice.model ?? '')) {
            infoService.setCharacteristic(Characteristic.Model, homekitDevice.model);
        }
        if ((serialCharacteristic.value ?? '') !== (homekitDevice.serialNumber ?? '')) {
            infoService.setCharacteristic(Characteristic.SerialNumber, homekitDevice.serialNumber);
        }
        if ((firmwareCharacteristic.value ?? '') !== (homekitDevice.firmwareRevision ?? '')) {
            infoService.setCharacteristic(Characteristic.FirmwareRevision, homekitDevice.firmwareRevision);
        }
        return infoService;
    };
}
//# sourceMappingURL=accessoryInformation.js.map