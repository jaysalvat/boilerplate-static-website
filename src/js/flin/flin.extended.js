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

    var cssStyles = getCssStyles(),
        cssPrefix = getCssPrefix();

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

    $.extend = function (deep) {
        var obj  = {},
            args = [].slice.call(arguments),
            i, k;

        if (typeof deep == 'boolean') {
            args.shift();
        }

        for (i = 0; i < args.length; i++) {
            for (k in args[i]) {
                if (args[i].hasOwnProperty(k)) {
                    if (deep === true && typeof args[i][k] == 'object') {
                        obj[k] = $.extend(deep, obj[k], args[i][k]);
                    } else {
                        obj[k] = args[i][k];
                    }
                }
            }
        }

        return obj;
    };

    $.fn = {

        slice: function () {
            return $([].slice.apply(this, arguments));
        },

        parent: function (selector) {
            return this.parents(selector, true);
        },

        closest: function (selector) {
            var elmts = [];

            this.each(function () {
                var $elmt = $(this);

                if ($elmt.is(selector)) {
                    elmts.push(this);
                } else {
                    elmts.push($elmt.parent(selector)[0]);
                }
            });

            return $.uniq(elmts);
        },

        children: function (selector) {
            var elmts = [];

            this.each(function () {
                [].slice.call(this.children).forEach(function (child) {
                    if (!selector || $(child).is(selector)) {
                        elmts.push(child);
                    }
                });
            });

            return $.uniq(elmts);
        },

        parents: function (selector, firstOnly){
            var parents = [],
                parent;

            if (typeof selector == 'boolean')  {
                firstOnly = selector;
                selector  = null;
            }

            this.each(function () {
                parent = this.parentNode;

                while (parent != document && parents.indexOf(parent) < 0) {
                    if ($(parent).is(selector || '*')) {
                        parents.push(parent);
                    }

                    if (firstOnly && parents.length) {
                        break;
                    }

                    parent = parent.parentNode;
                }
            });

            return $.uniq(parents);
        },

        eq: function (idx) {
            return this.slice(idx, idx + 1);
        },

        index: function (elmt) {
            if (elmt) {
                return this.indexOf($(elmt)[0]);
            }

            return this.parent.childNodes.indexOf(this[0]);
        },

        has: function (selector) {
            return !!this.find(selector).length;
        },

        is: function (selector) {
            var elmts = 0;

            this.each(function () {
                var elmt = this;

                if (elmt == selector || (
                       elmt.matchesSelector
                    || elmt.webkitMatchesSelector
                    || elmt.mozMatchesSelector
                    || elmt.msMatchesSelector
                    || elmt.oMatchesSelector
                ).call(elmt, selector)) {
                    elmts++;
                }
            });

            return !!elmts;
        },

        replace: function (html) {
            return this.before(html).remove();
        },

        wrap: function (html) {
            var elmt = $(html)[0];

            return this.each(function () {
                $(this).before(elmt);

                while (elmt.children.length) {
                    elmt = elmt.children[0];
                }

                $(elmt).append(this);
            });
        },

        remove: function () {
            return this.each(function () {
                var elmt = this;

                if (elmt.parentNode) {
                    elmt.parentNode.removeChild(elmt);
                }
            });
        },

        on: function (name, handler, capture) {
            return this.each(function () {
                var elmt = this;

                name.split(' ').forEach(function (name) {
                    var evt = getEventInfo(name),
                        key = evt.n + '.' + evt.ns,
                        handlerList,
                        handlerProxy,
                        args;

                    handlerProxy = function (e) {
                        args = e._args || [];
                        
                        if (args[0] !== e) {
                            args.unshift(e);
                        }

                        if (!e._name || matchEvents(getEventInfo(e._name), evt)) {
                            handler.apply(elmt, args);
                        }
                    };

                    handlerList = elmt._handlers || {};
                    handlerList[key] = handlerList[key] || [];
                    handlerList[key].push(handlerProxy);
                    
                    elmt._handlers = handlerList;
                    elmt.addEventListener(evt.n, handlerProxy, capture);
                });
            });
        },

        off: function (name, capture) {
            return this.each(function () {
                var elmt = this;
                
                name.split(' ').forEach(function (name) {
                    var evt = getEventInfo(name),
                        handlers,
                        k, i, x;

                    handlers = elmt._handlers;

                    for (k in handlers) {
                        if (handlers.hasOwnProperty(k)) {
                            i = getEventInfo(k);

                            if (matchEvents(evt, i)) {
                                for (x = 0; x < handlers[k].length; x++) {
                                    elmt.removeEventListener(i.n, handlers[k][x], capture);
                                }
                                delete handlers[k];
                            }
                        }
                    }
                });
            });
        },

        trigger: function (name, args) {
            var evt = doc.createEvent('HTMLEvents');
            
            evt._args = args;
            evt._name = name;
            evt.initEvent(name.replace(/\..*/, ''), true, true);

            return this.each(function () {
                this.dispatchEvent(evt);
            });
        },

        set: function (key, value) {
            return this.each(function (i) {
                var elmt = this,
                    values = key;

                if (typeof key != 'object') {
                    values = {};
                    values[key] = value;
                }

                $.each(values, function (key, value) {
                    var sign = key[0],
                        shortKey = key.slice(1);

                    if (typeof value == 'function') {
                        value = value.call(elmt, i);
                    }

                    if (sign == '@') {
                        if (value === undefined) {
                            elmt.removeAttribute(shortKey);
                        } else {
                            elmt.setAttribute(shortKey, value);
                        }
                    }

                    if (sign == '.') {
                        if (value == 'toggle') {
                            toggleClass(elmt, shortKey);
                        } else if (value == 'remove') {
                            removeClass(elmt, shortKey);
                        } else {
                            addClass(elmt, shortKey);
                        }
                    }

                    if (sign == ':') {
                        shortKey = getCssProperty(shortKey);

                        elmt.style[shortKey] = value;
                    } else {
                        elmt[key] = value;
                    }
                });
            });
        },

        get: function (key) {
            if (typeof key == 'number') {
                return this[key < 0 ? key + this.length : key ];
            }

            if (!key) {
                return [].slice.call(this);
            }

            var elmt = this[0],
                sign = key[0],
                shortKey = key.slice(1);

            if (!elmt) {
                return;
            }

            if (sign == '@') {
                return elmt.getAttribute(shortKey);
            }

            if (sign == '.') {
                return hasClass(elmt, shortKey);
            }

            if (sign == ':') {
                shortKey = getCssProperty(shortKey);

                return elmt.style[shortKey] || getComputedStyle(elmt).getPropertyValue(shortKey);
            }

            return elmt[key]; 
        },

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

    [ 'prepend', 'append', 'before', 'after' ].forEach(function (name, i) {
        $.fn[name] = function (html) {
            var newElmt = $(html)[0];

            return this.each(function () {
                var elmt   = this,
                    parent = elmt.parentNode;

                if (i === 0) {
                    return elmt.insertBefore(newElmt, elmt.firstChild);   
                }

                if (i == 1) {
                    return elmt.appendChild(newElmt);
                }

                if (i == 2) {
                    return parent.insertBefore(newElmt, elmt);
                }

                return parent.insertBefore(newElmt, elmt.nextSibling);
            });
        };
    });

    [ 'width', 'height', 'outerWidth', 'outerHeight' ].forEach(function (name, i) {
        $.fn[name] = function (value) {
            var elmt = this[0],
                key  = name.replace('outer', '').toLowerCase(),
                ckey = capitalize(key);

            if (value !== undefined) {
                return this.set(':' + key, value + 'px');
            }

            if (elmt == win) {
                return elmt['inner' + ckey];
            }

            if (elmt == doc) {
                return elmt.body['scroll' + ckey];
            }

            if ([ 0, 1 ].indexOf(i) < 0) {
                return elmt.getClientRects()[0][key];
            }

            return parseInt($(elmt).get(':' + key), 10);
        };
    });

    function matchEvents (evt1, evt2) {
        return (evt1.n == '*' || evt2.n == evt1.n ) && (evt1.ns == '*' || evt2.ns == evt1.ns);
    }

    function getEventInfo (name) {
        var splits = name.split('.');

        return {
            n:  splits[0] || '*',
            ns: splits[1] || '*'
        };
    }

    function getClassRe (className) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }

    function hasClass (elmt, className) {
        return getClassRe(className).test(elmt.className);
    }

    function addClass (elmt, className) {
        if (!hasClass(elmt, className)) {
            elmt.className = (elmt.className + ' ' + className).trim();
        }
    }

    function removeClass (elmt, className) {
         elmt.className = elmt.className.replace(getClassRe(className), ' ').trim();
    }

    function toggleClass (elmt, className) {
        if (hasClass(elmt, className)) {
            removeClass(elmt, className);
        } else {
            addClass(elmt, className);
        }
    }

    function getComputedStyle (elmt) {
        return win.getComputedStyle(elmt, '');
    }

    function getCssStyles () {
        return [].slice.call(getComputedStyle(doc.documentElement));
    }

    function getCssPrefix () {
        var prefix = (cssStyles.join('').match(/-(moz|webkit|ms)-/) || (cssStyles.OLink === '' && ['', 'o']))[1];

        return prefix == 'ms' ? 'ms' : capitalize(prefix);
    }

    function getCssProperty (property) {  
        var prefixed = ('-' + cssPrefix + '-' + property).toLowerCase();

        property = property.toLowerCase();

        if (cssStyles.indexOf(property) > -1) {
            return camelize(property);
        }

        if (cssStyles.indexOf(prefixed) > -1 || (/transform/.test(property) && cssStyles.indexOf('-ms-transform-origin-x') > -1)) {
            return cssPrefix + capitalize(camelize(property));
        }

        return property;
    }

    function capitalize (string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    function camelize (string) {
        return string.replace(/-(.)/g, function(match, group) {
            return group.toUpperCase();
        });
    }

    $.flin = '0.2.0';

    return $;
});
