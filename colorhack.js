/*
 ================================
         GLOBAL VARIABLES
 ================================
 */

// Modify these values to resolve conflicts with the page's elements.
var CH_PREFIX =                     'colorhack_';   // HTML id prefix for naming ColorHack elements
var CH_CLASS =                      'colorhack';    // HTML class to identify ColorHack elements

var BASE_Z_INDEX =                  9000;           // minimum z-index of ColorHack elements 

var DIALOG_COLOR_SCHEMES_HEIGHT =   400;            // color-schemes dialog height
var DIALOG_COLOR_SCHEMES_WIDTH =    200;            // color-schemes dialog width
var DIALOG_COLOR_SETTINGS_HEIGHT =  220;            // color-settings dialog height
var DIALOG_COLOR_SETTINGS_WIDTH =   350;            // color-settings dialog width
var DIALOG_ELEMENT_DETAILS_HEIGHT = 300;            // element-details dialog height
var DIALOG_ELEMENT_DETAILS_WIDTH =  300;            // element-details dialog width

var SLIDE_DURATION =                300;            // time taken to complete slide animations

// ColorHack object
var COLORHACK;

/*
 ================================
         COLORHACK CLASS
 ================================

 * Contains properties and methods for ColorHack objects.
 * Any page should only have one instance of the ColorHack class.
 */
