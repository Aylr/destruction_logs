destructionLogs = new Mongo.Collection('destructionLogs');
batches = new Mongo.Collection('batches');


if (Meteor.isClient) {
    Template.registerHelper('formattedDate', function(date) {
        return moment(date).format('MM-DD-YYYY');
    });
};

if (Meteor.isServer) {
    Meteor.methods({
        lookup: function(lot) {
            var url = 'http://192.168.1.202/api/lot/controlled-amounts/' + lot;
            //url = "http://localhost:3000/fake_data.json";		// fake server data for offline testing
            url = 'http://localhost:8000/api/lot/controlled-amounts/' + lot;
            var lookup = Meteor.http.call("GET", url); // server does not require asynchronous callback
            console.log(lookup);

            return lookup;
        }
    });
};