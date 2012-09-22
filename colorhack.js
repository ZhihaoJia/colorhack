/* ======== ColorHack ======== */

/*  GLOBAL VARIABLES */

// Modify these values to resolve conflicts with the page's elements.
var CH_PREFIX =     'colorhack_';   // HTML id prefix for naming ColorHack elements
var CH_CLASS =      'colorhack';    // HTML class to identify ColorHack elements

// ColorHack "class".
// Contains properties and methods for ColorHack objects.
// Any page should only have one instance of the ColorHack class.
function ColorHack() {

    // Dialogs that make up the main UI.
    // Used to generate the menu toolbar options.
    var _dialogs = [
        { id: 'color-schemes',          text: 'Color Scheme' },
        { id: 'color-settings',         text: 'Color Settings' },
        { id: 'element-details',        text: 'Element Details' }
    ];

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
    
    // Primary components used by ColorHack.
    this.components = {
        // Menu located on the bottom-right of the page.
        // Contains the icon and toolbar components.
        menu:
            $('<div/>', {
                id:         CH_PREFIX + 'menu',
                'class':    CH_CLASS
            })
        ,

        // Menu icon located on the bottom-right of the page.
        // Toggles visibility of the toolbar.
        icon:
            $('<h1/>', {
                id:         CH_PREFIX + 'icon',
                'class':    CH_CLASS
            })
            .text('ColorHack')
        ,

        // Toolbar located on the bottom-right of the page.
        // Provides a menu to toggle visibility of ColorHack dialogs.
        toolbar:
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
                                    'class':    CH_CLASS + ' ' + CH_PREFIX + 'toolbar-item-check'
                                })
                                .html('&#x2713') // checkmark
                            )
                            .append(_dialogs[i].text)
                        );
                    }
                    return toolbarOptions;
                })()
            )
            .hide()
        ,

        // Color scheme dialog.
        // Manages color rules and elements that use the rules.
        'color-schemes':
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
                //cancel:         '.' + CH_CLASS + ':not(.' + CH_PREFIX + 'dialog-header)',
                //containment:    'body',
                scroll:         false,
                zIndex:         10000
            })
        ,

        // Color settings dialog.
        // Manages the set of color styles in a color rule.
        'color-settings':
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
                zIndex:         10000
            })
        ,

        // Element details dialog.
        // Shows details on element attributes and applied color rules.
        'element-details':
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
                zIndex:         10000
            })
    };

}

// Builds the DOM for ColorHack elements.
ColorHack.prototype.AssembleComponents = function() {
    $(document.body)
        // Build bottom-right menu and add it to page
        .append(this.components.menu
            .append(this.components.toolbar)
            .append(this.components.icon)
            .appendTo(document.body)
        )
        // Add dialogs to page
        .append(this.components['color-schemes'])
        .append(this.components['color-settings'])
        .append(this.components['element-details'])
    ;
}

// Creates and attaches events for ColorHack elements.
ColorHack.prototype.AttachEvents = function() {
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
            var $toolbar = $('#' + CH_PREFIX + 'toolbar')
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
                $('#' + this.id.replace('toolbar_', '')).show();
            } else {
                // Remove checkmark
                $checkbox.html('');
                // Hide corresponding dialog
                $('#' + this.id.replace('toolbar_', '')).hide();
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

// Sets up ColorHack on the page.
ColorHack.prototype.Init = function() {
    this.AssembleComponents();
    this.AttachEvents();
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
        '    margin:             0;',
        '    padding:            0;',
        '    border:             0;',
        '    outline:            0;',
        '    font-size:          100%;',
        '    font:               inherit;',
        '    vertical-align:     baseline;',
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
        '    display:            block;',
        '}',

        '.' + CH_CLASS,
        '{',
        '    line-height:        1;',
        '}',
        'ol.' + CH_CLASS, ', ul.' + CH_CLASS,
        '{',
        '    list-style:         none;',
        '}',
        'a.' + CH_CLASS,
        '{',
        '    text-decoration:    none;',
        '}',
        'blockquote.' + CH_CLASS + ', q.' + CH_CLASS,
        '{',
        '    quotes:             none;',
        '}',
        'blockquote.' + CH_CLASS + ':before, blockquote.' + CH_CLASS + ':after',
        'q.' + CH_CLASS + ':before, q.' + CH_CLASS + ':after',
        ' {',
        '    content:            "";',
        '    content:            none;',
        '}',

        'ins.' + CH_CLASS,
        '{',
        '    text-decoration:    underline;',
        '}',
        'del.' + CH_CLASS,
        '{',
        '    text-decoration:    line-through;',
        '}',

        'table.' + CH_CLASS,
        '{',
        '    border-collapse:    collapse;',
        '    border-spacing:     0;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(CSS_RESET.join('\n'))
    );
}

