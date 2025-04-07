const fs = require('fs');
const { parseTPSRequestsFromXML } = require('./parseTPSLogFn');

(async () => {
  const input = fs.readFileSync('testXML.txt', 'utf-8');
  const result = await parseTPSRequestsFromXML(input);
  console.log(JSON.stringify(result, null, 2));
})();

