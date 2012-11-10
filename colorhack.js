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
var DIALOG_COLOR_SETTINGS_HEIGHT =  200;            // color-settings dialog height
var DIALOG_COLOR_SETTINGS_WIDTH =   400;            // color-settings dialog width
var DIALOG_ELEMENT_DETAILS_HEIGHT = 300;            // element-details dialog height
var DIALOG_ELEMENT_DETAILS_WIDTH =  300;            // element-details dialog width

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
              PRIVATE METHODS
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

    var _CreateColorPicker = function(color) {
        var colorPicker =
            $('<div/>', {
                id:         CH_PREFIX + 'color-settings_color-' + color,
                'class':    CH_CLASS + ' ' +
                            CH_PREFIX + 'color-settings_color',
            })
            .append(
                $('<label/>', {
                    id:         CH_PREFIX + 'color-settings_color-label',
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-label',
                    'for':      CH_PREFIX + 'color-settings_color-textbox-' + color
                })
                .html(color.substring(0, 1).toUpperCase() + ':')
            )
            .append(
                $('<canvas/>', {
                    id:         CH_PREFIX + 'color-settings_color-picker-' + color,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-picker',
                    'Height':   24, // WARNING: This is a hack, since
                    'Width':    256 // normally it changes CSS height and width.
                })
                .append(
                    $('<p/>').html('Your browser does not support this feature')
                )
            )
            .append(
                $('<input/>', {
                    id:         CH_PREFIX + 'color-settings_color-textbox-' + color,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-textbox',
                    name:       CH_PREFIX + 'color-textbox-' + color,
                    type:       'text',
                })
            )
        return colorPicker;
    }

    /*
     ================================
            PRIVATE PROPERTIES
     ================================
     */

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
        // Allow dialog to be dragged.
        .draggable({
            //containment:    'body',
            scroll:         false,
            zIndex:         BASE_Z_INDEX + 100,
            handle:         '.' + CH_PREFIX + 'dialog-header',
            /* 
             * There seems to be an issue with jQuery UI draggable containment option and fixed position elements:
             * http://bugs.jqueryui.com/ticket/6181
             * Seems like the issue still exists for integer array values.
             */
            containment:    (function() {
                                var $window = $(window);
                                return [0, 0, $window.width() - DIALOG_COLOR_SCHEMES_WIDTH, $window.height() - DIALOG_COLOR_SCHEMES_HEIGHT]
                            })()
        })
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
        // Allow dialog to be dragged.
        .draggable({
            scroll:         false,
            zIndex:         BASE_Z_INDEX + 100,
            handle:         '.' + CH_PREFIX + 'dialog-header',
            containment:    (function() {
                                var $window = $(window);
                                return [0, 0, $window.width() - DIALOG_COLOR_SETTINGS_WIDTH, $window.height() - DIALOG_COLOR_SETTINGS_HEIGHT]
                            })()
        })
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
            _CreateColorPicker('red')
        )
        .append(
            _CreateColorPicker('blue')
        )
        .append(
            _CreateColorPicker('green')
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
            // Allow dialog to be dragged
            .draggable({
                scroll:         false,
                zIndex:         BASE_Z_INDEX + 100,
                handle:         '.' + CH_PREFIX + 'dialog-header',
                containment:    (function() {
                                    var $window = $(window);
                                    return [0, 0, $window.width() - DIALOG_ELEMENT_DETAILS_WIDTH, $window.height() - DIALOG_ELEMENT_DETAILS_HEIGHT]
                                })()
            })
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

        'color-schemes':            _colorSchemes,

        'color-settings':           _colorSettings,
        'color-settings_colors':     _colorSettingsColors,
        'color-pickers':            {
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-red'),
                                        green:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-green'),
                                        blue:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker-alpha')
                                    },

        'element-details':          _elementDetails
    };

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
        var colors = ['red', 'blue', 'green'];
        var canvas, context;

        // Set up canvas for R, G, and B color pickers.
        for (i = 0; i < colors.length; i++) {
            // Get color picker canvas and context.
            canvas = this.components['color-pickers'][colors[i]].get(0);
            if (typeof canvas === 'undefined') continue;
            context = canvas.getContext('2d');
            if (typeof context === 'undefined') continue;

            // Fill color picker with color gradient.
            var hueWidth = canvas.width / 256;
            var hueHeight = canvas.height;
            if (colors[i] === 'red') {
                for (j = 0; j < 256; j++) {
                    context.fillStyle = 'rgb(' + j + ', 0, 0)';
                    context.fillRect(j * hueWidth, 0, hueWidth, hueHeight);
                }
            }
            else if (colors[i] === 'blue') {
                for (j = 0; j < 256; j++) {
                    context.fillStyle = 'rgb(0, ' + j + ', 0)';
                    context.fillRect(j * hueWidth, 0, hueWidth, hueHeight);
                }
            }
            else if (colors[i] === 'green') {
                for (j = 0; j < 256; j++) {
                    context.fillStyle = 'rgb(0, 0, ' + j + ')';
                    context.fillRect(j * hueWidth, 0, hueWidth, hueHeight);
                }
            }
        }

        // Set up canvas for alpha color picker.
        // Get color picker canvas and context.
        canvas = this.components['color-pickers'].alpha.get(0);
        if (typeof canvas === 'undefined') return;
        context = canvas.getContext('2d');
        if (typeof context === 'undefined') return;

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

    // Creates and attaches events for ColorHack elements.
    this.AttachEvents = function() {
        // Menu events
        this.components.menu
            // Hovering over the menu should change the opacity of child elements.
            // I don't remember why I decided not to do this with the :hover pseudoclass...
            .hover(function() {
                $(this).children('#' + CH_PREFIX + 'icon, #' + CH_PREFIX + 'toolbar').css({
                    opacity:    '1'
                });
            }, function() {
                $(this).children('#' + CH_PREFIX + 'icon, #' + CH_PREFIX + 'toolbar').css({
                    opacity:    '0.6'
                });
            })

        // Icon events
        this.components.icon
            // Clicking the menu icon should toggle visibility of the toolbar.
            .click(function() {
                var $toolbar = COLORHACK.components.toolbar;
                if ($toolbar.css('display') === 'none') {
                    $toolbar.show('slide', { direction: 'down' }, 300);
                } else {
                    $toolbar.hide('slide', { direction: 'down' }, 300);
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

        // Dialog events
        $('.' + CH_PREFIX + 'dialog-close').click(function() {
            var $dialog = $(this).closest('.' + CH_PREFIX + 'dialog');
            // Hide dialog
            $dialog.hide();
            // Remove check from menu toolbar option
            $('#' + $dialog.get(0).id.replace(CH_PREFIX, CH_PREFIX + 'toolbar_'))
                .find('.' + CH_PREFIX + 'toolbar-item-check')
                .html('');
        });
    }

    this.SetDefaults = function() {
        // Set default color in color settings to white.
        this.components['color-settings_colors']
            .find('.' + CH_PREFIX + 'color-textbox').val(255);

        // Get alpha channel color picker canvas and context.
        canvas = this.components['color-pickers'].alpha.get(0);
        if (typeof canvas === 'undefined') return;
        context = canvas.getContext('2d');
        if (typeof context === 'undefined') return;

        // Fill color picker with color gradient.
        var hueWidth = canvas.width / 256;
        var hueHeight = canvas.height;
        for (j = 0; j < 256; j++) {
            context.fillStyle = 'rgba(255, 255, 255, ' + j / 256 + ')';
            context.fillRect(j * hueWidth, 0, hueWidth, hueHeight);
        }
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

            '-ms-transition:' +         'color .1s linear, background .1s linear, opacity .2s linear;',
            '-moz-transition:' +        'color .1s linear, background .1s linear, opacity .2s linear;',
            '-webkit-transition:' +     'color .1s linear, background .1s linear, opacity .2s linear;',
            '-o-transition:' +          'color .1s linear, background .1s linear, opacity .2s linear;',
            'transition:' +             'color .1s linear, background .1s linear, opacity .2s linear;',
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
            'cursor:' +             'pointer;',

            'background:' +         '-ms-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-moz-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-webkit-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         '-o-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
            'background:' +         'linear-gradient(top, rgb(250, 250, 250) 0%, rgb(210, 210, 210) 100%);',
        '}',

        // Menu
        '#' + CH_PREFIX + 'menu {',
            'z-index:' +            (BASE_Z_INDEX + 10) + ';',
            'bottom:' +             '0;',
            'right:' +              '0;',
            'margin:' +             '4px;',

            'font-size:' +          '16px;',
            'text-align:' +         'center;',
        '}',
        '#' + CH_PREFIX + 'icon,',
        '#' + CH_PREFIX + 'toolbar {',
            'width:' +              '150px;',

            'opacity:' +            '0.6;',
            'border:' +             '2px solid rgb(60, 60, 60);',
        '}',
        '#' + CH_PREFIX + 'icon {',
            'padding:' +            '4px 0;',
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
            'z-index:' +            (BASE_Z_INDEX + 1) + ';',

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

            'opacity:' +            '0.6;',

            'font-size:' +          '18px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover {',
            'opacity:' +            '1;',
        '}',

        // Color scheme dialog
        '#' + CH_PREFIX + 'color-schemes {',
            'height:' +             DIALOG_COLOR_SCHEMES_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SCHEMES_WIDTH + 'px;',
            'top:' +                '4px;',
            'left:' +               '4px;',
        '}',

        // Color settings dialog
        '#' + CH_PREFIX + 'color-settings {',
            'height:' +             DIALOG_COLOR_SETTINGS_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SETTINGS_WIDTH + 'px;',
            'top:' +                '4px;',
            'right:' +              '4px;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors {',
            'height:' +             '120px;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-settings_color {',
            'margin:' +             '6px 0;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-label {',
            'width:' +              '16px;',
            'display:' +            'inline-block;',
            'font-size:' +          '14px;',
            'vertical-align:' +     'top;',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-textbox {',
            'height:' +             '24px;',
            'width:' +              '48px;',
            'vertical-align:' +     'top;',
        '}',

        // Element details dialog
        '#' + CH_PREFIX + 'element-details {',
            'height:' +             DIALOG_ELEMENT_DETAILS_HEIGHT + 'px;',
            'width:' +              DIALOG_ELEMENT_DETAILS_WIDTH + 'px;',
            'bottom:' +             '4px;',
            'left:' +               '4px;',
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
    LoadCssReset();
    LoadStylesheet();

    COLORHACK = new ColorHack();
    COLORHACK.Init();
});
