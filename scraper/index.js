const superagent = require('superagent');
const cheerio = require('cheerio');
const agent = superagent.agent();
const fs = require('fs');
let logBuffer = '';
let sessionId = '';
let acpSessionId = '';

/**
 * Forum parameters to be used.
 *
 * @type {{ url: string, pass: string, user: string }}
 */
const forumParams = require('./auth.json');

async function getMainIndex() {
  /**
   * Login to get session ID, and pass cookies to agent.
   */
  const loginPage = cheerio.load((await agent.get(`${forumParams.url}ucp.php?mode=login`)).text);
  sessionId = loginPage('input[name="sid"]').val();

  log('Logging into forum...');

  const loginRes = await agent
    .post(`${forumParams.url}ucp.php?mode=login`)
    .field('login', 'Login')
    .field('autologin', 'on')
    .field('password', forumParams.pass)
    .field('username', forumParams.user)
    .field('redirect', `${forumParams.url}index.php`)
    .field('sid', sessionId);

  /**
   * Parse the resulting main page.
   */
  const mainPage = cheerio.load(loginRes.text);
  const forumName = mainPage('#site-description h1 a').text();
  const forumDesc = mainPage('#site-description p a').text();
  const loggedUser = mainPage('.username-coloured, .username').first().text();
  const loggedAvatar = mainPage('.avatar-bg').css('background-image').slice(4).slice(0, -1);
  const forumIndex = mainPage('.forums .row')
    .filter(function () {
      return mainPage(this).find('.forumtitle').text();
    })
    .map(function() {
      try {
        const index = {
          title: mainPage(this).find('.forumtitle').text(),
          forumId: numberConv(mainPage(this).find('.forumtitle').attr('href').match(/f(\d+)\/$/)[1]),
          desc: mainPage(this).find('.forum_description').text(),
          posts: numberConv(mainPage(this).find('.posts').contents().filter(function() { return this.nodeType === 3 }).text()),
          topics: numberConv(mainPage(this).find('.topics').contents().filter(function() { return this.nodeType === 3 }).text()),
        };
        index.lastPost = mainPage(this).find('.lastpost .lastsubject').text() ? {
          title: mainPage(this).find('.lastpost .lastsubject').text(),
          poster: mainPage(this).find('.display_username a').text(),
          posterId: numberConv(mainPage(this).find('.display_username a').attr('href').match(/u=(\d+)$/)[1]),
          threadId: numberConv(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/-t(\d+)(\.|\-)/)[1]),
          postId: numberConv(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/#p(\d+)$/)[1]),
        } : undefined;
        return index;
      } catch (err) {
        log(`Error parsing forum ${mainPage(this).find('.forumtitle').text()}`);
        throw err;
      }
    }).get();
  const admLink = mainPage('.dropdown a').first().attr('href');

  log(`Forum: ${forumName}`)
  log(`Description: ${forumDesc}`);
  log(`Logged in as User: ${loggedUser} | Avatar ${loggedAvatar} | Session ID: ${sessionId}`);
  log(`Admin console link: ${admLink}`);
  line();

  /**
   * Log into ACP with admin console link.
   */
  log('Logging into ACP...');
  const acpLoginPage = cheerio.load((await agent.get(admLink)).text);
  const credential = acpLoginPage('input[name="credential"]').val();
  acpSessionId = acpLoginPage('input[name="sid"]').val();

  const acpLoginRes = await agent
    .post(admLink)
    .field('login', 'Login')
    .field('credential', credential)
    .field(`password_${credential}`, forumParams.pass)
    .field('username', forumParams.user)
    .field('redirect', admLink)
    .field('sid', acpSessionId);

  const acpMainPage = cheerio.load(acpLoginRes.text);
  const firstRowIP = acpMainPage('.zebra-table td').eq(1).text();

  log(`Logged in as Admin: ${loggedUser} | IP: ${firstRowIP} | Credential: ${credential} | Session ID: ${acpSessionId}`);
  line();

  log('Forum index:');
  line();
  log(JSON.stringify(forumIndex, null, 2));
}

async function main() {
  line();
  log(`Forum Scraper Starting...`);
  log(new Date().toString());
  line();

  try {
    await getMainIndex();
  } catch (err) {
    log('Scraper error!');
    line();
    log(err);
  }

  fs.writeFileSync('log.txt', logBuffer);
}

main();

/**
 * Utility functions.
 */
function line() { log('='.repeat(25)); }
function numberConv(str) { return Number(str.trim().replace(',', '')); }
function log(str) {
  console.log(str);
  logBuffer += `${str}\n`;
}