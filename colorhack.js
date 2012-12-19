/*
 ================================
         GLOBAL VARIABLES
 ================================
 */

/* Settings */
// Safe to change.

// Modify these values to resolve conflicts with the page's elements.
var CH_PREFIX =                         'colorhack_';       // HTML id prefix for naming ColorHack elements
var CH_CLASS =                          'colorhack';        // HTML class to identify ColorHack elements

var BASE_Z_INDEX =                      9000;               // minimum z-index of ColorHack elements 

var DIALOG_COLOR_SCHEMES_HEIGHT =       400;                // color-schemes dialog height
var DIALOG_COLOR_SCHEMES_WIDTH =        220;                // color-schemes dialog width
var DIALOG_COLOR_SETTINGS_HEIGHT =      'auto';             // color-settings dialog height
var DIALOG_COLOR_SETTINGS_WIDTH =       352;                // color-settings dialog width
var DIALOG_COLORSCHEME_DETAILS_HEIGHT = 300;                // colorscheme-details dialog height
var DIALOG_COLORSCHEME_DETAILS_WIDTH =  300;                // colorscheme-details dialog width

var SLIDE_DURATION =                    300;                // time taken to complete slide animations

var HIGHLIGHT_BORDER_COLOR =            'rgb(50, 200, 200)' // border color used to highlight elements in add member mode
var HIGHLIGHT_BOX_SHADOW_COLOR =        'rgb(80, 120, 255)' // box shadow color used to highlight elements in add member mode

/* Constants used by ColorHack */
// Not safe to change.

