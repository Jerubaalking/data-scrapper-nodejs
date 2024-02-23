const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return await response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function scrapeData(html) {
  const $ = cheerio.load(html);

  // Replace the following selectors and logic with the specific structure of the target website
  const data = [];
  for (let x = 0; x < 300; x++) {
    $('#cmap_' + x).each((i, element) => {
      const item = $(element).text();
      data.push(item);
    });
  }

  return data;
}

function saveToJson(data, filePath) {
  const jsonData = JSON.stringify(data, null, 2);
  addObjectIfNotExists(filePath, jsonData);
  // fs.writeFileSync(filePath, jsonData);
  console.log('Data saved to JSON 2:', filePath);
}

function addObjectIfNotExists(filename, newObj) {
  // Read the existing JSON file
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      // Handle file read error
      console.error('Error reading file:', err);
      return;
    }

    let existingData = [];

    try {
      // Parse the existing data
      existingData = JSON.parse(data);
    } catch (parseError) {
      // Handle JSON parse error
      console.error('Error parsing JSON:', parseError);
      return;
    }

    // Check if the new object already exists
    const objectExists = existingData.some(obj => JSON.stringify(obj) === JSON.stringify(newObj));

    if (!objectExists) {
      // Add the new object to the existing data
      existingData.push(newObj);

      // Write the updated data back to the file
      fs.writeFile(filename, JSON.stringify(existingData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          // Handle file write error
          console.error('Error writing file:', writeErr);
        } else {
          console.log('Object added successfully.');
        }
      });
    } else {
      console.log('Object already exists in the file.');
    }
  });
}

async function main(url) {
  try {
    const html = await fetchData(url);
    const scrapedData = await scrapeData(html);

    // Specify the path where you want to save the JSON file
    const jsonFilePath = path.join(__dirname, 'scraped_data.json');

    saveToJson(scrapedData, jsonFilePath);
  } catch (error) {
    console.error('Main process error:', error);
  }
}

module.exports = { main };
