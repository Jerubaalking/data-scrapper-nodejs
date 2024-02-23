const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
}

async function scrapeData(html, params, notifyCallback) {
  const $ = cheerio.load(html);

  const companies = [];
  const totalPages = (parseInt($(".pages_no").last().text()) > 100) ? params.pages : parseInt($(".pages_no").last().text());

  for (let page = 1; page <= totalPages; page++) {
    const pageUrl = page === 1 ? `${params.url}` : `${params.url}/${page}`;

    try {
      console.log("fetching page URL --->>", pageUrl)
      const pageHtml = await fetchData(pageUrl);
      console.log("Page HTML:", pageHtml); // Log page HTML

      const pageCompanies = scrapePageData(pageHtml, params);
      console.log("Page Companies:", pageCompanies); // Log page companies

      companies.push(...pageCompanies);
      notifyCallback({ status: 'progress', page });
    } catch (error) {
      console.error("Error fetching or scraping page data:", error.message);
      notifyCallback({ status: 'error', error: error.message });
    }
  }

  return companies;
}


function scrapePageData(html, params) {
  const $ = cheerio.load(html);

  const pageCompanies = [];
  const parentId = '.company.with_img';

  console.log("scrap page data html", parentId);
  $(parentId).each((index, element) => {
    const company = {};
    console.log("element ==>>", element);
    // Extract data from each company div
    company.name = $(element).find("h4 a").text().trim();
    company.address = $(element).find(".address").text().trim();
    company.description = $(element).find(".desc").text().trim();
    company.logo = $(element).find(".logo img").attr("data-src");

    pageCompanies.push(company);
  });

  return pageCompanies;
}

function saveToCSV(data, filePath) {
  const csvContent = data
    .map(
      (company) =>
        `${company.name},${company.address},${company.description},${company.logo}`
    )
    .join("\n");
  fs.writeFileSync(filePath, csvContent);
  console.log("Data saved to CSV:", filePath);
}

function saveToJson(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);
    console.log("Data saved to JSON:", filePath);
  } catch (error) {
    console.error("Error saving data to JSON:", error);
    throw error;
  }
}


async function main(url, params = { elementId, limit, pages, saveFormat }, notifyCallback) {
  try {
    const html = await fetchData(url);

    // Notify the client that scraping has started
    notifyCallback({ status: 'start' });

    const scrapedData = await scrapeData(html, { ...params, url: url }, notifyCallback);

    // Specify the path where you want to save the output file// Specify the path where you want to save the output file
    const filePath = path.join(__dirname, "scraped_data");
    console.log("data ===>>", params);

    switch (params.saveFormat) {
      case "csv":
        saveToCSV(scrapedData, filePath + ".csv");
        break;
      default:
        saveToJson(scrapedData, filePath + ".json");
        break;
    }

    // Notify the client that scraping is done
    notifyCallback({ status: 'done' });
  } catch (error) {
    console.error("Main process error:", error);
    // Notify the client about the error
    notifyCallback({ status: 'error', error: error.message });
  }
}

module.exports = { main };
