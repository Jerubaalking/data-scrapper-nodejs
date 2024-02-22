const { main } = require('./scrapper');

const url = process.argv[2];
const elementId = process.argv[3]; 
const  limit  = process.argv[4];
const pages = process.argv[5];
const saveFormat = process.argv[6]; // Extract URL from command line arguments

// console.log("url====>>>", url, elementId, limit, pages, saveFormat);
main(url, {elementId:elementId, limit:limit, pages:pages, saveFormat:saveFormat}, (notification) => {
  // notification.saveFormat = notification.saveFormat || 'json';
  // notification.parentId = notification.parentId || '.company.with_img';
  process.send(notification); // Send notifications to the parent process
});