const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

class Scrapper {
    constructor() {
    }
    async fetchData(url) {
        try {
            const response = await axios.get(url);
            return await response.data;
        } catch (error) {
            console.error("Error fetching data:", error.message);
            // Remove the following line if you don't want to rethrow the error
            throw error;
        }
    }

    // Helper function to compare objects for equality
    compareObjects(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    }

    async scrapeData(html, params, notifyCallback) {
        const $ = cheerio.load(html);

        const companies = [];
        // const totalPages = (parseInt($(".pages_no").last().text()) > 100) ? params.pages : parseInt($(".pages_no").last().text());

        const lastPage = parseInt(params.start) + parseInt(params.pages);
        console.log("fetching page URL 1--->>", lastPage);
        for (let page = params.start | 1; page <= lastPage; page++) {
            const pageUrl = (page === 1) ? `${params.url}${params.region}` : `${params.url}${params.region}/${page}`;

            try {
                console.log("fetching page URL --->>", pageUrl)
                const pageHtml = await this.fetchData(pageUrl);
                // console.log("Page HTML:", pageHtml); // Log page HTML

                const pageCompanies = this.scrapePageData(pageHtml, params, pageUrl);
                // console.log("Page Companies:", await pageCompanies); // Log page companies

                companies.push(...await pageCompanies);
                console.log("thus is the scrapped data", await pageCompanies);
                notifyCallback({ status: 'progress', page });
            } catch (error) {
                console.error("Error fetching or scraping page data:", error.message);
                notifyCallback({ status: 'error', error: error.message });
            }
        }
        return companies;
    }

    async scrapeCompanyExtraDetails(companyLink) {
        const companyDetails = {};
        try {


            // Fetch the HTML of the company's individual page (you need to implement this function)

            const response = await axios.get(companyLink);
            // return await response.data;

            const companyHtml = await response.data;
            // console.log("fetching link ====>>", response.data);
            // // Load the company's HTML using Cheerio
            const company$ = await cheerio.load(await companyHtml);

            // // Define the parent class containing the .cmp_details_in elements
            const parentClass = '.cmp_details';

            // // Iterate through each .cmp_details_in element
            company$(parentClass + ' .cmp_details_in').each((index, cmpDetailsInElement) => {
                var locationData = {};

                // Find .info elements inside each .cmp_details_in element
                company$(cmpDetailsInElement).find('.info').each((infoIndex, infoElement) => {
                    // Iterate through each .location div inside the .info div
                    company$(infoElement).find('.location').each((locationIndex, locationElement) => {
                        const label = company$(locationElement).prev('.label').text().trim();
                        const text = company$(locationElement).text().trim();
                        companyDetails[label.toLowerCase()] = text;
                    });
                    company$(infoElement).find('.phone').each((locationIndex, locationElement) => {
                        const label = company$(locationElement).prev('.label').text().trim();
                        const text = company$(locationElement).text().trim();
                        companyDetails['phone'] = text;
                    });
                    // Extract mobile number
                    const mobileNumber = company$('.info .label:contains("Mobile phone")').next('.text').text().trim();
                    companyDetails['mobileNumber'] = mobileNumber;

                    // Extract website
                    // const website = company$('.info .label:contains("Website")').next('.text.weblinks a').attr('href');
                    // companyDetails['website'] = website;

                    company$(infoElement).find('.weblinks').each((locationIndex, locationElement) => {
                        const label = company$(locationElement).prev('.label').text().trim();
                        const text = company$(locationElement).text().trim();
                        companyDetails['website'] = text;
                    });
                });
                // console.log("business fetched data inside ====>", companyDetails);
                // Add the location data to the company details object

            });

            return companyDetails;
        } catch (error) {
            console.log("error in business ===>>", error.message);
        }
    }
    async scrapePageData(html, params, pageUrl) {
        const $ = await cheerio.load(html);

        const pageCompanies = [];
        const parentId = '.company.with_img';

        // Use a traditional for loop to handle asynchronous operations
        for (let index = 0; index < $(parentId).length; index++) {
            const element = $(parentId).eq(index);

            const company = {};
            company.name = element.find("h4 a").text().trim();
            company.address = element.find(".address").text().trim();
            company.description = element.find(".desc").text().trim();
            company.logo = element.find(".logo img").attr("data-src");

            const companyLink = pageUrl.split('.com/')[0] + '.com' + element.find("h4 a").attr('href');

            if (companyLink) {
                const companyDetails = await this.scrapeCompanyExtraDetails(companyLink);
                company['phone'] = await companyDetails.phone;
                company['mobileNumber'] = await companyDetails.mobileNumber;
                company['website'] = await companyDetails.website;

                pageCompanies.push(company);
            }
        }

        // console.log("thus the companies", pageCompanies);
        return pageCompanies;
    }


    async saveToCSV(data, filePath) {
        const csvContent = data
            .map(
                (company) =>
                    `${company.name},${company.address},${company.description},${company.phone},${company.mobile},${company.website}`
            )
            .join("\n");
        fs.writeFileSync(filePath, csvContent);
        console.log("Data saved to CSV:", filePath);
    }

    async saveToJson(data, filePath) {
        try {
            let existingData = [];

            // Read existing data from the file if it exists
            if (fs.existsSync(filePath)) {
                const existingJson = await fs.readFileSync(filePath, 'utf-8');
                existingData = JSON.parse(await existingJson);
            }

            // Check for duplicates and append only unique data
            data.forEach(async newItem => {
                if (!existingData.some(existingItem => this.compareObjects(existingItem, newItem))) {
                    existingData.push(await newItem);
                }
            });

            const jsonData = JSON.stringify(await existingData, null, 2);
            // console.log("data to write", await jsonData);
            fs.writeFileSync(filePath, await jsonData);
            console.log('Data saved to JSON1:', filePath);
        } catch (error) {
            console.error('Error saving data to JSON:', error);
            throw error;
        }
    }
}

module.exports = Scrapper;
