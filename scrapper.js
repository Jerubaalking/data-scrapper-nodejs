const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}
async function loadHtml(html){
  return cheerio.load(html);
}

async function scrapeData(html, params, notifyCallback) {
  try {
    const $ = loadHtml(html);

    let mappedData = []; // Rename companies to mappedData
    let totalPages = 1;

    // Check if mapperContext is provided
    if (params.mapperContext) {
      const { pagination } = params.mapperContext;

      // If pagination is specified in mapperContext, attempt to detect pagination elements
      if (pagination) {
        const { parentId, selectors } = pagination;

        // Attempt to find pagination elements based on provided selectors
        for (let i = 0; i < selectors.length; i++) {
          const paginationElements = $(parentId).find(selectors[i]);

          // If pagination elements are found, determine total pages
          if (paginationElements.length > 0) {
            totalPages = paginationElements.length;
            break;
          }
        }
      }
    }

    // Scraping loop
    for (let page = 1; page <= totalPages; page++) {
      const pageUrl = page === 1 ? `${params.url}` : `${params.url}/${page}`;

      try {
        const pageHtml = await fetchData(pageUrl);
        console.log("Page HTML:", pageHtml); // Log page HTML

        const pageMappedData = scrapePageData(pageHtml, params);
        console.log("Page Mapped Data:", pageMappedData); // Log page companies

        mappedData.push(...pageMappedData); // Rename companies to mappedData
        notifyCallback({ status: "progress", page });
      } catch (error) {
        console.error("Error fetching or scraping page data:", error.message);
        notifyCallback({ status: "error", error: error.message });
      }
    }

    return mappedData; // Rename companies to mappedData
  } catch (error) {
    notifyCallback({ status: "error", error: error });
  }
}

// ... (rest of the code)

function scrapePageData(html, params) {
  const $ = loadHtml(html);

  const pageCompanies = [];
  const mapperContext = params.mapperContext || {};

  console.log("scrap page data html", mapperContext);
  $(mapperContext.parentId).each((index, element) => {
    const company = {};

    // Extract data based on mapper context
    for (const key in mapperContext.fields) {
      const field = mapperContext.fields[key];
      const value = $(element).find(field.selector).text().trim();
      company[key] = value;
    }

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

module.exports = { fetchData, scrapeData, saveToCSV, saveToJson, loadHtml};
