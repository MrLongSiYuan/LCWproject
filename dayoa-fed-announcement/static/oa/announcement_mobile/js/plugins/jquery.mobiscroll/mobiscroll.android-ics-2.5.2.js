define(function(require, exports, module){

    (function ($) {
        var theme = {
            defaults: {
                dateOrder: 'Mddyy',
                mode: 'mixed',
                rows: 5,
                width: 70,
                height: 36,
                showLabel: false,
                useShortLabels: true
            }
        }

        $.mobiscrollDT.themes['android-ics'] = theme;
        $.mobiscrollDT.themes['android-ics light'] = theme;

    })(jQuery);

})



