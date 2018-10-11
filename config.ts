const CONFIG = {
    COINPAN_ID: '',
    COINPAN_PASSWORD: '',
    LOGIN_TRIAL_CYCLE_MSEC: 4 * 3600 * 1000,
};

function checkType(orig: any, target: string): string | number {
    const origType = typeof orig;
    switch (origType) {
        case 'string':
            return target.toString();
        case 'number':
            return Number(target);
        default:
            throw new Error(`${origType} type config is not overridable`);
    }
}

for (const configKey in CONFIG) {
    const envVarValue = process.env[configKey];
    const configValue = CONFIG[configKey];
    if (envVarValue != null) {
        try {
            CONFIG[configKey] = checkType(configValue, envVarValue);
        } catch (err) {
            console.error(err);
            console.error(`configKey(${configKey}) is not overridable`);
            process.exit(-1);
        }
    }
}

export default CONFIG;