// Type enumeration of color scheme color types (used in color schemes)
var COLOR_TYPE_FOREGROUND =             1;
var COLOR_TYPE_BACKGROUND =             2;
var COLOR_TYPE_BORDER =                 3;

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
    var _dialogs =                  [];

    var _menu =                     {};
    var _toolbar =                  {};
    var _icon =                     {};

    var _colorSchemes =             {};

    var _colorSettings =            {};
    var _colorSettingsColors =      {};

    var _colorschemeDetails =       {};

    // Public properties
    this.components =               {};
    this.colorSchemes =             [];

    // Private methods
    var _GetElPos =                 function() {}
    var _RgbToHex =                 function() {}
    var _HexToRgb =                 function() {}

    var _CreateDefaultColorScheme = function() {}
    var _CreateColorSchemeMember =  function() {}

    var _AddColorSchemeMembers =    function() {}
    var _AddColorSchemes =          function() {}
    var _UpdateColorSchemes =       function() {}

    var _ToggleColorScheme =        function() {}
    var _SelectColorScheme =        function() {}

    var _RemoveColorScheme =        function() {}
    var _RemoveColorSchemeMember =  function() {}

    var _FillGradient =             function() {}
    var _SetActiveColor =           function() {}
    var _UpdateActiveColor =        function() {}
    var _SubmitColorTextbox =       function() {}

    // Public methods
    this.BuildDialogs =             function() {}
    this.SetupColorPickers =        function() {}
    this.AttachEvents =             function() {}
    this.SetDefaults =              function() {}
    this.Init =                     function() {} 

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

    // Counts the total number of color schemes created (included deleted ones).
    // Used to assign IDs to newly-created color schemes.
    var schemeCount = 0;

    // Variables used to count number of clicks.
    // Used to differentiate between single, double, etc. clicks.
    var _clickTimer = null, _clicks = 0;

    // Regex variables for input validation and filtering.
    var regexAlpha =    /^[a-zA-Z]*$/;
    var regexAlphaNum = /^[a-zA-Z0-9]*$/;
    var regexDec =      /^[0-9]*$/;
    var regexHex =      /^[a-fA-F0-9]*$/;

    // Boolean to track whether the control/command key is pressed.
    var _isCtrlPressed = false;

    // Indicates whether we are adding an element to the active color scheme.
    var _inAddMemberMode = false;
    // Dialog element ID of the member whose add button was clicked to enter add member mode
    // (used to determine where to add the new member).
    var _addMemberModeOriginator = null;
    // Dialog element ID of the color scheme we are adding a member to (while in add member mode).
    var _addMemberModeSchemeId = null;
    // Object to hold original element styling when temporarily changing them in add color scheme member mode.
    var _originalStyling = {};

    // Dialogs that make up the main UI.
    // Used to generate the menu toolbar options.
    var _dialogs = [
        { id: 'color-schemes',          name: 'Color Schemes' },
        { id: 'color-settings',         name: 'Color Settings' },
        { id: 'colorscheme-details',    name: 'Color Scheme Details' }
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
                for (var i = 0 ; i < _dialogs.length ; i++) {
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
        .append(
            $('<div/>', {
                id:         CH_PREFIX + 'color-schemes_schemes',
                'class':    CH_CLASS + ' ' +
                            CH_PREFIX + 'color-schemes'
            })
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
                        for (var i = 0; i < colors.length; i++) {
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
          COLORSCHEME DETAILS DIALOG
     --------------------------------
     */

    // Color scheme details dialog.
    // Shows details on element attributes and applied color rules.
    var _colorschemeDetails =
        $('<div/>', {
            id:         CH_PREFIX + 'colorscheme-details',
            'class':    CH_CLASS + ' ' +
                        CH_PREFIX + 'dialog'
        })
        // Add dialog header
        .append(
            _CreateDialogHeader('Color Scheme Details')
        )
    ;

    /*
     ================================
            PUBLIC PROPERTIES
     ================================
     */
    
    // Primary UI components used by ColorHack.
    this.components = {
        menu:                       _menu,
        icon:                       _icon,
        toolbar:                    _toolbar,

        dialogs:                    $()
                                        .add(_colorSchemes)
                                        .add(_colorSettings)
                                        .add(_colorschemeDetails),

        'color-schemes':            _colorSchemes,
        'color-schemes_schemes':    _colorSchemes.find('.' + CH_PREFIX + 'color-schemes'),

        'color-settings':           _colorSettings,
        'color-settings_colors':    _colorSettingsColors,
        'color-components':         {
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
        'color-picker_gradients':   {
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-picker_gradient-alpha')
                                    },
        'color-textboxes':          {
                                        hex:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-hex'),
                                        red:    _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-red'),
                                        green:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-green'),
                                        blue:   _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-blue'),
                                        alpha:  _colorSettingsColors.find('#' + CH_PREFIX + 'color-settings_color-textbox-alpha')
                                    },

        'colorscheme-details':      _colorschemeDetails
    };

    // Contains all the color schemes tracked by ColorHack.
    // Each color scheme is an object of the following form:
    //  {
    //      id:             string                              // id of color scheme element in color schemes dialog
    //      name:           string                              // arbitrary non-unique name given to color scheme
    //      memberCount:    integer                             // similar purpose to schemeCount for COLORHACK object
    //      members:        [ {                                 // array of objects to keep track of elements belonging to color scheme
    //              id:     string                                  // id of member element in color schemes dialog
    //              name:   string                                  // arbitrary non-unique name
    //              el:     element                                 // DOM element
    //          }, ... ]
    //      colors:         [ {                                 // array of objects describing color properties of color scheme
    //              type:   integer                                 // enumeration, describes type of color (e.g. color, background, ...)
    //              value:  { r: integer, g: integer, b: integer }  // rgb object
    //          }, ... ]
    //  }
    this.colorSchemes = [];

    // Should I even keep track of color schemes interally? Is it necessary?
    // Adding and deleting schemes and scheme members would be simpler without this...
    // If I need to do something with the color schemes later though (like generate CSS),
    // I would rather not go through the DOM to do it...

    /*
     ================================
              PRIVATE METHODS
     ================================
     */

    // Returns the position of an element on the page.
    var _GetElPos = function(el) {
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

    // Creates and returns a default internal color scheme object.
    var _CreateDefaultColorScheme = function() {
        var cs = {
            id:             CH_PREFIX + 'scheme' + schemeCount,
            name:           'Color Scheme ' + (schemeCount+1),
            memberCount:    0,
            members:        [],
            colors:     [
                { type:     COLOR_TYPE_FOREGROUND,
                  value:    { r: 0, g: 0, b: 0 } },
                { type:     COLOR_TYPE_BACKGROUND,
                  value:    { r: 255, g: 255, b: 255 } },
                { type:     COLOR_TYPE_BORDER,
                  value:    { r: 0, g: 0, b: 0 } }
            ]
        };
        schemeCount++;

        return cs;
    }

    // Creates and returns an internal color scheme member object.
    var _CreateColorSchemeMember = function(element, elementName, schemeIndex, scheme) {
        var member = {
            id:     CH_PREFIX + 'scheme' + schemeIndex + '_member' + scheme.memberCount,
            name:   elementName,
            el:     element
        }
        scheme.memberCount++;

        return member;
    }

    // Adds one or more members to the input color scheme.
    // Input color scheme is a JQ DOM element, members is an array of member objects.
    var _AddColorSchemeMembers = function($scheme, members, afterTarget) {
        var $newMembers = $();

        var addColorSchemeMember = function(index) {
            $newMembers = $newMembers.add(
                $('<div/>', {
                    id:         members[index].id,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-scheme_member'
                })
                .append(
                    $('<span/>', {
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-scheme_member_name'
                    })
                    .html( // shorten displayed name if too long to fit
                        members[index].name.length > 20 ?
                        members[index].name.substring(0, 20) + '...' :
                        members[index].name
                    )
                )
                .append(
                    $('<span/>', {
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'inline-button ' +
                                    CH_PREFIX + 'small ' +
                                    CH_PREFIX + 'color-scheme_add'
                    })
                    .html('<span>+</span>')
                )
                .append(
                    $('<span/>', {
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'inline-button ' +
                                    CH_PREFIX + 'small ' +
                                    CH_PREFIX + 'color-scheme_remove'
                    })
                    .html('<span>&minus;</span>')
                )
            );
        }

        for (var i = 0; i < members.length; i++) {
            addColorSchemeMember(i);
        }

        // Add color scheme members to DOM.
        if (typeof afterTarget === 'undefined') {
            $scheme.find('.' + CH_PREFIX + 'color-scheme_members').append($newMembers);
        } else {
            $newMembers.insertAfter(afterTarget);
        }
    }

    // Adds one or more color schemes to Color Schemes dialog.
    // Input color schemes is an array of color scheme objects.
    var _AddColorSchemes = function(schemes, afterTarget) {
        var $newSchemes = $();

        var addColorScheme = function(index) {
            $newSchemes = $newSchemes.add(
                $('<div/>', {
                    id:         schemes[index].id,
                    'class':    CH_CLASS + ' ' +
                                CH_PREFIX + 'color-scheme'
                })
                .append(
                    $('<h3/>', {
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-scheme_title'
                    })
                    .append(
                        $('<span/>', {
                            'class':    CH_CLASS + ' ' +
                                        CH_PREFIX + 'inline-button ' +
                                        CH_PREFIX + 'color-scheme_toggle'
                        })
                        // #x25b6 = black right triangle arrow
                        // #x25bc = black down triangle arrow
                        .html('<span>&#x25b6;</span>')
                    )
                    .append(
                        $('<span/>', {
                            'class':    CH_CLASS + ' ' +
                                        CH_PREFIX + 'color-scheme_name'
                        })
                        .html(schemes[index].name)
                    )
                    .append(
                        $('<span/>', {
                            'class':    CH_CLASS + ' ' +
                                        CH_PREFIX + 'inline-button ' +
                                        CH_PREFIX + 'color-scheme_add'
                        })
                        .html('<span>+</span>')
                    )
                    .append(
                        $('<span/>', {
                            'class':    CH_CLASS + ' ' +
                                        CH_PREFIX + 'inline-button ' +
                                        CH_PREFIX + 'color-scheme_remove'
                        })
                        .html('<span>&minus;</span>')
                    )
                )
                .append(
                    $('<div/>', {
                        'class':    CH_CLASS + ' ' +
                                    CH_PREFIX + 'color-scheme_members'
                    })
                    .hide()
                )
            )
            // Add member DOM elements to the color scheme.
            _AddColorSchemeMembers($newSchemes.eq(index), schemes[index].members);
        }

        for (var i = 0; i < schemes.length; i++) {
            addColorScheme(i);
        }

        // Add color schemes to DOM.
        if (typeof afterTarget === 'undefined') {
            COLORHACK.components['color-schemes'].find('#' + CH_PREFIX + 'color-schemes_schemes')
                .append($newSchemes);
        } else {
            $newSchemes.insertAfter(afterTarget);
        }
    }

    // Updates Color Schemes dialog based on internal color schemes in ColorHack object.
    var _UpdateColorSchemes = function() {
        var $colorSchemes = COLORHACK.components['color-schemes'].find('#' + CH_PREFIX + 'color-schemes_schemes');
        $colorSchemes.empty();
        _AddColorSchemes(COLORHACK.colorSchemes);
    }

    var _ToggleColorScheme = function(el) {
        var $cs = $(el).closest('.' + CH_PREFIX + 'color-scheme');
        var $members = $cs.find('.' + CH_PREFIX + 'color-scheme_members');

        if ($cs.hasClass(CH_PREFIX + 'expanded')) {
            $cs.removeClass(CH_PREFIX + 'expanded');
            $cs.find('.' + CH_PREFIX + 'color-scheme_toggle').css({
                '-ms-transform':       '',
                '-moz-transform':      '',
                '-webkit-transform':   '',
                '-o-transform':        '',
                'transform':           ''
            })
        } else {
            $cs.addClass(CH_PREFIX + 'expanded');
            $cs.find('.' + CH_PREFIX + 'color-scheme_toggle').css({
                '-ms-transform':       'rotate(90deg)',
                '-moz-transform':      'rotate(90deg)',
                '-webkit-transform':   'rotate(90deg)',
                '-o-transform':        'rotate(90deg)',
                'transform':           'rotate(90deg)'
            })
        }
        /*if ($members.css('display') === 'none') {
            $cs.find('.' + CH_PREFIX + 'color-scheme_toggle span').html('&#x25bc;');
        } else {
            $cs.find('.' + CH_PREFIX + 'color-scheme_toggle span').html('&#x25b6;');
        }*/
        $members.slideToggle(SLIDE_DURATION, function() {});
    }

    // Selects color scheme from input color scheme element.
    var _SelectColorScheme = function(el) {
        var $cs = $(el);

        $cs.parent().find('.' + CH_PREFIX + 'color-scheme.' + CH_PREFIX + 'selected').removeClass(CH_PREFIX + 'selected');
        $cs.addClass(CH_PREFIX + 'selected');
    }

    // Removes a color scheme from colorhack and the page by the index.
    var _RemoveColorScheme = function(schemeId) {
        // Remove from COLORHACK object.
        for (var i = 0; i < COLORHACK.colorSchemes.length; i++) {
            if (COLORHACK.colorSchemes[i].id === schemeId) {
                COLORHACK.colorSchemes.splice(i, 1);
                break;
            }
        }

        // Remove from DOM.
        COLORHACK.components['color-schemes_schemes'].find('#' + schemeId).remove();
    }

    // Removes a color scheme member element from colorhack and the page by index.
    var _RemoveColorSchemeMember = function(schemeId, memberId) {
        // TODO: Add placeholder "No elements assigned to color scheme" member to DOM if none exist (and also remove when adding new members)
        // Remove from COLORHACK object.
        for (var i = 0; i < COLORHACK.colorSchemes.length; i++) {
            if (COLORHACK.colorSchemes[i].id === schemeId) {
                for (var j = 0; j < COLORHACK.colorSchemes[i].members.length; j++) {
                    if (COLORHACK.colorSchemes[i].members[j].id === memberId) {
                        COLORHACK.colorSchemes[i].members.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }

        // Remove from DOM
        COLORHACK.components['color-schemes_schemes'].find('#' + schemeId).find('#' + memberId).remove();
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

    // Performs all updates needed to change the active color, based on the input rgba object.
    var _SetActiveColor = function(rgba) {
        var hue = 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ', 1)';
        var color = 'rgba(' + rgba.red + ', ' + rgba.green + ', ' + rgba.blue + ', ' + rgba.alpha/100 + ')';
http://www.youtube.com/watch?v=KHchLxioU08&feature=player_embedded
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

    // Performs all updates needed when changing the active color in the color settings dialog.
    // Uses all color picker selector positions.
    var _UpdateActiveColor = function() {
        var colors = ['red', 'green', 'blue', 'alpha'];
        var rgba = {};

        // Get the rgb value for each specific hue
        for (var i = 0; i < colors.length; i++) {
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

    // Submits color value entered into color picker textbox.
    var _SubmitColorTextbox = function(target, isHex, isAlpha) {
        if (isHex) {
            // Get the textbox input value as a hex color value.
            var val = target.value.substring(0, 6); // value may be too long after copy-paste
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
        } else {
            // Get the textbox input value as an integer.
            var val = parseInt(target.value.replace(/\D/g, '').substring(0, 3), 10); // convert to integer
            if (val > 255 && !isAlpha)
                val = 255;
            else if (val > 100 && isAlpha)
                val = 100;

            // Set selector position.
            $target = $(target);
            if (isAlpha)
                $($target.data('selector')).css('left', (val / 100 * 255) + 'px');
            else
                $($target.data('selector')).css('left', val + 'px');

            _UpdateActiveColor();
        }
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
            .append(this.components['colorscheme-details'])
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
        for (var i = 0; i < colors.length; i++) {
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

        $('body *').not('.' + CH_CLASS)
            // TODO: Make this more robust. Doesn't work as well as element selectors yet in browser development tools yet.
            // Highlight elements under mouse when selecting new member to add to color scheme.
            .on('mouseover', function(e) { // preferable over mouseenter so that handle is triggered when hover moved to parent element.
                if (!_inAddMemberMode)
                    return;

                if (_originalStyling.target) {
                    // Restore original styling of previously hovered element.
                    var $prevTarget = _originalStyling.target;
                    $prevTarget.css('box-shadow', _originalStyling.boxShadow);
                }

                var $target = $(e.target);
                // Save original styling of hovered element.
                _originalStyling.target = $target;
                _originalStyling.boxShadow = $target.css('box-shadow');

                // Set new styling for hovered element.
                $target.css('box-shadow', '0 0 2px 2px ' + HIGHLIGHT_BOX_SHADOW_COLOR);
                // NOTE: There is an issue here where stylesheet box-shadow styling is overwritten.
                // This can be averted by appending the new styling with ", ". However, it would then
                // no longer work for elements that don't have box-shadow styling. Since I don't know
                // of a good way to check stylesheet styling of an element (especially since most
                // styles are inherited), I will leave this as is.
            })

            // Unhighlight a highlighted element under the mouse when adding color scheme memebers.
            .on('mouseout', function(e) { // preferable over mouseleave for same reason as mouseover
                if (!_inAddMemberMode)
                    return;

                if (_originalStyling.target) {
                    // Restore original styling of hovered element.
                    var $target = _originalStyling.target;
                    $target.css('box-shadow', _originalStyling.boxShadow);

                    _originalStyling.target = null;
                }
            })

            // Add highlighted element when selecting new member to add to color scheme.
            .on('click', function(e) {
                if (!_inAddMemberMode)
                    return;

                var $target = $(e.target);
                var $scheme = $target.closest('.' + CH_PREFIX + 'color-scheme');

                if (_originalStyling.target) {
                    // Restore original styling of previously hovered element.
                    var $prevTarget = _originalStyling.target;
                    $prevTarget.css('border-color', _originalStyling.borderColor);
                    $prevTarget.css('box-shadow', _originalStyling.boxShadow);

                    _originalStyling.target = null;
                }

                // Look for color scheme to add member to.
                for (var i = 0; i < COLORHACK.colorSchemes.length; i++) {
                    if (COLORHACK.colorSchemes[i].id === _addMemberModeSchemeId) {
                        // Build default member name (can be changed by user later).
                        // Default name has format:
                        //      <tag_name>#<id>.<class1>.<class2>[...]
                        var memberName = e.target.nodeName.toLowerCase();
                        memberName +=
                            (e.target.id ? ('#' + e.target.id) : '') +
                            (e.target.className ?
                                ((function(classes) {
                                    var output = '';
                                    var htmlClasses = classes.split(' ');
                                    for (var i = 0; i < htmlClasses.length; i++) {
                                        if (htmlClasses[i].length > 0) {
                                            output += '.' + htmlClasses[i];
                                        }
                                    }
                                    return output;
                                })(e.target.className)) : '')
                        ;

                        var newMember = _CreateColorSchemeMember(
                            e.target,
                            memberName,
                            i,
                            COLORHACK.colorSchemes[i]
                        );

                        COLORHACK.colorSchemes[i].members.push(newMember);
                        _AddColorSchemeMembers($('#' + _addMemberModeSchemeId), [newMember]);
                        break;
                    }
                }

                // Block default click behavior and switch to normal mode.
                _inAddMemberMode = false;
                _addMemberModeSchemeId = null;
                if (e.preventDefault) e.preventDefault();
                return false;
            })
        ;

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

        /* DIALOGS */

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

        /* COLOR SCHEMES DIALOG */

        // Toggle slide on color scheme toggle icon click.
        this.components['color-schemes_schemes']
            // Select active color scheme on color scheme click.
            .on('click', '.' + CH_PREFIX + 'color-scheme', function (e) {
                _SelectColorScheme(this);
            })

            .on('click', '.' + CH_PREFIX + 'color-scheme_toggle', function (e) {
                _ToggleColorScheme(this);
            })

            // Add color scheme on plus icon click.
            .on('click', '.' + CH_PREFIX + 'color-scheme > * > .' + CH_PREFIX + 'color-scheme_add', function(e) {
                var $cs = $(this).closest('.' + CH_PREFIX + 'color-scheme');
                var newScheme = _CreateDefaultColorScheme();

                // TODO: move the code for adding to internal color scheme array to _AddColorSchemes.
                // Should do this after finished color schemes dialog (so we can remove the extra test color schemes on load).

                COLORHACK.colorSchemes.push(newScheme);
                _AddColorSchemes([newScheme], $cs);
            })

            // Remove color scheme on minus icon click.
            .on('click', '.' + CH_PREFIX + 'color-scheme > * > .' + CH_PREFIX + 'color-scheme_remove', function(e) {
                var $this = $(this);
                _RemoveColorScheme($this.closest('.' + CH_PREFIX + 'color-scheme').get(0).id);
            })

            // Add color scheme member on plus icon click.
            .on('click', '.' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'color-scheme_add', function(e) {
                var $this = $(this);

                _inAddMemberMode = true;
                _addMemberModeOriginator = this;
                _addMemberModeSchemeId = $this.closest('.' + CH_PREFIX + 'color-scheme').get(0).id;
            })

            // Remove color scheme member on minus icon click.
            .on('click', '.' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'color-scheme_remove', function(e) {
                var $this = $(this);
                _RemoveColorSchemeMember(
                    $this.closest('.' + CH_PREFIX + 'color-scheme').get(0).id,
                    $this.closest('.' + CH_PREFIX + 'color-scheme_member').get(0).id
                );
            })
        ;

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
                    var xPos = e.pageX - _GetElPos(e.target).x - 2; // 2 to account for selector width

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

                // Allow keypress if ctrl/cmd is being pressed (e.g. for copy-paste action).
                if (_isCtrlPressed)
                    return true;

                // If key pressed is enter, submit color value.
                if (key === 13) {                   // enter
                    return _SubmitColorTextbox(e.target, isHex, isAlpha);
                }

                // Allow special characters.
                if ((key === 8 || key === 46) ||    // backspace, delete
                    (key === 9) ||                  // tab key
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
                    // Allow additional character input if text is selected (highlighted text is replaced).
                    if (e.target.selectionStart !== e.target.selectionEnd)
                        return true;
                    if (e.preventDefault) e.preventDefault();
                    return false;
                }
            })
            .keydown(function(e) {
                if (e.ctrlKey || e.metaKey) // if key pressed is ctrl or cmd (Macs) key
                    _isCtrlPressed = true;
            })
            .keyup(function(e) {
                if (_isCtrlPressed)
                    _isCtrlPressed = false;
            })
            .blur(function(e) {
                var isHex = (e.target.id.indexOf('hex') !== -1) ? true : false;
                var isAlpha = (e.target.id.indexOf('alpha') !== -1) ? true : false;
                _SubmitColorTextbox(e.target, isHex, isAlpha);
            });
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
        this.components['colorscheme-details'].css({
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

        // Set up default first color scheme
        this.colorSchemes.push({ // start with few elements for testing
            id:             CH_PREFIX + 'scheme' + schemeCount,
            name:           'Color Scheme ' + (schemeCount+1),
            memberCount:    2, // change to 0
            //members:    [],
            members:    [
                { name:     'head',
                  id:       CH_PREFIX + 'scheme' + schemeCount + '_member0',
                  el:       $('head').get(0) },
                { name:     'body',
                  id:       CH_PREFIX + 'scheme0_member1',
                  el:       $('body').get(0) }
            ],
            colors:     [
                { type:     COLOR_TYPE_FOREGROUND,
                  value:    { r: 0, g: 0, b: 0 } },
                { type:     COLOR_TYPE_BACKGROUND,
                  value:    { r: 255, g: 255, b: 255 } },
                { type:     COLOR_TYPE_BORDER,
                  value:    { r: 0, g: 0, b: 0 } }
            ]
        });
        schemeCount++;
        this.colorSchemes.push({
            id:         CH_PREFIX + 'scheme1',
            name:       'Color Scheme 2',
            memberCount:    1, // change to 0
            members:    [
                { name:     'body',
                  id:       CH_PREFIX + 'scheme1_member0',
                  el:       $('body').get(0) }
            ],
            colors:     [
                { type:     COLOR_TYPE_FOREGROUND,
                  value:    { r: 0, g: 0, b: 0 } },
                { type:     COLOR_TYPE_BACKGROUND,
                  value:    { r: 255, g: 255, b: 255 } },
                { type:     COLOR_TYPE_BORDER,
                  value:    { r: 0, g: 0, b: 0 } }
            ]
        });
        schemeCount++;
        this.colorSchemes.push({
            id:         CH_PREFIX + 'scheme2',
            name:       'Color Scheme 3',
            memberCount:    1, // change to 0
            members:    [
                { name:     'body',
                  id:       CH_PREFIX + 'scheme2_member0',
                  el:       $('body').get(0) }
            ],
            colors:     [
                { type:     COLOR_TYPE_FOREGROUND,
                  value:    { r: 0, g: 0, b: 0 } },
                { type:     COLOR_TYPE_BACKGROUND,
                  value:    { r: 255, g: 255, b: 255 } },
                { type:     COLOR_TYPE_BORDER,
                  value:    { r: 0, g: 0, b: 0 } }
            ]
        });
        schemeCount++;
        _UpdateColorSchemes();

        // Automatically select and expand the first color scheme.
        var firstScheme = this.components['color-schemes_schemes'].find('.' + CH_PREFIX + 'color-scheme:first-child').get(0)
        _SelectColorScheme(firstScheme);
        _ToggleColorScheme($(firstScheme).find('.' + CH_PREFIX + 'color-scheme_toggle').get(0));

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
            for (var i = 0 ; i < els.length ; i++) {
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
            for (var i = 0 ; i < els.length ; i++) {
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

            '-ms-transition:' +         'color .1s linear, border-color .1s linear, opacity .15s linear, -ms-transform .1s linear;',
            '-moz-transition:' +        'color .1s linear, border-color .1s linear, opacity .15s linear, -moz-transform .1s linear;',
            '-webkit-transition:' +     'color .1s linear, border-color .1s linear, opacity .15s linear, -webkit-transform .1s linear;',
            '-o-transition:' +          'color .1s linear, border-color .1s linear, opacity .15s linear, -o-transform .1s linear;',
            'transition:' +             'color .1s linear, border-color .1s linear, opacity .15s linear, transform .1s linear;',
        '}',
        '.' + CH_CLASS + ':not(.' + CH_PREFIX + 'dialog) * {',
            '-ms-transition:' +         'background .1s linear;',
            '-moz-transition:' +        'background .1s linear;',
            '-webkit-transition:' +     'background .1s linear;',
            '-o-transition:' +          'background .1s linear;',
            'transition:' +             'background .1s linear;',
        '}',
        'div.' + CH_CLASS + ', input.' + CH_CLASS + ' {',
            'font-weight:' +            'lighter;',
        '}',
        'h1.' + CH_CLASS + ',',
        'h2.' + CH_CLASS + ',',
        'h3.' + CH_CLASS + ',',
        'h4.' + CH_CLASS + ',',
        'h5.' + CH_CLASS + ',',
        'h6.' + CH_CLASS + ' {',
            'font-weight:' +            'bold;',
        '}',

        '.' + CH_CLASS + '.' + CH_PREFIX + 'inline-button {',
            'height:' +                 '14px;',
            'width:' +                  '14px;',
            'display:' +                'inline-block;',
            'padding:' +                '0 1px;',
            'cursor:' +                 'pointer;',

            'background:' +             'rgba(60, 60, 60, 0.4);',

            'font-size:' +              '16px;',
            'font-weight:' +            'bold;',
            'line-height:' +            '10px;',
            'text-align:' +             'center;',

            '-ms-transition:' +         'background 0s linear;',
            '-moz-transition:' +        'background 0s linear;',
            '-webkit-transition:' +     'background 0s linear;',
            '-o-transition:' +          'background 0s linear;',
            'transition:' +             'background 0s linear;',
        '}',
        '.' + CH_CLASS + '.' + CH_PREFIX + 'inline-button.' + CH_PREFIX + 'small {',
            'height:' +                 '12px;',
            'width:' +                  '12px;',

            'font-size:' +              '16px;',
            'line-height:' +            '8px;',
        '}',
        '.' + CH_CLASS + '.' + CH_PREFIX + 'inline-button span {',
            'display:' +                'inline-block;',
            'margin:' +                 '0 auto;',
        '}',
        '.' + CH_CLASS + '.' + CH_PREFIX + 'inline-button:hover {',
            'background:' +             'rgba(60, 60, 60, 0.8);',
        '}',


        // Menu + dialogs
        '#' + CH_PREFIX + 'menu,',
        '#' + CH_PREFIX + 'color-schemes,',
        '#' + CH_PREFIX + 'color-settings,',
        '#' + CH_PREFIX + 'colorscheme-details {',
        // Position is !important to overwrite jQuery inline style of position: relative for Chrome.
        // Possibly a bug in jQuery UI (checks for other position styling, so should not overwrite it).
        // Have not been able to isolate exact cause in jq, and have not been able to reproduce issue in simpler test cases.
            'position:' +               'fixed !important;',
        '}',
        '#' + CH_PREFIX + 'menu,',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header {',
            '-ms-user-select:' +        'none;',
            '-moz-user-select:' +       'none;',
            '-webkit-user-select:' +    'none;',
            '-o-user-select:' +         'none;',
            'user-select:' +            'none;',
        '}',
        '#' + CH_PREFIX + 'icon,',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header,',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header {',
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
            'width:' +              '180px;',

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
        '#' + CH_PREFIX + 'colorscheme-details {',
            'z-index:' +            BASE_Z_INDEX + ';',

            'opacity:' +            '0.6;',
            'color:' +              'rgb(240, 240, 240);',
            'background:' +         'rgb(60, 60, 60);',
            'border:' +             '2px solid rgb(60, 60, 60);',

            'font-size:' +          '12px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes:hover, ',
        '#' + CH_PREFIX + 'color-settings:hover, ',
        '#' + CH_PREFIX + 'colorscheme-details:hover {',
            'opacity:' +            '1;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header {',
            'height:' +             '22px;',
            'position:' +           'relative;',

            'border-bottom:' +      '2px solid rgb(60, 60, 60);',

            'cursor:' +             'move;',
            'font-size:' +          '14px;',
            'text-align:' +         'center;',
            'white-space:' +        'nowrap;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title {',
            'display:' +            'inline-block;',
            'line-height:' +        '22px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close {',
            'position:' +           'absolute;',
            'top:' +                '0;',
            'right:' +              '0;',
            'padding:' +            '0 8px;',

            'cursor:' +             'pointer;',
            'opacity:' +            '0.6;',

            'font-size:' +          '18px;',
            'line-height:' +        '20px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover {',
            'opacity:' +            '1;',
        '}',

        /* Want everything but textboxes and editable elements to be non-selectable (highlight-able)
         * Haven't been able to get it working either by selecting specific elements or using :not() */
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-label,',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'color-label,',
        '#' + CH_PREFIX + 'colorscheme-details .' + CH_PREFIX + 'color-label {',
            '-ms-user-select:' +        'none;',
            '-moz-user-select:' +       'none;',
            '-webkit-user-select:' +    'none;',
            '-o-user-select:' +         'none;',
            'user-select:' +            'none;',

            'font-weight:' +            'normal;',
        '}',


        // Color schemes dialog
        '#' + CH_PREFIX + 'color-schemes {',
            'height:' +             DIALOG_COLOR_SCHEMES_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SCHEMES_WIDTH + 'px;',
        '}',

        '#' + CH_PREFIX + 'color-schemes #' + CH_PREFIX + 'color-schemes_schemes {',
            'height:' +             (DIALOG_COLOR_SCHEMES_HEIGHT - 22 - 2) + 'px;', // dialog_h - header_h - header_border_w
            'overflow:' +           'auto;',
        '}',

        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme {',
            'padding:' +            '4px 8px;',
            //'cursor:' +             'pointer;',

            'border:' +             '1px solid rgb(80, 80, 80);',

            'background:' +         'rgb(100, 100, 100);',
            'background:' +         '-ms-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-moz-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-webkit-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-o-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         'linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme:hover {',
            'border-color:' +       'rgb(160, 160, 160);',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme.' + CH_PREFIX + 'selected {',
            'box-shadow:' +         '0 0 2px 1px rgb(200, 200, 200) inset;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme.' + CH_PREFIX + 'expanded {',
            'background:' +         '-ms-linear-gradient(top, rgb(90, 90, 90) 0%, rgb(110, 110, 110) 100%);',
            'background:' +         '-moz-linear-gradient(top, rgb(90, 90, 90) 0%, rgb(110, 110, 110) 100%);',
            'background:' +         '-webkit-linear-gradient(top, rgb(90, 90, 90) 0%, rgb(110, 110, 110) 100%);',
            'background:' +         '-o-linear-gradient(top, rgb(90, 90, 90) 0%, rgb(110, 110, 110) 100%);',
            'background:' +         'linear-gradient(top, rgb(90, 90, 90) 0%, rgb(110, 110, 110) 100%);',
        '}',

        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_title {',
            'position:' +           'relative;',

            'font-size:' +          '14px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_name {',
            'margin:' +             '0 4px;',
            'cursor:' +             'text;',

            'font-weight:' +        'normal;',
        '}',

        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_toggle {',
            'width:' +              '12px;',
            'position:' +           'relative;',
            'top:' +                '-1px;',
            'cursor:' +             'pointer;',

            'background:' +         'rgba(0, 0, 0, 0);',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_toggle span {',
            'font-size:' +          '10px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_add, ',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_remove {',
            'position:' +           'absolute;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_add {',
            'right:' +              '20px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_remove {',
            'right:' +              '0;',
        '}',

        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_members {',
            'margin:' +             '4px 0 0 16px;',
            'padding:' +            '4px 0;',
            'border-top:' +         '1px solid rgba(160, 160, 160, 0.8);',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member {',
            'position:' +           'relative;',
            'padding:' +            '3px 2px;',

            'cursor:' +             'default;',

            '-ms-transition:' +     'background 0s linear;',
            '-moz-transition:' +    'background 0s linear;',
            '-webkit-transition:' + 'background 0s linear;',
            '-o-transition:' +      'background 0s linear;',
            'transition:' +         'background 0s linear;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'color-scheme_member_name {',
            'cursor:' +             'text;',

            'letter-spacing:' +     '1px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'color-scheme_add {',
            'right:' +              '22px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'color-scheme_remove {',
            'right:' +              '2px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member:hover {',
            'background:' +         'rgba(60, 60, 60, 0.2);',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member .' + CH_PREFIX + 'inline-button {',
            'visibility:' +         'hidden;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'color-scheme_member:hover .' + CH_PREFIX + 'inline-button {',
            'visibility:' +         'visible;',
        '}',


        // Color settings dialog
        '#' + CH_PREFIX + 'color-settings {',
            'height:' +             DIALOG_COLOR_SETTINGS_HEIGHT + 'px;',
            'width:' +              DIALOG_COLOR_SETTINGS_WIDTH + 'px;',
        '}',

        '#' + CH_PREFIX + 'color-settings_colors {',
            'padding:' +            '2px 8px;',
            'position:' +           'relative;',
            'z-index:' +            (BASE_Z_INDEX + 11) + ';',

            'border:' +             '1px solid rgb(80, 80, 80);',

            'background:' +         'rgb(100, 100, 100);',
            'background:' +         '-ms-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-moz-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-webkit-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         '-o-linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
            'background:' +         'linear-gradient(top, rgb(110, 110, 110) 0%, rgb(90, 90, 90) 100%);',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors:hover {',
            'border-color:' +       'rgb(160, 160, 160);',
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
            'width:' +              '265px;', // width of gradient + width of selector
            'position:' +           'relative;',
            'z-index:' +            (BASE_Z_INDEX + 12) + ';',
        '}',
        '#' + CH_PREFIX + 'color-settings_colors .' + CH_PREFIX + 'color-picker_gradient {',
            'position:' +           'absolute;',
            'left:' +               '4px;', // proportional to selector width
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


        // Color scheme details dialog
        '#' + CH_PREFIX + 'colorscheme-details {',
            'height:' +             DIALOG_COLORSCHEME_DETAILS_HEIGHT + 'px;',
            'width:' +              DIALOG_COLORSCHEME_DETAILS_WIDTH + 'px;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(STYLESHEET.join(' '))
    );
}

// Add ColorHack to the page once it has finished loading.
$(function() {
    if (typeof COLORHACK === 'undefined') {
        LoadCssReset();
        LoadStylesheet();

        COLORHACK = new ColorHack();
        COLORHACK.Init();
    }
});
