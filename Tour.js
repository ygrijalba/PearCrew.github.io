var tour = {};
(function($) {
    var $li_css = $('<style/>');
    $li_css.appendTo('head');
    $li_css.append('.help-li { font-size: 1.2rem; line-height: 1.6rem; cursor: pointer; text-decoration: underline;color: white; }\
                 .help-li:hover {font-weight: 600;}');
    var settings = {
        data: [],
        autoStart: false,
        controlsPosition: 'TR',
        useOverlay: true,
        overlayZindex: 10,
        keyboard: true, /* Option for keyboard */
        welcomeMessage: '<h2>Sorry!</h2>There is no help available for this page yet.</p>',
        buttons: {
            next  : { text : '', class : ''},
            prev  : { text : '', class: '' },
            start : { text : '', class: '' },
            end   : { text : '', class: '' }
        },
        controlsCss: {
            background: 'rgba(8, 68, 142, 0.80)',
            color: '#fff'
        },
        tooltipCss: {
            background: 'rgba(0, 0, 0, 0.70)',
            color: '#fff'
        }
    };

    var options, step, steps;
    var ew, eh, el, et;
    var started = false;
    var $overlay;

    var $tooltip = $('<div>', {
        id: 'tourtip',
        className: 'tourtip',
        html: ''
    }).css({
        'display': 'none',
        'padding': '10px 20px',
        'position': 'absolute',
        'font-family': 'sans-serif',
        'border-radius': '5px',
        'font-size': '12px',
        'box-sizing': 'border-box',
        'z-index' : '2000'
    });

    var methods = {
        init: function(opts, startFrom) {
            options = $.extend(settings, opts);
            startFrom = (typeof(startFrom) == 'undefined') ? null : startFrom-1;

            if (started == false) {
                started = true;
                options.data.unshift({ element : 'body', tooltip: null, text: options.welcomeMessage });
                controls = '<div id="tourControls">\
                            <div id="tourText">'+options.welcomeMessage+'</div>\
                            <ul>';
                  
                var btnTour_style = 'background-color: transparent; border-radius: 25px; font-size: 25px;';
                for(var i = 1; i < options.data.length; i++)
                {
                    controls +=  '<li id="help' +i+ '" value="'+i+'" class="help-li">' + options.data[i].label + '</li>';
                }

                controls += '</ul>\
                            <div id="tourButtons">\
                                <button id="tourPrev" style="'+btnTour_style+' display:none" class="t-Button t-Button--icon t-Button--iconLeft t-Button--hot'+options.buttons.prev.class+'" type="button">\
                                    <span class="'+options.buttons.prev.iconclass+'" aria-hidden="true"></span>\
                                    <span class="t-Button-label">' + options.buttons.prev.text + '</span>\
                                </button>\
                                <button id="tourNext" style="'+btnTour_style+'" class="t-Button t-Button--icon t-Button--iconLeft  t-Button--hot'+options.buttons.start.class+'" type="button">\
                                    <span id="tourNextIcon" class="'+options.buttons.start.iconclass+'" aria-hidden="true"></span>\
                                    <span id="tourNextText" class="t-Button-label">' + options.buttons.start.text + '</span>\
                                </button>\
                                <button id="tourEnd" style="'+btnTour_style+' display:none" class="t-Button t-Button--icon t-Button--iconLeft  t-Button--hot'+options.buttons.end.class+'" type="button">\
                                    <span class="'+options.buttons.end.iconclass+'" aria-hidden="true"></span>\
                                    <span class="t-Button-label">' + options.buttons.end.text + '</span>\
                                </button>\
                            </div>\
                            </div>';
                $controlsCss = { 'display': 'block', 'position': 'fixed', 'width': '200px', 'padding': '10px 20px', 'border-radius': '10px', 'font-family': 'sans-serif', 'z-index': '1000' };
                $controls = $(controls).css($controlsCss).css(options.controlsCss);
                $cpos = methods.getControlPosition(options.controlsPosition);
                $controls.css($cpos);
                $('body').append($controls);

                $tooltip.css(options.tooltipCss);

                step = 0;
                steps = options.data.length;
                $('body').prepend($tooltip);
            }

            if (startFrom != null) {
                step = startFrom;
                stepData = options.data[startFrom];
                methods.setTooltip(step, stepData);
            }

            methods.bindElements();
        },
        next: function() {
            // previous step location
            if (step > -1 && options.data[step].hasOwnProperty('location') && typeof(options.data[step].location) != 'undefined') {
                location.href = options.data[step].location;
            } else {
                step++;

                if (step == steps) {
                    methods.destroy();
                } else {
                    $tooltip.hide();
                    stepData = options.data[step];
                    methods.setTooltip(step, stepData, 'next');
                }
            }
        },
        prev: function() {
            $tooltip.hide();

            if (step <= 0) {
                step--;
            } else {
                step--;
                stepData = options.data[step];

                methods.setTooltip(step, stepData, 'prev');
            }
        },
        goto: function(this_step) {
            step = (this_step - 1);
            // previous step location
            if (step > -1 && options.data[step].hasOwnProperty('location') && typeof(options.data[step].location) != 'undefined') {
                location.href = options.data[step].location;
            } else {
                step++;

                if (step == steps) {
                    methods.destroy();
                } else {
                    $tooltip.hide();
                    stepData = options.data[step];
                    methods.setTooltip(step, stepData, 'next');
                }
            }
            
        },
        setTooltip: function(step, stepData, dir) {
            if (options.useOverlay) {
                if (!$overlay) {
                    $overlay = $('<div id="touroverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: '+options.overlayZindex+'; background-color: rgba(0,0,0,0.5);">');
                }
                $('body').append($overlay);
                $overlay.click(function(){
                    methods.destroy();
                 });
            }
            
            $previousElement = (dir == 'next') ? $(options.data[step-1].element) : $(options.data[step+1].element);
            if (typeof $previousElement.data('tour-data') != 'undefined') {
                previous_data = $previousElement.data('tour-data');
                $previousElement.css('position', previous_data.position);
                $previousElement.css('z-index', previous_data.zindex);    
            }

            $element = $(stepData.element).eq(0);
            tour_data = { 'zindex' : $element.css('z-index'), 'position' : $element.css('position'), 'background-color' : $element.css('background-color') };
            $element.data('tour-data', tour_data);
            $element.css('position', 'relative').css('z-index', 459)
            if (options.useOverlay) {
                bgc = ($element.css('background-color') == 'transparent') ? methods.findParentBg($element) : $element.css('background-color');    
                $element.css('background-color', bgc);
            }

            if (typeof stepData.callback != 'undefined' && typeof stepData.callback == 'function') {
                stepData.callback();
            }

            if (stepData.controlsPosition) {
                methods.setControlsPosition(stepData.controlsPosition);
            }

            if (stepData.tooltip != null) {

                tooltipContent = stepData.tooltip;

                if (typeof stepData.files != 'undefined' && stepData.files.length > 0) {
                    tooltipContent += '<hr>';
                    $.each(stepData.files, function(f, file){
                        tooltipContent += '<a href="'+file.url+'" target="_blank">'+file.name+'</a><br>';
                    });
                }

                $tooltip.html(tooltipContent);

                if (stepData.text) {
                    $('#tourText').html(stepData.text);
                }

                
                tooltipPos = (typeof stepData.position == 'undefined') ? 'BL' : stepData.position;
                $pos = methods.getTooltipPosition(tooltipPos, $element);
                var maxWidth = $(stepData.element).width();
                $tooltip.css({ 'top': $pos.top + 'px', 'left': $pos.left + 'px', 'max-width': maxWidth + 'px' });
                $tooltip.show('fast');

                $.scrollTo(stepData.element, 200, { offset: -225 });    
            }
           
            if (step == steps) {
                methods.destroy();
            }

            methods.showHideButtons();
        },
        setControlsPosition: function(pos) {
            chtml = $controls.html();
            $controls.remove();
            $controls = $(controls).html(chtml);
            $controls = $controls.css($controlsCss).css(options.controlsCss);
            position = methods.getControlPosition(pos);
            $controls.css(position);
            $('body').append($controls);
        },
        getTooltipPosition: function(pos, $e) {
            ew = $element.outerWidth();
            eh = $element.outerHeight();
            el = $element.offset().left;
            et = $element.offset().top;
            tw = $tooltip.width() + parseInt($tooltip.css('padding-left')) + parseInt($tooltip.css('padding-right'));
            th = $tooltip.height() + parseInt($tooltip.css('padding-top')) + +parseInt($tooltip.css('padding-bottom'));

            $('.tourArrow').remove();
            tbg = $tooltip.css('background-color');

            $upArrow = $('<div class="tourArrow"></div>').css({ 'position': 'absolute', 'display': 'block', 'width': '0', 'height': '0', 'border-left': '5px solid transparent', 'border-right': '5px solid transparent', 'border-bottom': '5px solid ' + tbg });
            $downArrow = $('<div class="tourArrow"></div>').css({ 'position': 'absolute', 'display': 'block', 'width': '0', 'height': '0', 'border-left': '5px solid transparent', 'border-right': '5px solid transparent', 'border-top': '5px solid ' + tbg });
            $rightArrow = $('<div class="tourArrow"></div>').css({ 'position': 'absolute', 'display': 'block', 'width': '0', 'height': '0', 'border-top': '5px solid transparent', 'border-bottom': '5px solid transparent', 'border-left': '5px solid ' + tbg });
            $leftArrow = $('<div class="tourArrow"></div>').css({ 'position': 'absolute', 'display': 'block', 'width': '0', 'height': '0', 'border-top': '5px solid transparent', 'border-bottom': '5px solid transparent', 'border-right': '5px solid ' + tbg });
            switch (pos) {
                case 'BL':
                    position = { 'left': el, 'top': et + eh + 10 };
                    $upArrow.css({ top: '-5px', left: '48%' });
                    $tooltip.prepend($upArrow);
                    break;

                case 'BR':
                    position = { 'left': el + ew - tw, 'top': et + eh + 10 };
                    $upArrow.css({ top: '-5px', left: '48%' });
                    $tooltip.prepend($upArrow);
                    break;

                case 'TL':
                    position = { 'left': el, 'top': (et - th) - 10 };
                    $downArrow.css({ top: th, left: '48%' });
                    $tooltip.append($downArrow);
                    break;

                case 'TR':
                    position = { 'left': (el + ew) - tw, 'top': et - th - 10 };
                    $downArrow.css({ top: th, left: '48%' });
                    $tooltip.append($downArrow);
                    break;

                case 'RT':
                    position = { 'left': el + ew + 10, 'top': et };
                    $leftArrow.css({ left: '-5px' });
                    $tooltip.prepend($leftArrow);
                    break;

                case 'RB':
                    position = { 'left': el + ew + 10, 'top': et + eh - th };
                    $leftArrow.css({ left: '-5px' });
                    $tooltip.prepend($leftArrow);
                    break;

                case 'LT':
                    position = { 'left': (el - tw) - 10, 'top': et };
                    $rightArrow.css({ right: '-5px' });
                    $tooltip.prepend($rightArrow);
                    break;

                case 'LB':
                    position = { 'left': (el - tw) - 10, 'top': et + eh - th };
                    $rightArrow.css({ right: '-5px' });
                    $tooltip.prepend($rightArrow);
                    break;

                case 'B':
                    position = { 'left': el + ew / 2 - tw / 2, 'top': (et + eh) + 10 };
                    $upArrow.css({ top: '-5px', left: '48%' });
                    $tooltip.prepend($upArrow);
                    break;

                case 'L':
                    position = { 'left': (el - tw) - 10, 'top': et + eh / 2 - th / 2 };
                    $rightArrow.css({ right: '-5px' });
                    $tooltip.prepend($rightArrow);
                    break;

                case 'T':
                    position = { 'left': el + ew / 2 - tw / 2, 'top': (et - th) - 10 };
                    $downArrow.css({ top: th, left: '48%' });
                    $tooltip.append($downArrow);
                    break;

                case 'R':
                    position = { 'left': (el + ew) + 10, 'top': et + eh / 2 - th / 2 };
                    $leftArrow.css({ left: '-5px' });
                    $tooltip.prepend($leftArrow);
                    break;
            }
            return position;
        },
        getControlPosition: function(pos) {
            switch (pos) {
                case 'TR':
                    pos = { 'top': '10px', 'right': '10px' };
                    break;

                case 'TL':
                    pos = { 'top': '10px', 'left': '10px' };
                    break;

                case 'BL':
                    pos = { 'bottom': '10px', 'left': '10px' };
                    break;

                case 'BR':
                    pos = { 'bottom': '10px', 'right': '10px' };
                    break;
            }
            return pos;
        },
        showHideButtons: function() {
            if (step < steps) {
                $('#tourNext').show();
                $('#tourNextText').html(options.buttons.next.text);
            }

            if (step <= 0) {
                $('#tourPrev').hide();
                $('#tourEnd').hide();
                $('#tourNextIcon').attr('class', options.buttons.start.iconclass);
                $('#tourNextText').html(options.buttons.start.text);
            }

            if (step <= steps && step > 0) {
                $('#tourPrev').show();
                $('#tourEnd').show();
                $('#tourNextIcon').attr('class', options.buttons.next.iconclass);
                $('#tourNextText').html(options.buttons.next.text);
            }
        },
        findParentBg : function($element) {
            while ($element.css('background-color') == 'transparent') {
                $element = $element.parent();
            }
            return $element.css('background-color');
        },
        destroy: function() {
            $('#tourControls').remove();
            $('#tourtip').remove();
            $tooltip.css({ 'display': 'none' }).html('');
            $(options.data[step]).css("z-index","auto");
            options.data.shift();
            step = -1;
            started = false;
            options.keyboard = false; /* Bug fixed with option keyboard */
            if (options.useOverlay) {
                if ($overlay) { $overlay.remove()};    
            } 

        },
        bindElements: function() {

            
            $("#tourNext").unbind( "click" );
            $("#tourPrev").unbind( "click" );
            $("#tourEnd").unbind( "click" );
            
            $('#tourNext').click(function(){ methods.next(); });
            $('#tourPrev').click(function(){ methods.prev(); });
            $('#tourEnd').click(function(){ methods.destroy(); });
            
            for(var i = 1; i < options.data.length; i++)
            {
                $('#help' + i).click(function(){methods.goto(this.value);});
            }

            $('body').on('keydown', function(e){
                if (e.keyCode == 37) {
                    options.keyboard ? methods.prev() : ''; /* Method option keyboard */
                } 
                if (e.keyCode == 39) {
                    options.keyboard ? methods.next() : '';
                }
                if (e.keyCode == 27) {
                    options.keyboard ? methods.destroy() : '';
                }
            });
        }
    };

    $.fn.aSimpleTour = function(method) {
        t = this;
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);    
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.aSimpleTour');
        }
    };

    $(window).load(function(){
        tourStep = window.location.hash.substr(1).split('=');
        if (typeof(eval(tourStep[0])) != 'undefined' && typeof(eval(tourStep[1])) != 'undefined') {
            $.aSimpleTour(eval(tourStep[0]), tourStep[1]);    
        }
    });


})(jQuery);


// Direct Access
$.aSimpleTour = function(opts, startFrom) 
                { 
                    opts.autoStart = false;
                    opts.controlsPosition = 'TR';
                    opts.buttons = {
                                    next  : { text : '', class : '', iconclass: 'fa fa-chevron-circle-right'},
                                    prev  : { text : '', class: '', iconclass: 'fa fa-chevron-circle-left'},
                                    start : { text : '', class: '', iconclass: 'fa fa-play-circle'},
                                    end   : { text : '', class: '', iconclass: 'fa fa-times-circle' }
                                };
                    
                    opts.controlsCss = {
                                            background: 'rgba(38, 120, 207, 0.88)',
                                            color: 'rgb(255, 255, 255)',
                                            width: '400px',
                                            'border-radius': "10px",
                                            'font-size': '13px',
                                            'box-shadow': '-1px 0px 3px 1px rgba(22, 69, 119, 0.4588235294117647)'
                                        }
                    $.fn.aSimpleTour(opts, startFrom);  
                    return this; 
                }