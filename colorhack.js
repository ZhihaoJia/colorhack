/* ======== ColorHack ======== */

/*  GLOBAL VARIABLES */

// Modify these values to resolve conflicts with the page's elements.
var CH_ID_PREFIX =  'colorhack_';   // HTML id prefix for naming ColorHack elements.
var CH_CLASS =      'colorhack';    // HTML class to identify ColorHack elements.

// ColorHack "class".
// Contains properties and methods for ColorHack objects.
// Any page should only have one instance of the ColorHack class.
function ColorHack() {

    // Dialogs that make up the main UI.
    var dialogs = [
        { id: 'color-schemes',          text: 'Color Scheme' },
        { id: 'color-scheme-details',   text: 'Color Settings' },
        { id: 'element-details',        text: 'Element Details' }
    ];
    
    // Primary components used by ColorHack.
    this.components = {
        // Menu located on the bottom-right of the page.
        // Contains the icon and toolbar components.
        menu:
            $('<div/>', {
                id:         CH_ID_PREFIX + 'menu',
                'class':    CH_CLASS
            })
        ,

        // Menu icon located on the bottom-right of the page.
        // Toggles visibility of the toolbar.
        icon:
            $('<div/>', {
                id:         CH_ID_PREFIX + 'icon',
                'class':    CH_CLASS
            })
            .text('ColorHack')
        ,

        // Toolbar located on the bottom-right of the page.
        // Provides a menu to toggle visibility of ColorHack dialogs.
        toolbar:
            $('<ul/>', {
                id:         CH_ID_PREFIX + 'toolbar',
                'class':    CH_CLASS
            })
            // Append toolbar options.
            .append(
                // Create toolbar items.
                (function() {
                    var toolbarOptions = $(); // empty jQuery object
                    for (i = 0 ; i < dialogs.length ; i++) {
                        toolbarOptions = toolbarOptions.add(
                            $('<li/>', {
                                id:         CH_ID_PREFIX + 'toolbar_' + dialogs[i].id,
                                'class':    CH_CLASS + ' toolbar-item'
                            })
                            .html('<span class="toolbar-item-check">&#x2713</span>' + dialogs[i].text)
                        );
                    }
                    return toolbarOptions;
                })()
            )
            .hide()
    }

}

// Builds the DOM for ColorHack elements.
ColorHack.prototype.AssembleElements = function() {
    this.components.menu
        .append(this.components.toolbar)
        .append(this.components.icon)
        .appendTo(document.body);
}

// Creates and attaches events for ColorHack elements.
ColorHack.prototype.AttachEvents = function() {
    this.components.menu
        .hover(function() {
            $(this).children('#' + CH_ID_PREFIX + 'icon, #' + CH_ID_PREFIX + 'toolbar').css({
                opacity:    '1'
            });
        }, function() {
            $(this).children('#' + CH_ID_PREFIX + 'icon, #' + CH_ID_PREFIX + 'toolbar').css({
                opacity:    '0.6'
            });
        })

    this.components.icon
        .click(function() {
            var $toolbar = $('#' + CH_ID_PREFIX + 'toolbar')
            if ($toolbar.css('display') === 'none') {
                $toolbar.show('slide', { direction: 'down' }, 300);
            } else {
                $toolbar.hide('slide', { direction: 'down' }, 300);
            }
        })

    // Iterate through toolbar options and assign events to each.
    this.components.toolbar.find('.toolbar-item').each(function(index, value) {
        // Make sure to account for differences between toolbar options.
        $(value).click(function() {
            var $checkbox = $(this).find('.toolbar-item-check');
            if ($checkbox.html() === '') {
                $checkbox.html('&#x2713');
            } else {
                $checkbox.html('');
            }
        })
    })
}

// Sets up ColorHack on the page.
ColorHack.prototype.Init = function() {
    this.AssembleElements();
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
        '.' + CH_CLASS + ' {',
        '    -ms-transition:         color .1s linear, background .1s linear, opacity .2s linear;',
        '    -moz-transition:        color .1s linear, background .1s linear, opacity .2s linear;',
        '    -webkit-transition:     color .1s linear, background .1s linear, opacity .2s linear;',
        '    -o-transition:          color .1s linear, background .1s linear, opacity .2s linear;',
        '    transition:             color .1s linear, background .1s linear, opacity .2s linear;',
        '}',

        '#' + CH_ID_PREFIX + 'menu {',
        '    position:           fixed;',
        '    z-index:            9001;',
        '    bottom:             0;',
        '    right:              0;',
        '    margin:             4px;',

        '    font-family:        "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;',
        '    font-size:          16px;',
        '    text-align:         center;',

        '    -ms-user-select: none;',
        '    -moz-user-select: none;',
        '    -webkit-user-select: none;',
        '    -o-user-select: none;',
        '    user-select: none;',
        '}',

        '#' + CH_ID_PREFIX + 'icon, #' + CH_ID_PREFIX + 'toolbar {',
        '    width:              150px;',

        '    opacity:            0.6;',
        '    border:             2px solid rgb(100, 100, 100);',

        '    cursor:             pointer;',
        '}',

        '#' + CH_ID_PREFIX + 'icon {',
        '    padding:            4px 0;',

        '    color:              rgb(100, 100, 100);',
        '    background:         rgb(240, 240, 240);',

        '    font-weight:        bold;',
        '}',

        '#' + CH_ID_PREFIX + 'toolbar {',
        '    color:              rgb(240, 240, 240);',
        '    border-bottom:      0;',

        '    text-align:         left;',
        '}',
        '#' + CH_ID_PREFIX + 'toolbar .toolbar-item {',
        '    padding:            4px;',

        '    background:         rgb(160, 160, 160);',
        '    border-top:         1px solid rgb(180, 180, 180);',

        '    cursor:             pointer;',
        '}',
        '#' + CH_ID_PREFIX + 'toolbar .toolbar-item:first-child {',
        '    border-top:         0;',
        '}',
        '#' + CH_ID_PREFIX + 'toolbar .toolbar-item:hover {',
        '    background:         rgb(100, 100, 100);',
        '}',
        '#' + CH_ID_PREFIX + 'toolbar .toolbar-item .toolbar-item-check {',
        '    width:              16px;',
        '    display:            inline-block;',
        '}'
    ]

    // Add CSS to the page head.
    $(document.head).append(
        $('<style/>', {
            type: 'text/css'
        }).html(STYLESHEET.join('\n'))
    );
}

// Add ColorHack to the page once it has finished "loading".
$(function() {
    LoadCssReset();
    LoadStylesheet();

    ch = new ColorHack();
    ch.Init();
});
