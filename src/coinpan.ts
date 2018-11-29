import * as puppeteer from 'puppeteer';
import config from './config';
import * as  browser_setting from './browser-setting';

export async function loginCoinpanAndCheckAttendance(): Promise<void> {
  const browserLaunchOption = browser_setting.getBrowserLaunchOption();
  const browser = await puppeteer.launch(browserLaunchOption);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
  await page.goto('https://www.coinpan.com');

  await page.type('input.idpw_id', config.COINPAN_ID);
  await page.type('input.idpw_pass', config.COINPAN_PASSWORD);

  page.on('dialog', async function (dialog) {
    console.log(`Dialog message: ${dialog.message()}`);
    try {
      await dialog.dismiss();
      await browser.close();
    } catch (err) {
      console.error(err);
      console.error('Failed to close browser');
    }
  });

  const loginButton = await page.waitForSelector('.loginbutton > input[type="submit"]');
  loginButton.click();
  await page.waitForNavigation({
    waitUntil: 'domcontentloaded',
  });

  await page.goto('https://coinpan.com/attendance');

  const pageContent = await page.content();
  const loginCheckKeyword = '로그인을 하지 않았습니다.';
  if (pageContent.indexOf(loginCheckKeyword) !== -1) {
    await browser.close();
    throw new Error('Failed to login');
  }
  const attendanceCheckKeyword = '출석이 완료되었습니다.';
  if (pageContent.indexOf(attendanceCheckKeyword) !== -1) {
    console.log(`attendanceCheckKeyword(${attendanceCheckKeyword}) was found on page. skip button click process`);
  } else {
    await page.click('#greetings + button');
  }

  await browser.close();
}
