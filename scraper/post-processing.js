const fs = require('fs');
const path = require('path');

function mergeStuff(dataType, mapKey) {
  console.log(`merging ${dataType} data into hashmap with key ${mapKey}...`);
  const files = fs.readdirSync('./output');
  const objArray = files
    .filter(file => file.startsWith(`${dataType}Data(`))
    .map(file => {
      return JSON.parse(fs.readFileSync(path.join('./output', file), 'utf8'))
    });
  const arrayConcat = [].concat(...objArray)
    .reduce((obj, val) => {
      obj[val[mapKey]] = val;
      return obj;
    }, {});
  console.log(`writing data into ${dataType}Data.json...`);
  fs.writeFileSync(`${dataType}Data.json`, JSON.stringify(arrayConcat, null, 2));
}

mergeStuff('post', '_pid');
mergeStuff('thread', '_tid');
mergeStuff('member', '_id');
mergeStuff('category', '_cid');

const memberData = JSON.parse(fs.readFileSync('memberData.json', 'utf8'));
for (const _uid in memberData) {
  memberData[_uid]._uid = _uid;
  delete memberData[_uid]._id;

  const valid = /^(\d+).(\d+).(\d+)$/.test(memberData[_uid]._birthday);
  if (!valid) {
    memberData[_uid]._birthday = '';
  } else {
    const arr = memberData[_uid]._birthday.match(/^(\d+).(\d+).(\d+)$/);
    const birth = `${arr[1].padStart(2, '0')}/${arr[2].padStart(2, '0')}/${arr[3]}`;
    memberData[_uid]._birthday = birth;
  }
  delete memberData[_uid].birthday;
}
fs.writeFileSync('memberData.json', JSON.stringify(memberData, null, 2));