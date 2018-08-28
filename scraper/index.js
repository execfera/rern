const webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
const firefox = require('selenium-webdriver/firefox');

const driver = new webdriver.Builder()
  .withCapabilities(webdriver.Capabilities.firefox())
  .usingServer('http://127.0.0.1:2828')
  /* .setFirefoxOptions(new firefox.Options()
    .headless()
    .windowSize({ width: 1920, height: 1080 })
    .setProfile('C:\\Users\\Amir\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\boks55u5.dev-edition-default')
  ) */
  .build();

driver.catch(err => console.error(`build error: ${err}`));

driver.get('https://www.tapatalk.com/groups/rockmanchaosnetwork/')
  .then(() => driver.findElements(By.css('a[role="menuitem"]')))
  .then((elements) => elements.map(el => el.getAttribute('href')))
  .then((stringArr) => stringArr.forEach(str => console.log(`href: ${str}`)))
  .then((driver) => { driver.quit() })
  .catch((err) => console.error(`fetch error: ${err}`));