// Loads ColorHack stylesheet.
function LoadStylesheet() {
    // Another monstrosity...
    var STYLESHEET = [
        // General
        '.' + CH_CLASS + ' {',
        '    font-family:            "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif !important;',

        '    -ms-transition:         color .1s linear, background .1s linear, opacity .2s linear;',
        '    -moz-transition:        color .1s linear, background .1s linear, opacity .2s linear;',
        '    -webkit-transition:     color .1s linear, background .1s linear, opacity .2s linear;',
        '    -o-transition:          color .1s linear, background .1s linear, opacity .2s linear;',
        '    transition:             color .1s linear, background .1s linear, opacity .2s linear;',
        '}',
        'h1.' + CH_CLASS + ', ',
        'h2.' + CH_CLASS + ', ',
        'h3.' + CH_CLASS + ', ',
        'h4.' + CH_CLASS + ', ',
        'h5.' + CH_CLASS + ', ',
        'h6.' + CH_CLASS + '  {',
        '    font-weight:            bold;',
        '}',

        // Menu + dialogs
        '#' + CH_PREFIX + 'menu, ',
        '#' + CH_PREFIX + 'color-schemes, ',
        '#' + CH_PREFIX + 'color-settings, ',
        '#' + CH_PREFIX + 'element-details {',
        '    position:               fixed;',

        '    -ms-user-select:        none;',
        '    -moz-user-select:       none;',
        '    -webkit-user-select:    none;',
        '    -o-user-select:         none;',
        '    user-select:            none;',
        '}',
        '#' + CH_PREFIX + 'icon, ',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header {',
        '    color:                  rgb(80, 80, 80);',
        '    background:             rgb(240, 240, 240);', // won't be applied if browser supports CSS3
        '    cursor:                 pointer;',

        '    background:         -ms-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(220, 220, 220) 100%);',
        '    background:         -moz-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(220, 220, 220) 100%);',
        '    background:         -webkit-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(220, 220, 220) 100%);',
        '    background:         -o-linear-gradient(top, rgb(250, 250, 250) 0%, rgb(220, 220, 220) 100%);',
        '    background:         linear-gradient(top, rgb(250, 250, 250) 0%, rgb(220, 220, 220) 100%);',
        '}',

        // Menu
        '#' + CH_PREFIX + 'menu {',
        '    z-index:                9010;',
        '    bottom:                 0;',
        '    right:                  0;',
        '    margin:                 4px;',

        '    font-size:              16px;',
        '    text-align:             center;',
        '}',
        '#' + CH_PREFIX + 'icon, ',
        '#' + CH_PREFIX + 'toolbar {',
        '    width:                  150px;',

        '    opacity:                0.6;',
        '    border:                 2px solid rgb(80, 80, 80);',
        '}',
        '#' + CH_PREFIX + 'icon {',
        '    padding:                4px 0;',
        '}',
        '#' + CH_PREFIX + 'toolbar {',
        '    border-bottom:          0;',

        '    text-align:             left;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item {',
        '    padding:                4px;',

        '    color:                  rgb(240, 240, 240);',
        '    background:             rgb(120, 120, 120);',
        '    border-top:             1px solid rgb(180, 180, 180);',

        '    cursor:                 pointer;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item:first-child {',
        '    border-top:             0;',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item:hover {',
        '    background:             rgb(80, 80, 80);',
        '}',
        '#' + CH_PREFIX + 'toolbar .' + CH_PREFIX + 'toolbar-item .' + CH_PREFIX + 'toolbar-item-check {',
        '    width:                  16px;',
        '    display:                inline-block;',
        '}',

        // Dialogs
        '#' + CH_PREFIX + 'color-schemes, ',
        '#' + CH_PREFIX + 'color-settings, ',
        '#' + CH_PREFIX + 'element-details {',
        '    z-index:                9001;',

        '    opacity:                0.6;',
        '    color:                  rgb(240, 240, 240);',
        '    background:             rgb(80, 80, 80);',
        '    border:                 2px solid rgb(80, 80, 80);',

        '    font-size:              12px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes:hover, ',
        '#' + CH_PREFIX + 'color-settings:hover, ',
        '#' + CH_PREFIX + 'element-details:hover {',
        '    opacity:                1;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header {',
        '    position:               relative;',
        '    padding:                4px 0;',

        '    font-size:              14px;',
        '    text-align:             center;',
        '    white-space:            nowrap;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-title {',
        '    display:                inline-block;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close {',
        '    position:               absolute;',
        '    top:                    0;',
        '    right:                  0;',
        '    padding:                0 8px 4px 8px;',

        '    opacity:                0.6;',

        '    font-size:              18px;',
        '}',
        '#' + CH_PREFIX + 'color-schemes .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'color-settings .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover, ',
        '#' + CH_PREFIX + 'element-details .' + CH_PREFIX + 'dialog-header .' + CH_PREFIX + 'dialog-close:hover {',
        '    opacity:                1;',
        '}',

        // Color scheme dialog
        '#' + CH_PREFIX + 'color-schemes {',
        '    height:                 400px;',
        '    width:                  200px;',
        '    top:                    4px;',
        '    left:                   4px;',
        '}',

        // Color settings dialog
        '#' + CH_PREFIX + 'color-settings {',
        '    height:                 200px;',
        '    width:                  400px;',
        '    top:                    4px;',
        '    right:                  4px;',
        '}',

        // Element details dialog
        '#' + CH_PREFIX + 'element-details {',
        '    height:                 300px;',
        '    width:                  300px;',
        '    bottom:                 4px;',
        '    left:                   4px;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(STYLESHEET.join('\n'))
    );
}

// Add ColorHack to the page once it has finished ready.
$(function() {
    LoadCssReset();
    LoadStylesheet();

    ch = new ColorHack();
    ch.Init();
});