function ColorHack() {

    /*
     ================================
           PREDECLARE VARIABLES
     ================================
     */

        // Private properties
        var _dialogs =              [];

        var _menu =                 {};
        var _toolbar =              {};
        var _icon =                 {};

        var _colorSchemes =         {};

        var _colorSettings =        {};
        var _colorSettingsColors =  {};

        var _elementDetails =       {};

        // Public properties
        this.components =           {};

        // Private methods
        var _GetPos =               function() {}

        var _RgbToHex =             function() {}
        var _HexToRgb =             function() {}
        var _FillGradient =         function() {}
        var _UpdateActiveColor =    function() {}
        var _SetActiveColor =       function() {}

        // Public methods
        this.BuildDialogs =         function() {}
        this.SetupColorPickers =    function() {}
        this.AttachEvents =         function() {}
        this.SetDefaults =          function() {}
        this.Init =                 function() {}

    /*
     ================================
         CREATE-COMPONENT METHODS
     ================================
     */

    // Creates dialog header elements.
    var _CreateDialogHeader = function(title) {
        var header =
            $('<h2/>', {
                'class':    CH_CLASS + ' ' +
                            CH_PREFIX + 'dialog-header'
            })
            .append( // dialog title
                $('<span/>', {
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'dialog-title'
                })
                .text(title)
            )
            .append( // dialog close button
                $('<span/>', {
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'dialog-close'
                })
                .html('&times;')
            )
        ;
        return header;
    }

    // Creates color picker elements for a single color.
    var _CreateColorPicker = function(color) {
        var colorPicker =
            $('<div/>', { // container for color picker elements
                id:         CH_PREFIX + 'color-settings_color-' + color,
                'class':    CH_CLASS + ' ' +
                            CH_PREFIX + 'color-settings_color',
            })
            .append(
                $('<label/>', { // label for color picker textbox - R:/G:/B:
                    id:         CH_PREFIX + 'color-settings_color-label-' + color,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-label',
                    'for':      CH_PREFIX + 'color-settings_color-textbox-' + color
                })
                .html(color.substring(0, 1).toUpperCase() + ':')
            )
            .append(
                $('<div/>', { // color picker
                    id:         CH_PREFIX + 'color-settings_color-picker-' + color,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-picker',
                })
                .append(
                    $('<canvas/>', { // color picker gradient
                        id:         CH_PREFIX + 'color-settings_color-picker_gradient-' + color,
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-picker_gradient',
                        'Height':   '24px', // WARNING: This is a hack, since this normally it changes
                        'Width':    '256px' // the CSS height/width and not the element's height/width.
                    })
                    .append(
                        $('<p/>').html('Your browser does not support this feature')
                    )
                    .data('color', color)
                    .data('selector', '#' + CH_PREFIX + 'color-settings_color-picker_selector-' + color)
                )
                .append(
                    $('<div/>', { // color picker selector
                        id:         CH_PREFIX + 'color-settings_color-picker_selector-' + color,
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-picker_selector'
                    })
                    .data('color', color)
                    .data('gradient', '#' + CH_PREFIX + 'color-settings_color-picker_gradient-' + color)
                )
                .data('color', color)
            )
            .append(
                $('<input/>', { // textbox for color picker
                    id:         CH_PREFIX + 'color-settings_color-textbox-' + color,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-textbox',
                    name:       CH_PREFIX + 'color-textbox-' + color,
                    type:       'text',
                })
                .data('color', color)
                .data('selector', '#' + CH_PREFIX + 'color-settings_color-picker_selector-' + color)
            )
        return colorPicker;
    }

    /*
     ================================
            PRIVATE PROPERTIES
     ================================
     */

    // Variables used to count number of clicks.
    // Used to differentiate between single, double, etc. clicks.
    var _clickTimer = null, _clicks = 0;

    // Regex variables for input validation and filtering.
    var regexAlpha =    /^[a-zA-Z]*$/;
    var regexAlphaNum = /^[a-zA-Z0-9]*$/
    var regexDec =      /^[0-9]*$/;
    var regexHex =      /^[a-fA-F0-9]*$/

    // Dialogs that make up the main UI.
    // Used to generate the menu toolbar options.
    var _dialogs = [
        { id: 'color-schemes',          name: 'Color Schemes' },
        { id: 'color-settings',         name: 'Color Settings' },
        { id: 'element-details',        name: 'Element Details' }
    ];

    /*
     --------------------------------
                   MENU
     --------------------------------
     */

    // Menu located on the bottom-right of the page.
    // Contains the icon and toolbar components.
    var _menu =
        $('<div/>', {
            id:         CH_PREFIX + 'menu',
            'class':    CH_CLASS
        })
    ;

    // Toolbar located on the bottom-right of the page.
    // Provides a menu to toggle visibility of ColorHack dialogs.
    var _toolbar =
        $('<ul/>', {
            id:         CH_PREFIX + 'toolbar',
            'class':    CH_CLASS
        })
        // Add toolbar options.
        .append(
            // Create toolbar items.
            (function() {
                var toolbarOptions = $(); // empty jQuery object
                // Build collection of toolbar options from dialogs array
                for (i = 0 ; i < _dialogs.length ; i++) {
                    toolbarOptions = toolbarOptions.add(
                        $('<li/>', {
                            id:         CH_PREFIX + 'toolbar_' + _dialogs[i].id,
                            'class':    CH_CLASS + ' ' +
                                        CH_PREFIX + 'toolbar-item'
                        })
                        .append( // checkmark element
                            $('<span/>', {
                                'class':    CH_CLASS + ' ' +
                                            CH_PREFIX + 'toolbar-item-check'
                            })
                            .html('&#x2713') // checkmark
                        )
                        .append(_dialogs[i].name)
                    );
                }
                return toolbarOptions;
            })()
        )
        .hide()
        .appendTo(_menu)
    ;

    // Menu icon located on the bottom-right of the page.
    // Toggles visibility of the toolbar.
    var _icon =
        $('<h1/>', {
            id:         CH_PREFIX + 'icon',
            'class':    CH_CLASS
        })
        .text('ColorHack')
        .appendTo(_menu)
    ;

    /*
     --------------------------------
           COLOR SCHEMES DIALOG
     --------------------------------
     */

    // Color scheme dialog.
    // Manages color rules and elements that use the rules.
    var _colorSchemes =
        $('<div/>', {
            id:         CH_PREFIX + 'color-schemes',
            'class':    CH_CLASS + ' ' +
                        CH_PREFIX + 'dialog'
        })
        // Add dialog header.
        .append(
            _CreateDialogHeader('Color Schemes')
        )
    ;

    /*
     --------------------------------
           COLOR SETTINGS DIALOG
     --------------------------------
     */

    // Color settings dialog.
    // Manages the set of color styles in a color rule.
    var _colorSettings =
        $('<div/>', {
            id:         CH_PREFIX + 'color-settings',
            'class':    CH_CLASS + ' ' +
                        CH_PREFIX + 'dialog'
        })
        // Add dialog header.
        .append(
            _CreateDialogHeader('Color Settings')
        )
    ;

    // Color picker component of color settings dialog.
    // Uses sliders to control R, G, B, and A levels.
    // Also contains text fields for manually entering values.
    var _colorSettingsColors =
        $('<div/>', {
            id:         CH_PREFIX + 'color-settings_colors',
            'class':    CH_CLASS,
        })
        .append(
            $('<div/>', {
                id:         CH_PREFIX + 'color-settings_color-hex',
                'class':    CH_CLASS + ' ' +
                            CH_PREFIX + 'color-settings_color-hex'
            })
            .append(
                $('<label/>', {
                    id:         CH_PREFIX + 'color-settings_color-label-hex',
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-label',
                    'for':      CH_PREFIX + 'color-settings_color-textbox-hex'
                })
                .html('#:')
            )
            .append(
                $('<div/>', {
                    id:         CH_PREFIX + 'color-settings_color-components',
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-components'
                })
                .append(
                    (function() {
                        var components = $();
                        var colors = ['red', 'green', 'blue'];
                        for (i = 0; i < colors.length; i++) {
                            components = components.add(
                                $('<div/>', {
                                    id:         CH_PREFIX + 'color-settings_color-component-' + colors[i],
                                    'class':    CH_CLASS + ' ' +
                                                CH_PREFIX + 'color-component'
                                })
                            )
                        }
                        return components;
                    })()
                )
                .append(
                    $('<div/>', {
                        id:         CH_PREFIX + 'color-settings_color-full',
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-full'
                    })
                )
            )
            .append(
                $('<input/>', {
                    id:         CH_PREFIX + 'color-settings_color-textbox-hex',
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-textbox-hex',
                    name:       CH_PREFIX + 'color-textbox-hex',
                    type:       'text'
                })
            )
        )
        .append(
            _CreateColorPicker('red')
        )
        .append(
            _CreateColorPicker('green')
        )
        .append(
            _CreateColorPicker('blue')
        )
        .append(
            _CreateColorPicker('alpha')
        )
        .appendTo(_colorSettings)
    ;

    /*
     --------------------------------
          ELEMENT DETAILS DIALOG
     --------------------------------
     */

    // Element details dialog.
    // Shows details on element attributes and applied color rules.
    var _elementDetails =
        $('<div/>', {
            id:         CH_PREFIX + 'element-details',
            'class':    CH_CLASS + ' ' +
                        CH_PREFIX + 'dialog'
        })
        // Add dialog header
        .append(
            _CreateDialogHeader('Element Details')
        )
    ;

    /*
     ================================
            PUBLIC PROPERTIES
     ================================
     */
    
    // Primary components used by ColorHack.
    this.components = {
        menu:                       _menu,
        icon:                       _icon,
        toolbar:                    _toolbar,

        dialogs:                    $()
                                        .add(_colorSchemes)
                                        .add(_colorSettings)
                                        .add(_elementDetails),

        'color-schemes':            _colorSchemes,

        'color-settings':           _colorSettings,
        'color-settings_colors':    _colorSettingsColors,
        'color-components':            {
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-component-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-component-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-component-blue'),
                                        full:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-full')
                                    },
        'color-pickers':            {
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-alpha')
                                    },
        'color-picker_gradients':    {
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-alpha')
                                    },
        'color-textboxes':    {
                                        hex:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-hex'),
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-alpha')
                                    },

        'element-details':          _elementDetails
    };

    /*
     ================================
              PRIVATE METHODS
     ================================
     */

    // Returns the position of an element on the page.
    var _GetPos = function(el) {
        for (
            var xPos = 0, yPos = 0;
            el != null;
            xPos += el.offsetLeft, yPos += el.offsetTop, el = el.offsetParent
        );
        return {x: xPos, y: yPos};
    }

    // Converts RGB color as { r: x, g: y, b: z } to hex color as '#abcdef'.
    var _RgbToHex = function(rgb) {
        return '' +
            ((1 << 24) +
            (+rgb.red << 16) +
            (+rgb.green << 8) +
            +rgb.blue)
            .toString(16).slice(1).toUpperCase();
    }

    // Converts hex color as '#abcdef' to RGB color as { r: x, g: y, b: z }.
    var _HexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 0
        } : null;
    }

    // Fills a given color gradient for a color picker based on input colors.
    var _FillGradient = function(colorGradients, color, startHue, stopHue) {
        // Get color picker canvas and context.
        canvas = colorGradients[color].get(0);
        if (typeof canvas === 'undefined') return;
        context = canvas.getContext('2d');
        if (typeof context === 'undefined') return;

        if (color === 'alpha') {
            // Fill color picker background with alpha channel grid.
            context.fillStyle = '#9F9F9F'; // Light grey
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#636363'; // Dark grey

            for (j = 0; j < canvas.height / 8; j++) {
                k = (j % 2 === 0) ? 1 : 0;

                for (; k < canvas.width / 8; k += 2) {
                    context.fillRect(k * 8, j * 8, 8, 8);
                }
            }
        }

        // Fill color picker with color gradient.
        linearGradient = context.createLinearGradient(0, 0, canvas.width, 0);
        linearGradient.addColorStop(0, startHue);
        linearGradient.addColorStop(1, stopHue);

        context.fillStyle = linearGradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Performs all updates needed when changing the active color in the color settings dialog.
    // Uses all color picker selector positions.
    var _UpdateActiveColor = function() {
        var colors = ['red', 'green', 'blue', 'alpha'];
        var rgba = {};

        // Get the rgb value for each specific hue
        for (i = 0; i < colors.length; i++) {
            // RGB value is based off of selector's position in the color picker.
            rgba[colors[i]] = COLORHACK.components['color-pickers'][colors[i]]
                .find('.' + CH_PREFIX + 'color-picker_selector').css('left');
            rgba[colors[i]] = rgba[colors[i]].substring(0, rgba[colors[i]].length - 2);

            if (colors[i] === 'alpha') {
                rgba[colors[i]] = Math.floor(rgba[colors[i]] * 100 / 255);
            }
        }

        _SetActiveColor(rgba);
    }

    // Performs all updates needed to change the active color, based on the input rgba object.
    var _SetActiveColor = function(rgba) {
        var hue = 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ', 1)';
        var color = 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ', ' + rgba.alpha/100 + ')';

        // Update hex component colors.
        with ({ comps: COLORHACK.components['color-components'] }) {
            comps.red.css('background', 'rgba(' + rgba.red + ', 0, 0, 1)');
            comps.green.css('background', 'rgba(0, ' + rgba.green + ', 0, 1)');
            comps.blue.css('background', 'rgba(0, 0, ' + rgba.blue + ', 1)');
            comps.full.css('background', hue);
        }

        // Update textbox values.
        with ({ texts: COLORHACK.components['color-textboxes'] }) {
            texts.hex.val(_RgbToHex(rgba));
            texts.red.val(rgba.red);
            texts.green.val(rgba.green);
            texts.blue.val(rgba.blue);
            texts.alpha.val(rgba.alpha);
        }

        // Update alpha color picker gradient color.
        _FillGradient(
            COLORHACK.components['color-picker_gradients'],
            'alpha',
            'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ', 0)',
            hue
        );
    }

    /*
     ================================
              PUBLIC METHODS
     ================================
     */

    // Builds the DOM for ColorHack elements.
    this.BuildDialogs = function() {
        $(document.body)
            // Add menu to page
            .append(this.components.menu)
            // Add dialogs to page
            .append(this.components['color-schemes'])
            .append(this.components['color-settings'])
            .append(this.components['element-details'])
        ;
    }

    // Sets up the color picker components.
    this.SetupColorPickers = function() {
        var colors = [
            { name: 'red',      startColor: '#000',             stopColor: '#FF0000'    },
            { name: 'green',    startColor: '#000',             stopColor: '#00FF00'    },
            { name: 'blue',     startColor: '#000',             stopColor: '#0000FF'    },
            { name: 'alpha',    startColor: 'rgba(0, 0, 0, 0)', stopColor: '#000'       }
        ];

        // Set up canvas for R, G, and B color pickers.
        for (i = 0; i < colors.length; i++) {
            _FillGradient(
                this.components['color-picker_gradients'],
                colors[i].name,
                colors[i].startColor,
                colors[i].stopColor
            );
        }
    }

    // Creates and attaches events for ColorHack elements.
    this.AttachEvents = function() {
        /* GLOBAL EVENT VARIABLES */
        var drag = {
            isDragging:     false,
            target:         null
        }

        /* GENERAL */
        $('body').mouseup(function() {
            drag.isDragging = false;
            drag.target = null;
        })

        /* MENU */

        // Icon events
        this.components.icon
            // Clicking the menu icon should toggle visibility of the toolbar.
            .click(function() {
                // Only allow single clicks.
                // Otherwise, weird stuff happens when user spam-clicks the menu icon...
                _clicks++;
                if (_clicks === 1) {
                    var $toolbar = COLORHACK.components.toolbar;
                    if ($toolbar.css('display') === 'none') {
                        $toolbar.show('slide', { direction: 'down' }, SLIDE_DURATION);
                    } else {
                        $toolbar.hide('slide', { direction: 'down' }, SLIDE_DURATION);
                    }
                    // Enable sliding again after sliding animation is done.
                    _clickTimer = setTimeout(function() {
                        _clicks = 0;
                    }, SLIDE_DURATION);
                }
            })

        // Toolbar option events
        this.components.toolbar.find('.' + CH_PREFIX + 'toolbar-item').each(function(index, value) {
            // Iterate through toolbar options and assign events to each.
            // Clicking a toolbar option should toggle the visibility of the coresponding dialog.
            // A checkmark should also be in the toolbar option to indicate whether the dialog is visible.
            $(value).click(function() {
                var $checkbox = $(this).find('.' + CH_PREFIX + 'toolbar-item-check');
                if ($checkbox.html() === '') {
                    // Add checkmark
                    $checkbox.html('&#x2713'); // checkmark
                    // Show corresponding dialog
                    COLORHACK.components[this.id.replace(CH_PREFIX + 'toolbar_', '')].show();
                } else {
                    // Remove checkmark
                    $checkbox.html('');
                    // Hide corresponding dialog
                    COLORHACK.components[this.id.replace(CH_PREFIX + 'toolbar_', '')].hide();
                }
            })
        })

        /* DIALOG */

        // Drag dialogs by dialog header.
        this.components.dialogs.draggable({
            //containment:    'body',
            scroll:         false,
            zIndex:         BASE_Z_INDEX + 100,
            handle:         '.' + CH_PREFIX + 'dialog-header'/*,
            /*
             * There seems to be an issue with jQuery UI draggable containment option and fixed position elements:
             * http://bugs.jqueryui.com/ticket/6181
             * Seems like the issue still exists for integer array values.
             */
            /* containment:    (function() {
                                var $window = $(window);
                                return [0, 0, $window.width() - DIALOG_COLOR_SCHEMES_WIDTH, $window.height() - DIALOG_COLOR_SCHEMES_HEIGHT]
                            })() */
        })

        // Close dialog on X button click.
        this.components.dialogs.find('.' + CH_PREFIX + 'dialog-close').click(function() {
            var $dialog = $(this).closest('.' + CH_PREFIX + 'dialog');
            // Hide dialog
            $dialog.hide();
            // Remove check from menu toolbar option
            $('#' + $dialog.get(0).id.replace(CH_PREFIX, CH_PREFIX + 'toolbar_'))
                .find('.' + CH_PREFIX + 'toolbar-item-check')
                .html('');
        });

        /* COLOR SETTINGS DIALOG */

        // Dragging the color picker selector changes the active color.
        this.components['color-settings'].find('.' + CH_PREFIX + 'color-picker_selector').draggable({
            axis:           'x',
            containment:    'parent',
            start:          function(e, ui) { // start draggin
                drag.isDragging = true;
                drag.target = e.target;
                $(e.target).css('opacity', 1); // want opaque selector while dragging
            },
            drag:           function(e, ui) { // while dragging
                _UpdateActiveColor();
            },
            stop:           function(e, ui) { // stop dragging
                drag.isDragging = false;
                drag.target = null;
                $(e.target).css('opacity', '');
            }
        });

        // Dragging along color gradient starts color selector drag.
        this.components['color-settings'].find('.' + CH_PREFIX + 'color-picker_gradient')
            .mousedown(function(e) {
                // If statement to handle event bubbling.
                if (this.id === e.target.id) {
                    drag.isDragging = true;
                    drag.target = e.target;

                    $gradient = $(e.target);
                    $selector = $($gradient.data('selector'));
                    var xPos = e.pageX - _GetPos(e.target).x - 2; // 2 to account for selector width

                    // Move selector to align with mouse by x (horizontal) position.
                    $selector.css('left', xPos);
                    //
                    // Update the active color based on new selector position.
                    _UpdateActiveColor();

                    // Trigger the corresponding selector drag.
                    $($(e.target).data('selector')).trigger(e);

                    drag.target = $selector.get(0);
                }
            })
            .mouseup(function(e) {
                drag.isDragging = false;
                drag.target = null;
            });

        // Restrict characters accepted in the textboxes (input validation).
        // Allows color values to be set from the textboxes.
        this.components['color-settings'].find('.' + CH_PREFIX + 'color-textbox, .' + CH_PREFIX + 'color-textbox-hex')
            .keypress(function(e) {
                var key = e.keyCode || e.which;
                var isHex = (e.target.id.indexOf('hex') !== -1) ? true : false;
                var isAlpha = (e.target.id.indexOf('alpha') !== -1) ? true : false;

                // TODO: handle copy-paste, ctrl/cmd hold cases
                // TODO: treat textbox lose focus the same way as pressing enter

                // If key pressed is enter, update active color.
                if (key === 13) {                   // enter
                    if (isHex) {
                        // Get the textbox input value as a hex color value.
                        var val = e.target.value;
                        if (val.length === 3)
                            val =
                                val.substring(0, 1) + val.substring(0, 1) +
                                val.substring(1, 2) + val.substring(1, 2) +
                                val.substring(2, 3) + val.substring(2, 3);
                        else if (val.length !== 6) // note that length <= 6
                            val = val + Array(6 - val.length + 1).join('0');

                        var rgb = _HexToRgb(val.toLowerCase());
                        var $gradients = COLORHACK.components['color-picker_gradients'];

                        // Set selector positions.
                        $($gradients.red.data('selector')).css('left', (rgb.r > 255 ? 255 : rgb.r) + 'px');
                        $($gradients.green.data('selector')).css('left', (rgb.g > 255 ? 255 : rgb.g) + 'px');
                        $($gradients.blue.data('selector')).css('left', (rgb.b > 255 ? 255 : rgb.b) + 'px');
                        $($gradients.alpha.data('selector')).css('left', '255px'); // hex colors do not have alpha channel

                        _UpdateActiveColor();
                        return true;
                    } else {
                        // Get the textbox input value as an integer.
                        var val = parseInt(e.target.value.replace(/\D/g, ''), 10); // convert to integer
                        $target = $(e.target);

                        // Set selector position.
                        if (val > 255 && !isAlpha) {
                            val = 255;
                            $($target.data('selector')).css('left', val + 'px');
                        } else if (val > 100 && isAlpha) {
                            val = 100;
                            $($target.data('selector')).css('left', (val / 100 * 255) + 'px');
                        }

                        _UpdateActiveColor();
                        return true;
                    }
                }

                // Allow special characters.
                if ((key === 8 || key === 46) ||    // backspace, delete
                    (key > 36 && key < 41)) {       // arrow keys
                    return true;
                }

                // Allow numbers.
                key = String.fromCharCode(key);
                if ((isHex && !regexHex.test(key)) ||
                    (!isHex && !regexDec.test(key))) {
                    if (e.preventDefault) e.preventDefault();
                    return false;
                }

                // Enforce max character limit.
                if ((isHex && e.target.value.length >= 6) ||
                    (!isHex && e.target.value.length >=3)) {
                    // TODO: if text selected, allow keypress
                    if (e.preventDefault) e.preventDefault();
                    return false;
                }
            })
    }

    this.SetDefaults = function() {
        // Set dialog positions
        this.components['color-schemes'].css({
            'top':  '4px',
            left:   '4px'
        });
        this.components['color-settings'].css({
            'top':  '4px',
            right:  '4px'
        });
        this.components['element-details'].css({
            bottom: '4px',
            left:   '4px'
        });

        // Set color in color settings to white.
        this.components['color-settings_colors']
            .find('#' + CH_PREFIX + 'color-settings_color-textbox-hex').val('FFFFFF');
        this.components['color-settings_colors']
            .find('.' + CH_PREFIX + 'color-component')
                .first().css('background', 'rgba(255, 0, 0, 1)')
                .next().css('background', 'rgba(0, 255, 0, 1)')
                .next().css('background', 'rgba(0, 0, 255, 1)')
                .next().css('background', 'rgba(255, 255, 255, 1)');

        this.components['color-settings_colors']
            .find('.' + CH_PREFIX + 'color-textbox').val(255);
        this.components['color-settings_colors']
            .find('#' + CH_PREFIX + 'color-settings_color-textbox-alpha').val(100);
        this.components['color-settings_colors']
            .find('.' + CH_PREFIX + 'color-picker_selector').css('left', '255px');

        _FillGradient(
            this.components['color-picker_gradients'],
            'alpha',
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 1)'
        );
    }

    // Sets up ColorHack on the page.
    this.Init = function() {
        this.BuildDialogs();
        this.SetupColorPickers();
        this.AttachEvents();
        this.SetDefaults();
    }
}

