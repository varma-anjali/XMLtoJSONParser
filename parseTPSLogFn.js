const xml2js = require('xml2js');

// === Helpers ===
const normalizeValue = val => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!isNaN(trimmed)) return parseFloat(trimmed);
    return trimmed;
  }
  return val;
};

const normalizeKey = key => key.toLowerCase();

const parseTrack2 = str => {
  const [card, data] = str.split('=');
  return data ? { [card]: data } : {};
};

// === Core Recursive Processor ===
function processNode(node) {
  if (typeof node !== 'object' || node === null) {
    return normalizeValue(node);
  }

  const output = {};

  for (const [key, value] of Object.entries(node)) {
    const normalizedKey = normalizeKey(key);

    if (typeof value === 'object' && value !== null) {
      output[normalizedKey] = processNode(value);
    } else if (typeof value === 'string') {
      const track2Data = parseTrack2(value.trim());
      if (track2Data && Object.keys(track2Data).length) {
        output[normalizedKey] = {
          raw: value.trim(),
          track2: track2Data
        };
      } else {
        output[normalizedKey] = normalizeValue(value);
      }
    } else {
      output[normalizedKey] = normalizeValue(value);
    }
  }

  return output;
}

// === Main Function ===
async function parseAnyTPSXML(xmlString) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });

  try {
    const parsed = await parser.parseStringPromise(xmlString);
    return processNode(parsed);
  } catch (err) {
    throw new Error('Failed to parse XML: ' + err.message);
  }
}

module.exports = { parseAnyTPSXML };
