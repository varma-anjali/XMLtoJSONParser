const xml2js = require('xml2js');

// Utility functions
const normalizeValue = val => isNaN(val) ? val : parseFloat(val);
const normalizeKey = key => key.toLowerCase();
const parseTrack2 = str => {
  const [card, data] = str.split('=');
  return data ? { [card]: data } : {};
};

// Main parsing function
async function parseAckrooTPSRequestsFromXML(xmlString) {
  const matches = xmlString.match(/<AckrooTPSRequest[\s\S]*?<\/AckrooTPSRequest>/g);
  if (!matches) {
    console.warn('No <AckrooTPSRequest> blocks found.');
    return [];
  }

  const parser = new xml2js.Parser({ explicitArray: false });
  const results = [];

  for (const xml of matches) {
    try {
      const { AckrooTPSRequest: req } = await parser.parseStringPromise(xml);
      const output = {
        transaction_type: req?.Transaction?.['$']?.Type || null,
        source_type: req?.Source?.['$']?.Type || null,
        lane: normalizeValue(req.Lane),
        invoiceno: normalizeValue(req.InvoiceNo),
        card: req.Card ? {
          type: req.Card.Type?.toLowerCase() || null,
          track2: req.Card.Track2 ? parseTrack2(req.Card.Track2) : {}
        } : null,
      };

      if (req.TransactionDetail) {
        const detail = {};

        if (req.TransactionDetail.Products) {
          const products = Array.isArray(req.TransactionDetail.Products)
            ? req.TransactionDetail.Products
            : [req.TransactionDetail.Products];

          detail.products = products.map(product =>
            Object.fromEntries(
              Object.entries(product).map(([k, v]) => [normalizeKey(k), normalizeValue(v)])
            )
          );
        }

        if (req.TransactionDetail.Payment) {
          detail.payment = Object.fromEntries(
            Object.entries(req.TransactionDetail.Payment).map(([k, v]) => [normalizeKey(k), normalizeValue(v)])
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

module.exports = { parseAckrooTPSRequestsFromXML };
