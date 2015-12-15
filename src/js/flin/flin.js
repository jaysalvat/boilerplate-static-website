/*! Flin v0.2.0 (c) 2015 Jay Salvat http://flin.jaysalvat.com */
/* global define: true */
/* jshint eqeqeq: false, loopfunc: true, laxbreak: true */

(function (context, factory) {
    'use strict';

    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define == 'function' && define.amd) {
        define([], factory);
    } else {
        context.Flin = factory();

        if (context.$ === undefined) {
            context.$ = context.Flin;
        }
    }
})(this, function () {
    'use strict';

    var $,
        flin   = {}, 
        win   = window,
        doc   = document,
        div   = doc.createElement('div'),
        table = doc.createElement('table'), 
        tbody = doc.createElement('tbody'),
        tr    = doc.createElement('tr'),
        containers = {
            'thead': table, 
            'tbody': table, 
            'tfoot': table,
            'tr':    tbody,
            'td':    tr, 
            'th':    tr,
            '*':     div
        };

    flin.init = function (selector, context) {
        var elmts;

        if (!selector) {
            return new flin.Collection();
        }
        else if (selector._flin) {
            return selector;
        }
        else if (selector instanceof Function) {
            return doc.addEventListener('DOMContentLoaded', selector);
        }
        else if (selector instanceof Array) {
            elmts = selector;
        }
        else if (typeof selector == 'string') {
            selector = selector.trim();

            if (selector[0] == '<') {
                elmts = flin.fragment(selector);
            }
            else if (context) {
                return $(context).find(selector);
            } 
            else {
                elmts = doc.querySelectorAll(selector);
            }
        }
        else if (selector instanceof NodeList) {
            elmts = selector;
        }
        else if (typeof selector == 'object') {
            elmts = [ selector ];
        }

        return new flin.Collection(elmts);
    };

    flin.Collection = function (elmts) {
        elmts = [].slice.call(elmts || []);
        elmts._flin = true;

        $.each($.fn, function (i) {
            elmts[i] = $.fn[i];
        });

        return elmts;
    };

    flin.fragment = function (html) {
        var container,
            name = html.match(/^\s*<(\w+|!)[^>]*>/)[1];

        if (!containers[name]) {
            name = '*';
        }

        container = containers[name];
        container.innerHTML = html;

        return $(container.childNodes);
    };

    $ = function (selector, context) {
        return flin.init(selector, context);
    };

    $.each = function (elmts, fn) {
        var i, k;

        if (typeof elmts.length == 'number') {
            for (i = 0; i < elmts.length; i++) {
                if (fn.call(elmts[i], i, elmts[i]) === false) {
                    return elmts;
                }
            }
        } else {
            for (k in elmts) {
                if (elmts.hasOwnProperty(k)) {
                    if (fn.call(elmts[k], k, elmts[k]) === false) {
                        return elmts;
                    }
                }
            }
        }

        return elmts;
    };

    $.uniq = function (elmts) {
        elmts = [].filter.call(elmts, function (elmt, idx) { 
            return elmts.indexOf(elmt) == idx;
        });

        return $(elmts);
    };

    $.fn = {

        each: function (callback) {
            return $.each(this, callback);
        },

        find: function (selector) {
            var elmts = [];

            this.each(function () {
                elmts = elmts.concat($(this.querySelectorAll(selector)));
            });

            return $.uniq(elmts);
        }
    };

    $.flin = '0.2.0';

    return $;
});
