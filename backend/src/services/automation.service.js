import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const IS_PROD = process.env.NODE_ENV === 'production';

async function getBrowser() {
  if (IS_PROD) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  // Local dev: use the Chrome/Chromium already installed on the machine.
  const localChromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  const { existsSync } = await import('fs');
  const executablePath = localChromePaths.find(existsSync);
  if (!executablePath) throw new Error('No local Chrome found. Set NODE_ENV=production or install Chrome.');

  return puppeteer.launch({
    executablePath,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });
}

/**
 * Runs the full PhilHealth Konsulta auto-registration flow and returns
 * the scraped success/error banner text.
 *
 * @param {{ pin: string, type: 'MM' | 'DD' }} input
 * @returns {Promise<{ status: 'success' | 'error', message: string, userId: string | null }>}
 */
export async function runRegistration({ pin, type }) {
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    page.on('dialog', async (dialog) => {
      try {
        await dialog.accept();
      } catch {
        /* dialog already handled */
      }
    });

    const initialUrl = `https://cec.philhealth.gov.ph/konsulta/assignment.php?pin=${pin}&type=${type}&aDC=76&userid={id}&source=MP#`;
    await page.goto(initialUrl, { waitUntil: 'networkidle2' });

    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('td')).some((td) => td.textContent.includes('Name :')),
      { timeout: 15000 }
    );

    const rawNameText = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td'));
      const nameCell = cells.find((td) => td.textContent.includes('Name :'));
      return nameCell ? nameCell.textContent : null;
    });

    if (!rawNameText) throw new Error('Could not find the Name element on the page.');

    const cleanName = rawNameText.replace(/Name\s*:\s*/i, '').trim();
    const nameParts = cleanName.split(/\s+/);
    if (nameParts.length < 2) throw new Error(`Name format unexpected: "${cleanName}"`);

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const generatedId = (lastName + firstName.charAt(0)).toLowerCase();

    const finalUrl = `https://cec.philhealth.gov.ph/konsulta/assignment.php?pin=${pin}&type=${type}&aDC=76&userid=${generatedId}&source=MP#`;
    await page.goto(finalUrl, { waitUntil: 'networkidle2' });

    await delay(1500);

    await page.keyboard.type('METRO');
    await delay(300);
    await page.keyboard.press('Enter');
    await delay(500);

    await page.keyboard.press('Tab');
    await delay(500);

    await page.keyboard.type('MANDA');
    await delay(300);
    await page.keyboard.press('Enter');
    await delay(500);

    await page.keyboard.press('Tab');
    await delay(500);

    await page.keyboard.press('Enter');
    await delay(800);

    await page.keyboard.press('Tab');
    await delay(300);
    await page.keyboard.press('Tab');
    await delay(300);

    await page.keyboard.type('FTCC');
    await delay(1000);

    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('a')).some((a) =>
          a.textContent.includes('FTCC MEDICAL CLINIC - MANDALUYONG')
        ),
      { timeout: 10000 }
    );

    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const target = links.find((a) => a.textContent.includes('FTCC MEDICAL CLINIC - MANDALUYONG'));
      if (target) target.click();
    });

    await delay(500);
    await page.keyboard.press('Enter');

    // Wait for either the success or error banner.
    const result = await page.waitForFunction(
      () => {
        const success = document.querySelector('.alert.alert-success');
        if (success && success.textContent.trim()) {
          return { status: 'success', message: success.textContent.trim() };
        }
        const error = document.querySelector('.alert.alert-danger');
        if (error && error.textContent.trim()) {
          return { status: 'error', message: error.textContent.trim() };
        }
        return null;
      },
      { timeout: 30000, polling: 500 }
    );

    const payload = await result.jsonValue();
    return { ...payload, userId: generatedId };
  } finally {
    await browser.close().catch(() => {});
  }
}
