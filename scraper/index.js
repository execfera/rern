const superagent = require('superagent');
require('superagent-retry-delay')(superagent);
const agent = superagent.agent();
const cheerio = require('cheerio');
const fs = require('fs');
const asyncPool = require('tiny-async-pool');
const sanitize = require('sanitize-filename');

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
  memberIdCount = Number(mainPage('.stat-block.statistics a').last().attr('href').match(/u=(\d+)$/)[1]);

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
  /* const memberIds = Array.from({ length: memberIdCount + 1 }, (_, i) => i);
  const members = await asyncPool(2, memberIds, getMember);

  testWriteFile(`memberData(${new Date().toISOString()}).json`, members); */

  /**
   * Thread info backup test.
   */
  line();
  log('Testing thread info backup for thread 897');
  line();
  await getPostsFromThread(897);

  /**
   * Forum index backup.
   */

  /* log('Forum index:');
  line();
  log(JSON.stringify(forumIndex, null, 2)); */
}

async function getForumStructure() {
  const manForumPageUrl = `${forumParams.url}adm/index.php?sid=${acpSessionId}&i=acp_forums&icat=6&mode=manage`;
  const manForumPage = cheerio.load((await agent.get(manForumPageUrl)).text);
}

async function getMember(userId) {
  if (userId === 0) {
    return { id: 0 };
  }
  const userPage = cheerio.load((await agent.get(`${forumParams.url}memberlist.php?mode=viewprofile&u=${userId}`)).text);
  if (userPage('.operation a').length) {
    const name = userPage('.profile .username').text().trim();
    log(`Getting ACP user info of user ${name} id ${userId}`);

    const userPageAdmUrl = userPage('.operation a').filter(function() { return userPage(this).attr('href').includes('/adm/') }).attr('href');
    const userPageAdm = cheerio.load((await agent.get(userPageAdmUrl)).text);
    const currentSid = userPageAdmUrl.match(/&sid=(\w+)$/)[1];
    const userPageAdmSig = cheerio.load((await agent.get(`${forumParams.url}adm/index.php?i=users&mode=sig&u=${userId}&sid=${currentSid}`)).text);
    const userPageAdmProf = cheerio.load((await agent.get(`${forumParams.url}adm/index.php?i=users&mode=profile&u=${userId}&sid=${currentSid}`)).text);

    const userProfile = userPage('.profile .group .clear-after');
    const user = {
      id: userId,
      name,
      avatar: userPage('.profile .avatar-bg').css('background-image').slice(4).slice(0, -1),
      email: userPageAdm('#user_email_search').val(),
      reg: dateConv(userProfile.filter(function() { return userPage(this).text().includes('Joined') }).find('.right').text()),
      sig: userPageAdmSig('textarea[name="signature"]').val(),
      int: userProfile.filter(function() { return userPage(this).text().includes('Interests') }).length ? userProfile.filter(function() { return userPage(this).text().includes('Interests') }).find('.right').html().replace('<br>', '\n') : "",
      birth: {
        year: parseInt(userPageAdmProf('select[name="bday_year"]').val()),
        month: parseInt(userPageAdmProf('select[name="bday_month"]').val()),
        day: parseInt(userPageAdmProf('select[name="bday_day"]').val()),
      },
    };
    log(`Done getting ACP user info of user ${name} id ${userId}`);
    return user;
  }
  return { id: userId };
}

