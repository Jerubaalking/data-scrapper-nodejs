const { fetchData, saveToCSV, saveToJson, scrapeData } = require("./pekua");
const path = require("path");

async function main(
  url,
  params = { mapperContext, limit, pages, saveFormat, savePath },
  notifyCallback
) {
  try {
    const html = await fetchData(url, notifyCallback);

    // Notify the client that scraping has started
    notifyCallback({ status: "start" });

    const scrapedData = await scrapeData(
      html,
      { ...params, url: url },
      notifyCallback
    );
    if (scrapedData) {
      // Specify the path where you want to save the output file// Specify the path where you want to save the output file
      const filePath = path.join(
        __dirname,
        params.savePath ? params.savePath : "scrapped_data"
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
      notifyCallback({ status: "closing", message: "Pekuzi is closing" });
    }else{
      // Notify the client that scraping is done
      notifyCallback({ status: "closing", message: "Pekuzi could not retrive data!" });
    }
  } catch (error) {
    console.error("Main process error:", error);
    // Notify the client about the error
    notifyCallback({ status: "error", error: error.message });
  }
}

module.exports = { main };
