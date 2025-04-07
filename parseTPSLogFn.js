const xml2js = require('xml2js');

// Utility functions
const normalizeValue = val => isNaN(val) ? val : parseFloat(val);
const normalizeKey = key => key.toLowerCase();
const parseTrack2 = str => {
  const [card, data] = str.split('=');
  return data ? { [card]: data } : {};
};

/**
 * Parses a block of XML representing a transaction request.
 * Accepts any root tag name (e.g., <POSRequest>, <AckrooTPSRequest>, etc.)
 * but expects a TPS-style structure inside.
 *
 * @param {string} xmlString - A full XML string containing one or more transaction blocks
 * @returns {Promise<Array<Object>>} Parsed and normalized transaction objects
 */
async function parseTPSRequestsFromXML(xmlString) {
  const matches = xmlString.match(/<([a-zA-Z0-9_]+)[^>]*>[\s\S]*?<\/\1>/g); // match all root-wrapped XML blocks
  if (!matches) {
    console.warn('No valid XML blocks found.');
    return [];
  }

  const parser = new xml2js.Parser({ explicitArray: false, trim: true });
  const results = [];

  for (const xml of matches) {
    try {
      const parsed = await parser.parseStringPromise(xml);
      const rootObj = Object.values(parsed)[0]; // get the contents under the root

      const output = {
        transaction_type: rootObj?.Transaction?.['$']?.Type || null,
        source_type: rootObj?.Source?.['$']?.Type || null,
        lane: normalizeValue(rootObj.Lane),
        invoiceno: normalizeValue(rootObj.InvoiceNo),
        card: rootObj.Card ? {
          type: rootObj.Card.Type?.toLowerCase() || null,
          track2: rootObj.Card.Track2 ? parseTrack2(rootObj.Card.Track2) : {}
        } : null,
      };

      if (rootObj.TransactionDetail) {
        const detail = {};

        if (rootObj.TransactionDetail.Products) {
          const products = Array.isArray(rootObj.TransactionDetail.Products)
            ? rootObj.TransactionDetail.Products
            : [rootObj.TransactionDetail.Products];

          detail.products = products.map(product =>
            Object.fromEntries(
              Object.entries(product).map(([k, v]) => [normalizeKey(k), normalizeValue(v)])
            )
          );
        }

        if (rootObj.TransactionDetail.Payment) {
          detail.payment = Object.fromEntries(
            Object.entries(rootObj.TransactionDetail.Payment).map(([k, v]) => [normalizeKey(k), normalizeValue(v)])
          );
        }

        output.transactiondetail = detail;
      }

      results.push(output);
    } catch (err) {
      console.error('Error parsing XML block:', err.message);
    }
  }

  return results;
}

module.exports = { parseTPSRequestsFromXML };
