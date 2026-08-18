import axios from 'axios';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export function deferAndCombine(fn, timeout, runNowFn) {
    let requests = [];
    let timer = null;
    const processRequests = () => {
        const currentRequests = requests;
        requests = [];
        let result;
        if (fn.length === 0) {
            result = fn();
        }
        else {
            result = fn(currentRequests.length);
        }
        result
            .then(value => currentRequests.forEach(req => req.resolve(value)))
            .catch(error => currentRequests.forEach(req => req.reject(error)))
            .finally(() => {
            timer = null;
        });
    };
    return (arg) => {
        if (runNowFn && arg !== undefined) {
            runNowFn(arg);
        }
        return new Promise((resolve, reject) => {
            requests.push({ resolve, reject });
            if (!timer) {
                timer = setTimeout(processRequests, timeout);
            }
        });
    };
}
export function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export function isObjectLike(candidate) {
    return typeof candidate === 'object' && candidate !== null || typeof candidate === 'function';
}
export async function loadPackageConfig(logger) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageConfigPath = path.join(__dirname, '..', 'package.json');
    const log = prefixLogger(logger, '[Package Config]');
    log.debug('Loading package configuration from:', packageConfigPath);
    try {
        const packageConfigData = await fs.readFile(packageConfigPath, 'utf8');
        return JSON.parse(packageConfigData);
    }
    catch (error) {
        log.error(`Error reading package.json: ${error}`);
        throw error;
    }
}
export function lookup(object, compareFn, value) {
    const compare = compareFn ?? ((objectProp, search) => objectProp === search);
    if (isObjectLike(object)) {
        return Object.keys(object).find(key => compare(object[key], value));
    }
    return undefined;
}
export function lookupCharacteristicNameByUUID(characteristic, uuid) {
    return Object.keys(characteristic).find(key => (characteristic[key].UUID === uuid));
}
export function prefixLogger(logger, prefix) {
    const methods = ['info', 'warn', 'error', 'debug', 'log'];
    const clonedLogger = methods.reduce((acc, method) => {
        acc[method] = (...args) => {
            const prefixString = typeof prefix === 'function' ? prefix() : prefix;
            if (method === 'log') {
                const [level, message, ...parameters] = args;
                logger[method](level, `${prefixString} ${message}`, ...parameters);
            }
            else {
                const [message, ...parameters] = args;
                logger[method](`${prefixString} ${message}`, ...parameters);
            }
        };
        return acc;
    }, {});
    clonedLogger.prefix = typeof logger.prefix === 'string' ? `${prefix} ${logger.prefix}` : prefix;
    return clonedLogger;
}
export async function runCommand(logger, command, args = [], options, hideStdout = false, hideStderr = false, returnProcess = false, suppressErrors = []) {
    const MAX_BUFFER_SIZE = 1024 * 1024;
    let stdout = '';
    let stderr = '';
    let outputFile = null;
    const filteredArgs = args.filter(arg => {
        if (arg.startsWith('>')) {
            outputFile = arg.substring(1).trim();
            return false;
        }
        return true;
    });
    logger.debug(`Running command: ${command} ${filteredArgs.join(' ')}`);
    const env = {
        ...process.env,
        ...(options?.env || {}),
    };
    const p = spawn(command, filteredArgs, {
        ...options,
        env,
    });
    logger.debug(`Command PID: ${p.pid}`);
    p.stdout.setEncoding('utf8').on('data', data => {
        stdout += data;
        if (stdout.length > MAX_BUFFER_SIZE) {
            stdout = stdout.slice(-MAX_BUFFER_SIZE);
        }
        if (!hideStdout) {
            logger.debug(`STDOUT: ${data.trim()}`);
        }
    });
    p.stderr.setEncoding('utf8').on('data', data => {
        stderr += data;
        if (stderr.length > MAX_BUFFER_SIZE) {
            stderr = stderr.slice(-MAX_BUFFER_SIZE);
        }
        if (!hideStderr) {
            logger.error(`STDERR: ${data.trim()}`);
        }
    });
    if (returnProcess) {
        logger.debug('Command started and returning process.');
        const stderrReady = new Promise((resolve) => {
            p.stderr.once('data', () => {
                logger.debug('Process data received.');
                resolve();
            });
        });
        await stderrReady;
        return [stdout, stderr, null, p];
    }
    const exitCode = await new Promise((resolve, reject) => {
        p.on('close', (code) => {
            logger.debug(`Command closed with exit code: ${code}`);
            resolve(code);
        }).on('error', (error) => {
            const errorMessage = error.message.toLowerCase();
            const shouldSuppress = suppressErrors.some(err => (error.code && error.code.toString().toLowerCase() === err.toLowerCase()) ||
                errorMessage.includes(err.toLowerCase()));
            if (!shouldSuppress) {
                logger.error('Command encountered an error:', error);
            }
            reject(error);
        });
    });
    p.stdout.destroy();
    p.stderr.destroy();
    p.kill();
    if (outputFile) {
        logger.debug(`Writing command output to file: ${outputFile}`);
        await fs.writeFile(outputFile, stdout);
    }
    logger.debug('Command finished.');
    return [stdout, stderr, exitCode];
}
export function satisfiesVersion(currentVersion, requiredVersion) {
    const parseVersionParts = (version) => {
        const [major = '0', minor = '0', patch = '0'] = version.replace('^', '').replace('v', '').split('.');
        return [Number(major) || 0, Number(minor) || 0, Number(patch) || 0];
    };
    const versions = requiredVersion.split('||').map(v => v.trim());
    const [currentMajor, currentMinor, currentPatch] = parseVersionParts(currentVersion);
    return versions.some(version => {
        const [requiredMajor, requiredMinor, requiredPatch] = parseVersionParts(version);
        if (currentMajor > requiredMajor) {
            return true;
        }
        if (currentMajor < requiredMajor) {
            return false;
        }
        if (currentMinor > requiredMinor) {
            return true;
        }
        if (currentMinor < requiredMinor) {
            return false;
        }
        return currentPatch >= requiredPatch;
    });
}
export async function waitForServer(url, log, timeout = 30000, interval = 1000, processToCheck, apiToken) {
    const startTime = Date.now();
    log.debug(`Waiting for server at ${url} with timeout ${timeout}ms and interval ${interval}ms`);
    while (Date.now() - startTime < timeout) {
        if (processToCheck && processToCheck.killed) {
            log.error('Server process was killed before responding.');
            throw new Error('Server process was killed before responding.');
        }
        if (processToCheck && processToCheck.exitCode !== null) {
            log.error(`Server process exited prematurely with code ${processToCheck.exitCode}.`);
            throw new Error(`Server process exited prematurely with code ${processToCheck.exitCode}.`);
        }
        try {
            const headers = apiToken ? { 'X-API-Key': apiToken } : undefined;
            const response = await axios.get(url, { headers });
            if (response.status === 200) {
                log.debug('Server responded successfully');
                return;
            }
        }
        catch {
            log.debug('Server not responding yet, retrying...');
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    log.error(`Server did not respond within ${timeout / 1000} seconds`);
    throw new Error(`Server did not respond within ${timeout / 1000} seconds`);
}
export async function getAvailablePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', reject);
    });
}
//# sourceMappingURL=utils.js.map