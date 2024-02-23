const { main } = require('./scrapper');

const url = process.argv[2];
const elementId = process.argv[3];
const limit = process.argv[4];
const pages = process.argv[5];
const saveFormat = process.argv[6];
const start = process.argv[8];
const region = process.argv[7]; // Extract URL from command line arguments

// console.log("url at event ====>>>", url, elementId, limit, pages, saveFormat);
main(url, { elementId: elementId, limit: limit, pages: pages, saveFormat: saveFormat, start: start, region: region }, async (notification) => {
  // notification.saveFormat = notification.saveFormat || 'json';
  // notification.parentId = notification.parentId || '.company.with_img';
  process.send(await notification); // Send notifications to the parent process
}).then(ans => {
  console.log("answer ==>>", ans);
}).catch(err => console.log("ERROR::", err));
