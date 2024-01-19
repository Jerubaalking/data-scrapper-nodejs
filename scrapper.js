const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');


async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function scrapeData(html,params) {
  const $ = cheerio.load(html);
  
  // Replace the following selectors and logic with the specific structure of the target website
  const data = [];
  for (let x = 0; x < params.limit; x++) {
    $('#'+params.elementId+x).each((i, element) => {
        const item = $(element).text();
        data.push(item);
      });
  }
  

  return data;
}

function saveToCSV(data, filePath) {
  const csvContent = data.join('\n');
  fs.writeFileSync(filePath, csvContent);
  console.log('Data saved to CSV:', filePath);
}


function saveToJson(data, filePath) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData);
  console.log('Data saved to JSON:', filePath);
}

async function main(url, params={saveFormat, limit, elementId}) {
  try {
    const html = await fetchData(url);
    const scrapedData = await scrapeData(html, params);

    // Specify the path where you want to save the CSV file
    const csvFilePath = path.join(__dirname, 'scraped_data.csv');
    switch (params.saveFormat) {
      case 'json':
        saveToJson(scrapedData, csvFilePath);
        
        break;
    
      default:
        saveToCSV(scrapedData, csvFilePath);
        break;
    }
  } catch (error) {
    console.error('Main process error:', error);
  }
}

module.exports = {main};
