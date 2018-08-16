(async () => {
  const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
  const firefox = require('selenium-webdriver/firefox');

  const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options()
      .headless()
      .windowSize({ width: 1920, height: 1080 })
    )
    .build();

  await driver.get('https://www.tapatalk.com/groups/rockmanchaosnetwork/');

  await driver.findElement(By.css('.dropdown-trigger')).click();
  const elements = await driver.findElements(By.css('a[role="menuitem"]'));
  for (const el of elements) {
    const text = await el.getAttribute('href');
    console.log(`inner href ${text}`);
  }

  const title = await driver.getTitle();
  const url = await driver.getCurrentUrl();
  console.log(`title: ${title}, url: ${url}`);
  driver.quit();

})().catch(err => {
  console.error(err);
})