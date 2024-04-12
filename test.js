const pekuzi = require('./index');
const url = "https://serversideup.net/post-put-and-patch-requests-with-nuxt-3/";
const mapperContext = {
    parentId: '.company.with_img',
    fields: {
      name: { selector: 'h4 a' },
      address: { selector: '.address' },
      description: { selector: '.desc' },
      logo: { selector: '.logo img', attribute: 'data-src' }
    }
  };
  try {
    new pekuzi(
        url,{
        params:{mapperContext},
        limit:20,
        pages:1,
        saveFormat:'.json',
        savePath:'/'
    });
    
  } catch (error) {
        console.log(error);
  }
