const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

async function scrapeData(html, params) {
  const $ = cheerio.load(html);

  const companies = [];
  const totalPages = (parseInt($(".pages_no").last().text())>100)? 10 : parseInt($(".pages_no").last().text()); // Extract total number of pages
  console.log("page numbers", totalPages);
  for (let page = 1; page <= totalPages; page++) {
    const pageUrl = page === 1 ? `${params.baseUrl}` : `${params.baseUrl}/${page}`;
    
    const pageHtml = await fetchData(pageUrl);

    const pageCompanies = scrapePageData(pageHtml, params);
    companies.push(...pageCompanies);
  }

  return companies;
}

function scrapePageData(html, params) {
  const $ = cheerio.load(html);

  const pageCompanies = [];
  const parentId = params.parentId;

  console.log("scrap page data html", parentId);
  $(parentId).each((index, element) => {
    const company = {};
    // const elementId = `cmap_${index}`;
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
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData);
  console.log("Data saved to JSON:", filePath);
}

async function main(url, params = { saveFormat: "csv", parentId: "listings" }) {
  try {
    const html = await fetchData(url);
    const scrapedData = await scrapeData(html, { ...params, baseUrl: url });

    // Specify the path where you want to save the output file
    const filePath = path.join(__dirname, "scraped_data");

    switch (params.saveFormat) {
      case "json":
        saveToJson(scrapedData, filePath + ".json");
        break;
      default:
        saveToCSV(scrapedData, filePath + ".csv");
        break;
    }
  } catch (error) {
    console.error("Main process error:", error);
  }
}

module.exports = { main };
