import * as puppeteer from 'puppeteer';
import config from './config';

export async function loginCoinpanAndCheckAttendance(): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
    await page.goto('https://www.coinpan.com');

    await page.type('input.idpw_id', config.COINPAN_ID);
    await page.type('input.idpw_pass', config.COINPAN_PASSWORD);

    page.on('dialog', async function (dialog) {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.dismiss();
        await browser.close();
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
        const attendanceButton = await page.waitForSelector('#greetings + button');
        await attendanceButton.click();
    }

    await browser.close();
}

function isElementHandle(target: void | puppeteer.ElementHandle<Element>): target is puppeteer.ElementHandle<Element> {
    return target ? true : false;
}
