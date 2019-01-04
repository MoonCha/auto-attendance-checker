import * as puppeteer from 'puppeteer';
import config from './config';
import * as browser_setting from './browser-setting';

export async function loginInvenAndCheckAttendance(): Promise <void> {
  const browserLaunchOption = browser_setting.getBrowserLaunchOption();
  const browser = await puppeteer.launch(browserLaunchOption);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
  await page.goto('https://member.inven.co.kr/user/scorpio/mlogin');

  const loginIdInput = await page.waitForSelector('input#user_id');
  await loginIdInput.type(config.INVEN_ID);
  const loginPwInput = await page.waitForSelector('input#password');
  await loginPwInput.type(config.INVEN_PASSWORD);

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

  const loginButton = await page.waitForSelector('button#loginBtn');
  loginButton.click();
  await page.waitForNavigation({
    waitUntil: 'domcontentloaded',
  });

  const navigatedPageUrl = page.url();
  const navigatedDomainWithPath = /^https?:\/\/(.*)/.exec(navigatedPageUrl)[1];

  const pageContent = await page.content();
  switch (navigatedDomainWithPath) {
    case 'member.inven.co.kr/user/scorpio/clogin':
      const loginFailureCheckKeyword = '로그인 정보가 일치하지 않습니다.';
      if (pageContent.indexOf(loginFailureCheckKeyword) !== -1) {
        await browser.close();
        console.error('Failed to login - invalid login info');
        return;
      }
      const passwordChangeOfferKeyword = '비밀번호를 변경해주시기 바랍니다.';
      if (pageContent.indexOf(passwordChangeOfferKeyword) !== -1) {
        await page.click('#btn-extend');
      }
      try {
        const modalOkButton = await page.waitForSelector('.modal-dialog #btn-ok', {
          timeout: 5000,
        });
        await modalOkButton.click();
      } catch (err) {
        console.log('Modal did not appear');
      }
      break;
    case 'hs.inven.co.kr':
      try {
        await page.waitForSelector('#hsLeftLogin .logout', {
          timeout: 5000,
        });
      } catch (err) {
        console.error(err);
        console.error('Failed to login');
        await browser.close();
        return;
      }
      console.log("Maybe already got daily bonus");
      break;
    case 'www.inven.co.kr/webzine/': {
      const loginButton = await page.waitForSelector('a.loginButton');
      const loginButtonHrefProperty = await loginButton.getProperty('href');
      const href = await loginButtonHrefProperty.jsonValue() as string;
      if (href.indexOf('logout') === -1) {
        console.error('Failed to login');
        await browser.close();
        return;
      }
      break;
    }
      
    default:
      console.log(`Unexpected navigation: ${navigatedDomainWithPath}`);
      await browser.close();
      return;
  }

  await page.goto('http://imart.inven.co.kr/attendance/');

  page.removeAllListeners('dialog');
  page.on('dialog', async function (dialog) {
    console.log(`Dialog message: ${dialog.message()}`);
    try {
      await dialog.dismiss();
    } catch (err) {
      console.error(err);
      console.error('Failed to dismiss browser');
    }
  });

  const attendButton = await page.waitForSelector('div.attendBttn > a');
  await attendButton.click();

  const votePageLinkButton = await page.waitForSelector('div.voteBttn > a');
  const buttonHrefProperty = await votePageLinkButton.getProperty('href');
  const href = await buttonHrefProperty.jsonValue() as string;
  await page.goto(href);

  const iframeList = await page.frames();
  let voteIframe: puppeteer.Frame;
  for (const iframe of iframeList) {
    const iframeUrl = iframe.url();
    if (iframeUrl.indexOf('www.inven.co.kr/common/invenvote') !== -1) {
      voteIframe = iframe;
      break;
    }
  }
  if (voteIframe != null) {
    await voteIframe.click('.voteoption input');
    await voteIframe.click('#vote_opinionWrap .vote a');
  } else {
    await browser.close();
    throw new Error('Vote page iframe not found');
  }

  await browser.close();
}
