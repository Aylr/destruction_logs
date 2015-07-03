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

Template.logFormTemplate.events({
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
    "submit form.lot_form": function(event, template) { // on "Lot Lookup" button
        event.preventDefault();
        console.log("Looking up lot...");

        var lot = event.target.lotNumber.value; // get lot from form

        Meteor.call('lookup', lot, function(error, result) {

            var parsed = JSON.parse(result.content);
            var controlled_drug_count = parsed.object.result.length;

            console.log("Controlled Drug Count: " + controlled_drug_count);

            if (controlled_drug_count <= 0) {
                console.log("ERROR :: None found");
                $("div.error").html("Lot Error :: None found");
            } else {
                for (i = 0; i < controlled_drug_count; i++) {
                    console.log("Drug " + i + ": " + parsed.object.result[i].name + " " + parsed.object.result[i].ndc + " " + parsed.object.result[i].total + parsed.object.result[i].uom);

                    var date = new Date();
                    var NDC = parsed.object.result[i].ndc;
                    var drug = parsed.object.result[i].name;
                    var quantity = parsed.object.result[i].total;
                    var uom = parsed.object.result[i].uom;
                    var lot_yield = parsed.object.targetYield;

                    var temp_object = {
                        date: date,
                        NDC: NDC,
                        drug: drug,
                        quantity: quantity,
                        uom: uom,
                        lot_yield: lot_yield
                    };

                    console.log(temp_object);

                    $("input#drug_name").val(drug);
                    $("input#NDC").val(NDC);
                    $("input#lot_drug_used").val(quantity);
                    $("input#lot_yield").val(lot_yield);
                    $("input#units").val(uom);
                }
            }

            console.log("parsed.object.result");
            console.log(parsed.object.result);

            // if(parsed.message == "Lookup failed."){
            // 	console.log(parsed.message);
            // } else {
            // 	console.log(parsed.message);
            // }


        });


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
