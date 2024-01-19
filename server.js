const express = require('express');
const { main } = require('./scrapper');
const app = express();
const fs = require("fs");
const path = require("path");
const {engine} = require('express-handlebars');

// Set up Handlebars as the view engine
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/scrape', async (req, res)=>{
    // await main(req.query.url, req.query); 
    let businesses = fs.readFileSync(__dirname+'/scraped_data.json');
    await res.render('businesses', {businesses: JSON.parse(businesses), url:req.query.url});
});
app.listen(3000, ()=>{
  console.log('server running on port 3000');
});
