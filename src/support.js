define(function(){
    S.support = (function() {
        var support,
            a,
            select,
            opt,
            input,
            fragment,
            eventName,
            i,
            isSupported,
            clickFn,
            div = document.createElement("div");
        // Setup
        div.setAttribute( "className", "t" );
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        // Support tests won't run in some limited or non-browser environments
        a = div.getElementsByTagName("a")[ 0 ];
        // First batch of tests
        select = document.createElement("select");
        opt = select.appendChild( document.createElement("option") );
        input = div.getElementsByTagName("input")[ 0 ];
        a.style.cssText = "top:1px;float:left;opacity:.5";
        support = {
            // Make sure that tbody elements aren't automatically inserted
            // IE will insert them into empty tables
            tbody: !div.getElementsByTagName("tbody").length,
            // Make sure that link elements get serialized correctly by innerHTML
            // This requires a wrapper element in IE
            htmlSerialize: !!div.getElementsByTagName("link").length,
            // Get the style information from getAttribute
            // (IE uses .cssText instead)
            style: /top/.test( a.getAttribute("style") ),
            // Make sure that URLs aren't manipulated
            // (IE normalizes it by default)
            hrefNormalized: ( a.getAttribute("href") === "/a" ),
            // Make sure that element opacity exists
            // (IE uses filter instead)
            // Use a regex to work around a WebKit issue. See #5145
            opacity: /^0.5/.test( a.style.opacity ),
            // Verify style float existence
            // (IE uses styleFloat instead of cssFloat)
            cssFloat: !!a.style.cssFloat,
            // Make sure that if no value is specified for a checkbox
            // that it defaults to "on".
            // (WebKit defaults to "" instead)
            checkOn: ( input.value === "on" ),
            // Make sure that a selected-by-default option has a working selected property.
            // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
            optSelected: opt.selected,
            // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
            getSetAttribute: div.className !== "t",
            // Makes sure cloning an html5 element does not cause problems
            // Where outerHTML is undefined, this still works
            html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",
            // Will be defined later
            submitBubbles: true,
            changeBubbles: true,
            focusinBubbles: false,
            noCloneEvent: true
        };

        if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
            div.attachEvent( "onclick", clickFn = function() {
                // Cloning a node shouldn't copy over any
                // bound event handlers (IE does this)
                support.noCloneEvent = false;
            });
            div.cloneNode( true ).fireEvent("onclick");
            div.detachEvent( "onclick", clickFn );
        }
        // Technique from Juriy Zaytsev
        // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        // We only care about the case where non-standard event systems
        // are used, namely in IE. Short-circuiting here helps us to
        // avoid an eval call (in setAttribute) which can cause CSP
        // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
        if ( div.attachEvent ) {
            for ( i in {
                submit: true,
                change: true,
                focusin: true
            }) {
                eventName = "on" + i;
                isSupported = ( eventName in div );
                if ( !isSupported ) {
                    div.setAttribute( eventName, "return;" );
                    isSupported = ( typeof div[ eventName ] === "function" );
                }
                support[ i + "Bubbles" ] = isSupported;
            }
        }
     
        a = select = opt = input  = div = null;

        return support;
    })();

});