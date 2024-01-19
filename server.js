const express = require('express');
const { main } = require('./scrapper');
const app = express();

app.get('/', (req, res)=>{
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Web Scraper Input</title>
    </head>
    <body>
      <h2>Web Scraper Input</h2>
      <form id="scraperForm">
        <label for="url">Website URL:</label>
        <input type="text" id="url" name="url" required>
        <br>
        <label for="limit">Item Limit</label>
        <input type="text" id="limit" name="limit" required>
        <br>
        <label for="elementId">Element ID (#)</label>
        <input type="text" id="elementId" name="elementId" required>
        <br>
        <label for="saveFormat">Save format (csv/json))</label>
        <input type="text" id="saveFormat" name="saveFormat" required>
        <br>
        <button type="button" onclick="submitForm()">Scrape Data</button>
      </form>
    
      <script>
        function submitForm() {
          const url = document.getElementById('url').value;
          const elementId = document.getElementById('elementId').value;
          const limit = document.getElementById('limit').value;
          const saveFormat = document.getElementById('saveFormat').value;
          if (url.trim() !== '') {
            // You can modify this URL as needed
            const scraperURL = '/scrape?url='+encodeURIComponent(url)+'&limit='+limit+'&elementId='+elementId+'&saveFormat='+saveFormat;
            window.location.href = scraperURL;
          } else {
            alert('Please enter a valid URL.');
          }
        }
      </script>
    </body>
    </html>
    `);
});

app.get('/scrape', async (req, res)=>{
  const {url, saveFormat,limit, elementId} = req.query;
  console.log(req.query, saveFormat, limit, elementId);
    await main(url, req.query);
    await res.send("Done!")
});
app.listen(3000, ()=>{
    console.log('server running on port 3000');
});