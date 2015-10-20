Template.logTableTemplate.helpers({
    destructionLogs: function() {
        return destructionLogs.find();
    }
});

Template.batchListTemplate.helpers({
    batches: function() {
        return batches.find();
    }
});

Template.calculationFormTemplate.events({
    "submit form.log_form": function(event) {
        event.preventDefault();

        destructionLogs.insert({
            date: new Date(),
            NDC: event.target.NDC.value,
            drug_name: event.target.drug_name.value,
            quantity: event.target.total_quantity.value,
            units: event.target.units.value
        });

        $("form input[type=text]").val("");
    },
    "click #clear": function() {
        $("form input[type=text]").val("");
        console.log("form cleared");
    },
    "submit form.calculation_form": function(event, template) {
        event.preventDefault();
        console.log("Calculating...");
        var disposal_count = event.target.disposal_quantity.value;
        var lot_yield = event.target.lot_yield.value;
        var lot_drug_used = event.target.lot_drug_used.value;

        var amount_per_disposed_item = function(count, lot_yield, total_drug) {
            // probably need some sanitization and error catching here

            var amount_per = (count) * (total_drug / lot_yield);
            return amount_per;
        }

        var total_qty = amount_per_disposed_item(disposal_count, lot_yield, lot_drug_used);
        console.log("Total Qty:" + total_qty);

        $("input#total_quantity").val(total_qty);
    }
});

Template.lotLookupFormTemplate.events({
    "submit form.lot_form": function(event, template) { // on "Lot Lookup" button
        event.preventDefault();

        var lot = event.target.lotNumber.value; // get lot from form
        console.log("Looking up lot: " + lot);

        Meteor.call('lookup', lot, function(error, result) {

            var parsed = JSON.parse(result.content);

            if (parsed.success != true) { // if there's no JSON or if success = false
                console.log("ERROR :: Something went wrong");
            } else {
                var controlled_drug_count = parsed.object.result.length;
                console.log("Controlled Drug Count: " + controlled_drug_count);
                lot = parsed.value;

                if (controlled_drug_count <= 0) { // if there are no controlled drugs returned
                    console.log("ERROR :: None found");
                    $("div.error").html("Lot Error :: None found");
                } else {
                    var date = new Date();
                    var lot_yield = parsed.object.targetYield;

                    // build out object for insertion into db
                    var log_item = {
                        'date': new Date(),
                        'user_initials': 'not working yet',
                        'reason': 'not working yet',
                        'lot': lot,
                        'lot_yield': lot_yield,
                        'lot_yield_units': uom,
                        'destroyed_amount': null,
                        'drugs': []
                    }

                    // loop through each controlled drug and build out the log object
                    // and the table for the user.
                    for (i = 0; i < controlled_drug_count; i++) {
                        console.log("Drug " + i + ": " + parsed.object.result[i].name + " " + parsed.object.result[i].ndc + " " + parsed.object.result[i].total + parsed.object.result[i].uom);

                        var NDC = parsed.object.result[i].ndc;
                        var drug_name = parsed.object.result[i].name;
                        var quantity = parsed.object.result[i].total;
                        var uom = parsed.object.result[i].uom;

                        var temp_drug = {
                            'NDC' : NDC,
                            'name' : drug_name,
                            'quantity' : quantity,
                            'units' : uom
                        }

                        log_item.drugs.push(temp_drug);         // add this drug to the drugs array in the item object

                        console.log(temp_drug);

                        //update GUI

                        //$("input#drug_name").val(drug_name);
                        $("input#NDC").val(NDC);
                        $("input#lot_drug_used").val(quantity);
                        $("input#lot_yield").val(lot_yield);
                        $("input#units").val(uom);
                        $("h3 span.lot").html(lot);

                    }
                }

                console.log("log_item");
                console.log(log_item);
            }

        }); // end Meteor.call
    }
});
