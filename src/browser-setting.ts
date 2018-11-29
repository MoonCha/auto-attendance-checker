import * as puppeteer from 'puppeteer';
import config from './config';

export function getBrowserLaunchOption(): puppeteer.LaunchOptions {
  const launchOptions: puppeteer.LaunchOptions = {};
  if (config.BROWSER_EXECUTABLE_PATH) {
    launchOptions.executablePath = config.BROWSER_EXECUTABLE_PATH;
  }
  if (config.BROWSER_NO_SANDBOX) {
    if (launchOptions.args) {
      launchOptions.args.push('--no-sandbox');
    } else {
      launchOptions.args = ['--no-sandbox'];
    }
  }
  return launchOptions;
}