/*
 * Options for styling ColorHack elements:
 *      1. Host stylesheet on separate server and link to it in <head>.
 *          + "Cleanest" method.
 *          + Good if also hosting ColorHack on separate server.
 *          - Nowhere to host it. My server sucks...it's not like I'm Google.
 *      2. Write stylesheet in <style> tags as a string, then append to <head>.
 *          + Functions like option 1.
 *          - Bloats page markup.
 *          - VERY ugly.
 *          - No syntax highlighting - difficult to maintain.
 *      3. Style each element created for ColorHack.
 *          + Will work.
 *          - Bloats JS.
 *          - Not CSS - don't get the cascading or stylsheet part, just the styles.
 *          - No syntax highlighting.
 *          - Will need different style reset methods/objects for each type of element.
 *          - VERY difficult to maintain.
 *          - Prone to errors.
 *  Option 2, I choose you (since option 1 is not really viable at the moment)!
 */

// Loads CSS reset stylesheet.
function LoadCssReset() {
    // Such a monstrosity...
    var CSS_RESET = [
        '/* CSS Reset for ColorHack */',
        // Generate selector through function for readability and easier maintenance.
        (function() {
            var els = [
                'div', 'span', 'applet', 'object', 'iframe',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre',
                'a', 'abbr', 'acronym', 'address', 'big', 'cite', 'code',
                'del', 'dfn', 'em', 'img', 'ins', 'kbd', 'q', 's', 'samp',
                'small', 'strike', 'strong', 'sub', 'sup', 'tt', 'var',
                'b', 'u', 'i', 'center',
                'dl', 'dt', 'dd', 'ol', 'ul', 'li',
                'fieldset', 'form', 'label', 'legend',
                'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td',
                'article', 'aside', 'canvas', 'details', 'figcaption', 'figure',
                'footer', 'header', 'hgroup', 'menu', 'nav', 'section', 'summary',
                'time', 'mark', 'audio', 'video'           
            ]
            for (i = 0 ; i < els.length ; i++) {
                els[i] += '.' + CH_CLASS;
            }
            return els.join(', ');
        })(),
        '{',
            'margin:' +                 '0;',
            'padding:' +                '0;',
            'border:' +                 '0;',
            'outline:' +                '0;',
            'font-size:' +              '100%;',
            'font:' +                   'inherit;',
            'vertical-align:' +         'baseline;',
        '}',

        '/* HTML5 display-role reset for older browsers */',
        (function() {
            var els = [
                'article', 'aside', 'details', 'figcaption', 'figure',
                'footer', 'header', 'hgroup', 'menu', 'nav', 'section'
            ]
            for (i = 0 ; i < els.length ; i++) {
                els[i] += '.' + CH_CLASS;
            }
            return els.join(', ');
        })(),
        '{',
             'display:' +                'block;',
        '}',

        '.' + CH_CLASS,
        '{',
            'line-height:' +            '1;',
        '}',
        'ol.' + CH_CLASS, ', ul.' + CH_CLASS,
        '{',
            'list-style:' +             'none;',
        '}',
        'a.' + CH_CLASS,
        '{',
            'text-decoration:' +        'none;',
        '}',
        'blockquote.' + CH_CLASS + ', q.' + CH_CLASS,
        '{',
            'quotes:' +                 'none;',
        '}',
        'blockquote.' + CH_CLASS + ':before, blockquote.' + CH_CLASS + ':after',
        'q.' + CH_CLASS + ':before, q.' + CH_CLASS + ':after',
        '{',
            'content:' +                '"";',
            'content:' +                'none;',
        '}',

        'ins.' + CH_CLASS,
        '{',
            'text-decoration:' +        'underline;',
        '}',
        'del.' + CH_CLASS,
        '{',
            'text-decoration:' +        'line-through;',
        '}',

        'table.' + CH_CLASS,
        '{',
            'border-collapse:' +        'collapse;',
            'border-spacing:' +         '0;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(CSS_RESET.join(' '))
    );
}

