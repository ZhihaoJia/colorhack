ColorHack
=========

GUI for dynamically changing HTML element colors and developing color schemes from within the browser. Useful for quickly designing and prototyping web pages.

**NOTE**: ColorHack is a work in progress and many of the expected features are not implemented yet. Furthermore, many of the implemented features may not work properly on all pages and browsers.

Usage:
------

ColorHack can be easily added to any HTML page, provided both jQuery and jQuery UI are also present.

### Modifying the page source:

ColorHack can be added to web pages by adding a few simple lines to the source. To add ColorHack to a page, append the following to the page `<head>`:

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
    <script type="text/javascript" src="path/to/colorhack.js"></script>

It is recommended that you acquire your own copy of colorhack.js to use. If you do not wish to download colorhack.js, a copy is hosted at http://zhihaojia.com/shared/, so that the following line will work:

    <script type="text/javascript" src="http://zhihaojia.com/shared/colorhack.js"></script>

**Note**: There is no guarantee that the copy hosted at zhihaojia.com will be the most up-to-date version. Using a hosted version of ColorHack also does not allow for you to make any configuration changes (refer to the Configuration section for more details).

### Injecting scripts through the browser:

ColorHack may be temporarily added to web pages for which the source cannot be modified. To do so, open the browser's developer tools console and enter the following JavaScript:

    // Add jQuery
    var jq = document.createElement("script");
    jq.type = "text/javascript";
    jq.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js';
    document.head.appendChild(jq);

    // Add jQuery UI
    var jqui = document.createElement("script");
    jqui.type = "text/javascript";
    jqui.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js';
    document.head.appendChild(jqui);

    // Add ColorHack
    var ch = document.createElement("script");
    ch.type = "text/javascript";
    ch.src = 'http://zhihaojia.com/shared/colorhack.js';
    document.head.appendChild(ch);

Note that this may need to be repeated if the page is reloaded.

Configuration:
--------------

The top of colorhack.js contains global variables used to configure various aspects of ColorHack. These may be changed to suit the circumstance.

For example, the UI provided by ColorHack is created through adding new elements to the page. In the unlikely case that any ColorHack element attributes (such as `id` or `class`) conflict with those on the page, they may be changed by modifying the values of the appropriate global variables.


Notes:
------

- ColorHack should only work properly on modern browsers that support HTML5 and CSS3. The page `!DOCTYPE` should also be for HTML5.
- ColorHack makes changes to HTML pages by changing the styling of specific elements on the page through JavaScript. Thus, ColorHack will not work if JavaScript is disabled in the browser.
- ColorHack will have no effect on page elements styled using `!important` rules.
