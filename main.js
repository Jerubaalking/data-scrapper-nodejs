const { fetchData, saveToCSV, saveToJson, scrapeData } = require("./scrapper");
const path = require("path");

async function main(
  url,
  params = { elementId, limit, pages, saveFormat, savePath },
  notifyCallback
) {
  try {
    const html = await fetchData(url);

    // Notify the client that scraping has started
    notifyCallback({ status: "start" });

    const scrapedData = await scrapeData(
      html,
      { ...params, url: url },
      notifyCallback
    );

    // Specify the path where you want to save the output file// Specify the path where you want to save the output file
    const filePath = path.join(
      __dirname,
      savePath ? savePath : "scrapped_data"
    );
    // console.log("data ===>>",scrapedData);

    switch (params.saveFormat) {
      case "json":
        saveToJson(scrapedData, filePath + ".json");
        break;
      default:
        saveToCSV(scrapedData, filePath + ".csv");
        break;
    }

    // Notify the client that scraping is done
    notifyCallback({ status: "done" });
  } catch (error) {
    console.error("Main process error:", error);
    // Notify the client about the error
    notifyCallback({ status: "error", error: error.message });
  }
}

module.exports = { main };
