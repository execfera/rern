const superagent = require('superagent');
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

/**
 * Start scraping.
 */
async function start() {
  /**
   * Login to get session ID, and pass cookies to agent.
   */
  
  const loginPage = await loadForumPage(`${forumParams.url}ucp.php?mode=login`);
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
  let mainPage = cheerio.load(loginRes.text);
  const forumName = mainPage('#site-description h1 a').text();
  const forumDesc = mainPage('#site-description p a').text();
  const loggedUser = mainPage('.username-coloured, .username').first().text();
  const loggedAvatar = mainPage('.avatar-bg').css('background-image').slice(4).slice(0, -1);
  const admLink = mainPage('.dropdown a').first().attr('href');
  const threadCount = mainPage('.stat-block.statistics').text().match(/\sTotal\stopics\s(\d+)\s/)[1];
  memberIdCount = Number(mainPage('.stat-block.statistics a').last().attr('href').match(/u=(\d+)$/)[1]);

  log(`Forum: ${forumName} | Description: ${forumDesc} | Member ID Count: ${memberIdCount} | Thread Count: ${threadCount}`);
  log(`Logged in as User: ${loggedUser} | Avatar ${loggedAvatar} | Session ID: ${sessionId}`);
  log(`Admin console link: ${admLink}`);
  line();

  /**
   * Log into ACP with admin console link.
   */
  log('Logging into ACP...');
  const acpLoginPage = await loadForumPage(admLink);
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
  mainPage = await loadForumPage(forumParams.url);
  sessionId = acpSessionId = mainPage('.dropdown a').first().attr('href').match(/sid\=(\w+)/)[1];

  log(`Logged in as Admin: ${loggedUser} | IP: ${firstRowIP} | Credential: ${credential} | Session ID: ${acpSessionId}`);
  line();

  /**
   * Forum index backup.
   */
  const forumData = await getForumStructure();

  testWriteFile(`forumStruct(${new Date().toISOString()}).json`, forumData);

  /**
   * Member backup.
   */
  const memberIds = Array.from({ length: memberIdCount + 1 }, (_, i) => i).slice(1);
  const members = await asyncPool(2, memberIds, getMember);

  testWriteFile(`memberData(${new Date().toISOString()}).json`, members);

  /**
   * Thread info backup.
   */
  const threadIds = Array.from({ length: threadCount + 1 }, (_, i) => i).slice(1);
  const postInfo = await asyncPool(1, threadIds, getPostsFromThread);

  testWriteFile(`postData(${new Date().toISOString()}).json`, postInfo);
}

/**
 * Get info for forum structure.
 */
async function getForumStructure() {
  const manForumPageUrl = `${forumParams.url}adm/index.php?sid=${acpSessionId}&i=acp_forums&icat=6&mode=manage`;
  const manForumPage = await loadAcpPage(manForumPageUrl);
  const forumIds = manForumPage('#fselect option').map(function() { return Number(manForumPage(this).val()); }).get();

  const forumAcpData = await asyncPool(3, forumIds, getAcpForumInfo);
  const parentForumIds = Array.from(new Set(forumAcpData.filter(data => data.parentId).map(data => data.parentId)));
  const forumIndexData = [].concat(...await asyncPool(3, parentForumIds, getForumInfo));

  return forumAcpData.map(acpData => Object.assign({}, acpData, forumIndexData.find(indexData => indexData.id === acpData.id)));
}

/**
 * Get ACP info for a single forum.
 */
async function getAcpForumInfo(forumId) {
  log(`Getting forum ACP info for forum index ${forumId}`);
  const forumAdmUrl = `${forumParams.url}adm/index.php?i=acp_forums&sid=${acpSessionId}&mode=manage&f=${forumId}&action=edit`;
  const forumAdmPage = await loadAcpPage(forumAdmUrl);
  return {
    id: forumId,
    parentId: Number(forumAdmPage('#parent').val()),
    type: forumAdmPage('#forum_type option[selected="selected"]').text(),
    name: forumAdmPage('#forum_name').val(),
    desc: forumAdmPage('#forum_desc').val(),
    link: forumAdmPage('#forum_link').val(),
  };
}

