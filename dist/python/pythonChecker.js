import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { delay, prefixLogger, runCommand } from '../utils.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPORTED_PYTHON_VERSIONS = ['3.11', '3.12', '3.13'];
class PythonChecker {
    log;
    platform;
    advancedPythonLogging;
    pythonExecutables;
    pluginDirPath;
    venvPath;
    venvConfigPath;
    requirementsPath = path.join(__dirname, '..', '..', 'requirements.txt');
    pythonExecutable = '';
    venvPipExecutable = '';
    venvPythonExecutable = '';
    constructor(platform) {
        this.platform = platform;
        this.log = prefixLogger(this.platform.log, '[Python Check]');
        this.advancedPythonLogging = this.platform.config.advancedOptions?.advancedPythonLogging ?? false;
        this.pythonExecutables = [
            'python3.13',
            'python3.12',
            'python3.11',
            'python3',
            'python',
        ];
        this.pluginDirPath = path.join(this.platform.storagePath, 'kasa-python');
        this.venvPath = path.join(this.pluginDirPath, '.venv');
        this.venvConfigPath = path.join(this.venvPath, 'pyvenv.cfg');
    }
    async allInOne() {
        this.log.debug('Starting python environment check...');
        this.ensurePluginDir();
        await this.ensurePythonVersion();
        await this.ensureVenvCreated();
        await this.ensureVenvUsesCorrectPythonHome();
        await this.ensureVenvRequirementsSatisfied();
        this.log.debug('Python environment check completed successfully');
    }
    ensurePluginDir() {
        this.log.debug('Ensuring plugin directory exists:', this.pluginDirPath);
        if (!fs.existsSync(this.pluginDirPath)) {
            fs.mkdirSync(this.pluginDirPath);
            this.log.debug('Plugin directory created:', this.pluginDirPath);
        }
        else {
            this.log.debug('Plugin directory already exists:', this.pluginDirPath);
        }
    }
    async ensurePythonVersion() {
        this.log.debug('Checking for supported Python version');
        const userPythonPath = this.platform.config.advancedOptions.pythonPath ?? '';
        if (userPythonPath) {
            this.log.debug(`User configured pythonPath: ${userPythonPath}`);
            if (!fs.existsSync(userPythonPath)) {
                this.log.error(`Configured pythonPath (${userPythonPath}) does not exist.`);
            }
            else if (fs.statSync(userPythonPath).isDirectory()) {
                this.log.error(`Configured pythonPath (${userPythonPath}) is a directory, not an executable. ` +
                    'Please provide the full path to the Python executable, i.e. /usr/bin/python3.11');
            }
            else {
                const version = await this.getPythonVersion(userPythonPath);
                if (version && SUPPORTED_PYTHON_VERSIONS.includes(version)) {
                    this.setPythonExecutables(userPythonPath, version);
                    return;
                }
                else {
                    this.log.error(`Configured pythonPath (${userPythonPath}) is not supported`);
                }
            }
        }
        for (const executable of this.pythonExecutables) {
            const resolved = await this.resolvePythonExecutable(executable);
            if (resolved) {
                const version = await this.getPythonVersion(resolved);
                if (version && SUPPORTED_PYTHON_VERSIONS.includes(version)) {
                    this.setPythonExecutables(resolved, version);
                    return;
                }
            }
        }
        this.log.error('No supported Python version found. Install Python 3.11, 3.12, or 3.13 and restart Homebridge.');
        throw new Error('No supported Python version found. Install Python 3.11, 3.12, or 3.13 and restart Homebridge.');
    }
    async getPythonVersion(executablePath) {
        try {
            const [stdout] = await runCommand(this.log, executablePath, ['--version'], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging, false, ['ENOENT']);
            const match = stdout.trim().match(/^Python (\d+\.\d+)/);
            return match ? match[1] : null;
        }
        catch {
            return null;
        }
    }
    async resolvePythonExecutable(executable) {
        const cmd = process.platform === 'win32' ? 'where' : 'which';
        try {
            const [stdout] = await runCommand(this.log, cmd, [executable], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
            const candidates = stdout.trim().split(/\r?\n/).filter(Boolean);
            for (const candidate of candidates) {
                if (fs.existsSync(candidate)) {
                    return candidate;
                }
            }
            return null;
        }
        catch {
            return null;
        }
    }
    setPythonExecutables(pythonPath, version) {
        this.pythonExecutable = pythonPath;
        const majorMinor = version;
        if (process.platform === 'win32') {
            this.venvPythonExecutable = path.join(this.venvPath, 'Scripts', 'python.exe');
            this.venvPipExecutable = path.join(this.venvPath, 'Scripts', 'pip.exe');
        }
        else {
            this.venvPythonExecutable = path.join(this.venvPath, 'bin', `python${majorMinor}`);
            this.venvPipExecutable = path.join(this.venvPath, 'bin', `pip${majorMinor}`);
        }
        this.platform.venvPythonExecutable = this.venvPythonExecutable;
        this.log.debug(`Selected Python executable: ${this.pythonExecutable}`);
    }
    async ensureVenvCreated() {
        this.log.debug('Ensuring virtual environment is created');
        if (!this.isVenvCreated()) {
            await this.createVenv();
        }
        else {
            this.log.debug('Virtual environment already exists');
        }
    }
    isVenvCreated() {
        const venvExists = fs.existsSync(this.venvPipExecutable) &&
            fs.existsSync(this.venvConfigPath) &&
            fs.existsSync(this.venvPythonExecutable);
        this.log.debug('Virtual environment exists:', venvExists);
        return venvExists;
    }
    async createVenv() {
        const maxAttempts = 3;
        const retryDelayMs = [5000, 15000];
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            this.log.debug(`Creating virtual environment (attempt ${attempt}/${maxAttempts}):`, this.venvPath);
            const [stdout] = await runCommand(this.log, this.pythonExecutable, ['-m', 'venv', this.venvPath, '--clear'], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
            if (!stdout.includes('not created successfully') && this.isVenvCreated()) {
                this.log.debug('Virtual environment created successfully');
                await this.updatePip();
                return;
            }
            if (attempt < maxAttempts) {
                const waitSec = retryDelayMs[attempt - 1] / 1000;
                this.log.warn(`Failed to create virtual environment (attempt ${attempt}/${maxAttempts}). Retrying in ${waitSec}s...`);
                await delay(retryDelayMs[attempt - 1]);
            }
        }
        throw new Error(`Failed to create virtual environment at: ${this.venvPath}`);
    }
    async ensureVenvUsesCorrectPythonHome() {
        this.log.debug('Ensuring virtual environment uses correct Python home');
        const venvPythonHome = await this.getPythonHome(this.venvPythonExecutable);
        this.log.debug('Virtual environment Python home:', venvPythonHome);
        const pythonHome = await this.getPythonHome(this.pythonExecutable);
        this.log.debug('System Python home:', pythonHome);
        if (venvPythonHome !== pythonHome) {
            this.log.debug('Python homes mismatch, recreating virtual environment');
            await this.createVenv();
        }
        else {
            this.log.debug('Python homes match');
        }
    }
    async getPythonHome(executable) {
        this.log.debug('Getting Python home for executable:', executable);
        const [basePrefix] = await runCommand(this.log, executable, [
            '-c',
            'import sys; print(getattr(sys, "base_prefix", getattr(sys, "prefix", "")))',
        ], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
        let pythonHome = basePrefix.trim();
        if (process.platform !== 'win32') {
            pythonHome = path.join(pythonHome, 'bin');
        }
        return pythonHome;
    }
    async updatePip() {
        this.log.debug('Updating pip in virtual environment');
        const [, , exitCode] = await runCommand(this.log, this.venvPipExecutable, ['install', '--upgrade', 'pip'], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
        if (exitCode !== 0) {
            throw new Error(`Failed to upgrade pip in virtual environment (exit code ${exitCode})`);
        }
        this.log.debug('Pip updated successfully');
    }
    async ensureVenvRequirementsSatisfied() {
        if (!await this.areRequirementsSatisfied()) {
            await this.installRequirements();
        }
        else {
            this.log.debug('Virtual environment requirements are satisfied');
        }
    }
    async areRequirementsSatisfied() {
        const [freezeStdout] = await runCommand(this.log, this.venvPipExecutable, ['freeze'], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
        const installed = this.stringToObject(freezeStdout);
        const required = this.stringToObject(fs.readFileSync(this.requirementsPath, 'utf8'));
        return Object.keys(required).every(pkg => installed[pkg] === required[pkg]);
    }
    stringToObject(value) {
        return value.trim().split('\n').reduce((acc, line) => {
            const [pkg, version] = line.split('==').map(x => x.trim());
            if (pkg && version) {
                acc[pkg.toLowerCase()] = version;
            }
            return acc;
        }, {});
    }
    async installRequirements() {
        this.log.debug('Installing requirements from:', this.requirementsPath);
        const [, , exitCode] = await runCommand(this.log, this.venvPipExecutable, ['install', '-r', this.requirementsPath], undefined, !this.advancedPythonLogging, !this.advancedPythonLogging);
        if (exitCode !== 0) {
            throw new Error(`Failed to install requirements from ${this.requirementsPath} (exit code ${exitCode})`);
        }
        this.log.debug('Requirements installed successfully');
    }
}
export default PythonChecker;
//# sourceMappingURL=pythonChecker.js.map