/**
 * @name get list of links
 *
 * @desc Scrapes Hacker News for links on the home page and returns the top 10
 */
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: 'zaibietonghua@qq.com',
    pass: 'swnykznnanftcabb'
  }
});

const bestbuyLink = 'https://www.bestbuy.ca/en-ca/product/nintendo-switch-console-with-neon-red-blue-joy-con/13817625';
const walmartLink = 'https://www.walmart.ca/en/ip/nintendo-switch-with-neon-blue-and-neon-red-joycon-nintendo-switch/6000200280557';

const stores = {
  bestbuy: bestbuyLink,
  walmart: walmartLink
}

function send(storeName) {
  const message = {
    from: 'zaibietonghua@qq.com',// Sender address
    to: '344375048@qq.com',         // List of recipients
    subject: storeName + ': Nintendo Switch Available', // Subject line
    text: storeName +  ' ' + getDate(), // Plain text body
    html: `<a href="${stores[storeName]}"> ${storeName} Switch</a>`

  };
  transport.sendMail(message, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(`${storeName} has stocks, email sent.`);
    }
  });
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36");
  await page.setViewport({ width: 1280, height: 800 })

  while (true) {
    try {
      // best buy
      await page.goto(stores.bestbuy)
      const available = await page.$$eval('.addToCartButton', anchors => { return !anchors[0].hasAttribute('disabled'); });
      if (available) {
        send('bestbuy');
      } else {
        console.log('Bestbuy out of stock at ' + getDate());
      }

      // walmart
      await page.goto(stores.walmart, { waitUntil: 'networkidle2' })
      const elementHandle = await page.$("button[data-automation='cta-button']");
      const text = await page.evaluate(el => el.textContent, elementHandle);
      if (text == 'Add to cart') {
        send('walmart');
      } else {
        console.log('Walmart out of stock at ' + getDate());
      }
      const nap = between(5, 10);
      await sleep(nap * 1000);
    }
    catch (err) {
      console.log(err);
    }
  }
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

function getDate() {
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + ' ' + time;
  return dateTime;
}