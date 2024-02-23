const Handlebars = require('handlebars');


var register = function (Handlebars) {
    var helpers = {

        ifEquals: function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },

        ifRowsValueExist: function (rows, value, options) {
            var k = [];
            rows.forEach(row => {
                if (row.role == value) {
                    k.push(true);
                } else {
                    k.push(false);
                }
            });
            console.log(k);
            if (k.includes(true)) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        // register helpers
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        // just return helpers object if we can't register helpers here
        return helpers;
    }
};
var decimalSeparator = () => {

}
module.exports.register = register;
module.exports.helpers = register(Handlebars.ExpressHandlebars); 