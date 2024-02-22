const express = require('express');
const { fork } = require('child_process');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();

// Set up Handlebars as the view engine
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/scrape', (req, res) => {
  try {
    const {url, elementId, limit, pages, saveFormat} = req.query;
    console.log(elementId, url,limit, pages, saveFormat)
    // Spawn the child process
    const scraperChild = fork(path.join(__dirname, 'scraperChild.js'), [url,elementId, limit,pages,saveFormat]);

    const notifications = [];

    // Listen for messages from the child process
    scraperChild.on('message', (notification) => {
      // Handle notifications here (e.g., update UI based on the notification)
      console.log('Notification from child process:', notification);
      notifications.push(notification);
    });

    // Handle child process exit
    scraperChild.on('exit', (code) => {
      console.log('Child process exited with code', code);

      // Send the response once, after processing all notifications
      res.send(notifications);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/businesses', async (req, res) => {
  try {
    // Read the scraped data from the file
    const businesses = [require('./scraped_data.json')];
    console.log("am here", businesses);
    // Render the 'businesses' view with the data
    res.render('businesses', { businesses:businesses });
  } catch (error) {
    console.error('Error rendering businesses page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
