const { main } = require('./main');

const url = process.argv[2];
const params = JSON.parse(process.argv[3]);// Extract URL from command line arguments

main(url, params,async (notification) => {
  // notification.saveFormat = notification.saveFormat || 'json';
  // notification.parentId = notification.parentId || '.company.with_img';
  process.send(await notification); // Send notifications to the parent process
});
