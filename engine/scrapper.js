const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const Scrapper = require('../engine/processing/scrapper');

async function main(url, params = { elementId, limit, pages, saveFormat, region, start }, notifyCallback) {
  try {
    const scrapper = new Scrapper();
    const html = await scrapper.fetchData(url);
    // const jsonFilepath = './scraped_data.json';
    // Notify the client that scraping has started
    notifyCallback({ status: 'start' });


    console.log("data ===>>", await params);
    // Specify the path where you want to save the output file// Specify the path where you want to save the output file
    const filePath = path.join(__dirname, "../data");
    if (params.saveFormat == 'csv') {
      console.log("am here please CSVVVV", params)
      const scrapedDataCSV = await scrapper.scrapeData(html, { ...params, url: url }, notifyCallback);
      scrapper.saveToCSV(scrapedDataCSV, filePath + "/csv/scraped_data.csv");
    } else {
      console.log("am here please JSONNNN", params)
      const scrapedDataJSON = await scrapper.scrapeData(html, { ...params, url: url }, notifyCallback);
      scrapper.saveToCSV(scrapedDataJSON, filePath + "/json/scraped_data.json");
    }
    // switch (await params.saveFormat) {
    //   case 'csv' | '.csv':
    //     break;
    //   case "json" | ".json":
    //     break;
    //   default:
    //     console.log("am here please DEFAULT", params)
    //     const scrapedData = await scrapper.scrapeData(html, { ...params, url: url }, notifyCallback);
    //     await scrapper.saveToJson(await scrapedData, filePath + "/csv/scraped_data.json");
    //     break;
    // }

    // Notify the client that scraping is done
    notifyCallback({ status: 'done' });
  } catch (error) {
    console.error("Main process error:", error);
    // Notify the client about the error
    notifyCallback({ status: 'error', error: error.message });
  }
}

module.exports = { main };