async function getForumInfo(forumId) {
  log(`Getting forum last post info for forum index ${forumId}`);
  const mainPage = await loadForumPage(`${forumParams.url}x-f${forumId}/`);
  return mainPage('.forums .row')
    .filter(function () {
      return mainPage(this).find('.forumtitle').text();
    })
    .map(function() {
      try {
        const index = {
          id: numberConv(mainPage(this).find('.forumtitle').attr('href').match(/f(\d+)\/$/)[1]),
        };
        const lastPostTitle = mainPage(this).find('.lastpost .lastsubject').text();
        if (lastPostTitle) {
          index.lastPost = {
            title: lastPostTitle,
            poster: mainPage(this).find('.display_username .username, .display_username .username-coloured').text(),
            posterId: Number(mainPage(this).find('.display_username a').attr('href') ? mainPage(this).find('.display_username a').attr('href').match(/u=(\d+)$/)[1] : 0),
            threadId: Number(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/-t(\d+)(\.|\-)/)[1]),
            postId: Number(mainPage(this).find('.lastpost .lastsubject').attr('href').match(/#p(\d+)$/)[1]),
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
}

/**
 * Get post info from thread.
 */
async function getPostsFromThread(threadId) {

  const firstPageUrl = `${forumParams.url}x-t${threadId}.html`;
  const firstPage = await loadForumPage(firstPageUrl);
  const threadName = firstPage('h2.topic-title a').text();
  const postQty = Number(firstPage('.pagination').first().text().match(/\s(\d+)\spost(s?)\s/)[1]);

  log(`Parsing thread ID ${threadId}: ${threadName} (${postQty} posts)`);

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
    const postQtyPerPage = firstPage('.postbody').length;
    const otherPages = Array.from({ length: Math.floor(postQty / postQtyPerPage) }, (_, i) => postQtyPerPage * (i + 1))
      .map(postQtyPage => `${forumParams.url}x-t${threadId}-s${postQtyPage}.html`);

    for (const pageUrl of otherPages) {
      const page = await loadForumPage(pageUrl);
      postIds.push(...page('.postcontent_button a')
        .filter(function(){ return page(this).attr('href') && page(this).attr('href').includes('mode=edit'); })
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

  const postContent = await asyncPool(5, postIds, (postId) => getPostContent(forumId, postId));
  return postIds.map((val, idx) => {
    return {
      postId: val,
      forumId,
      poster: posterNames[idx],
      posterId: posterIds[idx],
      time: postTimes[idx],
      content: postContent[idx],
    };
  });
}

async function getPostContent(forumId, postId) {
  log(`Getting post ${postId}`);
  const editPage = await loadForumPage(`${forumParams.url}posting.php?mode=edit&f=${forumId}&p=${postId}`);
  await sleep(18000);
  return editPage('#message').val();
}

async function getMember(userId) {
  if (userId === 0) {
    return { id: 0 };
  }
  const userPage = await loadForumPage(`${forumParams.url}memberlist.php?mode=viewprofile&u=${userId}`);
  if (userPage('.operation a').length) {
    const name = userPage('.profile .username').text().trim();
    log(`Getting ACP user info of user ${name} id ${userId}`);

    const userPageAdmUrl = userPage('.operation a').filter(function() { return userPage(this).attr('href').includes('/adm/') }).attr('href');
    const userPageAdm = await loadAcpPage(userPageAdmUrl);
    const currentSid = userPageAdmUrl.match(/&sid=(\w+)$/)[1];
    const userPageAdmSig = await loadAcpPage(`${forumParams.url}adm/index.php?i=users&mode=sig&u=${userId}&sid=${currentSid}`);
    const userPageAdmProf = await loadAcpPage(`${forumParams.url}adm/index.php?i=users&mode=profile&u=${userId}&sid=${currentSid}`);

    const userProfile = userPage('.profile .group .clear-after');
    let userAvatar = userPage('.profile .avatar-bg').css('background-image').slice(4).slice(0, -1);
    userAvatar = userAvatar === 'https://groups.tapatalk-cdn.com/static/image/no_avatar.png' ? null : userAvatar;
    const user = {
      id: userId,
      name,
      avatar: userAvatar,
      email: userPageAdm('#user_email_search').val(),
      reg: dateConv(userProfile.filter(function() { return userPage(this).text().includes('Joined') }).find('.right').text()),
      sig: userPageAdmSig('textarea[name="signature"]').val(),
      int: userProfile.filter(function() { return userPage(this).text().includes('Interests') }).length ? userProfile.filter(function() { return userPage(this).text().includes('Interests') }).find('.right').html().replace(/<br>/g, '\n') : "",
      birth: {
        year: parseInt(userPageAdmProf('select[name="bday_year"]').val()),
        month: parseInt(userPageAdmProf('select[name="bday_month"]').val()),
        day: parseInt(userPageAdmProf('select[name="bday_day"]').val()),
      },
    };
    return user;
  }
  return { id: userId };
}

/**
 * Page-loading functions.
 */

async function loadForumPage(pageUrl, limit = 1) {
  const maxlimit = 5;
  try {
    const page = cheerio.load((await agent.get(pageUrl)).text);
    if (!page('.navbar-forum-name').text()) {
      if (limit !== maxlimit) {
        log(`Error loading page ${pageUrl} attempt #${limit}, delaying next attempt by ${20000 + 10000 * limit}ms`);
        await sleep(20000 + 10000 * limit);
        return loadForumPage(pageUrl, limit + 1);
      }
      testWriteFile('errPageRes.txt', page);
      throw new Error(`Error loading page ${pageUrl}, limit exceeded ${maxlimit}. Ending scrape session and writing errored page to disk.`);
    }
    return page;
  } catch (err) {
    if (limit !== maxlimit) {
      log(`Error loading page ${pageUrl}, attempt #${limit} delaying next attempt by ${20000 + 10000 * limit}ms`);
      await sleep(20000 + 10000 * limit);
      return loadForumPage(pageUrl, limit + 1);
    }
    log(`Error loading page ${pageUrl}, limit exceeded ${maxlimit}. Ending scrape session.`);
    throw err;
  }
}

async function loadAcpPage(pageUrl, limit = 1) {
  const maxlimit = 5;
  try {
    const page = cheerio.load((await agent.get(pageUrl)).text);
    if (page('#page-header h1').text() !== 'Administration Control Panel') {
      if (limit !== maxlimit) {
        log(`Error loading page ${pageUrl} attempt #${limit}, delaying next attempt by ${10000 * limit}ms`);
        await sleep(10000 * limit);
        return loadAcpPage(pageUrl, limit + 1);
      }
      testWriteFile('errPageRes.txt', page);
      throw new Error(`Error loading page ${pageUrl} limit exceeded ${maxlimit}. Ending scrape session and writing errored page to disk.`);
    }
    return page;
  } catch (err) {
    if (limit !== maxlimit) {
      log(`Error loading page ${pageUrl} attempt #${limit}, delaying next attempt by ${10000 * limit}ms`);
      await sleep(10000 * limit);
      return loadAcpPage(pageUrl, limit + 1);
    }
    log(`Error loading page ${pageUrl} limit exceeded ${maxlimit}. Ending scrape session.`);
    throw err;
  }
}

/**
 * Main startup function.
 */
async function main() {
  const now = new Date().getTime();
  line();
  log(`Forum Scraper Starting...`);
  log(new Date().toString());
  line();

  try {
    await start();
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
  const outputDir = './output';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  fs.writeFileSync(`${outputDir}/${file}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
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