import * as puppeteer from 'puppeteer';
import config from './config';

export async function loginCoinpanAndCheckAttendance(): Promise<void> {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
        await page.goto('https://www.coinpan.com');
    
        await page.type('input.idpw_id', config.COINPAN_ID);
        await page.type('input.idpw_pass', config.COINPAN_PASSWORD);
    
        page.on('dialog', async function (dialog) {
            console.log(dialog.message());
            await dialog.dismiss();
            await browser.close();
        });

        await page.evaluate(() => {
            (document.querySelector('.loginbutton > input[type="submit"]') as HTMLElement).click();
        });

        await page.waitForNavigation({
            waitUntil: 'domcontentloaded',
        });

        await page.goto('https://coinpan.com/attendance');

        const pageContent = await page.content();
        const loginCheckKeyword = '로그인을 하지 않았습니다.';
        if (pageContent.indexOf(loginCheckKeyword) !== -1) {
            await browser.close();
            console.error("Failed to login");
            return;
        }
        const attendanceCheckKeyword = '출석이 완료되었습니다.';
        if (pageContent.indexOf(attendanceCheckKeyword) !== -1) {
            console.log(`attendanceCheckKeyword(${attendanceCheckKeyword}) was found on page. skip button click process`);
        } else {
            const reportAttendanceButtonSelector = '#greetings + button';
            await page.waitForSelector(reportAttendanceButtonSelector).catch(function () {
                console.log(`waitForSelector('${reportAttendanceButtonSelector}') Timeout: maybe attendance already checked`);
            });
    
            await page.evaluate(() => {
                (document.querySelector(reportAttendanceButtonSelector) as HTMLElement).click();
            });
        }
        await browser.close();
    } catch (err) {
        console.log(err);
    }
}
