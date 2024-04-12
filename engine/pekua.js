const axios = require("axios");
const fs = require("fs");

async function fetchData(url, notifyCallback) {
  try {
    notifyCallback({ status: "axios fetching", url });
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      notifyCallback({
        status: "error",
        error: "The request timed out. Please try again later."
      });
    } else {
      let eer = error.message.split("\n")[0];
      if (error.message.includes("Cannot find module")) {
        notifyCallback({
          status: "error",
          error: eer + ". run npm install " + eer.split("'")[1],
        });
      } else {
        notifyCallback({ status: "error", error: error });
      }
    }
  }
}

async function loadHtml(html, notifyCallback) {
  try {
    const cheerio = require("cheerio");
    return cheerio.load(`${html}`);
  } catch (error) {
    let eer = error.message.split("\n")[0];
    if (error.message.includes("Cannot find module")) {
      notifyCallback({
        status: "error",
        error: eer + ". run npm install " + eer.split("'")[1],
      });
    } else {
      notifyCallback({ status: "error", error: "Failed to load cheerio! " + error.message });
    }
    return null;
  }
}

async function scrapeData(html, params, notifyCallback) {
  try {
    const $ = await loadHtml(html, notifyCallback);
    if ($) {
      let mappedData = [];
      let totalPages = 1;

      if (params.mapperContext) {
        const { pagination } = params.mapperContext;

        if (pagination) {
          const { parentId, selectors } = pagination;

          for (let i = 0; i < selectors.length; i++) {
            const paginationElements = $(parentId).find(selectors[i]);

            if (paginationElements.length > 0) {
              totalPages = paginationElements.length;
              break;
            }
          }
        }
      }

      for (let page = 1; page <= totalPages; page++) {
        const pageUrl = page === 1 ? `${params.url}` : `${params.url}/${page}`;

        try {
          const pageHtml = await fetchData(pageUrl, notifyCallback);
          if (pageHtml) {
            const pageMappedData = scrapePageData(pageHtml, params, notifyCallback);
            mappedData.push(...pageMappedData);
            notifyCallback({ status: "progress", page });
          } else {
            notifyCallback({
              status: "failed",
              message: "failed to fetch html!",
            });
          }
        } catch (error) {
          notifyCallback({ status: "error", error: error.message });
        }
      }

      return mappedData;
    } else {
      notifyCallback({ status: "error", error: "cheerio not loaded!" });
      return null;
    }
  } catch (error) {
    notifyCallback({ status: "error", error: error.message });
    return null;
  }
}

async function scrapePageData(html, params, notifyCallback) {
  try {
    const $ = await loadHtml(html, notifyCallback);
    if ($) {
      const pageData = [];
      const mapperContext = params.mapperContext || {};

      $(mapperContext.parentId).each((index, element) => {
        const company = {};

        for (const key in mapperContext.fields) {
          const field = mapperContext.fields[key];
          const value = $(element).find(field.selector).text().trim();
          company[key] = value;
        }

        pageData.push(company);
      });

      return pageData;
    } else {
      notifyCallback({ status: "error", error: "failed to load cheerio" });
      return null;
    }
  } catch (error) {
    notifyCallback({ status: "error", error: error.message });
    return null;
  }
}

function saveToCSV(data, filePath) {
  const csvContent = data
    .map(
      (company) =>
        `${company.name},${company.address},${company.description},${company.logo}`
    )
    .join("\n");
  fs.writeFileSync(filePath, csvContent);
  // console.log("Data saved to CSV:", filePath);
}

function saveToJson(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);
    // console.log("Data saved to JSON:", filePath);
  } catch (error) {
    console.error("Error saving data to JSON:", error);
    throw error;
  }
}

module.exports = { fetchData, scrapeData, saveToCSV, saveToJson };
