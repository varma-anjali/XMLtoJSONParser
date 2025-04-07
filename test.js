const fs = require('fs');
const { parseAnyTPSXML } = require('./parseTPSLogFn');

(async () => {
  const xml = fs.readFileSync('testXML.txt', 'utf-8');

  try {
    const result = await parseAnyTPSXML(xml);
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Parsing failed:', e.message);
  }
})();

