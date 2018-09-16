const superagent = require('superagent');
const agent = superagent.agent();
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Forum parameters to be used.
 *
 * @type {{ url: string, pass: string, user: string }}
 */
const forumParams = require('./auth.json');

let logBuffer = '';
let sessionId = '';
let acpSessionId = '';
let memberIdCount = 0;

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

  /* testWriteFile('loginRes.txt', loginRes); */

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
        };
        const lastPostTitle = mainPage(this).find('.lastpost .lastsubject').text();
        if (lastPostTitle) {
          index.lastPost = {
            title: lastPostTitle,
            poster: mainPage(this).find('.display_username a').text(),
            posterId: numberConv(mainPage(this).find('.display_username a').attr('href').match(/u=(\d+)$/)[1]),
            threadId: numberConv(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/-t(\d+)(\.|\-)/)[1]),
            postId: numberConv(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/#p(\d+)$/)[1]),
            time: dateConv(mainPage(this).find('.lastpost > span').contents().filter(function() { return this.nodeType === 3 }).eq(-1).text()),
          };
          index.posts = numberConv(mainPage(this).find('.posts').contents().filter(function() { return this.nodeType === 3 }).text());
          index.topics = numberConv(mainPage(this).find('.topics').contents().filter(function() { return this.nodeType === 3 }).text());
        }
        return index;
      } catch (err) {
        log(`Error parsing forum ${mainPage(this).find('.forumtitle').text()}`);
        throw err;
      }
    }).get();
  const admLink = mainPage('.dropdown a').first().attr('href');
  memberIdCount = Number(mainPage('.stat-block.statistics strong').last().children().attr('href').match(/u=(\d+)$/)[1]);

  log(`Forum: ${forumName} | Description: ${forumDesc} | Member ID Count: ${memberIdCount}`);
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

  /* testWriteFile('acpLogin.txt', acpLoginRes); */

  const acpMainPage = cheerio.load(acpLoginRes.text);
  const firstRowIP = acpMainPage('.zebra-table td').eq(1).text();

  log(`Logged in as Admin: ${loggedUser} | IP: ${firstRowIP} | Credential: ${credential} | Session ID: ${acpSessionId}`);
  line();

  /**
   * Member backup.
   */

  /* const members = [{ id: 0 }];

  for (let i = 1; i <= memberIdCount; i++) {
    const userPage = cheerio.load((await agent.get(`${forumParams.url}memberlist.php?mode=viewprofile&u=${i}`)).text);
    if (userPage('.operation a').length) {
      const userPageAdmUrl = userPage('.operation a').filter(function() { return userPage(this).attr('href').includes('/adm/') }).attr('href');
      const name = userPage('.profile .username').text().trim();
      const userPageAdm = cheerio.load((await agent.get(userPageAdmUrl)).text);
      const currentSid = userPageAdmUrl.match(/&sid=(\w+)$/)[1];
      const userPageAdmSig = cheerio.load((await agent.get(`${forumParams.url}adm/index.php?i=users&mode=sig&u=${i}&sid=${currentSid}`)).text);

      log(`Getting ACP user info of user ${name} id ${i}`);

      const user = {
        id: i,
        name,
        avatar: userPage('.profile .avatar-bg').css('background-image').slice(4).slice(0, -1),
        email: userPageAdm('#user_email_search').val(),
        reg: dateConv(userPage('.profile .group .clear-after').filter(function() { return userPage(this).text().includes('Joined') }).find('.right').text()),
        sig: userPageAdmSig('textarea[name="signature"]').val(),
      };
      members.push(user);
    } else {
      members.push({ id: i });
    }
  }

  testWriteFile('memberData.json', members);

  /**
   * Forum index backup.
   */

  /* log('Forum index:');
  line();
  log(JSON.stringify(forumIndex, null, 2)); */
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

  testWriteFile('log.txt', logBuffer);
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
function dateConv(str) {
  if (!str) return undefined;
  const now = new Date();
  let dateStr = str.replace('Today', now.toDateString());
  now.setDate(now.getDate() - 1);
  dateStr = dateStr.replace('Yesterday', now.toDateString());
  return new Date(dateStr);
}
function testWriteFile(filename, data) {
  line();
  log(`Writing to test file ${filename}`);
  line();
  if (typeof data !== 'string') {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  } else {
    fs.writeFileSync(`./output/${filename}`, data);
  }
}