async function getPostsFromThread(threadId) {
  log(`Parsing thread ID ${threadId}`);

  const firstPageUrl = `${forumParams.url}x-t${threadId}.html`;
  const firstPage = cheerio.load((await agent.get(firstPageUrl)).text);

  const pageUrls = firstPage('.postcontent_button a')
    .filter(function(){ return firstPage(this).attr('href') && firstPage(this).attr('href').includes('mode=edit'); })
    .map(function() { return firstPage(this).attr('href') })
    .get();
  const forumId = pageUrls[0].match(/&f=(\d+)&/)[1];

  const postIds = pageUrls
    .map(str => str.split('&p=')[1]);
  const posterIds = firstPage('.avatar-username-inner .username, .avatar-username-inner .username-coloured')
    .map(function() { return firstPage(this).attr('href') || '' })
    .get()
    .map(url => url.split('&u=')[1] || '');
  const posterNames = firstPage('.avatar-username-inner .username, .avatar-username-inner .username-coloured')
    .map(function() { return firstPage(this).text() })
    .get();
  const postTimes = firstPage('.author time')
    .map(function() { return firstPage(this).text() })
    .get();

  if (firstPage('.pagination ul').length) {
    log(`Paginating thread ID ${threadId}`);
    const otherPages = firstPage('.pagination ul li')
      .first()
      .find('li')
      .not('.active, .arrow')
      .find('a')
      .map(function() { return firstPage(this).attr('href') })
      .get();

    for (const pageUrl of otherPages) {
      const page = cheerio.load((await agent.get(pageUrl)).text);
      postIds.push(...page('.postcontent_button a')
        .filter(function(){ return page(this).attr('href') && $(this).attr('href').includes('mode=edit'); })
        .map(function() { return page(this).attr('href') })
        .get()
        .map(str => str.split('&p=')[1]));
      posterIds.push(...page('.avatar-username-inner .username, .avatar-username-inner .username-coloured')
        .map(function() { return page(this).attr('href') || '' })
        .get()
        .map(url => url.split('&u=')[1] || ''));
      posterNames.push(...page('.avatar-username-inner .username, .avatar-username-inner .username-coloured')
        .map(function() { return page(this).text() })
        .get());
      postTimes.push(...page('.author time')
        .map(function() { return page(this).text() })
        .get());
    }
  }
  const postContent = [];
  log(`Post IDs: ${postIds.join(', ')}`);
  for (const postId of postIds) {
    log(`Getting post ${postId}`);
    const editPage = cheerio.load((await agent.get(`${forumParams.url}posting.php?mode=edit&f=${forumId}&p=${postId}`)).text);
    postContent.push(editPage('#message').val());
  }
  const postInfos = postIds.map((val, idx) => {
    return {
      postId: val,
      forumId,
      poster: posterNames[idx],
      posterId: posterIds[idx],
      time: postTimes[idx],
      content: postContent[idx],
    };
  });
  log(`Debug post info in thread ID ${threadId} forum ID ${forumId}:`);
  log(JSON.stringify(postInfos, null, 2));
}

async function main() {
  const now = new Date().getTime();
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
  log(`Time taken: ${timeCounter(new Date().getTime() - now)}`);

  testWriteFile(`log(${new Date().toISOString()}).txt`, logBuffer);
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
  let file = sanitize(filename.replace(/:/g, '_'));
  line();
  log(`Writing to test file ${file}`);
  line();
  fs.writeFileSync(`./output/${file}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

function timeCounter(msecond) {
  let t = Math.floor(msecond/1000);
  const years = Math.floor(t / 31536000);
  t = t - (years * 31536000);
  const months = Math.floor(t / 2592000);
  t = t - (months * 2592000);
  const days = Math.floor(t / 86400);
  t = t - (days * 86400);
  const hours = Math.floor(t / 3600);
  t = t - (hours * 3600);
  const minutes = Math.floor(t / 60);
  t = t - (minutes * 60);
  const content = [];
  if (years) content.push(years + " year" + (years > 1 ? "s" : ""));
  if (months) content.push(months + " month" + (months > 1 ? "s" : ""));
  if (days) content.push(days + " day" + (days > 1 ? "s" : ""));
  if (hours) content.push(hours + " hour"  + (hours > 1 ? "s" : ""));
  if (minutes) content.push(minutes + " minute" + (minutes > 1 ? "s" : ""));
  if (t) content.push(t + " second" + (t > 1 ? "s" : ""));
  return content.slice(0,3).join(', ');
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}