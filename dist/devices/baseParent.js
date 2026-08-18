import HomeKitDevice from './baseDevice.js';
export default class HomeKitParentDevice extends HomeKitDevice {
    childDescriptorMap = new Map();
    setupChildServices() {
        const children = this.kasaDevice.sys_info.children;
        if (!Array.isArray(children)) {
            return;
        }
        for (const child of children) {
            this.ensureChildService(child);
        }
    }
    ensureChildService(child) {
        const serviceType = this.getChildServiceType(child);
        const childIndex = this.extractChildIndex(child);
        const subType = `child-${childIndex + 1}`;
        let service = this.homebridgeAccessory.getServiceById(serviceType, subType);
        if (!service) {
            service = this.addService(serviceType, child.alias, subType);
        }
        const descriptors = this.buildChildDescriptors(child);
        this.childDescriptorMap.set(this.childKey(child), descriptors);
        for (const descriptor of descriptors) {
            const onSet = descriptor.writable
                ? (value) => this.childOnSet(service, child, descriptor, value)
                : undefined;
            this.registerCharacteristic(service, descriptor.type, () => this.childOnGet(service, child, descriptor), onSet);
            this.seedCharacteristicValue(service, descriptor, this.buildChildDescriptorContext(child), 'Child seed error');
        }
    }
    childKey(child) {
        return String(child.id ?? child.alias);
    }
    resolveLiveChild(snapshotChild) {
        const id = snapshotChild?.id;
        const children = this.kasaDevice.sys_info.children;
        if (!Array.isArray(children)) {
            return undefined;
        }
        return children.find(c => c.id === id);
    }
    updateChildField(childId, key, value) {
        const children = this.kasaDevice.sys_info.children;
        if (!Array.isArray(children)) {
            return;
        }
        const idx = children.findIndex(c => c.id === childId);
        if (idx >= 0) {
            children[idx][key] = value;
        }
    }
    buildChildDescriptorContext(child) {
        const live = this.resolveLiveChild(child) ?? child;
        return this.buildDescriptorContext(live);
    }
    async childOnGet(service, child, descriptor) {
        const context = this.buildChildDescriptorContext(child);
        try {
            let value = service.getCharacteristic(descriptor.type).value;
            if (value === undefined || value === null) {
                value = descriptor.getInitial(context);
                service.getCharacteristic(descriptor.type).updateValue(value);
            }
            return value;
        }
        catch (error) {
            this.log.error(`Child OnGet error (${child.alias}) ${descriptor.name}`, error);
            this.kasaDevice.offline = true;
            await this.stopPolling();
            return this.defaultValueForCharacteristic(descriptor.type);
        }
    }
    async childOnSet(service, child, descriptor, value) {
        if (!descriptor.applySet) {
            return;
        }
        await this.executeChildDescriptorSet(service, child, descriptor, value);
    }
    getChildService(child) {
        const serviceType = this.getChildServiceType(child);
        const childIndex = this.extractChildIndex(child);
        return this.homebridgeAccessory.getServiceById(serviceType, `child-${childIndex + 1}`);
    }
    async executeChildDescriptorSet(service, child, descriptor, value, isGrouped = false) {
        const runSet = async () => {
            if (this.shouldSkipUpdate()) {
                return;
            }
            if (!this.deviceManager) {
                throw new Error('Device manager undefined');
            }
            try {
                this.isUpdating = true;
                const context = this.buildChildDescriptorContext(child);
                await descriptor.applySet(value, context);
                const descriptors = this.childDescriptorMap.get(this.childKey(child)) ?? [];
                const descriptorsToUpdate = descriptor.syncGroup
                    ? descriptors.filter(desc => desc.syncGroup === descriptor.syncGroup)
                    : [descriptor];
                for (const desc of descriptorsToUpdate) {
                    const postSetValue = desc.getCurrent(context);
                    const char = service.getCharacteristic(desc.type);
                    if (desc.syncHomeKitValueAfterSet) {
                        this.updateValue(service, char, context.alias, postSetValue);
                    }
                    else {
                        this.log.info(`Set ${this.platform.lsc(service, char)} on ${context.alias} to ${postSetValue}`);
                    }
                }
                this.previousSnapshot = JSON.parse(JSON.stringify(this.kasaDevice));
            }
            catch (error) {
                this.log.error(`Child OnSet error (${child.alias}) ${descriptor.name}`, error);
                this.kasaDevice.offline = true;
                await this.stopPolling();
            }
            finally {
                if (!isGrouped) {
                    this.isUpdating = false;
                    this.updateEmitter.emit('updateComplete');
                }
            }
        };
        if (this.shouldBypassChildSetLock(child, descriptor)) {
            await runSet();
            return;
        }
        const lockKey = this.makeLockKey();
        await this.withLock(lockKey, runSet);
    }
    shouldBypassChildSetLock(child, descriptor) {
        if (!descriptor.syncGroup) {
            return false;
        }
        const descriptors = this.childDescriptorMap.get(this.childKey(child)) ?? [];
        const writableDescriptorsInGroup = descriptors.filter(desc => desc.syncGroup === descriptor.syncGroup && desc.writable);
        return writableDescriptorsInGroup.length > 1;
    }
    async updateAllServicesAndCharacteristics(forceUpdate) {
        const children = this.kasaDevice.sys_info.children;
        if (!Array.isArray(children)) {
            return;
        }
        for (const child of children) {
            const service = this.getChildService(child);
            if (!service) {
                continue;
            }
            const key = this.childKey(child);
            const descriptors = this.childDescriptorMap.get(key);
            if (!descriptors) {
                continue;
            }
            for (const descriptor of descriptors) {
                const context = this.buildChildDescriptorContext(child);
                try {
                    const previousChild = this.previousSnapshot?.sys_info.children?.find(c => c.id === child.id);
                    const previousContext = {
                        platform: this.platform,
                        device: this.previousSnapshot?.sys_info ?? {},
                        child: previousChild,
                        alias: child.alias,
                    };
                    if (descriptor.debouncePolls && descriptor.debouncePolls > 1) {
                        const characteristic = service.getCharacteristic(descriptor.type);
                        const hkValue = characteristic.value !== null && characteristic.value !== undefined
                            ? characteristic.value
                            : descriptor.getInitial(context);
                        const nextDeviceValue = descriptor.getCurrent(context);
                        const debounceKey = `${this.childKey(child)}:${descriptor.type.UUID}`;
                        const effectiveNext = this.resolveWithDebounce(debounceKey, hkValue, nextDeviceValue, descriptor.debouncePolls, forceUpdate);
                        this.updateIfChanged(service, characteristic, context.alias, hkValue, effectiveNext, descriptor.name, forceUpdate);
                    }
                    else {
                        const previousValue = previousChild ? descriptor.getCurrent(previousContext) : descriptor.getInitial(context);
                        const nextValue = descriptor.getCurrent(context);
                        this.updateIfChanged(service, service.getCharacteristic(descriptor.type), context.alias, previousValue, nextValue, descriptor.name, forceUpdate);
                    }
                }
                catch (error) {
                    this.log.error(`Child update diff error (${child.alias}) ${descriptor.name}`, error);
                }
            }
        }
    }
}
//# sourceMappingURL=baseParent.js.map