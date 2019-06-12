jQuery.noConflict();
(function($) {
    "use strict";

    kintone.events.on([
        "app.record.create.change.number1",
        "app.record.edit.change.number1"
    ], function(event) {
        event.record.number3.value = event.record.number1.value + event.record.number2.value
        return event;
    });

    kintone.events.on([
        "app.record.create.change.number2",
        "app.record.edit.change.number2"
    ], function(event) {
        event.record.number3.value = event.record.number1.value + event.record.number2.value
        
        return event;
    });
    
})(jQuery);
