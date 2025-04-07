const fs = require('fs');
const { parseAckrooTPSRequestsFromXML } = require('./parseTPSLogFn');

(async () => {
  const rawXML = fs.readFileSync('TPSlog.txt', 'utf8');
  const jsonOutput = await parseAckrooTPSRequestsFromXML(rawXML);
  console.log(JSON.stringify(jsonOutput, null, 2));
})();
