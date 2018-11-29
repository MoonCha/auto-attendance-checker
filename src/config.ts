const CONFIG = {
  COMMA_SPLITED_TARGET_SITE_LIST: "COINPAN,INVEN",
  COINPAN_ID: '',
  COINPAN_PASSWORD: '',
  INVEN_ID: '',
  INVEN_PASSWORD: '',
  LOGIN_TRIAL_CYCLE_MSEC: 4 * 3600 * 1000,
  BROWSER_EXECUTABLE_PATH: '',
  BROWSER_NO_SANDBOX: false,
};

function checkType(orig: any, target: string): string | number | boolean {
  const origType = typeof orig;
  switch (origType) {
    case 'string':
      return target.toString();
    case 'number':
      return Number(target);
    case 'boolean':
      if (target === 'true') {
        return true;
      }
      if (target === 'false') {
        return false;
      }
      throw new Error(`${target} cannot be converted to boolean type`);
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