// Loads ColorHack stylesheet.
function LoadStylesheet() {
    // Another monstrosity...
    var STYLESHEET = [
        // General
        '.' + CH_CLASS + ' {',
            'font-family:' +            '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif !important;',

            '-ms-transition:' +         'color .1s linear, opacity .2s linear;',
            '-moz-transition:' +        'color .1s linear, opacity .2s linear;',
            '-webkit-transition:' +     'color .1s linear, opacity .2s linear;',
            '-o-transition:' +          'color .1s linear, opacity .2s linear;',
            'transition:' +             'color .1s linear, opacity .2s linear;',
        '}',
        '.' + CH_CLASS + ':not(.' + CH_PREFIX + 'dialog) * {',
            '-ms-transition:' +         'background .1s linear;',
            '-moz-transition:' +        'background .1s linear;',
            '-webkit-transition:' +     'background .1s linear;',
            '-o-transition:' +          'background .1s linear;',
            'transition:' +             'background .1s linear;',
        '}',
        'h1.' + CH_CLASS + ',',
        'h2.' + CH_CLASS + ',',
        'h3.' + CH_CLASS + ',',
        'h4.' + CH_CLASS + ',',
        'h5.' + CH_CLASS + ',',
        'h6.' + CH_CLASS + ' {',
            'font-weight:' +            'bold;',
        '}',

        // Menu + dialogs
        '#' + CH_PREFIX + 'menu,',
        '#' + CH_PREFIX + 'color-schemes,',
        '#' + CH_PREFIX + 'color-settings,',
        '#' + CH_PREFIX + 'element-details {',
        // Position is !important to overwrite jQuery inline style of position: relative for Chrome.
        // Possibly a bug in jQuery UI (checks for other position styling, so should not overwrite it).
        // Have not been able to isolate exact cause in jq, and have not been able to reproduce issue in simpler test cases.
            'position:' +               'fixed !important;',
        '}',
        '#' + CH_PREFIX + 'menu,',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header {',
            '-ms-user-select:' +        'none;',
            '-moz-user-select:' +       'none;',
            '-webkit-user-select:' +    'none;',
            '-o-user-select:' +         'none;',
            'user-select:' +            'none;',
        '}',
        '#' + CH_PREFIX + 'icon,',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header {',
            'color:' +              'rgb(60, 60, 60);',
            'background:' +         'rgb(240, 240, 240);', // won't be applied if browser supports CSS3
            'text-shadow:' +        '0 1px rgb(250, 250, 250);',

            'background:' +         '-ms-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-moz-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-webkit-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-o-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         'linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
        '}',

        // Menu
        '#' + CH_PREFIX + 'menu {',
            'z-index:' +            (BASE_Z_INDEX + 50) + ';',
            'bottom:' +             '0;',
            'right:' +              '0;',
            'margin:' +             '4px;',

            'opacity:' +            '0.6;',

            'font-size:' +          '16px;',
            'text-align:' +         'center;',
        '}',
        '#' + CH_PREFIX + 'menu:hover {',
            'opacity:' +            '1;',
        '}',
        '#' + CH_PREFIX + 'icon,',
        '#' + CH_PREFIX + 'toolbar {',
            'width:' +              '150px;',

            'border:' +             '2px solid rgb(60, 60, 60);',
        '}',
        '#' + CH_PREFIX + 'icon {',
            'padding:' +            '4px 0;',
            'cursor:' +             'pointer;',
        '}',
        '#' + CH_PREFIX + 'toolbar {',
            'border-bottom:' +      '0;',

            'text-align:' +         'left;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item {',
            'padding:' +            '4px;',

            'color:' +              'rgb(240, 240, 240);',
            'background:' +         'rgb(100, 100, 100);',
            'border-top:' +         '1px solid rgb(160, 160, 160);',

            'cursor:                 pointer;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item:first-child {',
            'border-top:' +         '0;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item:hover {',
            'background:' +         'rgb(60, 60, 60);',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item .' + CH_PREFIX + 'toolbar-item-check {',
            'width:' +              '16px;',
            'display:' +            'inline-block;',
        '}',

        // Dialogs
        '#' + CH_PREFIX + 'color-schemes,',
        '#' + CH_PREFIX + 'color-settings,',
        '#' + CH_PREFIX + 'element-details {',
            'z-index:' +            BASE_Z_INDEX + ';',

            'opacity:' +            '0.6;',
            'color:' +              'rgb(240, 240, 240);',
            'background:' +         'rgb(60, 60, 60);',
            'border:' +             '2px solid rgb(60, 60, 60);',

            'font-size:              12px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes:hover, ',
        '#' + CH_PREFIX + 'color-settings:hover, ',
        '#' + CH_PREFIX + 'element-details:hover {',
            'opacity:' +            '1;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header {',
            'position:' +           'relative;',
            'padding:' +            '4px 0;',

            'cursor:' +             'move;',
            'font-size:' +          '14px;',
            'text-align:' +         'center;',
            'white-space:' +        'nowrap;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title {',
            'display:' +            'inline-block;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close {',
            'position:' +           'absolute;',
            'top:' +                '0;',
            'right:' +              '0;',
            'padding:' +            '0 8px 4px 8px;',

            'cursor:' +             'pointer;',
            'opacity:' +            '0.6;',

            'font-size:' +          '18px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover {',
            'opacity:' +            '1;',
        '}',

        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-label,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'color-label,',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'color-label {',
            '-ms-user-select:' +        'none;',
            '-moz-user-select:' +       'none;',
            '-webkit-user-select:' +    'none;',
            '-o-user-select:' +         'none;',
            'user-select:' +            'none;',
        '}',

        // Color scheme dialog
        '#' + CH_PREFIX + 'color-schemes {',
            'height:' +             DIALOG_COLOR_SCHEMES_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SCHEMES_WIDTH + 'px;',
        '}',

        // Color settings dialog
        '#' + CH_PREFIX + 'color-settings {',
            'height:' +             DIALOG_COLOR_SETTINGS_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SETTINGS_WIDTH + 'px;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors {',
            'margin:' +             '6px 0px;',
            'padding:' +            '2px 8px;',
            'position:' +           'relative;',
            'z-index:' +            (BASE_Z_INDEX + 11) + ';',

            'background:' +         'rgb(90, 90, 90);',

            '-ms-box-shadow:' +     '0 0 16px 4px rgb(70, 70, 70) inset;',
            '-moz-box-shadow:' +    '0 0 16px 4px rgb(70, 70, 70) inset;',
            '-webkit-box-shadow:' + '0 0 16px 4px rgb(70, 70, 70) inset;',
            '-o-box-shadow:' +      '0 0 16px 4px rgb(70, 70, 70) inset;',
            'box-shadow:' +         '0 0 16px 4px rgb(70, 70, 70) inset;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors:hover {',
            'background:' +         'rgb(100, 100, 100);',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors #' + CH_PREFIX + 'color-settings_color-components {',
            'display:' +            'inline-block;',
            'margin:' +             '0 10px 0 13px;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-component {',
            'display:' +            'inline-block;',
            'margin-right:' +       '4px;',
            'height:' +             '24px;',
            'width:' +              '24px;',

            'border:' +             '1px solid rgb(140, 140, 140);',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors #' + CH_PREFIX + 'color-settings_color-full {',
            'display:' +            'inline-block;',
            'height:' +             '24px;',
            'width:' +              '138px;',

            'border:' +             '1px solid rgb(140, 140, 140);',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-settings_color, ',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-settings_color-hex {',
            'margin:' +             '6px 0;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-settings_color-hex {',
            'margin-bottom:' +             '12px;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-label, ',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-label-hex {',
            'display:' +            'inline-block;',
            'position:' +           'relative;',
            'top:' +                '5px;',

            'font-size:' +          '14px;',
            'vertical-align:' +     'top;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-label {',
            'width:' +              '12px;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-picker {',
            'margin:' +             '0 8px;',
            'display:' +            'inline-block;',
            'height:' +             '26px;',
            'width:' +              '265px;', // width of gradient + width of selector - 1
            'position:' +           'relative;',
            'z-index:' +            (BASE_Z_INDEX + 12) + ';',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-picker_gradient {',
            'position:' +           'absolute;',
            'left:' +               '5px;', // half width of selector
            'z-index:' +            (BASE_Z_INDEX + 13) + ';',

            'border:' +             '1px solid rgb(140, 140, 140);',

            'cursor:' +             'crosshair;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-picker_selector {',
            'height:' +             '6px;',
            'width:' +              '6px;',
            // Position is !important to overwrite jQuery inline style of position: relative for Chrome.
            'position:' +           'absolute !important;',
            'top:' +                '7px;',
            'left:' +               '0px;',
            'z-index:' +            (BASE_Z_INDEX + 14) + ';',

            'opacity:' +            '0.8;',
            'background:' +         'rgb(120, 120, 120);',
            'border:' +             '2px solid rgb(160, 160, 160);',

            'cursor:' +             'crosshair;',

            '-ms-border-radius:' +      '4px;',
            '-moz-border-radius:' +     '4px;',
            '-webkit-border-radius:' +  '4px;',
            '-o-border-radius:' +       '4px;',
            'border-radius:' +          '4px;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-picker_selector:hover {',
            'opacity:' +            '1;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-textbox, ',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-textbox-hex {',
            'padding:' +            '1px 6px;',
            'height:' +             '22px;',
            'vertical-align:' +     'top;',

            'color:' +              'rgb(240, 240, 240);',
            'background:' +         'rgb(60, 60, 60);',
            'border:' +             '1px solid rgb(140, 140, 140);',

            'font-size:' +          '12px;',
            'letter-spacing:' +     '1px;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-textbox {',
            'width:' +              '26px;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-textbox-hex {',
            'width:' +              '54px;',
        '}',

        // Element details dialog
        '#' + CH_PREFIX + 'element-details {',
            'height:' +             DIALOG_ELEMENT_DETAILS_HEIGHT + 'px;',
            'width:' +              DIALOG_ELEMENT_DETAILS_WIDTH + 'px;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(STYLESHEET.join(' '))
    );
}

// Add ColorHack to the page once it has finished ready.
$(function() {
    if (typeof COLORHACK === 'undefined') {
        LoadCssReset();
        LoadStylesheet();

        COLORHACK = new ColorHack();
        COLORHACK.Init();
    }
});
