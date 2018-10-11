import config from './src/config';
import * as coinpan from './src/coinpan';

const trialFuncMap = {
    COINPAN: coinpan.loginCoinpanAndCheckAttendance,
};

const targetSiteList = config.COMMA_SPLITED_TARGET_SITE_LIST.split(',');
const targetTrialList: { siteName: string, try: () => Promise<void> }[] = [];
for (const targetSite of targetSiteList) {
    const trialFunc = trialFuncMap[targetSite];
    if (trialFunc != null) {
        targetTrialList.push({
            siteName: targetSite,
            try: trialFunc
        });
    } else {
        console.error(`Invalid target site: ${targetSite}`);
    }
}

async function loopTrialList() {
    for (const targetTrial of targetTrialList) {
        try {
            await targetTrial.try();
        } catch (err) {
            console.error(err);
        }
        console.log(`Trial(${targetTrial.siteName}) done: ${new Date()}`);
    }
    console.log(`All trial done. next trial will occur in ${config.LOGIN_TRIAL_CYCLE_MSEC / 1000} seconds`);
    setTimeout(loopTrialList, config.LOGIN_TRIAL_CYCLE_MSEC);
}

loopTrialList();
