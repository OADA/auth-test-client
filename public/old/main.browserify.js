!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.oadaIdClient=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.14.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.IPv6 = factory(root);
  }
}(this, function (root) {
  'use strict';

  /*
  var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";
  var _out = IPv6.best(_in);
  var _expected = "fe80::204:61ff:fe9d:f156";

  console.log(_in, _out, _expected, _out === _expected);
  */

  // save current IPv6 variable, if any
  var _IPv6 = root && root.IPv6;

  function bestPresentation(address) {
    // based on:
    // Javascript to test an IPv6 address for proper format, and to
    // present the "best text representation" according to IETF Draft RFC at
    // http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04
    // 8 Feb 2010 Rich Brown, Dartware, LLC
    // Please feel free to use this code as long as you provide a link to
    // http://www.intermapper.com
    // http://intermapper.com/support/tools/IPV6-Validator.aspx
    // http://download.dartware.com/thirdparty/ipv6validator.js

    var _address = address.toLowerCase();
    var segments = _address.split(':');
    var length = segments.length;
    var total = 8;

    // trim colons (:: or ::a:b:c… or …a:b:c::)
    if (segments[0] === '' && segments[1] === '' && segments[2] === '') {
      // must have been ::
      // remove first two items
      segments.shift();
      segments.shift();
    } else if (segments[0] === '' && segments[1] === '') {
      // must have been ::xxxx
      // remove the first item
      segments.shift();
    } else if (segments[length - 1] === '' && segments[length - 2] === '') {
      // must have been xxxx::
      segments.pop();
    }

    length = segments.length;

    // adjust total segments for IPv4 trailer
    if (segments[length - 1].indexOf('.') !== -1) {
      // found a "." which means IPv4
      total = 7;
    }

    // fill empty segments them with "0000"
    var pos;
    for (pos = 0; pos < length; pos++) {
      if (segments[pos] === '') {
        break;
      }
    }

    if (pos < total) {
      segments.splice(pos, 1, '0000');
      while (segments.length < total) {
        segments.splice(pos, 0, '0000');
      }

      length = segments.length;
    }

    // strip leading zeros
    var _segments;
    for (var i = 0; i < total; i++) {
      _segments = segments[i].split('');
      for (var j = 0; j < 3 ; j++) {
        if (_segments[0] === '0' && _segments.length > 1) {
          _segments.splice(0,1);
        } else {
          break;
        }
      }

      segments[i] = _segments.join('');
    }

    // find longest sequence of zeroes and coalesce them into one segment
    var best = -1;
    var _best = 0;
    var _current = 0;
    var current = -1;
    var inzeroes = false;
    // i; already declared

    for (i = 0; i < total; i++) {
      if (inzeroes) {
        if (segments[i] === '0') {
          _current += 1;
        } else {
          inzeroes = false;
          if (_current > _best) {
            best = current;
            _best = _current;
          }
        }
      } else {
        if (segments[i] === '0') {
          inzeroes = true;
          current = i;
          _current = 1;
        }
      }
    }

    if (_current > _best) {
      best = current;
      _best = _current;
    }

    if (_best > 1) {
      segments.splice(best, _best, '');
    }

    length = segments.length;

    // assemble remaining segments
    var result = '';
    if (segments[0] === '')  {
      result = ':';
    }

    for (i = 0; i < length; i++) {
      result += segments[i];
      if (i === length - 1) {
        break;
      }

      result += ':';
    }

    if (segments[length - 1] === '') {
      result += ':';
    }

    return result;
  }

  function noConflict() {
    /*jshint validthis: true */
    if (root.IPv6 === this) {
      root.IPv6 = _IPv6;
    }
  
    return this;
  }

  return {
    best: bestPresentation,
    noConflict: noConflict
  };
}));

},{}],2:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.14.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.SecondLevelDomains = factory(root);
  }
}(this, function (root) {
  'use strict';

  // save current SecondLevelDomains variable, if any
  var _SecondLevelDomains = root && root.SecondLevelDomains;

  var SLD = {
    // list of known Second Level Domains
    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
    // ----
    // publicsuffix.org is more current and actually used by a couple of browsers internally.
    // downside is it also contains domains like "dyndns.org" - which is fine for the security
    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
    // ----
    list: {
      'ac':' com gov mil net org ',
      'ae':' ac co gov mil name net org pro sch ',
      'af':' com edu gov net org ',
      'al':' com edu gov mil net org ',
      'ao':' co ed gv it og pb ',
      'ar':' com edu gob gov int mil net org tur ',
      'at':' ac co gv or ',
      'au':' asn com csiro edu gov id net org ',
      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb':' biz co com edu gov info net org store tv ',
      'bh':' biz cc com edu gov info net org ',
      'bn':' com edu gov net org ',
      'bo':' com edu gob gov int mil net org tv ',
      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs':' com edu gov net org ',
      'bz':' du et om ov rg ',
      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck':' biz co edu gen gov info net org ',
      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co':' com edu gov mil net nom org ',
      'cr':' ac c co ed fi go or sa ',
      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do':' art com edu gob gov mil net org sld web ',
      'dz':' art asso com edu gov net org pol ',
      'ec':' com edu fin gov info med mil net org pro ',
      'eg':' com edu eun gov mil name net org sci ',
      'er':' com edu gov ind mil net org rochest w ',
      'es':' com edu gob nom org ',
      'et':' biz com edu gov info name net org ',
      'fj':' ac biz com info mil name net org pro ',
      'fk':' ac co gov net nom org ',
      'fr':' asso com f gouv nom prd presse tm ',
      'gg':' co net org ',
      'gh':' com edu gov mil org ',
      'gn':' ac com gov net org ',
      'gr':' com edu gov mil net org ',
      'gt':' com edu gob ind mil net org ',
      'gu':' com edu gov net org ',
      'hk':' com edu gov idv net org ',
      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id':' ac co go mil net or sch web ',
      'il':' ac co gov idf k12 muni net org ',
      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq':' com edu gov i mil net org ',
      'ir':' ac co dnssec gov i id net org sch ',
      'it':' edu gov ',
      'je':' co net org ',
      'jo':' com edu gov mil name net org sch ',
      'jp':' ac ad co ed go gr lg ne or ',
      'ke':' ac co go info me mobi ne or sc ',
      'kh':' com edu gov mil net org per ',
      'ki':' biz com de edu gov info mob net org tel ',
      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn':' edu gov net org ',
      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw':' com edu gov net org ',
      'ky':' com edu gov net org ',
      'kz':' com edu gov mil net org ',
      'lb':' com edu gov net org ',
      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr':' com edu gov net org ',
      'lv':' asn com conf edu gov id mil net org ',
      'ly':' com edu gov id med net org plc sch ',
      'ma':' ac co gov m net org press ',
      'mc':' asso tm ',
      'me':' ac co edu gov its net org priv ',
      'mg':' com edu gov mil nom org prd tm ',
      'mk':' com edu gov inf name net org pro ',
      'ml':' com edu gov net org presse ',
      'mn':' edu gov org ',
      'mo':' com edu gov net org ',
      'mt':' com edu gov net org ',
      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw':' ac co com coop edu gov int museum net org ',
      'mx':' com edu gob net org ',
      'my':' com edu gov mil name net org sch ',
      'nf':' arts com firm info net other per rec store web ',
      'ng':' biz com edu gov mil mobi name net org sch ',
      'ni':' ac co com edu gob mil net nom org ',
      'np':' com edu gov mil net org ',
      'nr':' biz com edu gov info net org ',
      'om':' ac biz co com edu gov med mil museum net org pro sch ',
      'pe':' com edu gob mil net nom org sld ',
      'ph':' com edu gov i mil net ngo org ',
      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr':' ac biz com edu est gov info isla name net org pro prof ',
      'ps':' com edu gov net org plo sec ',
      'pw':' belau co ed go ne or ',
      'ro':' arts com firm info nom nt org rec store tm www ',
      'rs':' ac co edu gov in org ',
      'sb':' com edu gov net org ',
      'sc':' com edu gov net org ',
      'sh':' co com edu gov net nom org ',
      'sl':' com edu gov net org ',
      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv':' com edu gob org red ',
      'sz':' ac co org ',
      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw':' club com ebiz edu game gov idv mil net org ',
      'mu':' ac co com gov net or org ',
      'mz':' ac co edu gov org ',
      'na':' co com ',
      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa':' abo ac com edu gob ing med net nom org sld ',
      'pt':' com edu gov int net nome org publ ',
      'py':' com edu gov mil net org ',
      'qa':' com edu gov mil net org ',
      're':' asso com nom ',
      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw':' ac co com edu gouv gov int mil net ',
      'sa':' com edu gov med net org pub sch ',
      'sd':' com edu gov info med net org tv ',
      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg':' com edu gov idn net org per ',
      'sn':' art com edu gouv org perso univ ',
      'sy':' com edu gov mil net news org ',
      'th':' ac co go in mi net or ',
      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz':' ac co go ne or ',
      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug':' ac co go ne or org sc ',
      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us':' dni fed isa kids nsn ',
      'uy':' com edu gub mil net org ',
      've':' co com edu gob info mil net org web ',
      'vi':' co com k12 net org ',
      'vn':' ac biz com edu gov health info int name net org pro ',
      'ye':' co com gov ltd me net org plc ',
      'yu':' ac co edu gov org ',
      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm':' ac co com edu gov net org sch '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
    },
    is: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset+1);
    },
    noConflict: function(){
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
}));

},{}],3:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.14.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      return new URI(url, base);
    }

    if (url === undefined) {
      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  URI.version = '1.14.1';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      if (lookup[data[i]] !== undefined) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\.-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  URI.recodePath = function(string) {
    var segments = (string + '').split('/');
    for (var i = 0, length = segments.length; i < length; i++) {
      segments[i] = URI.encodePathSegment(URI.decode(segments[i]));
    }

    return segments.join('/');
  };
  URI.decodePath = function(string) {
    var segments = (string + '').split('/');
    for (var i = 0, length = segments.length; i < length; i++) {
      segments[i] = URI.decodePathSegment(segments[i]);
    }

    return segments.join('/');
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
  }

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {};
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else if (string.indexOf(':') !== string.lastIndexOf(':')) {
      // IPv6 host contains multiple colons - but no port
      // this notation is actually not allowed by RFC 3986, but we're a liberal parser
      parts.hostname = string.substring(0, pos) || null;
      parts.port = null;
    } else {
      t = string.substring(0, pos).split(':');
      parts.hostname = t[0] || null;
      parts.port = t[1] || null;
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string') {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);

      if (parts.password) {
        t += ':' + URI.encode(parts.password);
      }

      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };
  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (data[name] === value) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          if (!URI.hasQuery(data, key, name[key])) {
            return false;
          }
        }
      }

      return true;
    } else if (typeof name !== 'string') {
      throw new TypeError('URI.hasQuery() accepts an object, string as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end).replace(_trim, '');
      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    if (v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
      }

      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }
    }
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? URI.decodePath(res) : res;
    } else {
      this._parts.path = v ? URI.recodePath(v) : '/';
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v !== undefined) {
      if (v) {
        // accept trailing ://
        v = v.replace(/:(\/\/)?$/, '');

        if (!v.match(URI.protocol_expression)) {
          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
        }
      }
    }
    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        if (v.match(/[^0-9]/)) {
          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
        }
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      URI.parseHost(v, x);
      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      URI.parseHost(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      URI.parseAuthority(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      if (!this._parts.username) {
        return '';
      }

      var t = URI.buildUserinfo(this._parts);
      return t.substring(0, t.length -1);
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v) {
        URI.ensureValidHostname(v);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      URI.ensureValidHostname(v);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(v[i]);
        }
      } else if (v || typeof v === 'string') {
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = v;
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.decode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    if (this._parts.urn) {
      return this;
    }

    if (!this._parts.path || this._parts.path === '/') {
      return this;
    }

    var _was_relative;
    var _path = this._parts.path;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.indexOf('/..');
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    _path = URI.recodePath(_path);
    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    this.normalize();
    URI.encode = e;
    URI.decode = d;
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    this.normalize();
    URI.encode = e;
    URI.decode = d;
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (!resolved._parts.protocol) {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else if (resolved._parts.path.substring(-2) === '..') {
      resolved._parts.path += '/';
    }

    if (resolved.path().charAt(0) !== '/') {
      basedir = base.directory();
      resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
      resolved.normalizePath();
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relative.path(), base.path());

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = parents + relativeParts.path.substring(common.length);

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

},{"./IPv6":1,"./SecondLevelDomains":2,"./punycode":4}],4:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.3 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    length,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.3',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return punycode;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":164}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":8,"ieee754":9,"is-array":10}],8:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],9:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],10:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],11:[function(require,module,exports){
(function (Buffer){
'use strict';
var createHash = require('sha.js')

var md5 = require('./md5')
var rmd160 = require('ripemd160')
var Transform = require('stream').Transform;
var inherits = require('util').inherits

module.exports = function (alg) {
  if('md5' === alg) return new HashNoConstructor(md5)
  if('rmd160' === alg) return new HashNoConstructor(rmd160)
  return new Hash(createHash(alg))
}
inherits(HashNoConstructor, Transform)

function HashNoConstructor(hash) {
  Transform.call(this);
  this._hash = hash
  this.buffers = []
}

HashNoConstructor.prototype._transform = function (data, _, done) {
  this.buffers.push(data)
  done()
}
HashNoConstructor.prototype._flush = function (done) {
  var buf = Buffer.concat(this.buffers)
  var r = this._hash(buf)
  this.buffers = null
  this.push(r)
  done()
}
HashNoConstructor.prototype.update = function (data, enc) {
  this.write(data, enc)
  return this
}

HashNoConstructor.prototype.digest = function (enc) {
  this.end()
  var outData = new Buffer('')
  var chunk
  while ((chunk = this.read())) {
    outData = Buffer.concat([outData, chunk])
  }
  if (enc) {
    outData = outData.toString(enc)
  }
  return outData
}

inherits(Hash, Transform)

function Hash(hash) {
  Transform.call(this);
  this._hash = hash
}

Hash.prototype._transform = function (data, _, done) {
  this._hash.update(data)
  done()
}
Hash.prototype._flush = function (done) {
  this.push(this._hash.digest())
  this._hash = null
  done()
}
Hash.prototype.update = function (data, enc) {
  this.write(data, enc)
  return this
}

Hash.prototype.digest = function (enc) {
  this.end()
  var outData = new Buffer('')
  var chunk
  while ((chunk = this.read())) {
    outData = Buffer.concat([outData, chunk])
  }
  if (enc) {
    outData = outData.toString(enc)
  }
  return outData
}

}).call(this,require("buffer").Buffer)
},{"./md5":15,"buffer":7,"ripemd160":135,"sha.js":137,"stream":161,"util":164}],12:[function(require,module,exports){
(function (Buffer){
'use strict';
var createHash = require('./create-hash')
var Transform = require('stream').Transform;
var inherits = require('util').inherits
var zeroBuffer = new Buffer(128)
zeroBuffer.fill(0)

module.exports = Hmac
inherits(Hmac, Transform)
function Hmac (alg, key) {
  if(!(this instanceof Hmac)) return new Hmac(alg, key)

  Transform.call(this)
  this._opad = opad
  this._alg = alg

  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

  if(key.length > blocksize) {
    key = createHash(alg).update(key).digest()
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = this._ipad = new Buffer(blocksize)
  var opad = this._opad = new Buffer(blocksize)

  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  this._hash = createHash(alg).update(ipad)
}

Hmac.prototype.update = function (data, enc) {
  this.write(data, enc)
  return this
}

Hmac.prototype._transform = function (data, _, next) {
  this._hash.update(data)
  next()
}

Hmac.prototype._flush = function (next) {
  var h = this._hash.digest()
  this.push(createHash(this._alg).update(this._opad).update(h).digest())
  next()
}

Hmac.prototype.digest = function (enc) {
  this.end()
  var outData = new Buffer('')
  var chunk
  while ((chunk = this.read())) {
    outData = Buffer.concat([outData, chunk])
  }
  if (enc) {
    outData = outData.toString(enc)
  }
  return outData
}


}).call(this,require("buffer").Buffer)
},{"./create-hash":11,"buffer":7,"stream":161,"util":164}],13:[function(require,module,exports){
(function (Buffer){
'use strict';
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

}).call(this,require("buffer").Buffer)
},{"buffer":7}],14:[function(require,module,exports){
'use strict';
var rng = exports.rng = require('./rng')
var prng = exports.prng = require('./prng');

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = require('./create-hash')

exports.createHmac = require('./create-hmac')

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, rng(size))
    } catch (err) { callback(err) }
  } else {
    return rng(size)
  }
}
exports.pseudoRandomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, prng(size))
    } catch (err) { callback(err) }
  } else {
    return prng(size)
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}
var hashes = ['sha1', 'sha256', 'sha512', 'md5', 'rmd160'].concat(Object.keys(require('browserify-sign/algos')))
exports.getHashes = function () {
  return hashes;
}

var p = require('./pbkdf2')(exports)
exports.pbkdf2 = p.pbkdf2
exports.pbkdf2Sync = p.pbkdf2Sync
require('browserify-aes/inject')(exports, module.exports);
require('browserify-sign/inject')(module.exports, exports);
require('diffie-hellman/inject')(exports, module.exports);
require('create-ecdh/inject')(module.exports, exports);
require('public-encrypt/inject')(module.exports, exports);

// the least I can do is make error messages for the rest of the node.js/crypto api.
each([
  'createCredentials'
], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./create-hash":11,"./create-hmac":12,"./pbkdf2":143,"./prng":144,"./rng":145,"browserify-aes/inject":23,"browserify-sign/algos":34,"browserify-sign/inject":35,"create-ecdh/inject":79,"diffie-hellman/inject":103,"public-encrypt/inject":109}],15:[function(require,module,exports){
'use strict';
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = require('./helpers');

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":13}],16:[function(require,module,exports){
(function (Buffer){

module.exports = function (crypto, password, keyLen, ivLen) {
  keyLen = keyLen/8;
  ivLen = ivLen || 0;
  var ki = 0;
  var ii = 0;
  var key = new Buffer(keyLen);
  var iv = new Buffer(ivLen);
  var addmd = 0;
  var md, md_buf;
  var i;
  while (true) {
    md = crypto.createHash('md5');
    if(addmd++ > 0) {
       md.update(md_buf);
    }
    md.update(password);
    md_buf = md.digest();
    i = 0;
    if(keyLen > 0) {
      while(true) {
        if(keyLen === 0) {
          break;
        }
        if(i === md_buf.length) {
          break;
        }
        key[ki++] = md_buf[i];
        keyLen--;
        i++;
       }
    }
    if(ivLen > 0 && i !== md_buf.length) {
      while(true) {
        if(ivLen === 0) {
          break;
        }
        if(i === md_buf.length) {
          break;
        }
       iv[ii++] = md_buf[i];
       ivLen--;
       i++;
     }
   }
   if(keyLen === 0 && ivLen === 0) {
      break;
    }
  }
  for(i=0;i<md_buf.length;i++) {
    md_buf[i] = 0;
  }
  return {
    key: key,
    iv: iv
  };
};
}).call(this,require("buffer").Buffer)
},{"buffer":7}],17:[function(require,module,exports){
(function (Buffer){
// based on the aes implimentation in triple sec
// https://github.com/keybase/triplesec

// which is in turn based on the one from crypto-js
// https://code.google.com/p/crypto-js/

var uint_max = Math.pow(2, 32);
function fixup_uint32(x) {
    var ret, x_pos;
    ret = x > uint_max || x < 0 ? (x_pos = Math.abs(x) % uint_max, x < 0 ? uint_max - x_pos : x_pos) : x;
    return ret;
}
function scrub_vec(v) {
  var i, _i, _ref;
  for (i = _i = 0, _ref = v.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    v[i] = 0;
  }
  return false;
}

function Global() {
  var i;
  this.SBOX = [];
  this.INV_SBOX = [];
  this.SUB_MIX = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < 4; i = ++_i) {
      _results.push([]);
    }
    return _results;
  })();
  this.INV_SUB_MIX = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < 4; i = ++_i) {
      _results.push([]);
    }
    return _results;
  })();
  this.init();
  this.RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
}

Global.prototype.init = function() {
  var d, i, sx, t, x, x2, x4, x8, xi, _i;
  d = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < 256; i = ++_i) {
      if (i < 128) {
        _results.push(i << 1);
      } else {
        _results.push((i << 1) ^ 0x11b);
      }
    }
    return _results;
  })();
  x = 0;
  xi = 0;
  for (i = _i = 0; _i < 256; i = ++_i) {
    sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
    sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
    this.SBOX[x] = sx;
    this.INV_SBOX[sx] = x;
    x2 = d[x];
    x4 = d[x2];
    x8 = d[x4];
    t = (d[sx] * 0x101) ^ (sx * 0x1010100);
    this.SUB_MIX[0][x] = (t << 24) | (t >>> 8);
    this.SUB_MIX[1][x] = (t << 16) | (t >>> 16);
    this.SUB_MIX[2][x] = (t << 8) | (t >>> 24);
    this.SUB_MIX[3][x] = t;
    t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
    this.INV_SUB_MIX[0][sx] = (t << 24) | (t >>> 8);
    this.INV_SUB_MIX[1][sx] = (t << 16) | (t >>> 16);
    this.INV_SUB_MIX[2][sx] = (t << 8) | (t >>> 24);
    this.INV_SUB_MIX[3][sx] = t;
    if (x === 0) {
      x = xi = 1;
    } else {
      x = x2 ^ d[d[d[x8 ^ x2]]];
      xi ^= d[d[xi]];
    }
  }
  return true;
};

var G = new Global();


AES.blockSize = 4 * 4;

AES.prototype.blockSize = AES.blockSize;

AES.keySize = 256 / 8;

AES.prototype.keySize = AES.keySize;

 function bufferToArray(buf) {
  var len = buf.length/4;
  var out = new Array(len);
  var i = -1;
  while (++i < len) {
    out[i] = buf.readUInt32BE(i * 4);
  }
  return out;
 }
function AES(key) {
  this._key = bufferToArray(key);
  this._doReset();
}

AES.prototype._doReset = function() {
  var invKsRow, keySize, keyWords, ksRow, ksRows, t, _i, _j;
  keyWords = this._key;
  keySize = keyWords.length;
  this._nRounds = keySize + 6;
  ksRows = (this._nRounds + 1) * 4;
  this._keySchedule = [];
  for (ksRow = _i = 0; 0 <= ksRows ? _i < ksRows : _i > ksRows; ksRow = 0 <= ksRows ? ++_i : --_i) {
    this._keySchedule[ksRow] = ksRow < keySize ? keyWords[ksRow] : (t = this._keySchedule[ksRow - 1], (ksRow % keySize) === 0 ? (t = (t << 8) | (t >>> 24), t = (G.SBOX[t >>> 24] << 24) | (G.SBOX[(t >>> 16) & 0xff] << 16) | (G.SBOX[(t >>> 8) & 0xff] << 8) | G.SBOX[t & 0xff], t ^= G.RCON[(ksRow / keySize) | 0] << 24) : keySize > 6 && ksRow % keySize === 4 ? t = (G.SBOX[t >>> 24] << 24) | (G.SBOX[(t >>> 16) & 0xff] << 16) | (G.SBOX[(t >>> 8) & 0xff] << 8) | G.SBOX[t & 0xff] : void 0, this._keySchedule[ksRow - keySize] ^ t);
  }
  this._invKeySchedule = [];
  for (invKsRow = _j = 0; 0 <= ksRows ? _j < ksRows : _j > ksRows; invKsRow = 0 <= ksRows ? ++_j : --_j) {
    ksRow = ksRows - invKsRow;
    t = this._keySchedule[ksRow - (invKsRow % 4 ? 0 : 4)];
    this._invKeySchedule[invKsRow] = invKsRow < 4 || ksRow <= 4 ? t : G.INV_SUB_MIX[0][G.SBOX[t >>> 24]] ^ G.INV_SUB_MIX[1][G.SBOX[(t >>> 16) & 0xff]] ^ G.INV_SUB_MIX[2][G.SBOX[(t >>> 8) & 0xff]] ^ G.INV_SUB_MIX[3][G.SBOX[t & 0xff]];
  }
  return true;
};

AES.prototype.encryptBlock = function(M) {
  M = bufferToArray(new Buffer(M));
  var out = this._doCryptBlock(M, this._keySchedule, G.SUB_MIX, G.SBOX);
  var buf = new Buffer(16);
  buf.writeUInt32BE(out[0], 0);
  buf.writeUInt32BE(out[1], 4);
  buf.writeUInt32BE(out[2], 8);
  buf.writeUInt32BE(out[3], 12);
  return buf;
};

AES.prototype.decryptBlock = function(M) {
  M = bufferToArray(new Buffer(M));
  var temp = [M[3], M[1]];
  M[1] = temp[0];
  M[3] = temp[1];
  var out = this._doCryptBlock(M, this._invKeySchedule, G.INV_SUB_MIX, G.INV_SBOX);
  var buf = new Buffer(16);
  buf.writeUInt32BE(out[0], 0);
  buf.writeUInt32BE(out[3], 4);
  buf.writeUInt32BE(out[2], 8);
  buf.writeUInt32BE(out[1], 12);
  return buf;
};

AES.prototype.scrub = function() {
  scrub_vec(this._keySchedule);
  scrub_vec(this._invKeySchedule);
  scrub_vec(this._key);
};

AES.prototype._doCryptBlock = function(M, keySchedule, SUB_MIX, SBOX) {
  var ksRow, round, s0, s1, s2, s3, t0, t1, t2, t3, _i, _ref;

  s0 = M[0] ^ keySchedule[0];
  s1 = M[1] ^ keySchedule[1];
  s2 = M[2] ^ keySchedule[2];
  s3 = M[3] ^ keySchedule[3];
  ksRow = 4;
  for (round = _i = 1, _ref = this._nRounds; 1 <= _ref ? _i < _ref : _i > _ref; round = 1 <= _ref ? ++_i : --_i) {
    t0 = SUB_MIX[0][s0 >>> 24] ^ SUB_MIX[1][(s1 >>> 16) & 0xff] ^ SUB_MIX[2][(s2 >>> 8) & 0xff] ^ SUB_MIX[3][s3 & 0xff] ^ keySchedule[ksRow++];
    t1 = SUB_MIX[0][s1 >>> 24] ^ SUB_MIX[1][(s2 >>> 16) & 0xff] ^ SUB_MIX[2][(s3 >>> 8) & 0xff] ^ SUB_MIX[3][s0 & 0xff] ^ keySchedule[ksRow++];
    t2 = SUB_MIX[0][s2 >>> 24] ^ SUB_MIX[1][(s3 >>> 16) & 0xff] ^ SUB_MIX[2][(s0 >>> 8) & 0xff] ^ SUB_MIX[3][s1 & 0xff] ^ keySchedule[ksRow++];
    t3 = SUB_MIX[0][s3 >>> 24] ^ SUB_MIX[1][(s0 >>> 16) & 0xff] ^ SUB_MIX[2][(s1 >>> 8) & 0xff] ^ SUB_MIX[3][s2 & 0xff] ^ keySchedule[ksRow++];
    s0 = t0;
    s1 = t1;
    s2 = t2;
    s3 = t3;
  }
  t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
  t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
  t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
  t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];
  return [
    fixup_uint32(t0),
    fixup_uint32(t1),
    fixup_uint32(t2),
    fixup_uint32(t3)
  ];

};




  exports.AES = AES;
}).call(this,require("buffer").Buffer)
},{"buffer":7}],18:[function(require,module,exports){
(function (Buffer){
var aes = require('./aes');
var Transform = require('./cipherBase');
var inherits = require('inherits');
var GHASH = require('./ghash');
var xor = require('./xor');
inherits(StreamCipher, Transform);
module.exports = StreamCipher;

function StreamCipher(mode, key, iv, decrypt) {
  if (!(this instanceof StreamCipher)) {
    return new StreamCipher(mode, key, iv);
  }
  Transform.call(this);
  this._finID = Buffer.concat([iv, new Buffer([0, 0, 0, 1])]);
  iv = Buffer.concat([iv, new Buffer([0, 0, 0, 2])]);
  this._cipher = new aes.AES(key);
  this._prev = new Buffer(iv.length);
  this._cache = new Buffer('');
  this._secCache = new Buffer('');
  this._decrypt = decrypt;
  this._alen = 0;
  this._len = 0;
  iv.copy(this._prev);
  this._mode = mode;
  var h = new Buffer(4);
  h.fill(0);
  this._ghash = new GHASH(this._cipher.encryptBlock(h));
  this._authTag = null;
  this._called = false;
}
StreamCipher.prototype._transform = function (chunk, _, next) {
  if (!this._called && this._alen) {
    var rump = 16 - (this._alen % 16);
    if (rump <16) {
      rump = new Buffer(rump);
      rump.fill(0);
      this._ghash.update(rump);
    }
  }
  this._called = true;
  var out = this._mode.encrypt(this, chunk);
  if (this._decrypt) {
    this._ghash.update(chunk);
  } else {
    this._ghash.update(out);
  }
  this._len += chunk.length;
  next(null, out);
};
StreamCipher.prototype._flush = function (next) {
  if (this._decrypt && !this._authTag) {
    throw new Error('Unsupported state or unable to authenticate data');
  }
  var tag = xor(this._ghash.final(this._alen * 8, this._len * 8), this._cipher.encryptBlock(this._finID));
  if (this._decrypt) {
    if (xorTest(tag, this._authTag)) {
      throw new Error('Unsupported state or unable to authenticate data');
    }
  } else {
    this._authTag = tag;
  }
  this._cipher.scrub();
  next();
};
StreamCipher.prototype.getAuthTag = function getAuthTag () {
  if (!this._decrypt && Buffer.isBuffer(this._authTag)) {
    return this._authTag;
  } else {
    throw new Error('Attempting to get auth tag in unsupported state');
  }
};
StreamCipher.prototype.setAuthTag = function setAuthTag (tag) {
  if (this._decrypt) {
    this._authTag = tag;
  } else {
    throw new Error('Attempting to set auth tag in unsupported state');
  }
};
StreamCipher.prototype.setAAD = function setAAD (buf) {
  if (!this._called) {
    this._ghash.update(buf);
    this._alen += buf.length;
  } else {
    throw new Error('Attempting to set AAD in unsupported state');
  }
};
function xorTest(a, b) {
  var out = 0;
  if (a.length !== b.length) {
    out++;
  }
  var len = Math.min(a.length, b.length);
  var i = -1;
  while (++i < len) {
    out += (a[i] ^ b[i]);
  }
  return out;
}



}).call(this,require("buffer").Buffer)
},{"./aes":17,"./cipherBase":19,"./ghash":22,"./xor":33,"buffer":7,"inherits":147}],19:[function(require,module,exports){
(function (Buffer){
var Transform = require('stream').Transform;
var inherits = require('inherits');

module.exports = CipherBase;
inherits(CipherBase, Transform);
function CipherBase() {
  Transform.call(this);
}
CipherBase.prototype.update = function (data, inputEnd, outputEnc) {
  this.write(data, inputEnd);
  var outData = new Buffer('');
  var chunk;
  while ((chunk = this.read())) {
    outData = Buffer.concat([outData, chunk]);
  }
  if (outputEnc) {
    outData = outData.toString(outputEnc);
  }
  return outData;
};
CipherBase.prototype.final = function (outputEnc) {
  this.end();
  var outData = new Buffer('');
  var chunk;
  while ((chunk = this.read())) {
    outData = Buffer.concat([outData, chunk]);
  }
  if (outputEnc) {
    outData = outData.toString(outputEnc);
  }
  return outData;
};
}).call(this,require("buffer").Buffer)
},{"buffer":7,"inherits":147,"stream":161}],20:[function(require,module,exports){
(function (Buffer){
var aes = require('./aes');
var Transform = require('./cipherBase');
var inherits = require('inherits');
var modes = require('./modes');
var StreamCipher = require('./streamCipher');
var AuthCipher = require('./authCipher');
var ebtk = require('./EVP_BytesToKey');

inherits(Decipher, Transform);
function Decipher(mode, key, iv) {
  if (!(this instanceof Decipher)) {
    return new Decipher(mode, key, iv);
  }
  Transform.call(this);
  this._cache = new Splitter();
  this._last = void 0;
  this._cipher = new aes.AES(key);
  this._prev = new Buffer(iv.length);
  iv.copy(this._prev);
  this._mode = mode;
}
Decipher.prototype._transform = function (data, _, next) {
  this._cache.add(data);
  var chunk;
  var thing;
  while ((chunk = this._cache.get())) {
    thing = this._mode.decrypt(this, chunk);
    this.push(thing);
  }
  next();
};
Decipher.prototype._flush = function (next) {
  var chunk = this._cache.flush();
  if (!chunk) {
    return next;
  }

  this.push(unpad(this._mode.decrypt(this, chunk)));

  next();
};

function Splitter() {
   if (!(this instanceof Splitter)) {
    return new Splitter();
  }
  this.cache = new Buffer('');
}
Splitter.prototype.add = function (data) {
  this.cache = Buffer.concat([this.cache, data]);
};

Splitter.prototype.get = function () {
  if (this.cache.length > 16) {
    var out = this.cache.slice(0, 16);
    this.cache = this.cache.slice(16);
    return out;
  }
  return null;
};
Splitter.prototype.flush = function () {
  if (this.cache.length) {
    return this.cache;
  }
};
function unpad(last) {
  var padded = last[15];
  var i = -1;
  while (++i < padded) {
    if (last[(i + (16 - padded))] !== padded) {
      throw new Error('unable to decrypt data');
    }
  }
  if (padded === 16) {
    return;
  }
  return last.slice(0, 16 - padded);
}

var modelist = {
  ECB: require('./modes/ecb'),
  CBC: require('./modes/cbc'),
  CFB: require('./modes/cfb'),
  CFB8: require('./modes/cfb8'),
  CFB1: require('./modes/cfb1'),
  OFB: require('./modes/ofb'),
  CTR: require('./modes/ctr'),
  GCM: require('./modes/ctr')
};

module.exports = function (crypto) {
  function createDecipheriv(suite, password, iv) {
    var config = modes[suite];
    if (!config) {
      throw new TypeError('invalid suite type');
    }
    if (typeof iv === 'string') {
      iv = new Buffer(iv);
    }
    if (typeof password === 'string') {
      password = new Buffer(password);
    }
    if (password.length !== config.key/8) {
      throw new TypeError('invalid key length ' + password.length);
    }
    if (iv.length !== config.iv) {
      throw new TypeError('invalid iv length ' + iv.length);
    }
    if (config.type === 'stream') {
      return new StreamCipher(modelist[config.mode], password, iv, true);
    } else if (config.type === 'auth') {
      return new AuthCipher(modelist[config.mode], password, iv, true);
    }
    return new Decipher(modelist[config.mode], password, iv);
  }

  function createDecipher (suite, password) {
    var config = modes[suite];
    if (!config) {
      throw new TypeError('invalid suite type');
    }
    var keys = ebtk(crypto, password, config.key, config.iv);
    return createDecipheriv(suite, keys.key, keys.iv);
  }
  return {
    createDecipher: createDecipher,
    createDecipheriv: createDecipheriv
  };
};

}).call(this,require("buffer").Buffer)
},{"./EVP_BytesToKey":16,"./aes":17,"./authCipher":18,"./cipherBase":19,"./modes":24,"./modes/cbc":25,"./modes/cfb":26,"./modes/cfb1":27,"./modes/cfb8":28,"./modes/ctr":29,"./modes/ecb":30,"./modes/ofb":31,"./streamCipher":32,"buffer":7,"inherits":147}],21:[function(require,module,exports){
(function (Buffer){
var aes = require('./aes');
var Transform = require('./cipherBase');
var inherits = require('inherits');
var modes = require('./modes');
var ebtk = require('./EVP_BytesToKey');
var StreamCipher = require('./streamCipher');
var AuthCipher = require('./authCipher');
inherits(Cipher, Transform);
function Cipher(mode, key, iv) {
  if (!(this instanceof Cipher)) {
    return new Cipher(mode, key, iv);
  }
  Transform.call(this);
  this._cache = new Splitter();
  this._cipher = new aes.AES(key);
  this._prev = new Buffer(iv.length);
  iv.copy(this._prev);
  this._mode = mode;
}
Cipher.prototype._transform = function (data, _, next) {
  this._cache.add(data);
  var chunk;
  var thing;
  while ((chunk = this._cache.get())) {
    thing = this._mode.encrypt(this, chunk);
    this.push(thing);
  }
  next();
};
Cipher.prototype._flush = function (next) {
  var chunk = this._cache.flush();
  this.push(this._mode.encrypt(this, chunk));
  this._cipher.scrub();
  next();
};


function Splitter() {
   if (!(this instanceof Splitter)) {
    return new Splitter();
  }
  this.cache = new Buffer('');
}
Splitter.prototype.add = function (data) {
  this.cache = Buffer.concat([this.cache, data]);
};

Splitter.prototype.get = function () {
  if (this.cache.length > 15) {
    var out = this.cache.slice(0, 16);
    this.cache = this.cache.slice(16);
    return out;
  }
  return null;
};
Splitter.prototype.flush = function () {
  var len = 16 - this.cache.length;
  var padBuff = new Buffer(len);

  var i = -1;
  while (++i < len) {
    padBuff.writeUInt8(len, i);
  }
  var out = Buffer.concat([this.cache, padBuff]);
  return out;
};
var modelist = {
  ECB: require('./modes/ecb'),
  CBC: require('./modes/cbc'),
  CFB: require('./modes/cfb'),
  CFB8: require('./modes/cfb8'),
  CFB1: require('./modes/cfb1'),
  OFB: require('./modes/ofb'),
  CTR: require('./modes/ctr'),
  GCM: require('./modes/ctr')
};
module.exports = function (crypto) {
  function createCipheriv(suite, password, iv) {
    var config = modes[suite];
    if (!config) {
      throw new TypeError('invalid suite type');
    }
    if (typeof iv === 'string') {
      iv = new Buffer(iv);
    }
    if (typeof password === 'string') {
      password = new Buffer(password);
    }
    if (password.length !== config.key/8) {
      throw new TypeError('invalid key length ' + password.length);
    }
    if (iv.length !== config.iv) {
      throw new TypeError('invalid iv length ' + iv.length);
    }
    if (config.type === 'stream') {
      return new StreamCipher(modelist[config.mode], password, iv);
    } else if (config.type === 'auth') {
      return new AuthCipher(modelist[config.mode], password, iv);
    }
    return new Cipher(modelist[config.mode], password, iv);
  }
  function createCipher (suite, password) {
    var config = modes[suite];
    if (!config) {
      throw new TypeError('invalid suite type');
    }
    var keys = ebtk(crypto, password, config.key, config.iv);
    return createCipheriv(suite, keys.key, keys.iv);
  }
  return {
    createCipher: createCipher,
    createCipheriv: createCipheriv
  };
};

}).call(this,require("buffer").Buffer)
},{"./EVP_BytesToKey":16,"./aes":17,"./authCipher":18,"./cipherBase":19,"./modes":24,"./modes/cbc":25,"./modes/cfb":26,"./modes/cfb1":27,"./modes/cfb8":28,"./modes/ctr":29,"./modes/ecb":30,"./modes/ofb":31,"./streamCipher":32,"buffer":7,"inherits":147}],22:[function(require,module,exports){
(function (Buffer){
var zeros = new Buffer(16);
zeros.fill(0);
module.exports = GHASH;
function GHASH(key){
  this.h = key;
  this.state = new Buffer(16);
  this.state.fill(0);
  this.cache = new Buffer('');
}
// from http://bitwiseshiftleft.github.io/sjcl/doc/symbols/src/core_gcm.js.html
// by Juho Vähä-Herttua
GHASH.prototype.ghash = function (block) {
  var i = -1;
  while (++i < block.length) {
   this.state[i] ^= block[i];
  }
  this._multiply();
};

GHASH.prototype._multiply = function () {
  var Vi = toArray(this.h);
  var Zi = [0, 0, 0, 0];
  var j, xi, lsb_Vi;
  var i = -1;
  while (++i < 128) {
    xi = (this.state[~~(i/8)] & (1 << (7-i%8))) !== 0;
    if (xi) {
      // Z_i+1 = Z_i ^ V_i
      Zi = xor(Zi, Vi);
    }

    // Store the value of LSB(V_i)
    lsb_Vi = (Vi[3] & 1) !== 0;

    // V_i+1 = V_i >> 1
    for (j=3; j>0; j--) {
      Vi[j] = (Vi[j] >>> 1) | ((Vi[j-1]&1) << 31);
    }
    Vi[0] = Vi[0] >>> 1;

    // If LSB(V_i) is 1, V_i+1 = (V_i >> 1) ^ R
    if (lsb_Vi) {
      Vi[0] = Vi[0] ^ (0xe1 << 24);
    }
  }
  this.state = fromArray(Zi);
};
GHASH.prototype.update = function (buf) {
  this.cache = Buffer.concat([this.cache, buf]);
  var chunk;
  while (this.cache.length >= 16) {
    chunk = this.cache.slice(0, 16);
    this.cache = this.cache.slice(16);
    this.ghash(chunk);
  }
};
GHASH.prototype.final = function (abl, bl) {
  if (this.cache.length) {
    this.ghash(Buffer.concat([this.cache, zeros], 16));
  }
  this.ghash(fromArray([
     0, abl,
     0, bl
   ]));
  return this.state;
};

function toArray(buf) {
  return [
    buf.readUInt32BE(0),
    buf.readUInt32BE(4),
    buf.readUInt32BE(8),
    buf.readUInt32BE(12)
  ];
}
function fromArray(out) {
  out = out.map(fixup_uint32);
  var buf = new Buffer(16);
  buf.writeUInt32BE(out[0], 0);
  buf.writeUInt32BE(out[1], 4);
  buf.writeUInt32BE(out[2], 8);
  buf.writeUInt32BE(out[3], 12);
  return buf;
}
var uint_max = Math.pow(2, 32);
function fixup_uint32(x) {
    var ret, x_pos;
    ret = x > uint_max || x < 0 ? (x_pos = Math.abs(x) % uint_max, x < 0 ? uint_max - x_pos : x_pos) : x;
    return ret;
}
function xor(a, b) {
  return [
    a[0] ^ b[0],
    a[1] ^ b[1],
    a[2] ^ b[2],
    a[3] ^ b[3],
  ];
}
}).call(this,require("buffer").Buffer)
},{"buffer":7}],23:[function(require,module,exports){
module.exports = function (crypto, exports) {
  exports = exports || {};
  var ciphers = require('./encrypter')(crypto);
  exports.createCipher = ciphers.createCipher;
  exports.createCipheriv = ciphers.createCipheriv;
  var deciphers = require('./decrypter')(crypto);
  exports.createDecipher = deciphers.createDecipher;
  exports.createDecipheriv = deciphers.createDecipheriv;
  var modes = require('./modes');
  function listCiphers () {
    return Object.keys(modes);
  }
  exports.listCiphers = listCiphers;
};


},{"./decrypter":20,"./encrypter":21,"./modes":24}],24:[function(require,module,exports){
exports['aes-128-ecb'] = {
  cipher: 'AES',
  key: 128,
  iv: 0,
  mode: 'ECB',
  type: 'block'
};
exports['aes-192-ecb'] = {
  cipher: 'AES',
  key: 192,
  iv: 0,
  mode: 'ECB',
  type: 'block'
};
exports['aes-256-ecb'] = {
  cipher: 'AES',
  key: 256,
  iv: 0,
  mode: 'ECB',
  type: 'block'
};
exports['aes-128-cbc'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'CBC',
  type: 'block'
};
exports['aes-192-cbc'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'CBC',
  type: 'block'
};
exports['aes-256-cbc'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'CBC',
  type: 'block'
};
exports['aes128'] = exports['aes-128-cbc'];
exports['aes192'] = exports['aes-192-cbc'];
exports['aes256'] = exports['aes-256-cbc'];
exports['aes-128-cfb'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'CFB',
  type: 'stream'
};
exports['aes-192-cfb'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'CFB',
  type: 'stream'
};
exports['aes-256-cfb'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'CFB',
  type: 'stream'
};
exports['aes-128-cfb8'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'CFB8',
  type: 'stream'
};
exports['aes-192-cfb8'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'CFB8',
  type: 'stream'
};
exports['aes-256-cfb8'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'CFB8',
  type: 'stream'
};
exports['aes-128-cfb1'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'CFB1',
  type: 'stream'
};
exports['aes-192-cfb1'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'CFB1',
  type: 'stream'
};
exports['aes-256-cfb1'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'CFB1',
  type: 'stream'
};
exports['aes-128-ofb'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'OFB',
  type: 'stream'
};
exports['aes-192-ofb'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'OFB',
  type: 'stream'
};
exports['aes-256-ofb'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'OFB',
  type: 'stream'
};
exports['aes-128-ctr'] = {
  cipher: 'AES',
  key: 128,
  iv: 16,
  mode: 'CTR',
  type: 'stream'
};
exports['aes-192-ctr'] = {
  cipher: 'AES',
  key: 192,
  iv: 16,
  mode: 'CTR',
  type: 'stream'
};
exports['aes-256-ctr'] = {
  cipher: 'AES',
  key: 256,
  iv: 16,
  mode: 'CTR',
  type: 'stream'
};
exports['aes-128-gcm'] = {
  cipher: 'AES',
  key: 128,
  iv: 12,
  mode: 'GCM',
  type: 'auth'
};
exports['aes-192-gcm'] = {
  cipher: 'AES',
  key: 192,
  iv: 12,
  mode: 'GCM',
  type: 'auth'
};
exports['aes-256-gcm'] = {
  cipher: 'AES',
  key: 256,
  iv: 12,
  mode: 'GCM',
  type: 'auth'
};
},{}],25:[function(require,module,exports){
var xor = require('../xor');
exports.encrypt = function (self, block) {
  var data = xor(block, self._prev);
  self._prev = self._cipher.encryptBlock(data);
  return self._prev;
};
exports.decrypt = function (self, block) {
  var pad = self._prev;
  self._prev = block;
  var out = self._cipher.decryptBlock(block);
  return xor(out, pad);
};
},{"../xor":33}],26:[function(require,module,exports){
(function (Buffer){
var xor = require('../xor');
exports.encrypt = function (self, data, decrypt) {
  var out = new Buffer('');
  var len;
  while (data.length) {
    if (self._cache.length === 0) {
      self._cache = self._cipher.encryptBlock(self._prev);
      self._prev = new Buffer('');
    }
    if (self._cache.length <= data.length) {
      len = self._cache.length;
      out = Buffer.concat([out, encryptStart(self, data.slice(0, len), decrypt)]);
      data = data.slice(len);
    } else {
      out = Buffer.concat([out, encryptStart(self, data, decrypt)]);
      break;
    }
  }
  return out;
};
function encryptStart(self, data, decrypt) {
  var len = data.length;
  var out = xor(data, self._cache);
  self._cache = self._cache.slice(len);
  self._prev = Buffer.concat([self._prev, decrypt?data:out]);
  return out;
}
}).call(this,require("buffer").Buffer)
},{"../xor":33,"buffer":7}],27:[function(require,module,exports){
(function (Buffer){

function encryptByte(self, byte, decrypt) {
  var pad;
  var i = -1;
  var len = 8;
  var out = 0;
  var bit, value;
  while (++i < len) {
    pad = self._cipher.encryptBlock(self._prev);
    bit = (byte & (1 << (7-i))) ? 0x80:0;
    value = pad[0] ^ bit;
    out += ((value&0x80) >> (i%8));
    self._prev = shiftIn(self._prev, decrypt?bit:value);
  }
  return out;
}
exports.encrypt = function (self, chunk, decrypt) {
  var len = chunk.length;
  var out = new Buffer(len);
  var i = -1;
  while (++i < len) {
    out[i] = encryptByte(self, chunk[i], decrypt);
  }
  return out;
};
function shiftIn(buffer, value) {
  var len = buffer.length;
  var i = -1;
  var out = new Buffer(buffer.length);
  buffer = Buffer.concat([buffer, new Buffer([value])]);
  while(++i < len) {
    out[i] = buffer[i]<<1 | buffer[i+1]>>(7);
  }
  return out;
}
}).call(this,require("buffer").Buffer)
},{"buffer":7}],28:[function(require,module,exports){
(function (Buffer){
function encryptByte(self, byte, decrypt) {
  var pad = self._cipher.encryptBlock(self._prev);
  var out = pad[0] ^ byte;
  self._prev = Buffer.concat([self._prev.slice(1), new Buffer([decrypt?byte:out])]);
  return out;
}
exports.encrypt = function (self, chunk, decrypt) {
  var len = chunk.length;
  var out = new Buffer(len);
  var i = -1;
  while (++i < len) {
    out[i] = encryptByte(self, chunk[i], decrypt);
  }
  return out;
};
}).call(this,require("buffer").Buffer)
},{"buffer":7}],29:[function(require,module,exports){
(function (Buffer){
var xor = require('../xor');
function getBlock(self) {
  var out = self._cipher.encryptBlock(self._prev);
  incr32(self._prev);
  return out;
}
exports.encrypt = function (self, chunk) {
  while (self._cache.length < chunk.length) {
    self._cache = Buffer.concat([self._cache, getBlock(self)]);
  }
  var pad = self._cache.slice(0, chunk.length);
  self._cache = self._cache.slice(chunk.length);
  return xor(chunk, pad);
};
function incr32(iv) {
  var len = iv.length;
  var item;
  while (len--) {
    item = iv.readUInt8(len);
    if (item === 255) {
      iv.writeUInt8(0, len);
    } else {
      item++;
      iv.writeUInt8(item, len);
      break;
    }
  }
}
}).call(this,require("buffer").Buffer)
},{"../xor":33,"buffer":7}],30:[function(require,module,exports){
exports.encrypt = function (self, block) {
  return self._cipher.encryptBlock(block);
};
exports.decrypt = function (self, block) {
  return self._cipher.decryptBlock(block);
};
},{}],31:[function(require,module,exports){
(function (Buffer){
var xor = require('../xor');
function getBlock(self) {
  self._prev = self._cipher.encryptBlock(self._prev);
  return self._prev;
}
exports.encrypt = function (self, chunk) {
  while (self._cache.length < chunk.length) {
    self._cache = Buffer.concat([self._cache, getBlock(self)]);
  }
  var pad = self._cache.slice(0, chunk.length);
  self._cache = self._cache.slice(chunk.length);
  return xor(chunk, pad);
};
}).call(this,require("buffer").Buffer)
},{"../xor":33,"buffer":7}],32:[function(require,module,exports){
(function (Buffer){
var aes = require('./aes');
var Transform = require('./cipherBase');
var inherits = require('inherits');

inherits(StreamCipher, Transform);
module.exports = StreamCipher;
function StreamCipher(mode, key, iv, decrypt) {
  if (!(this instanceof StreamCipher)) {
    return new StreamCipher(mode, key, iv);
  }
  Transform.call(this);
  this._cipher = new aes.AES(key);
  this._prev = new Buffer(iv.length);
  this._cache = new Buffer('');
  this._secCache = new Buffer('');
  this._decrypt = decrypt;
  iv.copy(this._prev);
  this._mode = mode;
}
StreamCipher.prototype._transform = function (chunk, _, next) {
  next(null, this._mode.encrypt(this, chunk, this._decrypt));
};
StreamCipher.prototype._flush = function (next) {
  this._cipher.scrub();
  next();
};
}).call(this,require("buffer").Buffer)
},{"./aes":17,"./cipherBase":19,"buffer":7,"inherits":147}],33:[function(require,module,exports){
(function (Buffer){
module.exports = xor;
function xor(a, b) {
  var len = Math.min(a.length, b.length);
  var out = new Buffer(len);
  var i = -1;
  while (++i < len) {
    out.writeUInt8(a[i] ^ b[i], i);
  }
  return out;
}
}).call(this,require("buffer").Buffer)
},{"buffer":7}],34:[function(require,module,exports){
(function (Buffer){
exports['RSA-SHA224'] = exports.sha224WithRSAEncryption = {
  sign: 'rsa',
  hash: 'sha224',
  id: new Buffer('302d300d06096086480165030402040500041c', 'hex')
};
exports['RSA-SHA256'] = exports.sha256WithRSAEncryption = {
  sign: 'rsa',
  hash: 'sha256',
  id: new Buffer('3031300d060960864801650304020105000420', 'hex')
};
exports['RSA-SHA384'] = exports.sha384WithRSAEncryption = {
  sign: 'rsa',
  hash: 'sha384',
  id: new Buffer('3041300d060960864801650304020205000430', 'hex')
};
exports['RSA-SHA512'] = exports.sha512WithRSAEncryption = {
  sign: 'rsa',
  hash: 'sha512',
  id: new Buffer('3051300d060960864801650304020305000440', 'hex')
};
exports['RSA-SHA1'] = {
	sign: 'rsa',
	hash: 'sha1',
	id: new Buffer('3021300906052b0e03021a05000414', 'hex')
};
exports['ecdsa-with-SHA1'] = {
	sign: 'ecdsa',
	hash: 'sha1',
	id: new Buffer('', 'hex')
};
exports.DSA = exports['DSA-SHA1'] = exports['DSA-SHA'] = {
  sign: 'dsa',
  hash: 'sha1',
  id: new Buffer('', 'hex')
};
exports['RSA-RIPEMD160'] = exports.ripemd160WithRSA = {
  sign: 'rsa',
  hash: 'rmd160',
  id: new Buffer('3021300906052b2403020105000414', 'hex')
};
exports['RSA-MD5'] = exports.md5WithRSAEncryption = {
  sign: 'rsa',
  hash: 'md5',
  id: new Buffer('3020300c06082a864886f70d020505000410', 'hex')
};
}).call(this,require("buffer").Buffer)
},{"buffer":7}],35:[function(require,module,exports){
(function (Buffer){
var sign = require('./sign');
var verify = require('./verify');
var stream = require('readable-stream');
var inherits = require('inherits');
var algos = require('./algos');
'use strict';
module.exports = function (exports, crypto) {
	exports.createSign = createSign;
	function createSign(algorithm) {

		return new Sign(algorithm, crypto);
	}
	exports.createVerify = createVerify;
	function createVerify(algorithm) {
		return new Verify(algorithm, crypto);
	}
};
inherits(Sign, stream.Writable);
function Sign(algorithm, crypto) {
	stream.Writable.call(this);
	var data = algos[algorithm];
	if (!data) {
		throw new Error('Unknown message digest');
	}
	this._hash = crypto.createHash(data.hash);
	this._tag = data.id;
	this._crypto = crypto;
}
Sign.prototype._write = function _write(data, _, done) {
	this._hash.update(data);
	done();
};
Sign.prototype.update = function update(data) {
	this.write(data);
	return this;
};

Sign.prototype.sign = function signMethod(key, enc) {
	this.end();
	var hash = this._hash.digest();
	var sig = sign(Buffer.concat([this._tag, hash]), key, this._crypto);
	if (enc) {
		sig = sig.toString(enc);
	}
	return sig;
};

inherits(Verify, stream.Writable);
function Verify(algorithm, crypto) {
	stream.Writable.call(this);
	var data = algos[algorithm];
	if (!data) {
		throw new Error('Unknown message digest');
	}
	this._hash = crypto.createHash(data.hash);
	this._tag = data.id;
}
Verify.prototype._write = function _write(data, _, done) {
	this._hash.update(data);
	done();
};
Verify.prototype.update = function update(data) {
	this.write(data);
	return this;
};

Verify.prototype.verify = function verifyMethod(key, sig, enc) {
	this.end();
	var hash = this._hash.digest();
	if (!Buffer.isBuffer(sig)) {
		sig = new Buffer(sig, enc);
	}
	return verify(sig, Buffer.concat([this._tag, hash]), key);
};
}).call(this,require("buffer").Buffer)
},{"./algos":34,"./sign":76,"./verify":77,"buffer":7,"inherits":147,"readable-stream":158}],36:[function(require,module,exports){
// Utils

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
}

// Could use `inherits` module, but don't want to move from single file
// architecture yet.
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  var TempCtor = function () {}
  TempCtor.prototype = superCtor.prototype
  ctor.prototype = new TempCtor()
  ctor.prototype.constructor = ctor
}

// BN

function BN(number, base) {
  // May be `new BN(bn)` ?
  if (number !== null &&
      typeof number === 'object' &&
      Array.isArray(number.words)) {
    return number;
  }

  this.sign = false;
  this.words = null;
  this.length = 0;

  // Reduction context
  this.red = null;

  if (number !== null)
    this._init(number || 0, base || 10);
}
if (typeof module === 'object')
  module.exports = BN;

BN.BN = BN;
BN.wordSize = 26;

BN.prototype._init = function init(number, base) {
  if (typeof number === 'number') {
    if (number < 0) {
      this.sign = true;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    }
    return;
  } else if (typeof number === 'object') {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');
    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++)
      this.words[i] = 0;

    // Assume big-endian
    var off = 0;
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }

    return this.strip();
  }
  if (base === 'hex')
    base = 16;
  assert(base === (base | 0) && base >= 2 && base <= 36);

  number = number.toString().replace(/\s+/g, '');
  var start = 0;
  if (number[0] === '-')
    start++;

  if (base === 16)
    this._parseHex(number, start);
  else
    this._parseBase(number, base, start);

  if (number[0] === '-')
    this.sign = true;

  this.strip();
};

BN.prototype._parseHex = function parseHex(number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseInt(number.slice(i, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseInt(number.slice(start, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this.strip();
};

BN.prototype._parseBase = function parseBase(number, base, start) {
  // Initialize as zero
  this.words = [ 0 ];
  this.length = 1;

  var word = 0;
  var q = 1;
  var p = 0;
  var bigQ = null;
  for (var i = start; i < number.length; i++) {
    var digit;
    var ch = number[i];
    if (base === 10 || ch <= '9')
      digit = ch | 0;
    else if (ch >= 'a')
      digit = ch.charCodeAt(0) - 97 + 10;
    else
      digit = ch.charCodeAt(0) - 65 + 10;
    word *= base;
    word += digit;
    q *= base;
    p++;

    if (q > 0xfffff) {
      assert(q <= 0x3ffffff);
      if (!bigQ)
        bigQ = new BN(q);
      this.mul(bigQ).copy(this);
      this.iadd(new BN(word));
      word = 0;
      q = 1;
      p = 0;
    }
  }
  if (p !== 0) {
    this.mul(new BN(q)).copy(this);
    this.iadd(new BN(word));
  }
};

BN.prototype.copy = function copy(dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.sign = this.sign;
  dest.red = this.red;
};

BN.prototype.clone = function clone() {
  var r = new BN(null);
  this.copy(r);
  return r;
};

// Remove leading `0` from `this`
BN.prototype.strip = function strip() {
  while (this.length > 1 && this.words[this.length - 1] === 0)
    this.length--;
  return this._normSign();
};

BN.prototype._normSign = function _normSign() {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0)
    this.sign = false;
  return this;
};

BN.prototype.inspect = function inspect() {
  return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
};

/*

var zeros = [];
var groupSizes = [];
var groupBases = [];

var s = '';
var i = -1;
while (++i < BN.wordSize) {
  zeros[i] = s;
  s += '0';
}
groupSizes[0] = 0;
groupSizes[1] = 0;
groupBases[0] = 0;
groupBases[1] = 0;
var base = 2 - 1;
while (++base < 36 + 1) {
  var groupSize = 0;
  var groupBase = 1;
  // TODO: <=
  while (groupBase < (1 << BN.wordSize) / base) {
    groupBase *= base;
    groupSize += 1;
  }
  groupSizes[base] = groupSize;
  groupBases[base] = groupBase;
}

*/

var zeros = [
  '',
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '0000000',
  '00000000',
  '000000000',
  '0000000000',
  '00000000000',
  '000000000000',
  '0000000000000',
  '00000000000000',
  '000000000000000',
  '0000000000000000',
  '00000000000000000',
  '000000000000000000',
  '0000000000000000000',
  '00000000000000000000',
  '000000000000000000000',
  '0000000000000000000000',
  '00000000000000000000000',
  '000000000000000000000000',
  '0000000000000000000000000'
];

var groupSizes = [
  0, 0,
  25, 16, 12, 11, 10, 9, 8,
  8, 7, 7, 7, 7, 6, 6,
  6, 6, 6, 6, 6, 5, 5,
  5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5
];

var groupBases = [
  0, 0,
  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
];

BN.prototype.toString = function toString(base, padding) {
  base = base || 10;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var padding = padding | 0 || 1;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = zeros[6 - word.length] + word + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else if (base === (base | 0) && base >= 2 && base <= 36) {
    // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
    var groupSize = groupSizes[base];
    // var groupBase = Math.pow(base, groupSize);
    var groupBase = groupBases[base];
    var out = '';
    var c = this.clone();
    c.sign = false;
    while (c.cmpn(0) !== 0) {
      var r = c.modn(groupBase).toString(base);
      c = c.idivn(groupBase);

      if (c.cmpn(0) !== 0)
        out = zeros[groupSize - r.length] + r + out;
      else
        out = r + out;
    }
    if (this.cmpn(0) === 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else {
    assert(false, 'Base should be between 2 and 36');
  }
};

BN.prototype.toJSON = function toJSON() {
  return this.toString(16);
};

BN.prototype.toArray = function toArray() {
  this.strip();
  var res = new Array(this.byteLength());
  res[0] = 0;

  var q = this.clone();
  for (var i = 0; q.cmpn(0) !== 0; i++) {
    var b = q.andln(0xff);
    q.ishrn(8);

    // Assume big-endian
    res[res.length - i - 1] = b;
  }

  return res;
};

/*
function genCountBits(bits) {
  var arr = [];

  for (var i = bits - 1; i >= 0; i--) {
    var bit = '0x' + (1 << i).toString(16);
    arr.push('w >= ' + bit + ' ? ' + (i + 1));
  }

  return new Function('w', 'return ' + arr.join(' :\n') + ' :\n0;');
};

BN.prototype._countBits = genCountBits(26);
*/

// Sadly chrome apps could not contain `new Function()` calls
BN.prototype._countBits = function _countBits(w) {
  return w >= 0x2000000 ? 26 :
         w >= 0x1000000 ? 25 :
         w >= 0x800000 ? 24 :
         w >= 0x400000 ? 23 :
         w >= 0x200000 ? 22 :
         w >= 0x100000 ? 21 :
         w >= 0x80000 ? 20 :
         w >= 0x40000 ? 19 :
         w >= 0x20000 ? 18 :
         w >= 0x10000 ? 17 :
         w >= 0x8000 ? 16 :
         w >= 0x4000 ? 15 :
         w >= 0x2000 ? 14 :
         w >= 0x1000 ? 13 :
         w >= 0x800 ? 12 :
         w >= 0x400 ? 11 :
         w >= 0x200 ? 10 :
         w >= 0x100 ? 9 :
         w >= 0x80 ? 8 :
         w >= 0x40 ? 7 :
         w >= 0x20 ? 6 :
         w >= 0x10 ? 5 :
         w >= 0x8 ? 4 :
         w >= 0x4 ? 3 :
         w >= 0x2 ? 2 :
         w >= 0x1 ? 1 :
         0;
};

// Return number of used bits in a BN
BN.prototype.bitLength = function bitLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  var hi = this._countBits(w);
  return (this.length - 1) * 26 + hi;
};

BN.prototype.byteLength = function byteLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  return Math.ceil(this.bitLength() / 8);
};

// Return negative clone of `this`
BN.prototype.neg = function neg() {
  if (this.cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.sign = !this.sign;
  return r;
};

// Add `num` to `this` in-place
BN.prototype.iadd = function iadd(num) {
  // negative + positive
  if (this.sign && !num.sign) {
    this.sign = false;
    var r = this.isub(num);
    this.sign = !this.sign;
    return this._normSign();

  // positive + negative
  } else if (!this.sign && num.sign) {
    num.sign = false;
    var r = this.isub(num);
    num.sign = true;
    return r._normSign();
  }

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] + b.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  // Copy the rest of the words
  } else if (a !== this) {
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  }

  return this;
};

// Add `num` to `this`
BN.prototype.add = function add(num) {
  if (num.sign && !this.sign) {
    num.sign = false;
    var res = this.sub(num);
    num.sign = true;
    return res;
  } else if (!num.sign && this.sign) {
    this.sign = false;
    var res = num.sub(this);
    this.sign = true;
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

// Subtract `num` from `this` in-place
BN.prototype.isub = function isub(num) {
  // this - (-num) = this + num
  if (num.sign) {
    num.sign = false;
    var r = this.iadd(num);
    num.sign = true;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.sign) {
    this.sign = false;
    this.iadd(num);
    this.sign = true;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.sign = false;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  if (cmp > 0) {
    var a = this;
    var b = num;
  } else {
    var a = num;
    var b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] - b.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.sign = true;

  return this.strip();
};

// Subtract `num` from `this`
BN.prototype.sub = function sub(num) {
  return this.clone().isub(num);
};

/*
// NOTE: This could be potentionally used to generate loop-less multiplications
function _genCombMulTo(alen, blen) {
  var len = alen + blen - 1;
  var src = [
    'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
        'mask = 0x3ffffff, shift = 0x4000000;',
    'out.length = ' + len + ';'
  ];
  for (var k = 0; k < len; k++) {
    var minJ = Math.max(0, k - alen + 1);
    var maxJ = Math.min(k, blen - 1);

    for (var j = minJ; j <= maxJ; j++) {
      var i = k - j;
      var mul = 'a[' + i + '] * b[' + j + ']';

      if (j === minJ) {
        src.push('w = ' + mul + ' + c;');
        src.push('c = (w / shift) | 0;');
      } else {
        src.push('w += ' + mul + ';');
        src.push('c += (w / shift) | 0;');
      }
      src.push('w &= mask;');
    }
    src.push('o[' + k + '] = w;');
  }
  src.push('if (c !== 0) {',
           '  o[' + k + '] = c;',
           '  out.length++;',
           '}',
           'return out;');

  return src.join('\n');
}
*/

BN.prototype._smallMulTo = function _smallMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;
    }
    out.words[k] = rword;
    carry = ncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype._bigMulTo = function _bigMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  var hncarry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = hncarry;
    hncarry = 0;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;

      hncarry += ncarry >>> 26;
      ncarry &= 0x3ffffff;
    }
    out.words[k] = rword;
    carry = ncarry;
    ncarry = hncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype.mulTo = function mulTo(num, out) {
  var res;
  if (this.length + num.length < 63)
    res = this._smallMulTo(num, out);
  else
    res = this._bigMulTo(num, out);
  return res;
};

// Multiply `this` by `num`
BN.prototype.mul = function mul(num) {
  var out = new BN(null);
  out.words = new Array(this.length + num.length);
  return this.mulTo(num, out);
};

// In-place Multiplication
BN.prototype.imul = function imul(num) {
  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
    this.words[0] = 0;
    this.length = 1;
    return this;
  }

  var tlen = this.length;
  var nlen = num.length;

  this.sign = num.sign !== this.sign;
  this.length = this.length + num.length;
  this.words[this.length - 1] = 0;

  var lastCarry = 0;
  for (var k = this.length - 2; k >= 0; k--) {
    // Sum all words with the same `i + j = k` and accumulate `carry`,
    // note that carry could be >= 0x3ffffff
    var carry = 0;
    var rword = 0;
    var maxJ = Math.min(k, nlen - 1);
    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i];
      var b = num.words[j];
      var r = a * b;

      var lo = r & 0x3ffffff;
      carry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      carry += lo >>> 26;
    }
    this.words[k] = rword;
    this.words[k + 1] += carry;
    carry = 0;
  }

  // Propagate overflows
  var carry = 0;
  for (var i = 1; i < this.length; i++) {
    var w = this.words[i] + carry;
    this.words[i] = w & 0x3ffffff;
    carry = w >>> 26;
  }

  return this.strip();
};

// `this` * `this`
BN.prototype.sqr = function sqr() {
  return this.mul(this);
};

// `this` * `this` in-place
BN.prototype.isqr = function isqr() {
  return this.mul(this);
};

// Shift-left in-place
BN.prototype.ishln = function ishln(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  var o = this.clone();
  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = (this.words[i] - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this.strip();
};

// Shift-right in-place
// NOTE: `hint` is a lowest bit before trailing zeroes
// NOTE: if `extended` is true - { lo: ..., hi: } object will be returned
BN.prototype.ishrn = function ishrn(bits, hint, extended) {
  assert(typeof bits === 'number' && bits >= 0);
  if (hint)
    hint = (hint - (hint % 26)) / 26;
  else
    hint = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  hint -= s;
  hint = Math.max(0, hint);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= hint); i--) {
    var word = this.words[i];
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this.strip();
  if (extended)
    return { hi: this, lo: maskedWords };

  return this;
};

// Shift-left
BN.prototype.shln = function shln(bits) {
  return this.clone().ishln(bits);
};

// Shift-right
BN.prototype.shrn = function shrn(bits) {
  return this.clone().ishrn(bits);
};

// Test if n bit is set
BN.prototype.testn = function testn(bit) {
  assert(typeof bit === 'number' && bit >= 0);
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    return false;
  }

  // Check bit and return
  var w = this.words[s];

  return !!(w & q);
};

// Return only lowers bits of number (in-place)
BN.prototype.imaskn = function imaskn(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;

  assert(!this.sign, 'imaskn works only with positive numbers');

  if (r !== 0)
    s++;
  this.length = Math.min(s, this.length);

  if (r !== 0) {
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    this.words[this.length - 1] &= mask;
  }

  return this.strip();
};

// Return only lowers bits of number
BN.prototype.maskn = function maskn(bits) {
  return this.clone().imaskn(bits);
};

// Add plain number `num` to `this`
BN.prototype.iaddn = function iaddn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.isubn(-num);

  // Possible sign change
  if (this.sign) {
    if (this.length === 1 && this.words[0] < num) {
      this.words[0] = num - this.words[0];
      this.sign = false;
      return this;
    }

    this.sign = false;
    this.isubn(num);
    this.sign = true;
    return this;
  }
  this.words[0] += num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
    this.words[i] -= 0x4000000;
    if (i === this.length - 1)
      this.words[i + 1] = 1;
    else
      this.words[i + 1]++;
  }
  this.length = Math.max(this.length, i + 1);

  return this;
};

// Subtract plain number `num` from `this`
BN.prototype.isubn = function isubn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.iaddn(-num);

  if (this.sign) {
    this.sign = false;
    this.iaddn(num);
    this.sign = true;
    return this;
  }

  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this.strip();
};

BN.prototype.addn = function addn(num) {
  return this.clone().iaddn(num);
};

BN.prototype.subn = function subn(num) {
  return this.clone().isubn(num);
};

BN.prototype.iabs = function iabs() {
  this.sign = false;

  return this
};

BN.prototype.abs = function abs() {
  return this.clone().iabs();
};

BN.prototype._wordDiv = function _wordDiv(num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  var q = mode !== 'mod' && new BN(0);
  var sign = false;

  // Approximate quotient at each step
  while (a.length > b.length) {
    // NOTE: a.length is always >= 2, because of the condition .div()
    var hi = a.words[a.length - 1] * 0x4000000 + a.words[a.length - 2];
    var sq = (hi / b.words[b.length - 1]);
    var sqhi = (sq / 0x4000000) | 0;
    var sqlo = sq & 0x3ffffff;
    sq = new BN(null);
    sq.words = [ sqlo, sqhi ];
    sq.length = 2;

    // Collect quotient
    var shift = (a.length - b.length - 1) * 26;
    if (q) {
      var t = sq.shln(shift);
      if (a.sign)
        q.isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b).ishln(shift);
    if (a.sign)
      a.iadd(sq)
    else
      a.isub(sq);
  }
  // At this point a.length <= b.length
  while (a.ucmp(b) >= 0) {
    // NOTE: a.length is always >= 2, because of the condition above
    var hi = a.words[a.length - 1];
    var sq = new BN((hi / b.words[b.length - 1]) | 0);
    var shift = (a.length - b.length) * 26;

    if (q) {
      var t = sq.shln(shift);
      if (a.sign)
        q.isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b).ishln(shift);

    if (a.sign)
      a.iadd(sq);
    else
      a.isub(sq);
  }

  if (a.sign) {
    if (q)
      q.isubn(1);
    a.iadd(b);
  }
  return { div: q ? q : null, mod: a };
};

BN.prototype.divmod = function divmod(num, mode) {
  assert(num.cmpn(0) !== 0);

  if (this.sign && !num.sign) {
    var res = this.neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div.neg();
    if (mode !== 'div')
      mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
    return {
      div: div,
      mod: mod
    };
  } else if (!this.sign && num.sign) {
    var res = this.divmod(num.neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div.neg();
    return { div: div, mod: res.mod };
  } else if (this.sign && num.sign) {
    return this.neg().divmod(num.neg(), mode);
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BN(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this.divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BN(this.modn(num.words[0])) };
    return {
      div: this.divn(num.words[0]),
      mod: new BN(this.modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

// Find `this` / `num`
BN.prototype.div = function div(num) {
  return this.divmod(num, 'div').div;
};

// Find `this` % `num`
BN.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod').mod;
};

// Find Round(`this` / `num`)
BN.prototype.divRound = function divRound(num) {
  var dm = this.divmod(num);

  // Fast case - exact division
  if (dm.mod.cmpn(0) === 0)
    return dm.div;

  var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

  var half = num.shrn(1);
  var r2 = num.andln(1);
  var cmp = mod.cmp(half);

  // Round down
  if (cmp < 0 || r2 === 1 && cmp === 0)
    return dm.div;

  // Round up
  return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
};

BN.prototype.modn = function modn(num) {
  assert(num <= 0x3ffffff);
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + this.words[i]) % num;

  return acc;
};

// In-place division by number
BN.prototype.idivn = function idivn(num) {
  assert(num <= 0x3ffffff);

  var carry = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var w = this.words[i] + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this.strip();
};

BN.prototype.divn = function divn(num) {
  return this.clone().idivn(num);
};

BN.prototype._egcd = function _egcd(x1, p) {
  assert(!p.sign);
  assert(p.cmpn(0) !== 0);

  var a = this;
  var b = p.clone();

  if (a.sign)
    a = a.mod(p);
  else
    a = a.clone();

  var x2 = new BN(0);
  while (b.isEven())
    b.ishrn(1);
  var delta = b.clone();
  while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
    while (a.isEven()) {
      a.ishrn(1);
      if (x1.isEven())
        x1.ishrn(1);
      else
        x1.iadd(delta).ishrn(1);
    }
    while (b.isEven()) {
      b.ishrn(1);
      if (x2.isEven())
        x2.ishrn(1);
      else
        x2.iadd(delta).ishrn(1);
    }
    if (a.cmp(b) >= 0) {
      a.isub(b);
      x1.isub(x2);
    } else {
      b.isub(a);
      x2.isub(x1);
    }
  }
  if (a.cmpn(1) === 0)
    return x1;
  else
    return x2;
};

BN.prototype.gcd = function gcd(num) {
  if (this.cmpn(0) === 0)
    return num.clone();
  if (num.cmpn(0) === 0)
    return this.clone();

  var a = this.clone();
  var b = num.clone();
  a.sign = false;
  b.sign = false;

  // Remove common factor of two
  for (var shift = 0; a.isEven() && b.isEven(); shift++) {
    a.ishrn(1);
    b.ishrn(1);
  }

  while (a.isEven())
    a.ishrn(1);

  do {
    while (b.isEven())
      b.ishrn(1);

    // Swap `a` and `b` to make `a` always bigger than `b`
    if (a.cmp(b) < 0) {
      var t = a;
      a = b;
      b = t;
    }
    a.isub(a.div(b).mul(b));
  } while (a.cmpn(0) !== 0 && b.cmpn(0) !== 0);
  if (a.cmpn(0) === 0)
    return b.ishln(shift);
  else
    return a.ishln(shift);
};

// Invert number in the field F(num)
BN.prototype.invm = function invm(num) {
  return this._egcd(new BN(1), num).mod(num);
};

BN.prototype.isEven = function isEven(num) {
  return (this.words[0] & 1) === 0;
};

BN.prototype.isOdd = function isOdd(num) {
  return (this.words[0] & 1) === 1;
};

// And first word and num
BN.prototype.andln = function andln(num) {
  return this.words[0] & num;
};

// Increment at the bit position in-line
BN.prototype.bincn = function bincn(bit) {
  assert(typeof bit === 'number');
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    for (var i = this.length; i < s + 1; i++)
      this.words[i] = 0;
    this.words[s] |= q;
    this.length = s + 1;
    return this;
  }

  // Add bit and propagate, if needed
  var carry = q;
  for (var i = s; carry !== 0 && i < this.length; i++) {
    var w = this.words[i];
    w += carry;
    carry = w >>> 26;
    w &= 0x3ffffff;
    this.words[i] = w;
  }
  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }
  return this;
};

BN.prototype.cmpn = function cmpn(num) {
  var sign = num < 0;
  if (sign)
    num = -num;

  if (this.sign && !sign)
    return -1;
  else if (!this.sign && sign)
    return 1;

  num &= 0x3ffffff;
  this.strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0];
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.sign)
    res = -res;
  return res;
};

// Compare two numbers and return:
// 1 - if `this` > `num`
// 0 - if `this` == `num`
// -1 - if `this` < `num`
BN.prototype.cmp = function cmp(num) {
  if (this.sign && !num.sign)
    return -1;
  else if (!this.sign && num.sign)
    return 1;

  var res = this.ucmp(num);
  if (this.sign)
    return -res;
  else
    return res;
};

// Unsigned comparison
BN.prototype.ucmp = function ucmp(num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i];
    var b = num.words[i];

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};

//
// A reduce context, could be using montgomery or something better, depending
// on the `m` itself.
//
BN.red = function red(num) {
  return new Red(num);
};

BN.prototype.toRed = function toRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  assert(!this.sign, 'red works only with positives');
  return ctx.convertTo(this)._forceRed(ctx);
};

BN.prototype.fromRed = function fromRed() {
  assert(this.red, 'fromRed works only with numbers in reduction context');
  return this.red.convertFrom(this);
};

BN.prototype._forceRed = function _forceRed(ctx) {
  this.red = ctx;
  return this;
};

BN.prototype.forceRed = function forceRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  return this._forceRed(ctx);
};

BN.prototype.redAdd = function redAdd(num) {
  assert(this.red, 'redAdd works only with red numbers');
  return this.red.add(this, num);
};

BN.prototype.redIAdd = function redIAdd(num) {
  assert(this.red, 'redIAdd works only with red numbers');
  return this.red.iadd(this, num);
};

BN.prototype.redSub = function redSub(num) {
  assert(this.red, 'redSub works only with red numbers');
  return this.red.sub(this, num);
};

BN.prototype.redISub = function redISub(num) {
  assert(this.red, 'redISub works only with red numbers');
  return this.red.isub(this, num);
};

BN.prototype.redShl = function redShl(num) {
  assert(this.red, 'redShl works only with red numbers');
  return this.red.shl(this, num);
};

BN.prototype.redMul = function redMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.mul(this, num);
};

BN.prototype.redIMul = function redIMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.imul(this, num);
};

BN.prototype.redSqr = function redSqr() {
  assert(this.red, 'redSqr works only with red numbers');
  this.red._verify1(this);
  return this.red.sqr(this);
};

BN.prototype.redISqr = function redISqr() {
  assert(this.red, 'redISqr works only with red numbers');
  this.red._verify1(this);
  return this.red.isqr(this);
};

// Square root over p
BN.prototype.redSqrt = function redSqrt() {
  assert(this.red, 'redSqrt works only with red numbers');
  this.red._verify1(this);
  return this.red.sqrt(this);
};

BN.prototype.redInvm = function redInvm() {
  assert(this.red, 'redInvm works only with red numbers');
  this.red._verify1(this);
  return this.red.invm(this);
};

// Return negative clone of `this` % `red modulo`
BN.prototype.redNeg = function redNeg() {
  assert(this.red, 'redNeg works only with red numbers');
  this.red._verify1(this);
  return this.red.neg(this);
};

BN.prototype.redPow = function redPow(num) {
  assert(this.red && !num.red, 'redPow(normalNum)');
  this.red._verify1(this);
  return this.red.pow(this, num);
};

// Prime numbers with efficient reduction
var primes = {
  k256: null,
  p224: null,
  p192: null,
  p25519: null
};

// Pseudo-Mersenne prime
function MPrime(name, p) {
  // P = 2 ^ N - K
  this.name = name;
  this.p = new BN(p, 16);
  this.n = this.p.bitLength();
  this.k = new BN(1).ishln(this.n).isub(this.p);

  this.tmp = this._tmp();
}

MPrime.prototype._tmp = function _tmp() {
  var tmp = new BN(null);
  tmp.words = new Array(Math.ceil(this.n / 13));
  return tmp;
};

MPrime.prototype.ireduce = function ireduce(num) {
  // Assumes that `num` is less than `P^2`
  // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
  var r = num;
  var rlen;

  do {
    var pair = r.ishrn(this.n, 0, this.tmp);
    r = this.imulK(pair.hi);
    r = r.iadd(pair.lo);
    rlen = r.bitLength();
  } while (rlen > this.n);

  var cmp = rlen < this.n ? -1 : r.cmp(this.p);
  if (cmp === 0) {
    r.words[0] = 0;
    r.length = 1;
  } else if (cmp > 0) {
    r.isub(this.p);
  } else {
    r.strip();
  }

  return r;
};

MPrime.prototype.imulK = function imulK(num) {
  return num.imul(this.k);
};

function K256() {
  MPrime.call(
    this,
    'k256',
    'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
}
inherits(K256, MPrime);

K256.prototype.imulK = function imulK(num) {
  // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
  num.words[num.length] = 0;
  num.words[num.length + 1] = 0;
  num.length += 2;
  for (var i = num.length - 3; i >= 0; i--) {
    var w = num.words[i];
    var hi = w * 0x40;
    var lo = w * 0x3d1;
    hi += (lo / 0x4000000) | 0;
    var uhi = (hi / 0x4000000) | 0;
    hi &= 0x3ffffff;
    lo &= 0x3ffffff;

    num.words[i + 2] += uhi;
    num.words[i + 1] += hi;
    num.words[i] = lo;
  }
  var w = num.words[num.length - 2];
  if (w >= 0x4000000) {
    num.words[num.length - 1] += w >>> 26;
    num.words[num.length - 2] = w & 0x3ffffff;
  }
  if (num.words[num.length - 1] === 0)
    num.length--;
  if (num.words[num.length - 1] === 0)
    num.length--;
  return num;
};

function P224() {
  MPrime.call(
    this,
    'p224',
    'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
}
inherits(P224, MPrime);

function P192() {
  MPrime.call(
    this,
    'p192',
    'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
}
inherits(P192, MPrime);

function P25519() {
  // 2 ^ 255 - 19
  MPrime.call(
    this,
    '25519',
    '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
}
inherits(P25519, MPrime);

P25519.prototype.imulK = function imulK(num) {
  // K = 0x13
  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var hi = num.words[i] * 0x13 + carry;
    var lo = hi & 0x3ffffff;
    hi >>>= 26;

    num.words[i] = lo;
    carry = hi;
  }
  if (carry !== 0)
    num.words[num.length++] = carry;
  return num;
};

// Exported mostly for testing purposes, use plain name instead
BN._prime = function prime(name) {
  // Cached version of prime
  if (primes[name])
    return primes[name];

  var prime;
  if (name === 'k256')
    prime = new K256();
  else if (name === 'p224')
    prime = new P224();
  else if (name === 'p192')
    prime = new P192();
  else if (name === 'p25519')
    prime = new P25519();
  else
    throw new Error('Unknown prime ' + name);
  primes[name] = prime;

  return prime;
}

//
// Base reduction engine
//
function Red(m) {
  if (typeof m === 'string') {
    var prime = BN._prime(m);
    this.m = prime.p;
    this.prime = prime;
  } else {
    this.m = m;
    this.prime = null;
  }
}

Red.prototype._verify1 = function _verify1(a) {
  assert(!a.sign, 'red works only with positives');
  assert(a.red, 'red works only with red numbers');
};

Red.prototype._verify2 = function _verify2(a, b) {
  assert(!a.sign && !b.sign, 'red works only with positives');
  assert(a.red && a.red === b.red,
         'red works only with red numbers');
};

Red.prototype.imod = function imod(a) {
  if (this.prime)
    return this.prime.ireduce(a)._forceRed(this);
  return a.mod(this.m)._forceRed(this);
};

Red.prototype.neg = function neg(a) {
  var r = a.clone();
  r.sign = !r.sign;
  return r.iadd(this.m)._forceRed(this);
};

Red.prototype.add = function add(a, b) {
  this._verify2(a, b);

  var res = a.add(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res._forceRed(this);
};

Red.prototype.iadd = function iadd(a, b) {
  this._verify2(a, b);

  var res = a.iadd(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res;
};

Red.prototype.sub = function sub(a, b) {
  this._verify2(a, b);

  var res = a.sub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res._forceRed(this);
};

Red.prototype.isub = function isub(a, b) {
  this._verify2(a, b);

  var res = a.isub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res;
};

Red.prototype.shl = function shl(a, num) {
  this._verify1(a);
  return this.imod(a.shln(num));
};

Red.prototype.imul = function imul(a, b) {
  this._verify2(a, b);
  return this.imod(a.imul(b));
};

Red.prototype.mul = function mul(a, b) {
  this._verify2(a, b);
  return this.imod(a.mul(b));
};

Red.prototype.isqr = function isqr(a) {
  return this.imul(a, a);
};

Red.prototype.sqr = function sqr(a) {
  return this.mul(a, a);
};

Red.prototype.sqrt = function sqrt(a) {
  if (a.cmpn(0) === 0)
    return a.clone();

  var mod3 = this.m.andln(3);
  assert(mod3 % 2 === 1);

  // Fast case
  if (mod3 === 3) {
    var pow = this.m.add(new BN(1)).ishrn(2);
    var r = this.pow(a, pow);
    return r;
  }

  // Tonelli-Shanks algorithm (Totally unoptimized and slow)
  //
  // Find Q and S, that Q * 2 ^ S = (P - 1)
  var q = this.m.subn(1);
  var s = 0;
  while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
    s++;
    q.ishrn(1);
  }
  assert(q.cmpn(0) !== 0);

  var one = new BN(1).toRed(this);
  var nOne = one.redNeg();

  // Find quadratic non-residue
  // NOTE: Max is such because of generalized Riemann hypothesis.
  var lpow = this.m.subn(1).ishrn(1);
  var z = this.m.bitLength();
  z = new BN(2 * z * z).toRed(this);
  while (this.pow(z, lpow).cmp(nOne) !== 0)
    z.redIAdd(nOne);

  var c = this.pow(z, q);
  var r = this.pow(a, q.addn(1).ishrn(1));
  var t = this.pow(a, q);
  var m = s;
  while (t.cmp(one) !== 0) {
    var tmp = t;
    for (var i = 0; tmp.cmp(one) !== 0; i++)
      tmp = tmp.redSqr();
    assert(i < m);
    var b = this.pow(c, new BN(1).ishln(m - i - 1));

    r = r.redMul(b);
    c = b.redSqr();
    t = t.redMul(c);
    m = i;
  }

  return r;
};

Red.prototype.invm = function invm(a) {
  var inv = a._egcd(new BN(1), this.m);
  if (inv.sign) {
    inv.sign = false;
    return this.imod(inv).redNeg();
  } else {
    return this.imod(inv);
  }
};

Red.prototype.pow = function pow(a, num) {
  var w = [];
  var q = num.clone();
  while (q.cmpn(0) !== 0) {
    w.push(q.andln(1));
    q.ishrn(1);
  }

  // Skip leading zeroes
  var res = a;
  for (var i = 0; i < w.length; i++, res = this.sqr(res))
    if (w[i] !== 0)
      break;

  if (++i < w.length) {
    for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
      if (w[i] === 0)
        continue;
      res = this.mul(res, q);
    }
  }

  return res;
};

Red.prototype.convertTo = function convertTo(num) {
  return num.clone();
};

Red.prototype.convertFrom = function convertFrom(num) {
  var res = num.clone();
  res.red = null;
  return res;
};

//
// Montgomery method engine
//

BN.mont = function mont(num) {
  return new Mont(num);
};

function Mont(m) {
  Red.call(this, m);

  this.shift = this.m.bitLength();
  if (this.shift % 26 !== 0)
    this.shift += 26 - (this.shift % 26);
  this.r = new BN(1).ishln(this.shift);
  this.r2 = this.imod(this.r.sqr());
  this.rinv = this.r.invm(this.m);

  // TODO(indutny): simplify it
  this.minv = this.rinv.mul(this.r)
                       .sub(new BN(1))
                       .div(this.m)
                       .neg()
                       .mod(this.r);
}
inherits(Mont, Red);

Mont.prototype.convertTo = function convertTo(num) {
  return this.imod(num.shln(this.shift));
};

Mont.prototype.convertFrom = function convertFrom(num) {
  var r = this.imod(num.mul(this.rinv));
  r.red = null;
  return r;
};

Mont.prototype.imul = function imul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
    a.words[0] = 0;
    a.length = 1;
    return a;
  }

  var t = a.imul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.mul = function mul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
    return new BN(0)._forceRed(this);

  var t = a.mul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.invm = function invm(a) {
  // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
  var res = this.imod(a.invm(this.m).mul(this.r2));
  return res._forceRed(this);
};

},{}],37:[function(require,module,exports){
var elliptic = exports;

elliptic.version = require('../package.json').version;
elliptic.utils = require('./elliptic/utils');
elliptic.rand = require('brorand');
elliptic.hmacDRBG = require('./elliptic/hmac-drbg');
elliptic.curve = require('./elliptic/curve');
elliptic.curves = require('./elliptic/curves');

// Protocols
elliptic.ec = require('./elliptic/ec');

},{"../package.json":56,"./elliptic/curve":40,"./elliptic/curves":43,"./elliptic/ec":44,"./elliptic/hmac-drbg":47,"./elliptic/utils":48,"brorand":49}],38:[function(require,module,exports){
var assert = require('assert');
var bn = require('bn.js');
var elliptic = require('../../elliptic');

var getNAF = elliptic.utils.getNAF;
var getJSF = elliptic.utils.getJSF;

function BaseCurve(type, conf) {
  this.type = type;
  this.p = new bn(conf.p, 16);

  // Use Montgomery, when there is no fast reduction for the prime
  this.red = conf.prime ? bn.red(conf.prime) : bn.mont(this.p);

  // Useful for many curves
  this.zero = new bn(0).toRed(this.red);
  this.one = new bn(1).toRed(this.red);
  this.two = new bn(2).toRed(this.red);

  // Curve configuration, optional
  this.n = conf.n && new bn(conf.n, 16);
  this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

  // Temporary arrays
  this._wnafT1 = new Array(4);
  this._wnafT2 = new Array(4);
  this._wnafT3 = new Array(4);
  this._wnafT4 = new Array(4);
}
module.exports = BaseCurve;

BaseCurve.prototype.point = function point() {
  throw new Error('Not implemented');
};

BaseCurve.prototype.validate = function validate(point) {
  throw new Error('Not implemented');
};

BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
  var doubles = p._getDoubles();

  var naf = getNAF(k, 1);
  var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1);
  I /= 3;

  // Translate into more windowed form
  var repr = [];
  for (var j = 0; j < naf.length; j += doubles.step) {
    var nafW = 0;
    for (var k = j + doubles.step - 1; k >= j; k--)
      nafW = (nafW << 1) + naf[k];
    repr.push(nafW);
  }

  var a = this.jpoint(null, null, null);
  var b = this.jpoint(null, null, null);
  for (var i = I; i > 0; i--) {
    for (var j = 0; j < repr.length; j++) {
      var nafW = repr[j];
      if (nafW === i)
        b = b.mixedAdd(doubles.points[j]);
      else if (nafW === -i)
        b = b.mixedAdd(doubles.points[j].neg());
    }
    a = a.add(b);
  }
  return a.toP();
};

BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
  var w = 4;

  // Precompute window
  var nafPoints = p._getNAFPoints(w);
  w = nafPoints.wnd;
  var wnd = nafPoints.points;

  // Get NAF form
  var naf = getNAF(k, w);

  // Add `this`*(N+1) for every w-NAF index
  var acc = this.jpoint(null, null, null);
  for (var i = naf.length - 1; i >= 0; i--) {
    // Count zeroes
    for (var k = 0; i >= 0 && naf[i] === 0; i--)
      k++;
    if (i >= 0)
      k++;
    acc = acc.dblp(k);

    if (i < 0)
      break;
    var z = naf[i];
    assert(z !== 0);
    if (p.type === 'affine') {
      // J +- P
      if (z > 0)
        acc = acc.mixedAdd(wnd[(z - 1) >> 1]);
      else
        acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg());
    } else {
      // J +- J
      if (z > 0)
        acc = acc.add(wnd[(z - 1) >> 1]);
      else
        acc = acc.add(wnd[(-z - 1) >> 1].neg());
    }
  }
  return p.type === 'affine' ? acc.toP() : acc;
};

BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW,
                                                       points,
                                                       coeffs,
                                                       len) {
  var wndWidth = this._wnafT1;
  var wnd = this._wnafT2;
  var naf = this._wnafT3;

  // Fill all arrays
  var max = 0;
  for (var i = 0; i < len; i++) {
    var p = points[i];
    var nafPoints = p._getNAFPoints(defW);
    wndWidth[i] = nafPoints.wnd;
    wnd[i] = nafPoints.points;
  }

  // Comb small window NAFs
  for (var i = len - 1; i >= 1; i -= 2) {
    var a = i - 1;
    var b = i;
    if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
      naf[a] = getNAF(coeffs[a], wndWidth[a]);
      naf[b] = getNAF(coeffs[b], wndWidth[b]);
      max = Math.max(naf[a].length, max);
      max = Math.max(naf[b].length, max);
      continue;
    }

    var comb = [
      points[a], /* 1 */
      null, /* 3 */
      null, /* 5 */
      points[b] /* 7 */
    ];

    // Try to avoid Projective points, if possible
    if (points[a].y.cmp(points[b].y) === 0) {
      comb[1] = points[a].add(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].add(points[b].neg());
    } else {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    }

    var index = [
      -3, /* -1 -1 */
      -1, /* -1 0 */
      -5, /* -1 1 */
      -7, /* 0 -1 */
      0, /* 0 0 */
      7, /* 0 1 */
      5, /* 1 -1 */
      1, /* 1 0 */
      3  /* 1 1 */
    ];

    var jsf = getJSF(coeffs[a], coeffs[b]);
    max = Math.max(jsf[0].length, max);
    naf[a] = new Array(max);
    naf[b] = new Array(max);
    for (var j = 0; j < max; j++) {
      var ja = jsf[0][j] | 0;
      var jb = jsf[1][j] | 0;

      naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
      naf[b][j] = 0;
      wnd[a] = comb;
    }
  }

  var acc = this.jpoint(null, null, null);
  var tmp = this._wnafT4;
  for (var i = max; i >= 0; i--) {
    var k = 0;

    while (i >= 0) {
      var zero = true;
      for (var j = 0; j < len; j++) {
        tmp[j] = naf[j][i] | 0;
        if (tmp[j] !== 0)
          zero = false;
      }
      if (!zero)
        break;
      k++;
      i--;
    }
    if (i >= 0)
      k++;
    acc = acc.dblp(k);
    if (i < 0)
      break;

    for (var j = 0; j < len; j++) {
      var z = tmp[j];
      var p;
      if (z === 0)
        continue;
      else if (z > 0)
        p = wnd[j][(z - 1) >> 1];
      else if (z < 0)
        p = wnd[j][(-z - 1) >> 1].neg();

      if (p.type === 'affine')
        acc = acc.mixedAdd(p);
      else
        acc = acc.add(p);
    }
  }
  // Zeroify references
  for (var i = 0; i < len; i++)
    wnd[i] = null;
  return acc.toP();
};

BaseCurve.BasePoint = BasePoint;

function BasePoint(curve, type) {
  this.curve = curve;
  this.type = type;
  this.precomputed = null;
}

BasePoint.prototype.validate = function validate() {
  return this.curve.validate(this);
};

BasePoint.prototype.precompute = function precompute(power, _beta) {
  if (this.precomputed)
    return this;

  var precomputed = {
    doubles: null,
    naf: null,
    beta: null
  };
  precomputed.naf = this._getNAFPoints(8);
  precomputed.doubles = this._getDoubles(4, power);
  precomputed.beta = this._getBeta();
  this.precomputed = precomputed;

  return this;
};

BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
  if (this.precomputed && this.precomputed.doubles)
    return this.precomputed.doubles;

  var doubles = [ this ];
  var acc = this;
  for (var i = 0; i < power; i += step) {
    for (var j = 0; j < step; j++)
      acc = acc.dbl();
    doubles.push(acc);
  }
  return {
    step: step,
    points: doubles
  };
};

BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
  if (this.precomputed && this.precomputed.naf)
    return this.precomputed.naf;

  var res = [ this ];
  var max = (1 << wnd) - 1;
  var dbl = max === 1 ? null : this.dbl();
  for (var i = 1; i < max; i++)
    res[i] = res[i - 1].add(dbl);
  return {
    wnd: wnd,
    points: res
  };
};

BasePoint.prototype._getBeta = function _getBeta() {
  return null;
};

BasePoint.prototype.dblp = function dblp(k) {
  var r = this;
  for (var i = 0; i < k; i++)
    r = r.dbl();
  return r;
};

},{"../../elliptic":37,"assert":5,"bn.js":36}],39:[function(require,module,exports){
var assert = require('assert');
var curve = require('../curve');
var elliptic = require('../../elliptic');
var bn = require('bn.js');
var inherits = require('inherits');
var Base = curve.base;

var getNAF = elliptic.utils.getNAF;

function EdwardsCurve(conf) {
  // NOTE: Important as we are creating point in Base.call()
  this.twisted = conf.a != 1;
  this.mOneA = this.twisted && conf.a == -1;
  this.extended = this.mOneA;

  Base.call(this, 'mont', conf);

  this.a = new bn(conf.a, 16).mod(this.red.m).toRed(this.red);
  this.c = new bn(conf.c, 16).toRed(this.red);
  this.c2 = this.c.redSqr();
  this.d = new bn(conf.d, 16).toRed(this.red);
  this.dd = this.d.redAdd(this.d);

  assert(!this.twisted || this.c.fromRed().cmpn(1) === 0);
  this.oneC = conf.c == 1;
}
inherits(EdwardsCurve, Base);
module.exports = EdwardsCurve;

EdwardsCurve.prototype._mulA = function _mulA(num) {
  if (this.mOneA)
    return num.redNeg();
  else
    return this.a.redMul(num);
};

EdwardsCurve.prototype._mulC = function _mulC(num) {
  if (this.oneC)
    return num;
  else
    return this.c.redMul(num);
};

EdwardsCurve.prototype.point = function point(x, y, z, t) {
  return new Point(this, x, y, z, t);
};

// Just for compatibility with Short curve
EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
  return this.point(x, y, z, t);
};

EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point.fromJSON(this, obj);
};

EdwardsCurve.prototype.pointFromX = function pointFromX(odd, x) {
  x = new bn(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var x2 = x.redSqr();
  var rhs = this.c2.redSub(this.a.redMul(x2));
  var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

  var y = rhs.redMul(lhs.redInvm()).redSqrt();
  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y, curve.one);
};

EdwardsCurve.prototype.validate = function validate(point) {
  if (point.isInfinity())
    return true;

  // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
  point.normalize();

  var x2 = point.x.redSqr();
  var y2 = point.y.redSqr();
  var lhs = x2.redMul(this.a).redAdd(y2);
  var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

  return lhs.cmp(rhs) === 0;
};

function Point(curve, x, y, z, t) {
  Base.BasePoint.call(this, curve, 'projective');
  if (x === null && y === null && z === null) {
    this.x = this.curve.zero;
    this.y = this.curve.one;
    this.z = this.curve.one;
    this.t = this.curve.zero;
    this.zOne = true;
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    this.z = z ? new bn(z, 16) : this.curve.one;
    this.t = t && new bn(t, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
    if (this.t && !this.t.red)
      this.t = this.t.toRed(this.curve.red);
    this.zOne = this.z === this.curve.one;

    // Use extended coordinates
    if (this.curve.extended && !this.t) {
      this.t = this.x.redMul(this.y);
      if (!this.zOne)
        this.t = this.t.redMul(this.z.redInvm());
    }
  }
}
inherits(Point, Base.BasePoint);

Point.fromJSON = function fromJSON(curve, obj) {
  return new Point(curve, obj[0], obj[1], obj[2]);
};

Point.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.x.cmpn(0) === 0 &&
         this.y.cmp(this.z) === 0;
};

Point.prototype._extDbl = function _extDbl() {
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#doubling-dbl-2008-hwcd
  // 4M + 4S

  // A = X1^2
  var a = this.x.redSqr();
  // B = Y1^2
  var b = this.y.redSqr();
  // C = 2 * Z1^2
  var c = this.z.redSqr();
  c = c.redIAdd(c);
  // D = a * A
  var d = this.curve._mulA(a);
  // E = (X1 + Y1)^2 - A - B
  var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
  // G = D + B
  var g = d.redAdd(b);
  // F = G - C
  var f = g.redSub(c);
  // H = D - B
  var h = d.redSub(b);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point.prototype._projDbl = function _projDbl() {
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-projective.html#doubling-dbl-2008-bbjlp
  // http://hyperelliptic.org/EFD/g1p/auto-edwards-projective.html#doubling-dbl-2007-bl
  // and others
  // Generally 3M + 4S or 2M + 4S

  // B = (X1 + Y1)^2
  var b = this.x.redAdd(this.y).redSqr();
  // C = X1^2
  var c = this.x.redSqr();
  // D = Y1^2
  var d = this.y.redSqr();

  if (this.curve.twisted) {
    // E = a * C
    var e = this.curve._mulA(c);
    // F = E + D
    var f = e.redAdd(d);
    if (this.zOne) {
      // X3 = (B - C - D) * (F - 2)
      var nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
      // Y3 = F * (E - D)
      var ny = f.redMul(e.redSub(d));
      // Z3 = F^2 - 2 * F
      var nz = f.redSqr().redSub(f).redSub(f);
    } else {
      // H = Z1^2
      var h = this.z.redSqr();
      // J = F - 2 * H
      var j = f.redSub(h).redISub(h);
      // X3 = (B-C-D)*J
      var nx = b.redSub(c).redISub(d).redMul(j);
      // Y3 = F * (E - D)
      var ny = f.redMul(e.redSub(d));
      // Z3 = F * J
      var nz = f.redMul(j);
    }
  } else {
    // E = C + D
    var e = c.redAdd(d);
    // H = (c * Z1)^2
    var h = this.curve._mulC(redMul(this.z)).redSqr();
    // J = E - 2 * H
    var j = e.redSub(h).redSub(h);
    // X3 = c * (B - E) * J
    var nx = this.curve._mulC(b.redISub(e)).redMul(j);
    // Y3 = c * E * (C - D)
    var ny = this.curve._mulC(e).redMul(c.redISub(d));
    // Z3 = E * J
    var nz = e.redMul(j);
  }
  return this.curve.point(nx, ny, nz);
};

Point.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  // Double in extended coordinates
  if (this.curve.extended)
    return this._extDbl();
  else
    return this._projDbl();
};

Point.prototype._extAdd = function _extAdd(p) {
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-3
  // 8M

  // A = (Y1 - X1) * (Y2 - X2)
  var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
  // B = (Y1 + X1) * (Y2 + X2)
  var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
  // C = T1 * k * T2
  var c = this.t.redMul(this.curve.dd).redMul(p.t);
  // D = Z1 * 2 * Z2
  var d = this.z.redMul(p.z.redAdd(p.z));
  // E = B - A
  var e = b.redSub(a);
  // F = D - C
  var f = d.redSub(c);
  // G = D + C
  var g = d.redAdd(c);
  // H = B + A
  var h = b.redAdd(a);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point.prototype._projAdd = function _projAdd(p) {
  // http://hyperelliptic.org/EFD/g1p/auto-twisted-projective.html#addition-add-2008-bbjlp
  // http://hyperelliptic.org/EFD/g1p/auto-edwards-projective.html#addition-add-2007-bl
  // 10M + 1S

  // A = Z1 * Z2
  var a = this.z.redMul(p.z);
  // B = A^2
  var b = a.redSqr();
  // C = X1 * X2
  var c = this.x.redMul(p.x);
  // D = Y1 * Y2
  var d = this.y.redMul(p.y);
  // E = d * C * D
  var e = this.curve.d.redMul(c).redMul(d);
  // F = B - E
  var f = b.redSub(e);
  // G = B + E
  var g = b.redAdd(e);
  // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
  var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
  var nx = a.redMul(f).redMul(tmp);
  if (this.curve.twisted) {
    // Y3 = A * G * (D - a * C)
    var ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
    // Z3 = F * G
    var nz = f.redMul(g);
  } else {
    // Y3 = A * G * (D - C)
    var ny = a.redMul(g).redMul(d.redSub(c));
    // Z3 = c * F * G
    var nz = this.curve._mulC(f).redMul(g);
  }
  return this.curve.point(nx, ny, nz);
};

Point.prototype.add = function add(p) {
  if (this.isInfinity())
    return p;
  if (p.isInfinity())
    return this;

  if (this.curve.extended)
    return this._extAdd(p);
  else
    return this._projAdd(p);
};

Point.prototype.mul = function mul(k) {
  if (this.precomputed && this.precomputed.doubles)
    return this.curve._fixedNafMul(this, k);
  else
    return this.curve._wnafMul(this, k);
};

Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2);
};

Point.prototype.normalize = function normalize() {
  if (this.zOne)
    return this;

  // Normalize coordinates
  var zi = this.z.redInvm();
  this.x = this.x.redMul(zi);
  this.y = this.y.redMul(zi);
  if (this.t)
    this.t = this.t.redMul(zi);
  this.z = this.curve.one;
  this.zOne = true;
  return this;
};

Point.prototype.neg = function neg() {
  return this.curve.point(this.x.redNeg(),
                          this.y,
                          this.z,
                          this.t && this.t.redNeg());
};

Point.prototype.getX = function getX() {
  this.normalize();
  return this.x.fromRed();
};

Point.prototype.getY = function getY() {
  this.normalize();
  return this.y.fromRed();
};

// Compatibility with BaseCurve
Point.prototype.toP = Point.prototype.normalize;
Point.prototype.mixedAdd = Point.prototype.add;

},{"../../elliptic":37,"../curve":40,"assert":5,"bn.js":36,"inherits":147}],40:[function(require,module,exports){
var curve = exports;

curve.base = require('./base');
curve.short = require('./short');
curve.mont = require('./mont');
curve.edwards = require('./edwards');

},{"./base":38,"./edwards":39,"./mont":41,"./short":42}],41:[function(require,module,exports){
var assert = require('assert');
var curve = require('../curve');
var elliptic = require('../../elliptic');
var bn = require('bn.js');
var inherits = require('inherits');
var Base = curve.base;

var getNAF = elliptic.utils.getNAF;

function MontCurve(conf) {
  Base.call(this, 'mont', conf);

  this.a = new bn(conf.a, 16).toRed(this.red);
  this.b = new bn(conf.b, 16).toRed(this.red);
  this.i4 = new bn(4).toRed(this.red).redInvm();
  this.two = new bn(2).toRed(this.red);
  this.a24 = this.i4.redMul(this.a.redAdd(this.two));
}
inherits(MontCurve, Base);
module.exports = MontCurve;

MontCurve.prototype.point = function point(x, z) {
  return new Point(this, x, z);
};

MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point.fromJSON(this, obj);
}

MontCurve.prototype.validate = function validate(point) {
  var x = point.normalize().x;
  var x2 = x.redSqr();
  var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
  var y = rhs.redSqrt();

  return y.redSqr().cmp(rhs) === 0;
};

function Point(curve, x, z) {
  Base.BasePoint.call(this, curve, 'projective');
  if (x === null && z === null) {
    this.x = this.curve.one;
    this.z = this.curve.zero;
  } else {
    this.x = new bn(x, 16);
    this.z = new bn(z, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
  }
}
inherits(Point, Base.BasePoint);

Point.prototype.precompute = function precompute() {
  // No-op
};

Point.fromJSON = function fromJSON(curve, obj) {
  return new Point(curve, obj[0], obj[1] || curve.one);
};

Point.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

Point.prototype.dbl = function dbl() {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
  // 2M + 2S + 4A

  // A = X1 + Z1
  var a = this.x.redAdd(this.z);
  // AA = A^2
  var aa = a.redSqr();
  // B = X1 - Z1
  var b = this.x.redSub(this.z);
  // BB = B^2
  var bb = b.redSqr();
  // C = AA - BB
  var c = aa.redSub(bb);
  // X3 = AA * BB
  var nx = aa.redMul(bb);
  // Z3 = C * (BB + A24 * C)
  var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
  return this.curve.point(nx, nz);
};

Point.prototype.add = function add(p) {
  throw new Error('Not supported on Montgomery curve');
};

Point.prototype.diffAdd = function diffAdd(p, diff) {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
  // 4M + 2S + 6A

  // A = X2 + Z2
  var a = this.x.redAdd(this.z);
  // B = X2 - Z2
  var b = this.x.redSub(this.z);
  // C = X3 + Z3
  var c = p.x.redAdd(p.z);
  // D = X3 - Z3
  var d = p.x.redSub(p.z);
  // DA = D * A
  var da = d.redMul(a);
  // CB = C * B
  var cb = c.redMul(b);
  // X5 = Z1 * (DA + CB)^2
  var nx = diff.z.redMul(da.redAdd(cb).redSqr());
  // Z5 = X1 * (DA - CB)^2
  var nz = diff.x.redMul(da.redISub(cb).redSqr());
  return this.curve.point(nx, nz);
};

Point.prototype.mul = function mul(k) {
  var t = k.clone();
  var a = this; // (N / 2) * Q + Q
  var b = this.curve.point(null, null); // (N / 2) * Q
  var c = this; // Q

  for (var bits = []; t.cmpn(0) !== 0; t.ishrn(1))
    bits.push(t.andln(1));

  for (var i = bits.length - 1; i >= 0; i--) {
    if (bits[i] === 0) {
      // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
      a = a.diffAdd(b, c);
      // N * Q = 2 * ((N / 2) * Q + Q))
      b = b.dbl();
    } else {
      // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
      b = a.diffAdd(b, c);
      // N * Q + Q = 2 * ((N / 2) * Q + Q)
      a = a.dbl();
    }
  }
  return b;
};

Point.prototype.mulAdd = function mulAdd() {
  throw new Error('Not supported on Montgomery curve');
};

Point.prototype.normalize = function normalize() {
  this.x = this.x.redMul(this.z.redInvm());
  this.z = this.curve.one;
  return this;
};

Point.prototype.getX = function getX() {
  // Normalize coordinates
  this.normalize();

  return this.x.fromRed();
};

},{"../../elliptic":37,"../curve":40,"assert":5,"bn.js":36,"inherits":147}],42:[function(require,module,exports){
var assert = require('assert');
var curve = require('../curve');
var elliptic = require('../../elliptic');
var bn = require('bn.js');
var inherits = require('inherits');
var Base = curve.base;

var getNAF = elliptic.utils.getNAF;

function ShortCurve(conf) {
  Base.call(this, 'short', conf);

  this.a = new bn(conf.a, 16).toRed(this.red);
  this.b = new bn(conf.b, 16).toRed(this.red);
  this.tinv = this.two.redInvm();

  this.zeroA = this.a.fromRed().cmpn(0) === 0;
  this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

  // If the curve is endomorphic, precalculate beta and lambda
  this.endo = this._getEndomorphism(conf);
  this._endoWnafT1 = new Array(4);
  this._endoWnafT2 = new Array(4);
}
inherits(ShortCurve, Base);
module.exports = ShortCurve;

ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
  // No efficient endomorphism
  if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
    return;

  // Compute beta and lambda, that lambda * P = (beta * Px; Py)
  var beta;
  var lambda;
  if (conf.beta) {
    beta = new bn(conf.beta, 16).toRed(this.red);
  } else {
    var betas = this._getEndoRoots(this.p);
    // Choose the smallest beta
    beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
    beta = beta.toRed(this.red);
  }
  if (conf.lambda) {
    lambda = new bn(conf.lambda, 16);
  } else {
    // Choose the lambda that is matching selected beta
    var lambdas = this._getEndoRoots(this.n);
    if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
      lambda = lambdas[0];
    } else {
      lambda = lambdas[1];
      assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
    }
  }

  // Get basis vectors, used for balanced length-two representation
  var basis;
  if (conf.basis) {
    basis = conf.basis.map(function(vec) {
      return {
        a: new bn(vec.a, 16),
        b: new bn(vec.b, 16),
      };
    });
  } else {
    basis = this._getEndoBasis(lambda);
  }

  return {
    beta: beta,
    lambda: lambda,
    basis: basis
  };
};

ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
  // Find roots of for x^2 + x + 1 in F
  // Root = (-1 +- Sqrt(-3)) / 2
  //
  var red = num === this.p ? this.red : bn.mont(num);
  var tinv = new bn(2).toRed(red).redInvm();
  var ntinv = tinv.redNeg();
  var one = new bn(1).toRed(red);

  var s = new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);

  var l1 = ntinv.redAdd(s).fromRed();
  var l2 = ntinv.redSub(s).fromRed();
  return [ l1, l2 ];
};

ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
  // aprxSqrt >= sqrt(this.n)
  var aprxSqrt = this.n.shrn(Math.floor(this.n.bitLength() / 2));

  // 3.74
  // Run EGCD, until r(L + 1) < aprxSqrt
  var u = lambda;
  var v = this.n.clone();
  var x1 = new bn(1);
  var y1 = new bn(0);
  var x2 = new bn(0);
  var y2 = new bn(1);

  // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
  var a0;
  var b0;
  // First vector
  var a1;
  var b1;
  // Second vector
  var a2;
  var b2;

  var prevR;
  var i = 0;
  while (u.cmpn(0) !== 0) {
    var q = v.div(u);
    var r = v.sub(q.mul(u));
    var x = x2.sub(q.mul(x1));
    var y = y2.sub(q.mul(y1));

    if (!a1 && r.cmp(aprxSqrt) < 0) {
      a0 = prevR.neg();
      b0 = x1;
      a1 = r.neg();
      b1 = x;
    } else if (a1 && ++i === 2) {
      break;
    }
    prevR = r;

    v = u;
    u = r;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }
  a2 = r.neg();
  b2 = x;

  var len1 = a1.sqr().add(b1.sqr());
  var len2 = a2.sqr().add(b2.sqr());
  if (len2.cmp(len1) >= 0) {
    a2 = a0;
    b2 = b0;
  }

  // Normalize signs
  if (a1.sign) {
    a1 = a1.neg();
    b1 = b1.neg();
  }
  if (a2.sign) {
    a2 = a2.neg();
    b2 = b2.neg();
  }

  return [
    { a: a1, b: b1 },
    { a: a2, b: b2 }
  ];
};

ShortCurve.prototype._endoSplit = function _endoSplit(k) {
  var basis = this.endo.basis;
  var v1 = basis[0];
  var v2 = basis[1];

  var c1 = v2.b.mul(k).divRound(this.n);
  var c2 = v1.b.neg().mul(k).divRound(this.n);

  var p1 = c1.mul(v1.a);
  var p2 = c2.mul(v2.a);
  var q1 = c1.mul(v1.b);
  var q2 = c2.mul(v2.b);

  // Calculate answer
  var k1 = k.sub(p1).sub(p2);
  var k2 = q1.add(q2).neg();
  return { k1: k1, k2: k2 };
};

ShortCurve.prototype.point = function point(x, y, isRed) {
  return new Point(this, x, y, isRed);
};

ShortCurve.prototype.pointFromX = function pointFromX(odd, x) {
  x = new bn(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
  var y = y2.redSqrt();

  // XXX Is there any way to tell if the number is odd without converting it
  // to non-red form?
  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y);
};

ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
  return new JPoint(this, x, y, z);
};

ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
  return Point.fromJSON(this, obj, red);
};

ShortCurve.prototype.validate = function validate(point) {
  if (point.inf)
    return true;

  var x = point.x;
  var y = point.y;

  var ax = this.a.redMul(x);
  var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
  return y.redSqr().redISub(rhs).cmpn(0) === 0;
};

ShortCurve.prototype._endoWnafMulAdd = function _endoWnafMulAdd(points, coeffs) {
  var npoints = this._endoWnafT1;
  var ncoeffs = this._endoWnafT2;
  for (var i = 0; i < points.length; i++) {
    var split = this._endoSplit(coeffs[i]);
    var p = points[i];
    var beta = p._getBeta();

    if (split.k1.sign) {
      split.k1.sign = !split.k1.sign;
      p = p.neg(true);
    }
    if (split.k2.sign) {
      split.k2.sign = !split.k2.sign;
      beta = beta.neg(true);
    }

    npoints[i * 2] = p;
    npoints[i * 2 + 1] = beta;
    ncoeffs[i * 2] = split.k1;
    ncoeffs[i * 2 + 1] = split.k2;
  }
  var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2);

  // Clean-up references to points and coefficients
  for (var j = 0; j < i * 2; j++) {
    npoints[j] = null;
    ncoeffs[j] = null;
  }
  return res;
};

function Point(curve, x, y, isRed) {
  Base.BasePoint.call(this, curve, 'affine');
  if (x === null && y === null) {
    this.x = null;
    this.y = null;
    this.inf = true;
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    // Force redgomery representation when loading from JSON
    if (isRed) {
      this.x.forceRed(this.curve.red);
      this.y.forceRed(this.curve.red);
    }
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    this.inf = false;
  }
}
inherits(Point, Base.BasePoint);

Point.prototype._getBeta = function _getBeta() {
  if (!this.curve.endo)
    return;

  var pre = this.precomputed;
  if (pre && pre.beta)
    return pre.beta;

  var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
  if (pre) {
    var curve = this.curve;
    function endoMul(p) {
      return curve.point(p.x.redMul(curve.endo.beta), p.y);
    }
    pre.beta = beta;
    beta.precomputed = {
      beta: null,
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(endoMul)
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(endoMul)
      }
    };
  }
  return beta;
};

Point.prototype.toJSON = function toJSON() {
  if (!this.precomputed)
    return [ this.x, this.y ];

  return [ this.x, this.y, this.precomputed && {
    doubles: this.precomputed.doubles && {
      step: this.precomputed.doubles.step,
      points: this.precomputed.doubles.points.slice(1)
    },
    naf: this.precomputed.naf && {
      wnd: this.precomputed.naf.wnd,
      points: this.precomputed.naf.points.slice(1)
    }
  }];
};

Point.fromJSON = function fromJSON(curve, obj, red) {
  if (typeof obj === 'string')
    obj = JSON.parse(obj);
  var res = curve.point(obj[0], obj[1], red);
  if (!obj[2])
    return res;

  function obj2point(obj) {
    return curve.point(obj[0], obj[1], red);
  }

  var pre = obj[2];
  res.precomputed = {
    beta: null,
    doubles: pre.doubles && {
      step: pre.doubles.step,
      points: [ res ].concat(pre.doubles.points.map(obj2point))
    },
    naf: pre.naf && {
      wnd: pre.naf.wnd,
      points: [ res ].concat(pre.naf.points.map(obj2point))
    }
  };
  return res;
};

Point.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16 ,2) +
      ' y: ' + this.y.fromRed().toString(16, 2) + '>';
};

Point.prototype.isInfinity = function isInfinity() {
  return this.inf;
};

Point.prototype.add = function add(p) {
  // O + P = P
  if (this.inf)
    return p;

  // P + O = P
  if (p.inf)
    return this;

  // P + P = 2P
  if (this.eq(p))
    return this.dbl();

  // P + (-P) = O
  if (this.neg().eq(p))
    return this.curve.point(null, null);

  // P + Q = O
  if (this.x.cmp(p.x) === 0)
    return this.curve.point(null, null);

  var c = this.y.redSub(p.y);
  if (c.cmpn(0) !== 0)
    c = c.redMul(this.x.redSub(p.x).redInvm());
  var nx = c.redSqr().redISub(this.x).redISub(p.x);
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point.prototype.dbl = function dbl() {
  if (this.inf)
    return this;

  // 2P = O
  var ys1 = this.y.redAdd(this.y);
  if (ys1.cmpn(0) === 0)
    return this.curve.point(null, null);

  var a = this.curve.a;

  var x2 = this.x.redSqr();
  var dyinv = ys1.redInvm();
  var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

  var nx = c.redSqr().redISub(this.x.redAdd(this.x));
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point.prototype.getX = function getX() {
  return this.x.fromRed();
};

Point.prototype.getY = function getY() {
  return this.y.fromRed();
};

Point.prototype.mul = function mul(k) {
  k = new bn(k, 16);

  if (this.precomputed && this.precomputed.doubles)
    return this.curve._fixedNafMul(this, k);
  else if (this.curve.endo)
    return this.curve._endoWnafMulAdd([ this ], [ k ]);
  else
    return this.curve._wnafMul(this, k);
};

Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
  var points = [ this, p2 ];
  var coeffs = [ k1, k2 ];
  if (this.curve.endo)
    return this.curve._endoWnafMulAdd(points, coeffs);
  else
    return this.curve._wnafMulAdd(1, points, coeffs, 2);
};

Point.prototype.eq = function eq(p) {
  return this === p ||
         this.inf === p.inf &&
             (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
};

Point.prototype.neg = function neg(_precompute) {
  if (this.inf)
    return this;

  var res = this.curve.point(this.x, this.y.redNeg());
  if (_precompute && this.precomputed) {
    var pre = this.precomputed;
    function negate(p) {
      return p.neg();
    }
    res.precomputed = {
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(negate)
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(negate)
      }
    };
  }
  return res;
};

Point.prototype.toJ = function toJ() {
  if (this.inf)
    return this.curve.jpoint(null, null, null);

  var res = this.curve.jpoint(this.x, this.y, this.curve.one);
  return res;
};

function JPoint(curve, x, y, z) {
  Base.BasePoint.call(this, curve, 'jacobian');
  if (x === null && y === null && z === null) {
    this.x = this.curve.one;
    this.y = this.curve.one;
    this.z = new bn(0);
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    this.z = new bn(z, 16);
  }
  if (!this.x.red)
    this.x = this.x.toRed(this.curve.red);
  if (!this.y.red)
    this.y = this.y.toRed(this.curve.red);
  if (!this.z.red)
    this.z = this.z.toRed(this.curve.red);

  this.zOne = this.z === this.curve.one;
}
inherits(JPoint, Base.BasePoint);

JPoint.prototype.toP = function toP() {
  if (this.isInfinity())
    return this.curve.point(null, null);

  var zinv = this.z.redInvm();
  var zinv2 = zinv.redSqr();
  var ax = this.x.redMul(zinv2);
  var ay = this.y.redMul(zinv2).redMul(zinv);

  return this.curve.point(ax, ay);
};

JPoint.prototype.neg = function neg() {
  return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
};

JPoint.prototype.add = function add(p) {
  // O + P = P
  if (this.isInfinity())
    return p;

  // P + O = P
  if (p.isInfinity())
    return this;

  // 12M + 4S + 7A
  var pz2 = p.z.redSqr();
  var z2 = this.z.redSqr();
  var u1 = this.x.redMul(pz2);
  var u2 = p.x.redMul(z2);
  var s1 = this.y.redMul(pz2.redMul(p.z));
  var s2 = p.y.redMul(z2.redMul(this.z));

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(p.z).redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mixedAdd = function mixedAdd(p) {
  // O + P = P
  if (this.isInfinity())
    return p.toJ();

  // P + O = P
  if (p.isInfinity())
    return this;

  // 8M + 3S + 7A
  var z2 = this.z.redSqr();
  var u1 = this.x;
  var u2 = p.x.redMul(z2);
  var s1 = this.y;
  var s2 = p.y.redMul(z2).redMul(this.z);

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.dblp = function dblp(pow) {
  if (pow === 0)
    return this;
  if (this.isInfinity())
    return this;
  if (!pow)
    return this.dbl();

  if (this.curve.zeroA || this.curve.threeA) {
    var r = this;
    for (var i = 0; i < pow; i++)
      r = r.dbl();
    return r;
  }

  // 1M + 2S + 1A + N * (4S + 5M + 8A)
  // N = 1 => 6M + 6S + 9A
  var a = this.curve.a;
  var tinv = this.curve.tinv;

  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  // Reuse results
  var jyd = jy.redAdd(jy);
  for (var i = 0; i < pow; i++) {
    var jx2 = jx.redSqr();
    var jyd2 = jyd.redSqr();
    var jyd4 = jyd2.redSqr();
    var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

    var t1 = jx.redMul(jyd2);
    var nx = c.redSqr().redISub(t1.redAdd(t1));
    var t2 = t1.redISub(nx);
    var dny = c.redMul(t2);
    dny = dny.redIAdd(dny).redISub(jyd4);
    var nz = jyd.redMul(jz);
    if (i + 1 < pow)
      jz4 = jz4.redMul(jyd4);

    jx = nx;
    jz = nz;
    jyd = dny;
  }

  return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
};

JPoint.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  if (this.curve.zeroA)
    return this._zeroDbl();
  else if (this.curve.threeA)
    return this._threeDbl();
  else
    return this._dbl();
};

JPoint.prototype._zeroDbl = function _zeroDbl() {
  // Z = 1
  if (this.zOne) {
    // http://hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#doubling-mdbl-2007-bl
    // 1M + 5S + 14A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a; a = 0
    var m = xx.redAdd(xx).redIAdd(xx);
    // T = M ^ 2 - 2*S
    var t = m.redSqr().redISub(s).redISub(s);

    // 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);

    // X3 = T
    var nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    var ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2*Y1
    var nz = this.y.redAdd(this.y);
  } else {
    // http://hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#doubling-dbl-2009-l
    // 2M + 5S + 13A

    // A = X1^2
    var a = this.x.redSqr();
    // B = Y1^2
    var b = this.y.redSqr();
    // C = B^2
    var c = b.redSqr();
    // D = 2 * ((X1 + B)^2 - A - C)
    var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
    d = d.redIAdd(d);
    // E = 3 * A
    var e = a.redAdd(a).redIAdd(a);
    // F = E^2
    var f = e.redSqr();

    // 8 * C
    var c8 = c.redIAdd(c);
    c8 = c8.redIAdd(c8);
    c8 = c8.redIAdd(c8);

    // X3 = F - 2 * D
    var nx = f.redISub(d).redISub(d);
    // Y3 = E * (D - X3) - 8 * C
    var ny = e.redMul(d.redISub(nx)).redISub(c8);
    // Z3 = 2 * Y1 * Z1
    var nz = this.y.redMul(this.z);
    nz = nz.redIAdd(nz);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._threeDbl = function _threeDbl() {
  // Z = 1
  if (this.zOne) {
    // http://hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-mdbl-2007-bl
    // 1M + 5S + 15A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a
    var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
    // T = M^2 - 2 * S
    var t = m.redSqr().redISub(s).redISub(s);
    // X3 = T
    var nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    var ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2 * Y1
    var nz = this.y.redAdd(this.y);
  } else {
    // http://hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
    // 3M + 5S

    // delta = Z1^2
    var delta = this.z.redSqr();
    // gamma = Y1^2
    var gamma = this.y.redSqr();
    // beta = X1 * gamma
    var beta = this.x.redMul(gamma);
    // alpha = 3 * (X1 - delta) * (X1 + delta)
    var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
    alpha = alpha.redAdd(alpha).redIAdd(alpha);
    // X3 = alpha^2 - 8 * beta
    var beta4 = beta.redIAdd(beta);
    beta4 = beta4.redIAdd(beta4);
    var beta8 = beta4.redAdd(beta4);
    var nx = alpha.redSqr().redISub(beta8);
    // Z3 = (Y1 + Z1)^2 - gamma - delta
    var nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
    // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
    var ggamma8 = gamma.redSqr();
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    var ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._dbl = function _dbl() {
  var a = this.curve.a;
  var tinv = this.curve.tinv;

  // 4M + 6S + 10A
  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  var jx2 = jx.redSqr();
  var jy2 = jy.redSqr();

  var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

  var jxd4 = jx.redAdd(jx);
  jxd4 = jxd4.redIAdd(jxd4);
  var t1 = jxd4.redMul(jy2);
  var nx = c.redSqr().redISub(t1.redAdd(t1));
  var t2 = t1.redISub(nx);

  var jyd8 = jy2.redSqr();
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  var ny = c.redMul(t2).redISub(jyd8);
  var nz = jy.redAdd(jy).redMul(jz);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.trpl = function trpl() {
  if (!this.curve.zeroA)
    return this.dbl().add(this);

  // http://hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
  // 5M + 10S + ...

  // XX = X1^2
  var xx = this.x.redSqr();
  // YY = Y1^2
  var yy = this.y.redSqr();
  // ZZ = Z1^2
  var zz = this.z.redSqr();
  // YYYY = YY^2
  var yyyy = yy.redSqr();
  // M = 3 * XX + a * ZZ2; a = 0
  var m = xx.redAdd(xx).redIAdd(xx);
  // MM = M^2
  var mm = m.redSqr();
  // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
  var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
  e = e.redIAdd(e);
  e = e.redAdd(e).redIAdd(e);
  e = e.redISub(mm);
  // EE = E^2
  var ee = e.redSqr();
  // T = 16*YYYY
  var t = yyyy.redIAdd(yyyy);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  // U = (M + E)^2 - MM - EE - T
  var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
  // X3 = 4 * (X1 * EE - 4 * YY * U)
  var yyu4 = yy.redMul(u);
  yyu4 = yyu4.redIAdd(yyu4);
  yyu4 = yyu4.redIAdd(yyu4);
  var nx = this.x.redMul(ee).redISub(yyu4);
  nx = nx.redIAdd(nx);
  nx = nx.redIAdd(nx);
  // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
  var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  // Z3 = (Z1 + E)^2 - ZZ - EE
  var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mul = function mul(k, kbase) {
  k = new bn(k, kbase);

  return this.curve._wnafMul(this, k);
};

JPoint.prototype.eq = function eq(p) {
  if (p.type === 'affine')
    return this.eq(p.toJ());

  if (this === p)
    return true;

  // x1 * z2^2 == x2 * z1^2
  var z2 = this.z.redSqr();
  var pz2 = p.z.redSqr();
  if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
    return false;

  // y1 * z2^3 == y2 * z1^3
  var z3 = z2.redMul(this.z);
  var pz3 = pz2.redMul(p.z);
  return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
};

JPoint.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC JPoint Infinity>';
  return '<EC JPoint x: ' + this.x.toString(16, 2) +
      ' y: ' + this.y.toString(16, 2) +
      ' z: ' + this.z.toString(16, 2) + '>';
};

JPoint.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

},{"../../elliptic":37,"../curve":40,"assert":5,"bn.js":36,"inherits":147}],43:[function(require,module,exports){
var curves = exports;

var assert = require('assert');
var hash = require('hash.js');
var bn = require('bn.js');
var elliptic = require('../elliptic');

function PresetCurve(options) {
  if (options.type === 'short')
    this.curve = new elliptic.curve.short(options);
  else if (options.type === 'edwards')
    this.curve = new elliptic.curve.edwards(options);
  else
    this.curve = new elliptic.curve.mont(options);
  this.g = this.curve.g;
  this.n = this.curve.n;
  this.hash = options.hash;

  assert(this.g.validate(), 'Invalid curve');
  assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
}
curves.PresetCurve = PresetCurve;

function defineCurve(name, options) {
  Object.defineProperty(curves, name, {
    configurable: true,
    enumerable: true,
    get: function() {
      var curve = new PresetCurve(options);
      Object.defineProperty(curves, name, {
        configurable: true,
        enumerable: true,
        value: curve
      });
      return curve;
    }
  });
}

defineCurve('p192', {
  type: 'short',
  prime: 'p192',
  p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
  b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
  n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
  hash: hash.sha256,
  gRed: false,
  g: [
    '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
    '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811'
  ],
});

defineCurve('p224', {
  type: 'short',
  prime: 'p224',
  p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
  b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
  n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
  hash: hash.sha256,
  gRed: false,
  g: [
    'b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21',
    'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34'
  ],
});

defineCurve('p256', {
  type: 'short',
  prime: null,
  p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
  a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
  b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
  n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
  hash: hash.sha256,
  gRed: false,
  g: [
    '6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296',
    '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5'
  ],
});

defineCurve('curve25519', {
  type: 'mont',
  prime: 'p25519',
  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
  a: '76d06',
  b: '0',
  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
  hash: hash.sha256,
  gRed: false,
  g: [
    '9'
  ]
});

defineCurve('ed25519', {
  type: 'edwards',
  prime: 'p25519',
  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
  a: '-1',
  c: '1',
  // -121665 * (121666^(-1)) (mod P)
  d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
  hash: hash.sha256,
  gRed: false,
  g: [
    '216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

    // 4/5
    '6666666666666666666666666666666666666666666666666666666666666658'
  ]
});

defineCurve('secp256k1', {
  type: 'short',
  prime: 'k256',
  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
  a: '0',
  b: '7',
  n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
  h: '1',
  hash: hash.sha256,

  // Precomputed endomorphism
  beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
  lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
  basis: [
    {
      a: '3086d221a7d46bcde86c90e49284eb15',
      b: '-e4437ed6010e88286f547fa90abfe4c3'
    },
    {
      a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
      b: '3086d221a7d46bcde86c90e49284eb15'
    }
  ],

  gRed: false,
  g: [
    '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
    {
      'doubles': {
        'step': 4,
        'points': [
          [
            'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a',
            'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'
          ],
          [
            '8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508',
            '11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf'
          ],
          [
            '175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739',
            'd3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695'
          ],
          [
            '363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640',
            '4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9'
          ],
          [
            '8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c',
            '4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36'
          ],
          [
            '723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda',
            '96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f'
          ],
          [
            'eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa',
            '5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999'
          ],
          [
            '100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0',
            'cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09'
          ],
          [
            'e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d',
            '9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d'
          ],
          [
            'feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d',
            'e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088'
          ],
          [
            'da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1',
            '9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d'
          ],
          [
            '53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0',
            '5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8'
          ],
          [
            '8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047',
            '10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a'
          ],
          [
            '385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862',
            '283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453'
          ],
          [
            '6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7',
            '7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160'
          ],
          [
            '3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd',
            '56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0'
          ],
          [
            '85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83',
            '7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6'
          ],
          [
            '948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a',
            '53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589'
          ],
          [
            '6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8',
            'bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17'
          ],
          [
            'e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d',
            '4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda'
          ],
          [
            'e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725',
            '7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd'
          ],
          [
            '213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754',
            '4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2'
          ],
          [
            '4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c',
            '17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6'
          ],
          [
            'fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6',
            '6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f'
          ],
          [
            '76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39',
            'c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01'
          ],
          [
            'c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891',
            '893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3'
          ],
          [
            'd895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b',
            'febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f'
          ],
          [
            'b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03',
            '2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7'
          ],
          [
            'e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d',
            'eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78'
          ],
          [
            'a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070',
            '7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1'
          ],
          [
            '90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4',
            'e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150'
          ],
          [
            '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da',
            '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'
          ],
          [
            'e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11',
            '1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc'
          ],
          [
            '8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e',
            'efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b'
          ],
          [
            'e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41',
            '2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51'
          ],
          [
            'b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef',
            '67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45'
          ],
          [
            'd68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8',
            'db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120'
          ],
          [
            '324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d',
            '648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84'
          ],
          [
            '4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96',
            '35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d'
          ],
          [
            '9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd',
            'ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d'
          ],
          [
            '6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5',
            '9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8'
          ],
          [
            'a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266',
            '40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8'
          ],
          [
            '7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71',
            '34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac'
          ],
          [
            '928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac',
            'c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f'
          ],
          [
            '85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751',
            '1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962'
          ],
          [
            'ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e',
            '493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907'
          ],
          [
            '827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241',
            'c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec'
          ],
          [
            'eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3',
            'be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d'
          ],
          [
            'e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f',
            '4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414'
          ],
          [
            '1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19',
            'aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd'
          ],
          [
            '146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be',
            'b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0'
          ],
          [
            'fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9',
            '6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811'
          ],
          [
            'da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2',
            '8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1'
          ],
          [
            'a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13',
            '7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c'
          ],
          [
            '174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c',
            'ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73'
          ],
          [
            '959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba',
            '2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd'
          ],
          [
            'd2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151',
            'e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405'
          ],
          [
            '64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073',
            'd99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589'
          ],
          [
            '8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458',
            '38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e'
          ],
          [
            '13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b',
            '69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27'
          ],
          [
            'bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366',
            'd3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1'
          ],
          [
            '8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa',
            '40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482'
          ],
          [
            '8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0',
            '620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945'
          ],
          [
            'dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787',
            '7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573'
          ],
          [
            'f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e',
            'ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82'
          ]
        ]
      },
      'naf': {
        'wnd': 7,
        'points': [
          [
            'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
            '388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672'
          ],
          [
            '2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
            'd8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6'
          ],
          [
            '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc',
            '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'
          ],
          [
            'acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe',
            'cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37'
          ],
          [
            '774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
            'd984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b'
          ],
          [
            'f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8',
            'ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81'
          ],
          [
            'd7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e',
            '581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58'
          ],
          [
            'defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34',
            '4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77'
          ],
          [
            '2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c',
            '85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a'
          ],
          [
            '352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5',
            '321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c'
          ],
          [
            '2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f',
            '2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67'
          ],
          [
            '9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714',
            '73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402'
          ],
          [
            'daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729',
            'a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55'
          ],
          [
            'c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db',
            '2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482'
          ],
          [
            '6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4',
            'e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82'
          ],
          [
            '1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5',
            'b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396'
          ],
          [
            '605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479',
            '2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49'
          ],
          [
            '62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d',
            '80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf'
          ],
          [
            '80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f',
            '1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a'
          ],
          [
            '7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb',
            'd0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7'
          ],
          [
            'd528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9',
            'eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933'
          ],
          [
            '49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963',
            '758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a'
          ],
          [
            '77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74',
            '958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6'
          ],
          [
            'f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530',
            'e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37'
          ],
          [
            '463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b',
            '5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e'
          ],
          [
            'f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247',
            'cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6'
          ],
          [
            'caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1',
            'cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476'
          ],
          [
            '2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120',
            '4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40'
          ],
          [
            '7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435',
            '91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61'
          ],
          [
            '754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18',
            '673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683'
          ],
          [
            'e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8',
            '59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5'
          ],
          [
            '186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb',
            '3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b'
          ],
          [
            'df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f',
            '55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417'
          ],
          [
            '5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143',
            'efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868'
          ],
          [
            '290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
            'e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a'
          ],
          [
            'af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45',
            'f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6'
          ],
          [
            '766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a',
            '744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996'
          ],
          [
            '59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e',
            'c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e'
          ],
          [
            'f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8',
            'e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d'
          ],
          [
            '7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c',
            '30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2'
          ],
          [
            '948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519',
            'e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e'
          ],
          [
            '7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab',
            '100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437'
          ],
          [
            '3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca',
            'ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311'
          ],
          [
            'd3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf',
            '8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4'
          ],
          [
            '1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610',
            '68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575'
          ],
          [
            '733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4',
            'f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d'
          ],
          [
            '15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c',
            'd56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d'
          ],
          [
            'a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940',
            'edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629'
          ],
          [
            'e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980',
            'a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06'
          ],
          [
            '311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3',
            '66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374'
          ],
          [
            '34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf',
            '9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee'
          ],
          [
            'f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63',
            '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1'
          ],
          [
            'd7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448',
            'fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b'
          ],
          [
            '32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf',
            '5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661'
          ],
          [
            '7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5',
            '8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6'
          ],
          [
            'ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6',
            '8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e'
          ],
          [
            '16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5',
            '5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d'
          ],
          [
            'eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99',
            'f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc'
          ],
          [
            '78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51',
            'f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4'
          ],
          [
            '494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5',
            '42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c'
          ],
          [
            'a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5',
            '204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b'
          ],
          [
            'c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997',
            '4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913'
          ],
          [
            '841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881',
            '73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154'
          ],
          [
            '5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5',
            '39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865'
          ],
          [
            '36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66',
            'd2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc'
          ],
          [
            '336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726',
            'ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224'
          ],
          [
            '8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede',
            '6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e'
          ],
          [
            '1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94',
            '60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6'
          ],
          [
            '85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31',
            '3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511'
          ],
          [
            '29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51',
            'b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b'
          ],
          [
            'a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252',
            'ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2'
          ],
          [
            '4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5',
            'cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c'
          ],
          [
            'd24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b',
            '6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3'
          ],
          [
            'ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4',
            '322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d'
          ],
          [
            'af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f',
            '6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700'
          ],
          [
            'e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889',
            '2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4'
          ],
          [
            '591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246',
            'b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196'
          ],
          [
            '11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984',
            '998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4'
          ],
          [
            '3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a',
            'b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257'
          ],
          [
            'cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030',
            'bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13'
          ],
          [
            'c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197',
            '6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096'
          ],
          [
            'c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593',
            'c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38'
          ],
          [
            'a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef',
            '21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f'
          ],
          [
            '347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38',
            '60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448'
          ],
          [
            'da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a',
            '49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a'
          ],
          [
            'c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111',
            '5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4'
          ],
          [
            '4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502',
            '7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437'
          ],
          [
            '3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea',
            'be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7'
          ],
          [
            'cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26',
            '8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d'
          ],
          [
            'b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986',
            '39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a'
          ],
          [
            'd4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e',
            '62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54'
          ],
          [
            '48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4',
            '25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77'
          ],
          [
            'dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda',
            'ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517'
          ],
          [
            '6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859',
            'cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10'
          ],
          [
            'e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f',
            'f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125'
          ],
          [
            'eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c',
            '6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e'
          ],
          [
            '13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942',
            'fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1'
          ],
          [
            'ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a',
            '1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2'
          ],
          [
            'b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80',
            '5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423'
          ],
          [
            'ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d',
            '438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8'
          ],
          [
            '8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1',
            'cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758'
          ],
          [
            '52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63',
            'c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375'
          ],
          [
            'e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352',
            '6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d'
          ],
          [
            '7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193',
            'ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec'
          ],
          [
            '5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00',
            '9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0'
          ],
          [
            '32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58',
            'ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c'
          ],
          [
            'e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7',
            'd3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4'
          ],
          [
            '8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8',
            'c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f'
          ],
          [
            '4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e',
            '67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649'
          ],
          [
            '3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d',
            'cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826'
          ],
          [
            '674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b',
            '299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5'
          ],
          [
            'd32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f',
            'f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87'
          ],
          [
            '30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6',
            '462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b'
          ],
          [
            'be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297',
            '62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc'
          ],
          [
            '93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a',
            '7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c'
          ],
          [
            'b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c',
            'ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f'
          ],
          [
            'd5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52',
            '4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a'
          ],
          [
            'd3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb',
            'bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46'
          ],
          [
            '463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065',
            'bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f'
          ],
          [
            '7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917',
            '603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03'
          ],
          [
            '74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9',
            'cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08'
          ],
          [
            '30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3',
            '553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8'
          ],
          [
            '9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57',
            '712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373'
          ],
          [
            '176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66',
            'ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3'
          ],
          [
            '75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8',
            '9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8'
          ],
          [
            '809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721',
            '9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1'
          ],
          [
            '1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180',
            '4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9'
          ]
        ]
      }
    }
  ]
});

},{"../elliptic":37,"assert":5,"bn.js":36,"hash.js":50}],44:[function(require,module,exports){
var assert = require('assert');
var bn = require('bn.js');
var elliptic = require('../../elliptic');
var utils = elliptic.utils;

var KeyPair = require('./key');
var Signature = require('./signature');

function EC(options) {
  if (!(this instanceof EC))
    return new EC(options);

  // Shortcut `elliptic.ec(curve-name)`
  if (typeof options === 'string') {
    assert(elliptic.curves.hasOwnProperty(options), 'Unknown curve ' + options);

    options = elliptic.curves[options];
  }

  // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
  if (options instanceof elliptic.curves.PresetCurve)
    options = { curve: options };

  this.curve = options.curve.curve;
  this.n = this.curve.n;
  this.nh = this.n.shrn(1);
  this.g = this.curve.g;

  // Point on curve
  this.g = options.curve.g;
  this.g.precompute(options.curve.n.bitLength() + 1);

  // Hash for function for DRBG
  this.hash = options.hash || options.curve.hash;
}
module.exports = EC;

EC.prototype.keyPair = function keyPair(priv, pub) {
  return new KeyPair(this, priv, pub);
};

EC.prototype.genKeyPair = function genKeyPair(options) {
  if (!options)
    options = {};

  // Instantiate Hmac_DRBG
  var drbg = new elliptic.hmacDRBG({
    hash: this.hash,
    pers: options.pers,
    entropy: options.entropy || elliptic.rand(this.hash.hmacStrength),
    nonce: this.n.toArray()
  });

  var bytes = this.n.byteLength();
  var ns2 = this.n.sub(new bn(2));
  do {
    var priv = new bn(drbg.generate(bytes));
    if (priv.cmp(ns2) > 0)
      continue;

    priv.iaddn(1);
    return this.keyPair(priv);
  } while (true);
};

EC.prototype._truncateToN = function truncateToN(msg, truncOnly) {
  var delta = msg.byteLength() * 8 - this.n.bitLength();
  if (delta > 0)
    msg = msg.shrn(delta);
  if (!truncOnly && msg.cmp(this.n) >= 0)
    return msg.sub(this.n);
  else
    return msg;
};

EC.prototype.sign = function sign(msg, key, options) {
  key = this.keyPair(key, 'hex');
  msg = this._truncateToN(new bn(msg, 16));
  if (!options)
    options = {};

  // Zero-extend key to provide enough entropy
  var bytes = this.n.byteLength();
  var bkey = key.getPrivate().toArray();
  for (var i = bkey.length; i < 21; i++)
    bkey.unshift(0);

  // Zero-extend nonce to have the same byte size as N
  var nonce = msg.toArray();
  for (var i = nonce.length; i < bytes; i++)
    nonce.unshift(0);

  // Instantiate Hmac_DRBG
  var drbg = new elliptic.hmacDRBG({
    hash: this.hash,
    entropy: bkey,
    nonce: nonce
  });

  // Number of bytes to generate
  var ns1 = this.n.sub(new bn(1));
  do {
    var k = new bn(drbg.generate(this.n.byteLength()));
    k = this._truncateToN(k, true);
    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
      continue;

    var kp = this.g.mul(k);
    if (kp.isInfinity())
      continue;

    var r = kp.getX().mod(this.n);
    if (r.cmpn(0) === 0)
      continue;

    var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg)).mod(this.n);
    if (s.cmpn(0) === 0)
      continue;

    // Use complement of `s`, if it is > `n / 2`
    if (options.canonical && s.cmp(this.nh) > 0)
      s = this.n.sub(s);

    return new Signature(r, s);
  } while (true);
};

EC.prototype.verify = function verify(msg, signature, key) {
  msg = this._truncateToN(new bn(msg, 16));
  key = this.keyPair(key, 'hex');
  signature = new Signature(signature, 'hex');

  // Perform primitive values validation
  var r = signature.r;
  var s = signature.s;
  if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
    return false;
  if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
    return false;

  // Validate signature
  var sinv = s.invm(this.n);
  var u1 = sinv.mul(msg).mod(this.n);
  var u2 = sinv.mul(r).mod(this.n);

  var p = this.g.mulAdd(u1, key.getPublic(), u2);
  if (p.isInfinity())
    return false;

  return p.getX().mod(this.n).cmp(r) === 0;
};

},{"../../elliptic":37,"./key":45,"./signature":46,"assert":5,"bn.js":36}],45:[function(require,module,exports){
var assert = require('assert');
var bn = require('bn.js');

var elliptic = require('../../elliptic');
var utils = elliptic.utils;

function KeyPair(ec, priv, pub) {
  if (priv instanceof KeyPair)
    return priv;
  if (pub instanceof KeyPair)
    return pub;

  if (!priv) {
    priv = pub;
    pub = null;
  }
  if (priv !== null && typeof priv === 'object') {
    if (priv.x) {
      // KeyPair(public)
      pub = priv;
      priv = null;
    } else if (priv.priv || priv.pub) {
      // KeyPair({ priv: ..., pub: ... })
      pub = priv.pub;
      priv = priv.priv;
    }
  }

  this.ec = ec;
  this.priv = null;
  this.pub = null;

  // KeyPair(public, 'hex')
  if (this._importPublicHex(priv, pub))
    return;

  if (pub === 'hex')
    pub = null;

  // KeyPair(priv, pub)
  if (priv)
    this._importPrivate(priv);
  if (pub)
    this._importPublic(pub);
}
module.exports = KeyPair;

KeyPair.prototype.validate = function validate() {
  var pub = this.getPublic();

  if (pub.isInfinity())
    return { result: false, reason: 'Invalid public key' };
  if (!pub.validate())
    return { result: false, reason: 'Public key is not a point' };
  if (!pub.mul(this.ec.curve.n).isInfinity())
    return { result: false, reason: 'Public key * N != O' };

  return { result: true, reason: null };
};

KeyPair.prototype.getPublic = function getPublic(compact, enc) {
  if (!this.pub)
    this.pub = this.ec.g.mul(this.priv);

  // compact is optional argument
  if (typeof compact === 'string') {
    enc = compact;
    compact = null;
  }

  if (!enc)
    return this.pub;

  var len = this.ec.curve.p.byteLength();
  var x = this.pub.getX().toArray();

  for (var i = x.length; i < len; i++)
    x.unshift(0);

  if (compact) {
    var res = [ this.pub.getY().isEven() ? 0x02 : 0x03 ].concat(x);
  } else {
    var y = this.pub.getY().toArray();
    for (var i = y.length; i < len; i++)
      y.unshift(0);
    var res = [ 0x04 ].concat(x, y);
  }
  return utils.encode(res, enc);
};

KeyPair.prototype.getPrivate = function getPrivate(enc) {
  if (enc === 'hex')
    return this.priv.toString(16, 2);
  else
    return this.priv;
};

KeyPair.prototype._importPrivate = function _importPrivate(key) {
  this.priv = new bn(key, 16);

  // Ensure that the priv won't be bigger than n, otherwise we may fail
  // in fixed multiplication method
  this.priv = this.priv.mod(this.ec.curve.n);
};

KeyPair.prototype._importPublic = function _importPublic(key) {
  this.pub = this.ec.curve.point(key.x, key.y);
};

KeyPair.prototype._importPublicHex = function _importPublic(key, enc) {
  key = utils.toArray(key, enc);
  var len = this.ec.curve.p.byteLength();
  if (key[0] === 0x04 && key.length - 1 === 2 * len) {
    this.pub = this.ec.curve.point(
      key.slice(1, 1 + len),
      key.slice(1 + len, 1 + 2 * len));
  } else if ((key[0] === 0x02 || key[0] === 0x03) && key.length - 1 === len) {
    this.pub = this.ec.curve.pointFromX(key[0] === 0x03,
                                        key.slice(1, 1 +len));
  } else {
    return false;
  }

  return true;
};

// ECDH
KeyPair.prototype.derive = function derive(pub) {
  return pub.mul(this.priv).getX();
};

// ECDSA
KeyPair.prototype.sign = function sign(msg) {
  return this.ec.sign(msg, this);
};

KeyPair.prototype.verify = function verify(msg, signature) {
  return this.ec.verify(msg, signature, this);
};

KeyPair.prototype.inspect = function inspect() {
  return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) +
         ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
};

},{"../../elliptic":37,"assert":5,"bn.js":36}],46:[function(require,module,exports){
var assert = require('assert');
var bn = require('bn.js');

var elliptic = require('../../elliptic');
var utils = elliptic.utils;

function Signature(r, s) {
  if (r instanceof Signature)
    return r;

  if (this._importDER(r, s))
    return;

  assert(r && s, 'Signature without r or s');
  this.r = new bn(r, 16);
  this.s = new bn(s, 16);
}
module.exports = Signature;

Signature.prototype._importDER = function _importDER(data, enc) {
  data = utils.toArray(data, enc);
  if (data.length < 6 || data[0] !== 0x30 || data[2] !== 0x02)
    return false;
  var total = data[1];
  if (1 + total > data.length)
    return false;
  var rlen = data[3];
  // Short length notation
  if (rlen >= 0x80)
    return false;
  if (4 + rlen + 2 >= data.length)
    return false;
  if (data[4 + rlen] !== 0x02)
    return false;
  var slen = data[5 + rlen];
  // Short length notation
  if (slen >= 0x80)
    return false;
  if (4 + rlen + 2 + slen > data.length)
    return false;

  this.r = new bn(data.slice(4, 4 + rlen));
  this.s = new bn(data.slice(4 + rlen + 2, 4 + rlen + 2 + slen));

  return true;
};

Signature.prototype.toDER = function toDER(enc) {
  var r = this.r.toArray();
  var s = this.s.toArray();

  // Pad values
  if (r[0] & 0x80)
    r = [ 0 ].concat(r);
  // Pad values
  if (s[0] & 0x80)
    s = [ 0 ].concat(s);

  var total = r.length + s.length + 4;
  var res = [ 0x30, total, 0x02, r.length ];
  res = res.concat(r, [ 0x02, s.length ], s);
  return utils.encode(res, enc);
};

},{"../../elliptic":37,"assert":5,"bn.js":36}],47:[function(require,module,exports){
var assert = require('assert');

var hash = require('hash.js');
var elliptic = require('../elliptic');
var utils = elliptic.utils;

function HmacDRBG(options) {
  if (!(this instanceof HmacDRBG))
    return new HmacDRBG(options);
  this.hash = options.hash;
  this.predResist = !!options.predResist;

  this.outLen = this.hash.outSize;
  this.minEntropy = options.minEntropy || this.hash.hmacStrength;

  this.reseed = null;
  this.reseedInterval = null;
  this.K = null;
  this.V = null;

  var entropy = utils.toArray(options.entropy, options.entropyEnc);
  var nonce = utils.toArray(options.nonce, options.nonceEnc);
  var pers = utils.toArray(options.pers, options.persEnc);
  assert(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
  this._init(entropy, nonce, pers);
}
module.exports = HmacDRBG;

HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
  var seed = entropy.concat(nonce).concat(pers);

  this.K = new Array(this.outLen / 8);
  this.V = new Array(this.outLen / 8);
  for (var i = 0; i < this.V.length; i++) {
    this.K[i] = 0x00;
    this.V[i] = 0x01;
  }

  this._update(seed);
  this.reseed = 1;
  this.reseedInterval = 0x1000000000000;  // 2^48
};

HmacDRBG.prototype._hmac = function hmac() {
  return new hash.hmac(this.hash, this.K);
};

HmacDRBG.prototype._update = function update(seed) {
  var kmac = this._hmac()
                 .update(this.V)
                 .update([ 0x00 ]);
  if (seed)
    kmac = kmac.update(seed);
  this.K = kmac.digest();
  this.V = this._hmac().update(this.V).digest();
  if (!seed)
    return;

  this.K = this._hmac()
               .update(this.V)
               .update([ 0x01 ])
               .update(seed)
               .digest();
  this.V = this._hmac().update(this.V).digest();
};

HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
  // Optional entropy enc
  if (typeof entropyEnc !== 'string') {
    addEnc = add;
    add = entropyEnc;
    entropyEnc = null;
  }

  entropy = utils.toBuffer(entropy, entropyEnc);
  add = utils.toBuffer(add, addEnc);

  assert(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

  this._update(entropy.concat(add || []));
  this.reseed = 1;
};

HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
  if (this.reseed > this.reseedInterval)
    throw new Error('Reseed is required');

  // Optional encoding
  if (typeof enc !== 'string') {
    addEnc = add;
    add = enc;
    enc = null;
  }

  // Optional additional data
  if (add) {
    add = utils.toArray(add, addEnc);
    this._update(add);
  }

  var temp = [];
  while (temp.length < len) {
    this.V = this._hmac().update(this.V).digest();
    temp = temp.concat(this.V);
  }

  var res = temp.slice(0, len);
  this._update(add);
  this.reseed++;
  return utils.encode(res, enc);
};

},{"../elliptic":37,"assert":5,"hash.js":50}],48:[function(require,module,exports){
var assert = require('assert');
var bn = require('bn.js');

var utils = exports;

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg === 'string') {
    if (!enc) {
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        var hi = c >> 8;
        var lo = c & 0xff;
        if (hi)
          res.push(hi, lo);
        else
          res.push(lo);
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0)
        msg = '0' + msg;
      for (var i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
  } else {
    for (var i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
  }
  return res;
}
utils.toArray = toArray;

function toHex(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
utils.toHex = toHex;

utils.encode = function encode(arr, enc) {
  if (enc === 'hex')
    return toHex(arr);
  else
    return arr;
};

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
utils.zero2 = zero2;

// Represent num in a w-NAF form
function getNAF(num, w) {
  var naf = [];
  var ws = 1 << (w + 1);
  var k = num.clone();
  while (k.cmpn(1) >= 0) {
    var z;
    if (k.isOdd()) {
      var mod = k.andln(ws - 1);
      if (mod > (ws >> 1) - 1)
        z = (ws >> 1) - mod;
      else
        z = mod;
      k.isubn(z);
    } else {
      z = 0;
    }
    naf.push(z);

    // Optimization, shift by word if possible
    var shift = (k.cmpn(0) !== 0 && k.andln(ws - 1) === 0) ? (w + 1) : 1;
    for (var i = 1; i < shift; i++)
      naf.push(0);
    k.ishrn(shift);
  }

  return naf;
}
utils.getNAF = getNAF;

// Represent k1, k2 in a Joint Sparse Form
function getJSF(k1, k2) {
  var jsf = [
    [],
    []
  ];

  k1 = k1.clone();
  k2 = k2.clone();
  var d1 = 0;
  var d2 = 0;
  while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {

    // First phase
    var m14 = (k1.andln(3) + d1) & 3;
    var m24 = (k2.andln(3) + d2) & 3;
    if (m14 === 3)
      m14 = -1;
    if (m24 === 3)
      m24 = -1;
    var u1;
    if ((m14 & 1) === 0) {
      u1 = 0;
    } else {
      var m8 = (k1.andln(7) + d1) & 7;
      if ((m8 === 3 || m8 === 5) && m24 === 2)
        u1 = -m14;
      else
        u1 = m14;
    }
    jsf[0].push(u1);

    var u2;
    if ((m24 & 1) === 0) {
      u2 = 0;
    } else {
      var m8 = (k2.andln(7) + d2) & 7;
      if ((m8 === 3 || m8 === 5) && m14 === 2)
        u2 = -m24;
      else
        u2 = m24;
    }
    jsf[1].push(u2);

    // Second phase
    if (2 * d1 === u1 + 1)
      d1 = 1 - d1;
    if (2 * d2 === u2 + 1)
      d2 = 1 - d2;
    k1.ishrn(1);
    k2.ishrn(1);
  }

  return jsf;
}
utils.getJSF = getJSF;

},{"assert":5,"bn.js":36}],49:[function(require,module,exports){
var r;

module.exports = function rand(len) {
  if (!r)
    r = new Rand(null);

  return r.generate(len);
};

function Rand(rand) {
  this.rand = rand;
}
module.exports.Rand = Rand;

Rand.prototype.generate = function generate(len) {
  return this._rand(len);
};

if (typeof window === 'object') {
  if (window.crypto && window.crypto.getRandomValues) {
    // Modern browsers
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      window.crypto.getRandomValues(arr);
      return arr;
    };
  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
    // IE
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      window.msCrypto.getRandomValues(arr);
      return arr;
    };
  } else {
    // Old junk
    Rand.prototype._rand = function() {
      throw new Error('Not implemented yet');
    };
  }
} else {
  // Node.js or Web worker
  try {
    var crypto = require('cry' + 'pto');

    Rand.prototype._rand = function _rand(n) {
      return crypto.randomBytes(n);
    };
  } catch (e) {
    // Emulate crypto API using randy
    Rand.prototype._rand = function _rand(n) {
      var res = new Uint8Array(n);
      for (var i = 0; i < res.length; i++)
        res[i] = this.rand.getByte();
      return res;
    };
  }
}

},{}],50:[function(require,module,exports){
var hash = exports;

hash.utils = require('./hash/utils');
hash.common = require('./hash/common');
hash.sha = require('./hash/sha');
hash.ripemd = require('./hash/ripemd');
hash.hmac = require('./hash/hmac');

// Proxy hash functions to the main object
hash.sha256 = hash.sha.sha256;
hash.sha224 = hash.sha.sha224;
hash.ripemd160 = hash.ripemd.ripemd160;

},{"./hash/common":51,"./hash/hmac":52,"./hash/ripemd":53,"./hash/sha":54,"./hash/utils":55}],51:[function(require,module,exports){
var hash = require('../hash');
var utils = hash.utils;
var assert = utils.assert;

function BlockHash() {
  this.pending = null;
  this.pendingTotal = 0;
  this.blockSize = this.constructor.blockSize;
  this.outSize = this.constructor.outSize;
  this.hmacStrength = this.constructor.hmacStrength;
  this.endian = 'big';
}
exports.BlockHash = BlockHash;

BlockHash.prototype.update = function update(msg, enc) {
  // Convert message to array, pad it, and join into 32bit blocks
  msg = utils.toArray(msg, enc);
  if (!this.pending)
    this.pending = msg;
  else
    this.pending = this.pending.concat(msg);
  this.pendingTotal += msg.length;

  // Enough data, try updating
  if (this.pending.length >= this.blockSize / 8) {
    msg = this.pending;

    // Process pending data in blocks
    var r = msg.length % (this.blockSize / 8);
    this.pending = msg.slice(msg.length - r, msg.length);
    if (this.pending.length === 0)
      this.pending = null;

    msg = utils.join32(msg.slice(0, msg.length - r), this.endian);
    for (var i = 0; i < msg.length; i += this.blockSize / 32)
      this._update(msg.slice(i, i + this.blockSize / 32));
  }

  return this;
};

BlockHash.prototype.digest = function digest(enc) {
  this.update(this._pad());
  assert(this.pending === null);

  return this._digest(enc);
};

BlockHash.prototype._pad = function pad() {
  var len = this.pendingTotal;
  var bytes = this.blockSize / 8;
  var k = bytes - ((len + 8) % bytes);
  var res = new Array(k + 8);
  res[0] = 0x80;
  for (var i = 1; i < k; i++)
    res[i] = 0;

  // Append length
  len <<= 3;
  if (this.endian === 'big') {
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = len & 0xff;
  } else {
    res[i++] = len & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
  }

  return res;
}

},{"../hash":50}],52:[function(require,module,exports){
var hmac = exports;

var hash = require('../hash');
var utils = hash.utils;
var assert = utils.assert;

function Hmac(hash, key, enc) {
  if (!(this instanceof Hmac))
    return new Hmac(hash, key, enc);
  this.Hash = hash;
  this.blockSize = hash.blockSize / 8;
  this.outSize = hash.outSize / 8;
  this._init(utils.toArray(key, enc));
}
module.exports = Hmac;

Hmac.prototype._init = function init(key) {
  // Shorten key, if needed
  if (key.length > this.blockSize)
    key = new this.Hash().update(key).digest();
  assert(key.length <= this.blockSize);

  // Add padding to key
  for (var i = key.length; i < this.blockSize; i++)
    key.push(0);

  var okey = key.slice();
  for (var i = 0; i < key.length; i++) {
    key[i] ^= 0x36;
    okey[i] ^= 0x5c;
  }

  this.hash = {
    inner: new this.Hash().update(key),
    outer: new this.Hash().update(okey)
  };
};

Hmac.prototype.update = function update(msg, enc) {
  this.hash.inner.update(msg, enc);
  return this;
};

Hmac.prototype.digest = function digest(enc) {
  this.hash.outer.update(this.hash.inner.digest());
  return this.hash.outer.digest(enc);
};

},{"../hash":50}],53:[function(require,module,exports){
var hash = require('../hash');
var utils = hash.utils;

var rotl32 = utils.rotl32;
var sum32 = utils.sum32;
var sum32_3 = utils.sum32_3;
var sum32_4 = utils.sum32_4;
var BlockHash = hash.common.BlockHash;

function RIPEMD160() {
  if (!(this instanceof RIPEMD160))
    return new RIPEMD160();

  BlockHash.call(this);

  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
  this.endian = 'little';
}
utils.inherits(RIPEMD160, BlockHash);
exports.ripemd160 = RIPEMD160;

RIPEMD160.blockSize = 512;
RIPEMD160.outSize = 160;
RIPEMD160.hmacStrength = 192;

RIPEMD160.prototype._update = function update(msg) {
  var A = this.h[0];
  var B = this.h[1];
  var C = this.h[2];
  var D = this.h[3];
  var E = this.h[4];
  var Ah = A;
  var Bh = B;
  var Ch = C;
  var Dh = D;
  var Eh = E;
  for (var j = 0; j < 80; j++) {
    var T = sum32(
      rotl32(
        sum32_4(A, f(j, B, C, D), msg[r[j]], K(j)),
        s[j]),
      E);
    A = E;
    E = D;
    D = rotl32(C, 10);
    C = B;
    B = T;
    T = sum32(
      rotl32(
        sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j]], Kh(j)),
        sh[j]),
      Eh);
    Ah = Eh;
    Eh = Dh;
    Dh = rotl32(Ch, 10);
    Ch = Bh;
    Bh = T;
  }
  T = sum32_3(this.h[1], C, Dh);
  this.h[1] = sum32_3(this.h[2], D, Eh);
  this.h[2] = sum32_3(this.h[3], E, Ah);
  this.h[3] = sum32_3(this.h[4], A, Bh);
  this.h[4] = sum32_3(this.h[0], B, Ch);
  this.h[0] = T;
};

RIPEMD160.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'little');
  else
    return utils.split32(this.h, 'little');
};

function f(j, x, y, z) {
  if (j <= 15)
    return x ^ y ^ z;
  else if (j <= 31)
    return (x & y) | ((~x) & z);
  else if (j <= 47)
    return (x | (~y)) ^ z;
  else if (j <= 63)
    return (x & z) | (y & (~z));
  else
    return x ^ (y | (~z));
}

function K(j) {
  if (j <= 15)
    return 0x00000000;
  else if (j <= 31)
    return 0x5a827999;
  else if (j <= 47)
    return 0x6ed9eba1;
  else if (j <= 63)
    return 0x8f1bbcdc;
  else
    return 0xa953fd4e;
}

function Kh(j) {
  if (j <= 15)
    return 0x50a28be6;
  else if (j <= 31)
    return 0x5c4dd124;
  else if (j <= 47)
    return 0x6d703ef3;
  else if (j <= 63)
    return 0x7a6d76e9;
  else
    return 0x00000000;
}

var r = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
];

var rh = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];

var s = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
];

var sh = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

},{"../hash":50}],54:[function(require,module,exports){
var hash = require('../hash');
var utils = hash.utils;
var assert = utils.assert;

var rotr32 = utils.rotr32;
var rotl32 = utils.rotl32;
var sum32 = utils.sum32;
var sum32_4 = utils.sum32_4;
var sum32_5 = utils.sum32_5;
var BlockHash = hash.common.BlockHash;

var sha256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function SHA256() {
  if (!(this instanceof SHA256))
    return new SHA256();

  BlockHash.call(this);
  this.h = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
             0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];
  this.k = sha256_K;
}
utils.inherits(SHA256, BlockHash);
exports.sha256 = SHA256;

SHA256.blockSize = 512;
SHA256.outSize = 256;
SHA256.hmacStrength = 192;

SHA256.prototype._update = function _update(msg) {
  var W = new Array(64);
  for (var i = 0; i < 16; i++)
    W[i] = msg[i];
  for (; i < W.length; i++)
    W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];
  var f = this.h[5];
  var g = this.h[6];
  var h = this.h[7];

  assert(this.k.length === W.length);
  for (var i = 0; i < W.length; i++) {
    var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
    var T2 = sum32(s0_256(a), maj32(a, b, c));
    h = g;
    g = f;
    f = e;
    e = sum32(d, T1);
    d = c;
    c = b;
    b = a;
    a = sum32(T1, T2);
  }

  this.h[0] = sum32(this.h[0], a);
  this.h[1] = sum32(this.h[1], b);
  this.h[2] = sum32(this.h[2], c);
  this.h[3] = sum32(this.h[3], d);
  this.h[4] = sum32(this.h[4], e);
  this.h[5] = sum32(this.h[5], f);
  this.h[6] = sum32(this.h[6], g);
  this.h[7] = sum32(this.h[7], h);
};

SHA256.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'big');
  else
    return utils.split32(this.h, 'big');
};

function SHA224() {
  if (!(this instanceof SHA224))
    return new SHA224();

  SHA256.call(this);
  this.h = [ 0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
             0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
}
utils.inherits(SHA224, SHA256);
exports.sha224 = SHA224;

SHA224.blockSize = 512;
SHA224.outSize = 224;
SHA224.hmacStrength = 192;

SHA224.prototype._digest = function digest(enc) {
  // Just truncate output
  if (enc === 'hex')
    return utils.toHex32(this.h.slice(0, 7), 'big');
  else
    return utils.split32(this.h.slice(0, 7), 'big');
};

function ch32(x, y, z) {
  return (x & y) ^ ((~x) & z);
}

function maj32(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}

function s0_256(x) {
  return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
}

function s1_256(x) {
  return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
}

function g0_256(x) {
  return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
}

function g1_256(x) {
  return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
}

},{"../hash":50}],55:[function(require,module,exports){
var utils = exports;

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg === 'string') {
    if (!enc) {
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        var hi = c >> 8;
        var lo = c & 0xff;
        if (hi)
          res.push(hi, lo);
        else
          res.push(lo);
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 != 0)
        msg = '0' + msg;
      for (var i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
  } else {
    for (var i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
  }
  return res;
}
utils.toArray = toArray;

function toHex(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
utils.toHex = toHex;

function toHex32(msg, endian) {
  var res = '';
  for (var i = 0; i < msg.length; i++) {
    var w = msg[i];
    if (endian === 'little') {
      w = (w >>> 24) |
          ((w >>> 8) & 0xff00) |
          ((w << 8) & 0xff0000) |
          ((w & 0xff) << 24);
      if (w < 0)
        w += 0x100000000;
    }
    res += zero8(w.toString(16));
  }
  return res;
}
utils.toHex32 = toHex32;

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
utils.zero2 = zero2;

function zero8(word) {
  if (word.length === 7)
    return '0' + word;
  else if (word.length === 6)
    return '00' + word;
  else if (word.length === 5)
    return '000' + word;
  else if (word.length === 4)
    return '0000' + word;
  else if (word.length === 3)
    return '00000' + word;
  else if (word.length === 2)
    return '000000' + word;
  else if (word.length === 1)
    return '0000000' + word;
  else
    return word;
}
utils.zero8 = zero8;

function join32(msg, endian) {
  assert(msg.length % 4 === 0);
  var res = new Array(msg.length / 4);
  for (var i = 0, k = 0; i < res.length; i++, k += 4) {
    var w;
    if (endian === 'big')
      w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
    else
      w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
    if (w < 0)
      w += 0x100000000;
    res[i] = w;
  }
  return res;
}
utils.join32 = join32;

function split32(msg, endian) {
  var res = new Array(msg.length * 4);
  for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
    var m = msg[i];
    if (endian === 'big') {
      res[k] = m >>> 24;
      res[k + 1] = (m >>> 16) & 0xff;
      res[k + 2] = (m >>> 8) & 0xff;
      res[k + 3] = m & 0xff;
    } else {
      res[k + 3] = m >>> 24;
      res[k + 2] = (m >>> 16) & 0xff;
      res[k + 1] = (m >>> 8) & 0xff;
      res[k] = m & 0xff;
    }
  }
  return res;
}
utils.split32 = split32;

function rotr32(w, b) {
  return (w >>> b) | (w << (32 - b));
}
utils.rotr32 = rotr32;

function rotl32(w, b) {
  return (w << b) | (w >>> (32 - b));
}
utils.rotl32 = rotl32;

function sum32(a, b) {
  var r = (a + b) & 0xffffffff;
  if (r < 0)
    r += 0x100000000;
  return r;
}
utils.sum32 = sum32;

function sum32_3(a, b, c) {
  var r = (a + b + c) & 0xffffffff;
  if (r < 0)
    r += 0x100000000;
  return r;
}
utils.sum32_3 = sum32_3;

function sum32_4(a, b, c, d) {
  var r = (a + b + c + d) & 0xffffffff;
  if (r < 0)
    r += 0x100000000;
  return r;
}
utils.sum32_4 = sum32_4;

function sum32_5(a, b, c, d, e) {
  var r = (a + b + c + d + e) & 0xffffffff;
  if (r < 0)
    r += 0x100000000;
  return r;
}
utils.sum32_5 = sum32_5;

function assert(cond, msg) {
  if (!cond)
    throw new Error(msg || 'Assertion failed');
}
utils.assert = assert;

// Shamelessly copied from browserify
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  utils.inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  utils.inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],56:[function(require,module,exports){
module.exports={
  "name": "elliptic",
  "version": "0.15.15",
  "description": "EC cryptography",
  "main": "lib/elliptic.js",
  "scripts": {
    "test": "mocha --reporter=spec test/*-test.js"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:indutny/elliptic"
  },
  "keywords": [
    "EC",
    "Elliptic",
    "curve",
    "Cryptography"
  ],
  "author": {
    "name": "Fedor Indutny",
    "email": "fedor@indutny.com"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/indutny/elliptic/issues"
  },
  "homepage": "https://github.com/indutny/elliptic",
  "devDependencies": {
    "browserify": "^3.44.2",
    "mocha": "^1.18.2",
    "uglify-js": "^2.4.13"
  },
  "dependencies": {
    "bn.js": "^0.15.0",
    "brorand": "^1.0.1",
    "hash.js": "^0.2.0",
    "inherits": "^2.0.1"
  },
  "gitHead": "4bf1f50607285bff4ae19521217dbc801c3d36af",
  "_id": "elliptic@0.15.15",
  "_shasum": "63269184a856d6e00871e84f37a8401ff84e4aea",
  "_from": "elliptic@>=0.15.14 <0.16.0",
  "_npmVersion": "2.1.6",
  "_nodeVersion": "0.10.33",
  "_npmUser": {
    "name": "indutny",
    "email": "fedor@indutny.com"
  },
  "maintainers": [
    {
      "name": "indutny",
      "email": "fedor@indutny.com"
    }
  ],
  "dist": {
    "shasum": "63269184a856d6e00871e84f37a8401ff84e4aea",
    "tarball": "http://registry.npmjs.org/elliptic/-/elliptic-0.15.15.tgz"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/elliptic/-/elliptic-0.15.15.tgz",
  "readme": "ERROR: No README data found!"
}

},{}],57:[function(require,module,exports){
(function (Buffer){

module.exports = function evp(crypto, password, salt, keyLen) {
  keyLen = keyLen/8;
  var ki = 0;
  var ii = 0;
  var key = new Buffer(keyLen);
  var addmd = 0;
  var md, md_buf;
  var i;
  while (true) {
    md = crypto.createHash('md5');
    if(addmd++ > 0) {
       md.update(md_buf);
    }
    md.update(password);
    md.update(salt);
    md_buf = md.digest();
    i = 0;
    if(keyLen > 0) {
      while(true) {
        if(keyLen === 0) {
          break;
        }
        if(i === md_buf.length) {
          break;
        }
        key[ki++] = md_buf[i++];
        keyLen--;
       }
    }
   if(keyLen === 0) {
      break;
    }
  }
  for(i=0;i<md_buf.length;i++) {
    md_buf[i] = 0;
  }
  return key;
};
}).call(this,require("buffer").Buffer)
},{"buffer":7}],58:[function(require,module,exports){
module.exports={"2.16.840.1.101.3.4.1.1": "aes-128-ecb",
"2.16.840.1.101.3.4.1.2": "aes-128-cbc",
"2.16.840.1.101.3.4.1.3": "aes-128-ofb",
"2.16.840.1.101.3.4.1.4": "aes-128-cfb",
"2.16.840.1.101.3.4.1.21": "aes-192-ecb",
"2.16.840.1.101.3.4.1.22": "aes-192-cbc",
"2.16.840.1.101.3.4.1.23": "aes-192-ofb",
"2.16.840.1.101.3.4.1.24": "aes-192-cfb",
"2.16.840.1.101.3.4.1.41": "aes-256-ecb",
"2.16.840.1.101.3.4.1.42": "aes-256-cbc",
"2.16.840.1.101.3.4.1.43": "aes-256-ofb",
"2.16.840.1.101.3.4.1.44": "aes-256-cfb"
}
},{}],59:[function(require,module,exports){
// from https://github.com/indutny/self-signed/blob/gh-pages/lib/asn1.js
// Fedor, you are amazing.

var asn1 = require('asn1.js');
var rfc3280 = require('asn1.js-rfc3280');

var RSAPrivateKey = asn1.define('RSAPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('modulus').int(),
    this.key('publicExponent').int(),
    this.key('privateExponent').int(),
    this.key('prime1').int(),
    this.key('prime2').int(),
    this.key('exponent1').int(),
    this.key('exponent2').int(),
    this.key('coefficient').int()
  );
});
exports.RSAPrivateKey = RSAPrivateKey;

var RSAPublicKey = asn1.define('RSAPublicKey', function() {
  this.seq().obj(
    this.key('modulus').int(),
    this.key('publicExponent').int()
  );
});
exports.RSAPublicKey = RSAPublicKey;

var PublicKey = rfc3280.SubjectPublicKeyInfo;
exports.PublicKey = PublicKey;
var ECPublicKey =  asn1.define('ECPublicKey', function() {
  this.seq().obj(
    this.key('algorithm').seq().obj(
      this.key('id').objid(),
      this.key('curve').objid()
    ),
    this.key('subjectPrivateKey').bitstr()
  );
});
exports.ECPublicKey = ECPublicKey;
var ECPrivateWrap =  asn1.define('ECPrivateWrap', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').seq().obj(
      this.key('id').objid(),
      this.key('curve').objid()
    ),
    this.key('subjectPrivateKey').octstr()
  );
});
exports.ECPrivateWrap = ECPrivateWrap;

var PrivateKeyInfo = asn1.define('PrivateKeyInfo', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').use(rfc3280.AlgorithmIdentifier),
    this.key('subjectPrivateKey').octstr()
  );
});
exports.PrivateKey = PrivateKeyInfo;
var EncryptedPrivateKeyInfo = asn1.define('EncryptedPrivateKeyInfo', function() {
  this.seq().obj(
    this.key('algorithm').seq().obj(
      this.key('id').objid(),
      this.key('decrypt').seq().obj(
        this.key('kde').seq().obj(
          this.key('id').objid(),
          this.key('kdeparams').seq().obj(
            this.key('salt').octstr(),
            this.key('iters').int()
          )
        ),
        this.key('cipher').seq().obj(
          this.key('algo').objid(),
          this.key('iv').octstr()
        )
      )
    ),
    this.key('subjectPrivateKey').octstr()
  );
});
var dsaParams = asn1.define('dsaParams', function() {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters').seq().obj(
        this.key('p').int(),
        this.key('q').int(),
        this.key('g').int()
      )
  );
});
exports.EncryptedPrivateKey = EncryptedPrivateKeyInfo;
var DSAPublicKey = asn1.define('DSAPublicKey', function() {
  this.seq().obj(
    this.key('algorithm').use(dsaParams),
    this.key('subjectPublicKey').bitstr()
  );
});
exports.DSAPublicKey = DSAPublicKey;
var DSAPrivateWrap =  asn1.define('DSAPrivateWrap', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').seq().obj(
      this.key('id').objid(),
      this.key('parameters').seq().obj(
        this.key('p').int(),
        this.key('q').int(),
        this.key('g').int()
      )
    ),
    this.key('subjectPrivateKey').octstr()
  );
});
exports.DSAPrivateWrap = DSAPrivateWrap;
var DSAPrivateKey = asn1.define('DSAPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('p').int(),
    this.key('q').int(),
    this.key('g').int(),
    this.key('pub_key').int(),
    this.key('priv_key').int()
  );
});
exports.DSAPrivateKey = DSAPrivateKey;

exports.DSAparam = asn1.define('DSAparam', function () {
  this.int();
});
var ECPrivateKey = asn1.define('ECPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters').optional().explicit(0).use(ECParameters),
    this.key('publicKey').optional().explicit(1).bitstr()
  );
});
exports.ECPrivateKey = ECPrivateKey;
var ECParameters = asn1.define('ECParameters', function() {
  this.choice({
    namedCurve: this.objid()
  });
});

var ECPrivateKey2 = asn1.define('ECPrivateKey2', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('publicKey').seq().obj(
      this.key('key').bitstr()
    )
  );
});
exports.ECPrivateKey2 = ECPrivateKey2;

exports.signature = asn1.define('signature', function() {
  this.seq().obj(
    this.key('r').int(),
    this.key('s').int()
  );
});
},{"asn1.js":63,"asn1.js-rfc3280":62}],60:[function(require,module,exports){
(function (Buffer){
var findProc = /Proc-Type: 4,ENCRYPTED\n\r?DEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)\n\r?\n\r?([0-9A-z\n\r\+\/\=]+)\n\r?/m;
var startRegex = /^-----BEGIN (.*)-----\n/;
var evp = require('./EVP_BytesToKey');
module.exports = function (okey, password, crypto) {
  var key = okey.toString();
  var match = key.match(findProc);
  if (!match) {
    return okey;
  }
  var suite = 'aes' + match[1];
  var iv = new Buffer(match[2], 'hex');
  var cipherText = new Buffer(match[3].replace(/\n\r?/g, ''), 'base64');
  var cipherKey = evp(crypto, password, iv.slice(0,8), parseInt(match[1]));
  var out = [];
  var cipher = crypto.createDecipheriv(suite, cipherKey, iv);
  out.push(cipher.update(cipherText));
  out.push(cipher.final());
  var decrypted = Buffer.concat(out).toString('base64');
  var tag = key.match(startRegex)[1];
  return '-----BEGIN ' + tag + "-----\n" + wrap(decrypted) + "\n" + '-----END ' + tag + "-----\n";
};
// http://stackoverflow.com/a/7033705
function wrap(str) {
  var chunks = [];
  while (str) {
    if (str.length < 64) {
      chunks.push(str);
      break;
    }
    else {
      chunks.push(str.slice(0, 64));
      str = str.slice(64);
    }
  }
  return chunks.join("\n");
}
}).call(this,require("buffer").Buffer)
},{"./EVP_BytesToKey":57,"buffer":7}],61:[function(require,module,exports){
(function (Buffer){
var pemstrip = require('pemstrip');
var asn1 = require('./asn1');
var aesid = require('./aesid.json');
var fixProc = require('./fixProc');
module.exports = parseKeys;

function parseKeys(buffer, crypto) {
  var password;
  if (typeof buffer === 'object' && !Buffer.isBuffer(buffer)) {
    password = buffer.passphrase;
    buffer = buffer.key;
  }
  if (typeof buffer === 'string') {
    buffer = new Buffer(buffer);
  }
  if (password) {
    buffer = fixProc(buffer, password, crypto);
  }
  var stripped = pemstrip.strip(buffer);
  var type = stripped.tag;
  var data = new Buffer(stripped.base64, 'base64');
  var subtype,ndata;
  switch (type) {
    case 'PUBLIC KEY':
      ndata = asn1.PublicKey.decode(data, 'der');
      subtype = ndata.algorithm.algorithm.join('.');
      switch(subtype) {
        case '1.2.840.113549.1.1.1':
          return asn1.RSAPublicKey.decode(ndata.subjectPublicKey.data, 'der');
        case '1.2.840.10045.2.1':
          return {
            type: 'ec',
            data:  asn1.ECPublicKey.decode(data, 'der')
          };
        case '1.2.840.10040.4.1':
          ndata = asn1.DSAPublicKey.decode(data, 'der');
          ndata.algorithm.parameters.pub_key = asn1.DSAparam.decode(ndata.subjectPublicKey.data, 'der');
          return {
            type: 'dsa',
            data: ndata.algorithm.parameters
          };
        default: throw new Error('unknown key id ' +  subtype);
      }
      throw new Error('unknown key type ' +  type);
    case 'ENCRYPTED PRIVATE KEY':
      data = asn1.EncryptedPrivateKey.decode(data, 'der');
      data = decrypt(crypto, data, password);
      //falling through
    case 'PRIVATE KEY':
      ndata = asn1.PrivateKey.decode(data, 'der');
      subtype = ndata.algorithm.algorithm.join('.');
      switch(subtype) {
        case '1.2.840.113549.1.1.1':
          return asn1.RSAPrivateKey.decode(ndata.subjectPrivateKey, 'der');
        case '1.2.840.10045.2.1':
          ndata =  asn1.ECPrivateWrap.decode(data, 'der');
          return {
            curve: ndata.algorithm.curve,
            privateKey: asn1.ECPrivateKey.decode(ndata.subjectPrivateKey, 'der').privateKey
          };
        case '1.2.840.10040.4.1':
          ndata =  asn1.DSAPrivateWrap.decode(data, 'der');
          ndata.algorithm.parameters.priv_key = asn1.DSAparam.decode(ndata.subjectPrivateKey, 'der');
          return {
            type: 'dsa',
            params: ndata.algorithm.parameters
          };
        default: throw new Error('unknown key id ' +  subtype);
      }
      throw new Error('unknown key type ' +  type);
    case 'RSA PUBLIC KEY':
      return asn1.RSAPublicKey.decode(data, 'der');
    case 'RSA PRIVATE KEY':
      return asn1.RSAPrivateKey.decode(data, 'der');
    case 'DSA PRIVATE KEY':
      return {
        type: 'dsa',
        params: asn1.DSAPrivateKey.decode(data, 'der')
      };
    case 'EC PRIVATE KEY':
      data = asn1.ECPrivateKey.decode(data, 'der');
      return {
        curve: data.parameters.value,
        privateKey: data.privateKey
      };
    default: throw new Error('unknown key type ' +  type);
  }
}
parseKeys.signature = asn1.signature;
function decrypt(crypto, data, password) {
  var salt = data.algorithm.decrypt.kde.kdeparams.salt;
  var iters = data.algorithm.decrypt.kde.kdeparams.iters;
  var algo = aesid[data.algorithm.decrypt.cipher.algo.join('.')];
  var iv = data.algorithm.decrypt.cipher.iv;
  var cipherText = data.subjectPrivateKey;
  var keylen = parseInt(algo.split('-')[1], 10)/8;
  var key = crypto.pbkdf2Sync(password, salt, iters, keylen);
  var cipher = crypto.createDecipheriv(algo, key, iv);
  var out = [];
  out.push(cipher.update(cipherText));
  out.push(cipher.final());
  return Buffer.concat(out);
}
}).call(this,require("buffer").Buffer)
},{"./aesid.json":58,"./asn1":59,"./fixProc":60,"buffer":7,"pemstrip":75}],62:[function(require,module,exports){
try {
  var asn1 = require('asn1.js');
} catch (e) {
  var asn1 = require('../..');
}

var CRLReason = asn1.define('CRLReason', function() {
  this.enum({
    0: 'unspecified',
    1: 'keyCompromise',
    2: 'CACompromise',
    3: 'affiliationChanged',
    4: 'superseded',
    5: 'cessationOfOperation',
    6: 'certificateHold',
    8: 'removeFromCRL',
    9: 'privilegeWithdrawn',
    10: 'AACompromise'
  });
});
exports.CRLReason = CRLReason;

var AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', function() {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters').optional().any()
  );
});
exports.AlgorithmIdentifier = AlgorithmIdentifier;

var Certificate = asn1.define('Certificate', function() {
  this.seq().obj(
    this.key('tbsCertificate').use(TBSCertificate),
    this.key('signatureAlgorithm').use(AlgorithmIdentifier),
    this.key('signature').bitstr()
  );
});
exports.Certificate = Certificate;

var TBSCertificate = asn1.define('TBSCertificate', function() {
  this.seq().obj(
    this.key('version').def('v1').explicit(0).use(Version),
    this.key('serialNumber').use(CertificateSerialNumber),
    this.key('signature').use(AlgorithmIdentifier),
    this.key('issuer').use(Name),
    this.key('validity').use(Validity),
    this.key('subject').use(Name),
    this.key('subjectPublicKeyInfo').use(SubjectPublicKeyInfo),

    // TODO(indutny): validate that version is v2 or v3
    this.key('issuerUniqueID').optional().explicit(1).use(UniqueIdentifier),
    this.key('subjectUniqueID').optional().explicit(2).use(UniqueIdentifier),

    // TODO(indutny): validate that version is v3
    this.key('extensions').optional().explicit(3).use(Extensions)
  );
});
exports.TBSCertificate = TBSCertificate;

var Version = asn1.define('Version', function() {
  this.int({
    0: 'v1',
    1: 'v2',
    2: 'v3'
  });
});
exports.Version = Version;

var CertificateSerialNumber = asn1.define('CertificateSerialNumber',
                                          function() {
  this.int();
});
exports.CertificateSerialNumber = CertificateSerialNumber;

var Validity = asn1.define('Validity', function() {
  this.seq().obj(
    this.key('notBefore').use(Time),
    this.key('notAfter').use(Time)
  );
});
exports.Validity = Validity;

var Time = asn1.define('Time', function() {
  this.choice({
    utcTime: this.utctime(),
    genTime: this.gentime()
  });
});
exports.Time = Time;

var UniqueIdentifier = asn1.define('UniqueIdentifier', function() {
  this.bitstr();
});
exports.UniqueIdentifier = UniqueIdentifier;

var SubjectPublicKeyInfo = asn1.define('SubjectPublicKeyInfo', function() {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('subjectPublicKey').bitstr()
  );
});
exports.SubjectPublicKeyInfo = SubjectPublicKeyInfo;

var Extensions = asn1.define('Extensions', function() {
  this.seqof(Extension);
});
exports.Extensions = Extensions;

var Extension = asn1.define('Extension', function() {
  this.seq().obj(
    this.key('extnID').objid(),
    this.key('critical').bool().def(false),
    this.key('extnValue').octstr()
  );
});
exports.Extension = Extension;

var Name = asn1.define('Name', function() {
  this.choice({
    rdn: this.use(RDNSequence)
  });
});
exports.Name = Name;

var RDNSequence = asn1.define('RDNSequence', function() {
  this.seqof(RelativeDistinguishedName);
});
exports.RDNSequence = RDNSequence;

var RelativeDistinguishedName = asn1.define('RelativeDistinguishedName',
                                            function() {
  this.setof(AttributeTypeAndValue);
});
exports.RelativeDistinguishedName = RelativeDistinguishedName;

var AttributeTypeAndValue = asn1.define('AttributeTypeAndValue', function() {
  this.seq().obj(
    this.key('type').use(AttributeType),
    this.key('value').use(AttributeValue)
  );
});
exports.AttributeTypeAndValue = AttributeTypeAndValue;

var AttributeType = asn1.define('AttributeType', function() {
  this.objid();
});
exports.AttributeType = AttributeType;

var AttributeValue = asn1.define('AttributeValue', function() {
  this.any();
});
exports.AttributeValue = AttributeValue;

},{"../..":61,"asn1.js":63}],63:[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('bn.js');

asn1.define = require('./asn1/api').define;
asn1.base = require('./asn1/base');
asn1.constants = require('./asn1/constants');
asn1.decoders = require('./asn1/decoders');
asn1.encoders = require('./asn1/encoders');

},{"./asn1/api":64,"./asn1/base":66,"./asn1/constants":70,"./asn1/decoders":72,"./asn1/encoders":74,"bn.js":36}],64:[function(require,module,exports){
var asn1 = require('../asn1');
var util = require('util');
var vm = require('vm');

var api = exports;

api.define = function define(name, body) {
  return new Entity(name, body);
};

function Entity(name, body) {
  this.name = name;
  this.body = body;

  this.decoders = {};
  this.encoders = {};
};

Entity.prototype._createNamed = function createNamed(base) {
  var named = vm.runInThisContext('(function ' + this.name + '(entity) {\n' +
    '  this._initNamed(entity);\n' +
    '})');
  util.inherits(named, base);
  named.prototype._initNamed = function initnamed(entity) {
    base.call(this, entity);
  };

  return new named(this);
};

Entity.prototype._getDecoder = function _getDecoder(enc) {
  // Lazily create decoder
  if (!this.decoders.hasOwnProperty(enc))
    this.decoders[enc] = this._createNamed(asn1.decoders[enc]);
  return this.decoders[enc];
};

Entity.prototype.decode = function decode(data, enc, options) {
  return this._getDecoder(enc).decode(data, options);
};

Entity.prototype._getEncoder = function _getEncoder(enc) {
  // Lazily create encoder
  if (!this.encoders.hasOwnProperty(enc))
    this.encoders[enc] = this._createNamed(asn1.encoders[enc]);
  return this.encoders[enc];
};

Entity.prototype.encode = function encode(data, enc, /* internal */ reporter) {
  return this._getEncoder(enc).encode(data, reporter);
};

},{"../asn1":63,"util":164,"vm":165}],65:[function(require,module,exports){
var assert = require('assert');
var util = require('util');
var Reporter = require('../base').Reporter;
var Buffer = require('buffer').Buffer;

function DecoderBuffer(base, options) {
  Reporter.call(this, options);
  if (!Buffer.isBuffer(base)) {
    this.error('Input not Buffer');
    return;
  }

  this.base = base;
  this.offset = 0;
  this.length = base.length;
}
util.inherits(DecoderBuffer, Reporter);
exports.DecoderBuffer = DecoderBuffer;

DecoderBuffer.prototype.save = function save() {
  return { offset: this.offset };
};

DecoderBuffer.prototype.restore = function restore(save) {
  // Return skipped data
  var res = new DecoderBuffer(this.base);
  res.offset = save.offset;
  res.length = this.offset;

  this.offset = save.offset;

  return res;
};

DecoderBuffer.prototype.isEmpty = function isEmpty() {
  return this.offset === this.length;
};

DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
  if (this.offset + 1 <= this.length)
    return this.base.readUInt8(this.offset++, true);
  else
    return this.error(fail || 'DecoderBuffer overrun');
}

DecoderBuffer.prototype.skip = function skip(bytes, fail) {
  if (!(this.offset + bytes <= this.length))
    return this.error(fail || 'DecoderBuffer overrun');

  var res = new DecoderBuffer(this.base);

  // Share reporter state
  res._reporterState = this._reporterState;

  res.offset = this.offset;
  res.length = this.offset + bytes;
  this.offset += bytes;
  return res;
}

DecoderBuffer.prototype.raw = function raw(save) {
  return this.base.slice(save ? save.offset : this.offset, this.length);
}

function EncoderBuffer(value, reporter) {
  if (Array.isArray(value)) {
    this.length = 0;
    this.value = value.map(function(item) {
      if (!(item instanceof EncoderBuffer))
        item = new EncoderBuffer(item, reporter);
      this.length += item.length;
      return item;
    }, this);
  } else if (typeof value === 'number') {
    if (!(0 <= value && value <= 0xff))
      return reporter.error('non-byte EncoderBuffer value');
    this.value = value;
    this.length = 1;
  } else if (typeof value === 'string') {
    this.value = value;
    this.length = Buffer.byteLength(value);
  } else if (Buffer.isBuffer(value)) {
    this.value = value;
    this.length = value.length;
  } else {
    return reporter.error('Unsupported type: ' + typeof value);
  }
}
exports.EncoderBuffer = EncoderBuffer;

EncoderBuffer.prototype.join = function join(out, offset) {
  if (!out)
    out = new Buffer(this.length);
  if (!offset)
    offset = 0;

  if (this.length === 0)
    return out;

  if (Array.isArray(this.value)) {
    this.value.forEach(function(item) {
      item.join(out, offset);
      offset += item.length;
    });
  } else {
    if (typeof this.value === 'number')
      out[offset] = this.value;
    else if (typeof this.value === 'string')
      out.write(this.value, offset);
    else if (Buffer.isBuffer(this.value))
      this.value.copy(out, offset);
    offset += this.length;
  }

  return out;
};

},{"../base":66,"assert":5,"buffer":7,"util":164}],66:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":65,"./node":67,"./reporter":68}],67:[function(require,module,exports){
var assert = require('assert');
var Reporter = require('../base').Reporter;
var EncoderBuffer = require('../base').EncoderBuffer;

// Supported tags
var tags = [
  'seq', 'seqof', 'set', 'setof', 'octstr', 'bitstr', 'objid', 'bool',
  'gentime', 'utctime', 'null_', 'enum', 'int', 'ia5str'
];

// Public methods list
var methods = [
  'key', 'obj', 'use', 'optional', 'explicit', 'implicit', 'def', 'choice',
  'any'
].concat(tags);

// Overrided methods list
var overrided = [
  '_peekTag', '_decodeTag', '_use',
  '_decodeStr', '_decodeObjid', '_decodeTime',
  '_decodeNull', '_decodeInt', '_decodeBool', '_decodeList',

  '_encodeComposite', '_encodeStr', '_encodeObjid', '_encodeTime',
  '_encodeNull', '_encodeInt', '_encodeBool'
];

function Node(enc, parent) {
  var state = {};
  this._baseState = state;

  state.enc = enc;

  state.parent = parent || null;
  state.children = null;

  // State
  state.tag = null;
  state.args = null;
  state.reverseArgs = null;
  state.choice = null;
  state.optional = false;
  state.any = false;
  state.obj = false;
  state.use = null;
  state.useDecoder = null;
  state.key = null;
  state['default'] = null;
  state.explicit = null;
  state.implicit = null;

  // Should create new instance on each method
  if (!state.parent) {
    state.children = [];
    this._wrap();
  }
}
module.exports = Node;

var stateProps = [
  'enc', 'parent', 'children', 'tag', 'args', 'reverseArgs', 'choice',
  'optional', 'any', 'obj', 'use', 'alteredUse', 'key', 'default', 'explicit',
  'implicit'
];

Node.prototype.clone = function clone() {
  var state = this._baseState;
  var cstate = {};
  stateProps.forEach(function(prop) {
    cstate[prop] = state[prop];
  });
  var res = new this.constructor(cstate.parent);
  res._baseState = cstate;
  return res;
};

Node.prototype._wrap = function wrap() {
  var state = this._baseState;
  methods.forEach(function(method) {
    this[method] = function _wrappedMethod() {
      var clone = new this.constructor(this);
      state.children.push(clone);
      return clone[method].apply(clone, arguments);
    };
  }, this);
};

Node.prototype._init = function init(body) {
  var state = this._baseState;

  assert(state.parent === null);
  body.call(this);

  // Filter children
  state.children = state.children.filter(function(child) {
    return child._baseState.parent === this;
  }, this);
  assert.equal(state.children.length, 1, 'Root node can have only one child');
};

Node.prototype._useArgs = function useArgs(args) {
  var state = this._baseState;

  // Filter children and args
  var children = args.filter(function(arg) {
    return arg instanceof this.constructor;
  }, this);
  args = args.filter(function(arg) {
    return !(arg instanceof this.constructor);
  }, this);

  if (children.length !== 0) {
    assert(state.children === null);
    state.children = children;

    // Replace parent to maintain backward link
    children.forEach(function(child) {
      child._baseState.parent = this;
    }, this);
  }
  if (args.length !== 0) {
    assert(state.args === null);
    state.args = args;
    state.reverseArgs = args.map(function(arg) {
      if (typeof arg !== 'object' || arg.constructor !== Object)
        return arg;

      var res = {};
      Object.keys(arg).forEach(function(key) {
        if (key == (key | 0))
          key |= 0;
        var value = arg[key];
        res[value] = key;
      });
      return res;
    });
  }
};

//
// Overrided methods
//

overrided.forEach(function(method) {
  Node.prototype[method] = function _overrided() {
    var state = this._baseState;
    throw new Error(method + ' not implemented for encoding: ' + state.enc);
  };
});

//
// Public methods
//

tags.forEach(function(tag) {
  Node.prototype[tag] = function _tagMethod() {
    var state = this._baseState;
    var args = Array.prototype.slice.call(arguments);

    assert(state.tag === null);
    state.tag = tag;

    this._useArgs(args);

    return this;
  };
});

Node.prototype.use = function use(item) {
  var state = this._baseState;

  assert(state.use === null);
  state.use = item;

  return this;
};

Node.prototype.optional = function optional() {
  var state = this._baseState;

  state.optional = true;

  return this;
};

Node.prototype.def = function def(val) {
  var state = this._baseState;

  assert(state['default'] === null);
  state['default'] = val;
  state.optional = true;

  return this;
};

Node.prototype.explicit = function explicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.explicit = num;

  return this;
};

Node.prototype.implicit = function implicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.implicit = num;

  return this;
};

Node.prototype.obj = function obj() {
  var state = this._baseState;
  var args = Array.prototype.slice.call(arguments);

  state.obj = true;

  if (args.length !== 0)
    this._useArgs(args);

  return this;
};

Node.prototype.key = function key(key) {
  var state = this._baseState;

  assert(state.key === null);
  state.key = key;

  return this;
};

Node.prototype.any = function any() {
  var state = this._baseState;

  state.any = true;

  return this;
};

Node.prototype.choice = function choice(obj) {
  var state = this._baseState;

  assert(state.choice === null);
  state.choice = obj;
  this._useArgs(Object.keys(obj).map(function(key) {
    return obj[key];
  }));

  return this;
};

//
// Decoding
//

Node.prototype._decode = function decode(input) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return input.wrapResult(state.children[0]._decode(input));

  var result = state['default'];
  var present = true;

  var prevKey;
  if (state.key !== null)
    prevKey = input.enterKey(state.key);

  // Check if tag is there
  if (state.optional) {
    present = this._peekTag(
      input,
      state.explicit !== null ? state.explicit :
          state.implicit !== null ? state.implicit :
              state.tag || 0
    );
    if (input.isError(present))
      return present;
  }

  // Push object on stack
  var prevObj;
  if (state.obj && present)
    prevObj = input.enterObject();

  if (present) {
    // Unwrap explicit values
    if (state.explicit !== null) {
      var explicit = this._decodeTag(input, state.explicit);
      if (input.isError(explicit))
        return explicit;
      input = explicit;
    }

    // Unwrap implicit and normal values
    if (state.use === null && state.choice === null) {
      if (state.any)
        var save = input.save();
      var body = this._decodeTag(
        input,
        state.implicit !== null ? state.implicit : state.tag,
        state.any
      );
      if (input.isError(body))
        return body;

      if (state.any)
        result = input.raw(save);
      else
        input = body;
    }

    // Select proper method for tag
    if (state.any)
      result = result;
    else if (state.choice === null)
      result = this._decodeGeneric(state.tag, input);
    else
      result = this._decodeChoice(input);

    if (input.isError(result))
      return result;

    // Decode children
    if (!state.any && state.choice === null && state.children !== null) {
      var fail = state.children.some(function decodeChildren(child) {
        // NOTE: We are ignoring errors here, to let parser continue with other
        // parts of encoded data
        child._decode(input);
      });
      if (fail)
        return err;
    }
  }

  // Pop object
  if (state.obj && present)
    result = input.leaveObject(prevObj);

  // Set key
  if (state.key !== null && (result !== null || present === true))
    input.leaveKey(prevKey, state.key, result);

  return result;
};

Node.prototype._decodeGeneric = function decodeGeneric(tag, input) {
  var state = this._baseState;

  if (tag === 'seq' || tag === 'set')
    return null;
  if (tag === 'seqof' || tag === 'setof')
    return this._decodeList(input, tag, state.args[0]);
  else if (tag === 'octstr' || tag === 'bitstr' || tag === 'ia5str')
    return this._decodeStr(input, tag);
  else if (tag === 'objid' && state.args)
    return this._decodeObjid(input, state.args[0], state.args[1]);
  else if (tag === 'objid')
    return this._decodeObjid(input, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._decodeTime(input, tag);
  else if (tag === 'null_')
    return this._decodeNull(input);
  else if (tag === 'bool')
    return this._decodeBool(input);
  else if (tag === 'int' || tag === 'enum')
    return this._decodeInt(input, state.args && state.args[0]);
  else if (state.use !== null)
    return this._getUse(state.use, input._reporterState.obj)._decode(input);
  else
    return input.error('unknown tag: ' + tag);

  return null;
};

Node.prototype._getUse = function _getUse(entity, obj) {

  var state = this._baseState;
  // Create altered use decoder if implicit is set
  state.useDecoder = this._use(entity, obj);
  assert(state.useDecoder._baseState.parent === null);
  state.useDecoder = state.useDecoder._baseState.children[0];
  if (state.implicit !== state.useDecoder._baseState.implicit) {
    state.useDecoder = state.useDecoder.clone();
    state.useDecoder._baseState.implicit = state.implicit;
  }
  return state.useDecoder;
};

Node.prototype._decodeChoice = function decodeChoice(input) {
  var state = this._baseState;
  var result = null;
  var match = false;

  Object.keys(state.choice).some(function(key) {
    var save = input.save();
    var node = state.choice[key];
    try {
      var value = node._decode(input);
      if (input.isError(value))
        return false;

      result = { type: key, value: value };
      match = true;
    } catch (e) {
      input.restore(save);
      return false;
    }
    return true;
  }, this);

  if (!match)
    return input.error('Choice not matched');

  return result;
};

//
// Encoding
//

Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
  return new EncoderBuffer(data, this.reporter);
};

Node.prototype._encode = function encode(data, reporter, parent) {
  var state = this._baseState;
  if (state['default'] !== null && state['default'] === data)
    return;

  var result = this._encodeValue(data, reporter, parent);
  if (result === undefined)
    return;

  if (this._skipDefault(result, reporter, parent))
    return;

  return result;
};

Node.prototype._encodeValue = function encode(data, reporter, parent) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return state.children[0]._encode(data, reporter || new Reporter());

  var result = null;
  var present = true;

  // Set reporter to share it with a child class
  this.reporter = reporter;

  // Check if data is there
  if (state.optional && data === undefined) {
    if (state['default'] !== null)
      data = state['default']
    else
      return;
  }

  // For error reporting
  var prevKey;

  // Encode children first
  var content = null;
  var primitive = false;
  if (state.any) {
    // Anything that was given is translated to buffer
    result = this._createEncoderBuffer(data);
  } else if (state.choice) {
    result = this._encodeChoice(data, reporter);
  } else if (state.children) {
    content = state.children.map(function(child) {
      if (child._baseState.tag === 'null_')
        return child._encode(null, reporter, data);

      if (child._baseState.key === null)
        return reporter.error('Child should have a key');
      var prevKey = reporter.enterKey(child._baseState.key);

      if (typeof data !== 'object')
        return reporter.error('Child expected, but input is not object');

      var res = child._encode(data[child._baseState.key], reporter, data);
      reporter.leaveKey(prevKey);

      return res;
    }, this).filter(function(child) {
      return child;
    });

    content = this._createEncoderBuffer(content);
  } else {
    if (state.tag === 'seqof' || state.tag === 'setof') {
      // TODO(indutny): this should be thrown on DSL level
      if (!(state.args && state.args.length === 1))
        return reporter.error('Too many args for : ' + state.tag);

      if (!Array.isArray(data))
        return reporter.error('seqof/setof, but data is not Array');

      var child = this.clone();
      child._baseState.implicit = null;
      content = this._createEncoderBuffer(data.map(function(item) {
        var state = this._baseState;

        return this._getUse(state.args[0], data)._encode(item, reporter);
      }, child));
    } else if (state.use !== null) {
      result = this._getUse(state.use, parent)._encode(data, reporter);
    } else {
      content = this._encodePrimitive(state.tag, data);
      primitive = true;
    }
  }

  // Encode data itself
  var result;
  if (!state.any && state.choice === null) {
    var tag = state.implicit !== null ? state.implicit : state.tag;
    var cls = state.implicit === null ? 'universal' : 'context';

    if (tag === null) {
      if (state.use === null)
        reporter.error('Tag could be ommited only for .use()');
    } else {
      if (state.use === null)
        result = this._encodeComposite(tag, primitive, cls, content);
    }
  }

  // Wrap in explicit
  if (state.explicit !== null)
    result = this._encodeComposite(state.explicit, false, 'context', result);

  return result;
};

Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
  var state = this._baseState;

  var node = state.choice[data.type];
  if (!node) {
    assert(
        false,
        data.type + ' not found in ' +
            JSON.stringify(Object.keys(state.choice)));
  }
  return node._encode(data.value, reporter);
};

Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
  var state = this._baseState;

  if (tag === 'octstr' || tag === 'bitstr' || tag === 'ia5str')
    return this._encodeStr(data, tag);
  else if (tag === 'objid' && state.args)
    return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
  else if (tag === 'objid')
    return this._encodeObjid(data, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._encodeTime(data, tag);
  else if (tag === 'null_')
    return this._encodeNull();
  else if (tag === 'int' || tag === 'enum')
    return this._encodeInt(data, state.args && state.reverseArgs[0]);
  else if (tag === 'bool')
    return this._encodeBool(data);
  else
    throw new Error('Unsupported tag: ' + tag);
};

},{"../base":66,"assert":5}],68:[function(require,module,exports){
var util = require('util');

function Reporter(options) {
  this._reporterState = {
    obj: null,
    path: [],
    options: options || {},
    errors: []
  };
}
exports.Reporter = Reporter;

Reporter.prototype.isError = function isError(obj) {
  return obj instanceof ReporterError;
};

Reporter.prototype.enterKey = function enterKey(key) {
  return this._reporterState.path.push(key);
};

Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
  var state = this._reporterState;

  state.path = state.path.slice(0, index - 1);
  if (state.obj !== null)
    state.obj[key] = value;
};

Reporter.prototype.enterObject = function enterObject() {
  var state = this._reporterState;

  var prev = state.obj;
  state.obj = {};
  return prev;
};

Reporter.prototype.leaveObject = function leaveObject(prev) {
  var state = this._reporterState;

  var now = state.obj;
  state.obj = prev;
  return now;
};

Reporter.prototype.error = function error(msg) {
  var err;
  var state = this._reporterState;

  var inherited = msg instanceof ReporterError;
  if (inherited) {
    err = msg;
  } else {
    err = new ReporterError(state.path.map(function(elem) {
      return '[' + JSON.stringify(elem) + ']';
    }).join(''), msg.message || msg, msg.stack);
  }

  if (!state.options.partial)
    throw err;

  if (!inherited)
    state.errors.push(err);

  return err;
};

Reporter.prototype.wrapResult = function wrapResult(result) {
  var state = this._reporterState;
  if (!state.options.partial)
    return result;

  return {
    result: this.isError(result) ? null : result,
    errors: state.errors
  };
};

function ReporterError(path, msg) {
  this.path = path;
  this.rethrow(msg);
};
util.inherits(ReporterError, Error);

ReporterError.prototype.rethrow = function rethrow(msg) {
  this.message = msg + ' at: ' + (this.path || '(shallow)');
  Error.captureStackTrace(this, ReporterError);

  return this;
};

},{"util":164}],69:[function(require,module,exports){
var constants = require('../constants');

exports.tagClass = {
  0: 'universal',
  1: 'application',
  2: 'context',
  3: 'private'
};
exports.tagClassByName = constants._reverse(exports.tagClass);

exports.tag = {
  0x00: 'end',
  0x01: 'bool',
  0x02: 'int',
  0x03: 'bitstr',
  0x04: 'octstr',
  0x05: 'null_',
  0x06: 'objid',
  0x07: 'objDesc',
  0x08: 'external',
  0x09: 'real',
  0x0a: 'enum',
  0x0b: 'embed',
  0x0c: 'utf8str',
  0x0d: 'relativeOid',
  0x10: 'seq',
  0x11: 'set',
  0x12: 'numstr',
  0x13: 'printstr',
  0x14: 't61str',
  0x15: 'videostr',
  0x16: 'ia5str',
  0x17: 'utctime',
  0x18: 'gentime',
  0x19: 'graphstr',
  0x1a: 'iso646str',
  0x1b: 'genstr',
  0x1c: 'unistr',
  0x1d: 'charstr',
  0x1e: 'bmpstr'
};
exports.tagByName = constants._reverse(exports.tag);

},{"../constants":70}],70:[function(require,module,exports){
var constants = exports;

// Helper
constants._reverse = function reverse(map) {
  var res = {};

  Object.keys(map).forEach(function(key) {
    // Convert key to integer if it is stringified
    if ((key | 0) == key)
      key = key | 0;

    var value = map[key];
    res[value] = key;
  });

  return res;
};

constants.der = require('./der');

},{"./der":69}],71:[function(require,module,exports){
var util = require('util');

var asn1 = require('../../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DERDecoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DERDecoder;

DERDecoder.prototype.decode = function decode(data, options) {
  if (!(data instanceof base.DecoderBuffer))
    data = new base.DecoderBuffer(data, options);

  return this.tree._decode(data, options);
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
util.inherits(DERNode, base.Node);

DERNode.prototype._peekTag = function peekTag(buffer, tag) {
  if (buffer.isEmpty())
    return false;

  var state = buffer.save();
  var decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  buffer.restore(state);

  return decodedTag.tag === tag || decodedTag.tagStr === tag;
};

DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
  var decodedTag = derDecodeTag(buffer,
                                'Failed to decode tag of "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  var len = derDecodeLen(buffer,
                         decodedTag.primitive,
                         'Failed to get length of "' + tag + '"');

  // Failure
  if (buffer.isError(len))
    return len;

  if (!any &&
      decodedTag.tag !== tag &&
      decodedTag.tagStr !== tag &&
      decodedTag.tagStr + 'of' !== tag) {
    return buffer.error('Failed to match tag: "' + tag + '"');
  }

  if (decodedTag.primitive || len !== null)
    return buffer.skip(len, 'Failed to match body of: "' + tag + '"');

  // Indefinite length... find END tag
  var state = buffer.start();
  var res = this._skipUntilEnd(
      buffer,
      'Failed to skip indefinite length body: "' + this.tag + '"');
  if (buffer.isError(res))
    return res;

  return buffer.cut(state);
};

DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
  while (true) {
    var tag = derDecodeTag(buffer, fail);
    if (buffer.isError(tag))
      return tag;
    var len = derDecodeLen(buffer, tag.primitive, fail);
    if (buffer.isError(len))
      return len;

    var res;
    if (tag.primitive || len !== null)
      res = buffer.skip(len)
    else
      res = this._skipUntilEnd(buffer, fail);

    // Failure
    if (buffer.isError(res))
      return res;

    if (tag.tagStr === 'end')
      break;
  }
};

DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder) {
  var result = [];
  while (!buffer.isEmpty()) {
    var possibleEnd = this._peekTag(buffer, 'end');
    if (buffer.isError(possibleEnd))
      return possibleEnd;

    var res = decoder.decode(buffer, 'der');
    if (buffer.isError(res) && possibleEnd)
      break;
    result.push(res);
  }
  return result;
};

DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
  if (tag === 'octstr') {
    return buffer.raw();
  } else if (tag === 'bitstr') {
    var unused = buffer.readUInt8();
    if (buffer.isError(unused))
      return unused;

    return { unused: unused, data: buffer.raw() };
  } else if (tag === 'ia5str') {
    return buffer.raw().toString();
  } else {
    return this.error('Decoding of string type: ' + tag + ' unsupported');
  }
};

DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
  var identifiers = [];
  var ident = 0;
  while (!buffer.isEmpty()) {
    var subident = buffer.readUInt8();
    ident <<= 7;
    ident |= subident & 0x7f;
    if ((subident & 0x80) === 0) {
      identifiers.push(ident);
      ident = 0;
    }
  }
  if (subident & 0x80)
    identifiers.push(ident);

  var first = (identifiers[0] / 40) | 0;
  var second = identifiers[0] % 40;

  if (relative)
    result = identifiers;
  else
    result = [first, second].concat(identifiers.slice(1));

  if (values)
    result = values[result.join(' ')];

  return result;
};

DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
  var str = buffer.raw().toString();
  if (tag === 'gentime') {
    var year = str.slice(0, 4) | 0;
    var mon = str.slice(4, 6) | 0;
    var day = str.slice(6, 8) | 0;
    var hour = str.slice(8, 10) | 0;
    var min = str.slice(10, 12) | 0;
    var sec = str.slice(12, 14) | 0;
  } else if (tag === 'utctime') {
    var year = str.slice(0, 2) | 0;
    var mon = str.slice(2, 4) | 0;
    var day = str.slice(4, 6) | 0;
    var hour = str.slice(6, 8) | 0;
    var min = str.slice(8, 10) | 0;
    var sec = str.slice(10, 12) | 0;
    if (year < 70)
      year = 2000 + year;
    else
      year = 1900 + year;
  } else {
    return this.error('Decoding ' + tag + ' time is not supported yet');
  }

  return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
};

DERNode.prototype._decodeNull = function decodeNull(buffer) {
  return null;
};

DERNode.prototype._decodeBool = function decodeBool(buffer) {
  var res = buffer.readUInt8();
  if (buffer.isError(res))
    return res;
  else
    return res !== 0;
};

DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
  var res = 0;

  // Bigint, return as it is (assume big endian)
  var raw = buffer.raw();
  if (raw.length > 3)
    return new bignum(raw);

  while (!buffer.isEmpty()) {
    res <<= 8;
    var i = buffer.readUInt8();
    if (buffer.isError(i))
      return i;
    res |= i;
  }

  if (values)
    res = values[res] || res;

  return res;
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getDecoder('der').tree;
};

// Utility methods

function derDecodeTag(buf, fail) {
  var tag = buf.readUInt8(fail);
  if (buf.isError(tag))
    return tag;

  var cls = der.tagClass[tag >> 6];
  var primitive = (tag & 0x20) === 0;

  // Multi-octet tag - load
  if ((tag & 0x1f) === 0x1f) {
    var oct = tag;
    tag = 0;
    while ((oct & 0x80) === 0x80) {
      oct = buf.readUInt8(fail);
      if (buf.isError(oct))
        return oct;

      tag <<= 7;
      tag |= oct & 0x7f;
    }
  } else {
    tag &= 0x1f;
  }
  var tagStr = der.tag[tag];

  return {
    cls: cls,
    primitive: primitive,
    tag: tag,
    tagStr: tagStr
  };
}

function derDecodeLen(buf, primitive, fail) {
  var len = buf.readUInt8(fail);
  if (buf.isError(len))
    return len;

  // Indefinite form
  if (!primitive && len === 0x80)
    return null;

  // Definite form
  if ((len & 0x80) === 0) {
    // Short form
    return len;
  }

  // Long form
  var num = len & 0x7f;
  if (num >= 4)
    return buf.error('length octect is too long');

  len = 0;
  for (var i = 0; i < num; i++) {
    len <<= 8;
    var j = buf.readUInt8(fail);
    if (buf.isError(j))
      return j;
    len |= j;
  }

  return len;
}

},{"../../asn1":63,"util":164}],72:[function(require,module,exports){
var decoders = exports;

decoders.der = require('./der');

},{"./der":71}],73:[function(require,module,exports){
var util = require('util');
var Buffer = require('buffer').Buffer;

var asn1 = require('../../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DEREncoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DEREncoder;

DEREncoder.prototype.encode = function encode(data, reporter) {
  return this.tree._encode(data, reporter).join();
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
util.inherits(DERNode, base.Node);

DERNode.prototype._encodeComposite = function encodeComposite(tag,
                                                              primitive,
                                                              cls,
                                                              content) {
  var encodedTag = encodeTag(tag, primitive, cls, this.reporter);

  // Short form
  if (content.length < 0x80) {
    var header = new Buffer(2);
    header[0] = encodedTag;
    header[1] = content.length;
    return this._createEncoderBuffer([ header, content ]);
  }

  // Long form
  // Count octets required to store length
  var lenOctets = 1;
  for (var i = content.length; i >= 0x100; i >>= 8)
    lenOctets++;

  var header = new Buffer(1 + 1 + lenOctets);
  header[0] = encodedTag;
  header[1] = 0x80 | lenOctets;

  for (var i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
    header[i] = j & 0xff;

  return this._createEncoderBuffer([ header, content ]);
};

DERNode.prototype._encodeStr = function encodeStr(str, tag) {
  if (tag === 'octstr')
    return this._createEncoderBuffer(str);
  else if (tag === 'bitstr')
    return this._createEncoderBuffer([ str.unused | 0, str.data ]);
  else if (tag === 'ia5str')
    return this._createEncoderBuffer(str);
  return this.reporter.error('Encoding of string type: ' + tag +
                             ' unsupported');
};

DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
  if (typeof id === 'string') {
    if (!values)
      return this.reporter.error('string objid given, but no values map found');
    if (!values.hasOwnProperty(id))
      return this.reporter.error('objid not found in values map');
    id = values[id].split(/\s+/g);
    for (var i = 0; i < id.length; i++)
      id[i] |= 0;
  } else if (Array.isArray(id)) {
    id = id.slice();
  }

  if (!Array.isArray(id)) {
    return this.reporter.error('objid() should be either array or string, ' +
                               'got: ' + JSON.stringify(id));
  }

  if (!relative) {
    if (id[1] >= 40)
      return this.reporter.error('Second objid identifier OOB');
    id.splice(0, 2, id[0] * 40 + id[1]);
  }

  // Count number of octets
  var size = 0;
  for (var i = 0; i < id.length; i++) {
    var ident = id[i];
    for (size++; ident >= 0x80; ident >>= 7)
      size++;
  }

  var objid = new Buffer(size);
  var offset = objid.length - 1;
  for (var i = id.length - 1; i >= 0; i--) {
    var ident = id[i];
    objid[offset--] = ident & 0x7f;
    while ((ident >>= 7) > 0)
      objid[offset--] = 0x80 | (ident & 0x7f);
  }

  return this._createEncoderBuffer(objid);
};

function two(num) {
  if (num <= 10)
    return '0' + num;
  else
    return num;
}

DERNode.prototype._encodeTime = function encodeTime(time, tag) {
  var str;
  var date = new Date(time);

  if (tag === 'gentime') {
    str = [
      date.getFullYear(),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else if (tag === 'utctime') {
    str = [
      date.getFullYear() % 100,
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else {
    this.reporter.error('Encoding ' + tag + ' time is not supported yet');
  }

  return this._encodeStr(str, 'octstr');
};

DERNode.prototype._encodeNull = function encodeNull() {
  return this._createEncoderBuffer('');
};

DERNode.prototype._encodeInt = function encodeInt(num, values) {
  if (typeof num === 'string') {
    if (!values)
      return this.reporter.error('String int or enum given, but no values map');
    if (!values.hasOwnProperty(num)) {
      return this.reporter.error('Values map doesn\'t contain: ' +
                                 JSON.stringify(num));
    }
    num = values[num];
  }

  // Bignum, assume big endian
  if (bignum !== null && num instanceof bignum) {
    var numArray = num.toArray();
    if(num.sign === false && numArray[0] & 0x80) {
      numArray.unshift(0);
    }
    num = new Buffer(numArray);
  }

  if (Buffer.isBuffer(num)) {
    var size = num.length;
    if (num.length === 0)
      size++;

    var out = new Buffer(size);
    num.copy(out);
    if (num.length === 0)
      out[0] = 0
    return this._createEncoderBuffer(out);
  }

  if (num < 0x80)
    return this._createEncoderBuffer(num);

  if (num < 0x100)
    return this._createEncoderBuffer([0, num]);

  var size = 1;
  for (var i = num; i >= 0x100; i >>= 8)
    size++;

  var out = new Array(size);
  for (var i = out.length - 1; i >= 0; i--) {
    out[i] = num & 0xff;
    num >>= 8;
  }
  if(out[0] & 0x80) {
    out.unshift(0);
  }

  return this._createEncoderBuffer(new Buffer(out));
};

DERNode.prototype._encodeBool = function encodeBool(value) {
  return this._createEncoderBuffer(value ? 0xff : 0);
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getEncoder('der').tree;
};

DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
  var state = this._baseState;
  var i;
  if (state['default'] === null)
    return false;

  var data = dataBuffer.join();
  if (state.defaultBuffer === undefined)
    state.defaultBuffer = this._encodeValue(state['default'], reporter, parent).join();

  if (data.length !== state.defaultBuffer.length)
    return false;

  for (i=0; i < data.length; i++)
    if (data[i] !== state.defaultBuffer[i])
      return false;

  return true;
};

// Utility methods

function encodeTag(tag, primitive, cls, reporter) {
  var res;

  if (tag === 'seqof')
    tag = 'seq';
  else if (tag === 'setof')
    tag = 'set';

  if (der.tagByName.hasOwnProperty(tag))
    res = der.tagByName[tag];
  else if (typeof tag === 'number' && (tag | 0) === tag)
    res = tag;
  else
    return reporter.error('Unknown tag: ' + tag);

  if (res >= 0x1f)
    return reporter.error('Multi-octet tag encoding unsupported');

  if (!primitive)
    res |= 0x20;

  res |= (der.tagClassByName[cls || 'universal'] << 6);

  return res;
}

},{"../../asn1":63,"buffer":7,"util":164}],74:[function(require,module,exports){
var encoders = exports;

encoders.der = require('./der');

},{"./der":73}],75:[function(require,module,exports){
exports.strip = function strip(artifact) {
  artifact = artifact.toString()
  var startRegex = /^-----BEGIN (.*)-----\n/;
  var match = startRegex.exec(artifact);
  var tag = match[1];
  var endRegex = new RegExp("\n-----END " + tag + "-----(\n*)$");
  var base64 = artifact.slice(match[0].length).replace(endRegex, "").replace(/\n/g, "");
  return {tag: tag, base64: base64};
};

// http://stackoverflow.com/a/7033705
var wrap = function wrap(str, l) {
  var chunks = [];
  while (str) {
    if (str.length < l) {
      chunks.push(str);
      break;
    }
    else {
      chunks.push(str.substr(0, l));
      str = str.substr(l);
    }
  }
  return chunks.join("\n");
}

exports.assemble = function assemble(info) {
  var tag = info.tag;
  var base64 = info.base64;
  var startLine = "-----BEGIN " + tag + "-----";
  var endLine = "-----END " + tag + "-----";
  return startLine + "\n" + wrap(base64, 64) + "\n" + endLine + "\n";
}
},{}],76:[function(require,module,exports){
(function (Buffer){
// much of this based on https://github.com/indutny/self-signed/blob/gh-pages/lib/rsa.js
var parseKeys = require('parse-asn1');
var bn = require('bn.js');
var elliptic = require('elliptic');
module.exports = sign;
function sign(hash, key, crypto) {
  var priv = parseKeys(key, crypto);
  if (priv.curve) {
    return ecSign(hash, priv, crypto);
  } else if (priv.type === 'dsa') {
    return dsaSign(hash, priv, crypto);
  }
  var len = priv.modulus.byteLength();
  var pad = [ 0, 1 ];
  while (hash.length + pad.length + 1 < len) {
    pad.push(0xff);
  }
  pad.push(0x00);
  var i = -1;
  while (++i < hash.length) {
    pad.push(hash[i]);
  }
  
  var out = crt(pad, priv);
  if (out.length < len) {
    var prefix = new Buffer(len - out.length);
    prefix.fill(0);
    out = Buffer.concat([prefix, out], len);
  }
  return out;
}
function crt(msg, priv) {
  var c1 = new bn(msg).toRed(bn.mont(priv.prime1));
  var c2 = new bn(msg).toRed(bn.mont(priv.prime2));
  var qinv = new bn(priv.coefficient);
  var p = new bn(priv.prime1);
  var q = new bn(priv.prime2);
  var m1 = c1.redPow(priv.exponent1);
  var m2 = c2.redPow(priv.exponent2);
  m1 = m1.fromRed();
  m2 = m2.fromRed();
  var h = m1.isub(m2).imul(qinv).mod(p);
  h.imul(q);
  m2.iadd(h);
  return new Buffer(m2.toArray());
}
function ecSign(hash, priv, crypto) {
  elliptic.rand = crypto.randomBytes;
  var curve;
  if (priv.curve.join('.')  === '1.3.132.0.10') {
    curve = new elliptic.ec('secp256k1');
  }
  var key = curve.genKeyPair();
  key._importPrivate(priv.privateKey);
  var out = key.sign(hash);
  return new Buffer(out.toDER());
}
function dsaSign(hash, priv, crypto) {
  var x = priv.params.priv_key;
  var p = priv.params.p;
  var q = priv.params.q;
  var montq = bn.mont(q);
  var g = priv.params.g;
  var r = new bn(0);
  var k;
  var H = new bn(hash);
  var s = false;
  while (s === false) {
    while (!r.cmpn(0)) {
      k = getKay(q, crypto);
      r = makeR(g, k, p, q);
    }
    s = k.invm(q).imul(H.add(x.imul(r).mod(q)).mod(q)).mod(q);
    if (!s.cmpn(0)) {
      s = false;
      r = new bn(0);
    }
  }
  return toDER(r,s);
}
function toDER(r, s) {
  r = r.toArray();
  s = s.toArray();

  // Pad values
  if (r[0] & 0x80)
    r = [ 0 ].concat(r);
  // Pad values
  if (s[0] & 0x80)
    s = [ 0 ].concat(s);

  var total = r.length + s.length + 4;
  var res = [ 0x30, total, 0x02, r.length ];
  res = res.concat(r, [ 0x02, s.length ], s);
  return new Buffer(res);
}
function getKay(q, crypto) {
  var k = new bn(crypto.randomBytes(q.byteLength()));
  while (k.cmp(q) >= 0) {
    k = new bn(crypto.randomBytes(q.byteLength()));
  }
  return k;
}
function makeR(g, k, p, q) {
  return g.toRed(bn.mont(p)).redPow(k).fromRed().mod(q);
}
}).call(this,require("buffer").Buffer)
},{"bn.js":36,"buffer":7,"elliptic":37,"parse-asn1":61}],77:[function(require,module,exports){
(function (Buffer){
// much of this based on https://github.com/indutny/self-signed/blob/gh-pages/lib/rsa.js
var parseKeys = require('parse-asn1');
var elliptic = require('elliptic');
var bn = require('bn.js');
module.exports = verify;
function verify(sig, hash, key) {
  var pub = parseKeys(key);
  if (pub.type === 'ec') {
    return ecVerify(sig, hash, pub);
  } else if (pub.type === 'dsa') {
    return dsaVerify(sig, hash, pub);
  }
  var len = pub.modulus.byteLength();
  var pad = [ 0, 1 ];
  while (hash.length + pad.length + 1 < len) {
    pad.push(0xff);
  }
  pad.push(0x00);
  var i = -1;
  while (++i < hash.length) {
    pad.push(hash[i]);
  }
  pad = hash;
  var red = bn.mont(pub.modulus);
  sig = new bn(sig).toRed(red);

  sig = sig.redPow(new bn(pub.publicExponent));

  sig = new Buffer(sig.fromRed().toArray());
  sig = sig.slice(sig.length - hash.length);
  var out = 0;
  len = sig.length;
  i = -1;
  while (++i < len) {
    out += (sig[i] ^ hash[i]);
  }
  return !out;
}
function ecVerify(sig, hash, pub) {
  var curve;
  if (pub.data.algorithm.curve.join('.')  === '1.3.132.0.10') {
    curve = new elliptic.ec('secp256k1');
  }
  var pubkey = pub.data.subjectPrivateKey.data;
  return curve.verify(hash.toString('hex'), sig.toString('hex'), pubkey.toString('hex'));
}
function dsaVerify(sig, hash, pub) {
  var p = pub.data.p;
  var q = pub.data.q;
  var g = pub.data.g;
  var y = pub.data.pub_key;
  var unpacked = parseKeys.signature.decode(sig, 'der');
  var s = unpacked.s;
  var r = unpacked.r;
  checkValue(s, q);
  checkValue(r, q);
  var montq = bn.mont(q);
  var montp = bn.mont(p);
  var w =  s.invm(q);
  var v = g.toRed(montp)
  .redPow(new bn(hash).mul(w).mod(q))
  .fromRed()
  .mul(
    y.toRed(montp)
    .redPow(r.mul(w).mod(q))
    .fromRed()
  ).mod(p).mod(q);
  return !v.cmp(r);
}
function checkValue(b, q) {
  if (b.cmpn(0) <= 0) {
    throw new Error('invalid sig');
  }
  if (b.cmp(q) >= q) {
    throw new Error('invalid sig');
  }
}
}).call(this,require("buffer").Buffer)
},{"bn.js":36,"buffer":7,"elliptic":37,"parse-asn1":61}],78:[function(require,module,exports){
(function (Buffer){
var elliptic = require('elliptic');
var BN = require('bn.js');
module.exports = ECDH;

function ECDH(curve, crypto) {
	elliptic.rand = crypto.randomBytes;
	this.curve = new elliptic.ec(curve);
	this.keys = void 0;
}
ECDH.prototype.generateKeys = function (enc, format) {
	this.keys = this.curve.genKeyPair();
	return this.getPublicKey(enc, format);
};

ECDH.prototype.computeSecret = function (other, inenc, enc) {
	inenc = inenc || 'utf8';
	if (!Buffer.isBuffer(other)) {
		other = new Buffer(other, inenc);
	}
	other = new BN(other);
	other = other.toString(16);
	var otherPub = this.curve.keyPair(other, 'hex').getPublic();
	var out = otherPub.mul(this.keys.getPrivate()).getX();
	return returnValue(out, enc);
};
ECDH.prototype.getPublicKey = function (enc, format) {
	var key = this.keys.getPublic(format === 'compressed', true);
	if (format === 'hybrid') {
		if (key[key.length - 1] % 2) {
			key[0] = 7;
		} else {
			key [0] = 6;
		}
	}
	return returnValue(key, enc);
};
ECDH.prototype.getPrivateKey = function (enc) {
	return returnValue(this.keys.getPrivate(), enc);
};

ECDH.prototype.setPublicKey = function (pub, enc) {
	enc = enc || 'utf8';
	if (!Buffer.isBuffer(pub)) {
		pub = new Buffer(pub, enc);
	}
	var pkey = new BN(pub);
	pkey = pkey.toArray();
	this.keys._importPublicHex(pkey);
};
ECDH.prototype.setPrivateKey = function (priv, enc) {
	enc = enc || 'utf8';
	if (!Buffer.isBuffer(priv)) {
		priv = new Buffer(priv, enc);
	}
	var _priv = new BN(priv);
	_priv = _priv.toString(16);
	this.keys._importPrivate(_priv);
};
function returnValue(bn, enc) {
	if (!Array.isArray(bn)) {
		bn = bn.toArray();
	}
	var buf = new Buffer(bn);
	if (!enc) {
		return buf;
	} else {
		return buf.toString(enc);
	}
}
}).call(this,require("buffer").Buffer)
},{"bn.js":80,"buffer":7,"elliptic":81}],79:[function(require,module,exports){
var ECDH = require('./ecdh');
module.exports = function (crypto, exports) {
	exports.createECDH = function (curve) {
		return new ECDH(curve, crypto);
	};
};
},{"./ecdh":78}],80:[function(require,module,exports){
module.exports=require(36)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/bn.js/lib/bn.js":36}],81:[function(require,module,exports){
module.exports=require(37)
},{"../package.json":100,"./elliptic/curve":84,"./elliptic/curves":87,"./elliptic/ec":88,"./elliptic/hmac-drbg":91,"./elliptic/utils":92,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic.js":37,"brorand":93}],82:[function(require,module,exports){
module.exports=require(38)
},{"../../elliptic":81,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curve/base.js":38,"assert":5,"bn.js":80}],83:[function(require,module,exports){
module.exports=require(39)
},{"../../elliptic":81,"../curve":84,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curve/edwards.js":39,"assert":5,"bn.js":80,"inherits":147}],84:[function(require,module,exports){
module.exports=require(40)
},{"./base":82,"./edwards":83,"./mont":85,"./short":86,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curve/index.js":40}],85:[function(require,module,exports){
module.exports=require(41)
},{"../../elliptic":81,"../curve":84,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curve/mont.js":41,"assert":5,"bn.js":80,"inherits":147}],86:[function(require,module,exports){
module.exports=require(42)
},{"../../elliptic":81,"../curve":84,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curve/short.js":42,"assert":5,"bn.js":80,"inherits":147}],87:[function(require,module,exports){
module.exports=require(43)
},{"../elliptic":81,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/curves.js":43,"assert":5,"bn.js":80,"hash.js":94}],88:[function(require,module,exports){
module.exports=require(44)
},{"../../elliptic":81,"./key":89,"./signature":90,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/ec/index.js":44,"assert":5,"bn.js":80}],89:[function(require,module,exports){
module.exports=require(45)
},{"../../elliptic":81,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/ec/key.js":45,"assert":5,"bn.js":80}],90:[function(require,module,exports){
module.exports=require(46)
},{"../../elliptic":81,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/ec/signature.js":46,"assert":5,"bn.js":80}],91:[function(require,module,exports){
module.exports=require(47)
},{"../elliptic":81,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/hmac-drbg.js":47,"assert":5,"hash.js":94}],92:[function(require,module,exports){
module.exports=require(48)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/lib/elliptic/utils.js":48,"assert":5,"bn.js":80}],93:[function(require,module,exports){
module.exports=require(49)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/brorand/index.js":49}],94:[function(require,module,exports){
module.exports=require(50)
},{"./hash/common":95,"./hash/hmac":96,"./hash/ripemd":97,"./hash/sha":98,"./hash/utils":99,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash.js":50}],95:[function(require,module,exports){
module.exports=require(51)
},{"../hash":94,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash/common.js":51}],96:[function(require,module,exports){
module.exports=require(52)
},{"../hash":94,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash/hmac.js":52}],97:[function(require,module,exports){
module.exports=require(53)
},{"../hash":94,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash/ripemd.js":53}],98:[function(require,module,exports){
module.exports=require(54)
},{"../hash":94,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash/sha.js":54}],99:[function(require,module,exports){
module.exports=require(55)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/hash.js/lib/hash/utils.js":55}],100:[function(require,module,exports){
module.exports=require(56)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/package.json":56}],101:[function(require,module,exports){
(function (Buffer){
var BN = require('bn.js');
var MillerRabin = require('miller-rabin');
var millerRabin = new MillerRabin();
var TWENTYFOUR = new BN(24);
var ELEVEN = new BN(11);
var TEN = new BN(10);
var THREE = new BN(3);
var SEVEN = new BN(7);
var primes = require('./generatePrime');
module.exports = DH;
function setPublicKey(pub, enc) {
	enc = enc || 'utf8';
	if (!Buffer.isBuffer(pub)) {
		pub = new Buffer(pub, enc);
	}
	this._pub = new BN(pub);
}
function setPrivateKey(priv, enc) {
	enc = enc || 'utf8';
	if (!Buffer.isBuffer(priv)) {
		priv = new Buffer(priv, enc);
	}
	this._priv = new BN(priv);
}
var primeCache = {};
function checkPrime(prime, generator) {
	var gen = generator.toString('hex');
	var hex = [gen, prime.toString(16)].join('_');
	if (hex in primeCache) {
		return primeCache[hex];
	}
	var error = 0;
	
	if (prime.isEven() ||
		!primes.simpleSieve ||
		!primes.fermatTest(prime) ||
		!millerRabin.test(prime)) {
		//not a prime so +1
		error += 1;
		
		if (gen === '02' || gen === '05') {
			// we'd be able to check the generator
			// it would fail so +8
			error += 8;
		} else {
			//we wouldn't be able to test the generator
			// so +4
			error += 4;
		}
		primeCache[hex] = error;
		return error;
	}
	if (!millerRabin.test(prime.shrn(1))) {
		//not a safe prime
		error += 2;
	}
	var gen = generator.toString('hex');
	var rem;
	switch (gen) {
		case '02':
		  if (prime.mod(TWENTYFOUR).cmp(ELEVEN)) {
		  	// unsuidable generator
		  	error += 8;
		  }
		  break;
		case '05':
		  rem = prime.mod(TEN);
		  if (rem.cmp(THREE) && rem.cmp(SEVEN)) {
		  	// prime mod 10 needs to equal 3 or 7
		  	error += 8;
		  } 
		  break;
		default: 
		  error += 4;
	}
	primeCache[hex] = error;
	return error;
}
function defineError (self, error) {
	try {
		Object.defineProperty(self, 'verifyError', {
	    enumerable: true,
	    value: error,
	    writable: false
	  });
	} catch(e) {
		self.verifyError = error;
	}
}
function DH(prime, generator,crypto, malleable) {
	this.setGenerator(generator);
	this.__prime = new BN(prime);
	this._prime = BN.mont(this.__prime);
	this._pub = void 0;
	this._priv = void 0;
	
	if (malleable) {
		this.setPublicKey = setPublicKey;
		this.setPrivateKey = setPrivateKey;
		defineError(this, checkPrime(this.__prime, generator));
	} else {
		defineError(this, 8);
	}
	this._makeNum = function makeNum() {
		return crypto.randomBytes(192);
	};
}
DH.prototype.generateKeys = function () {
	if (!this._priv) {
		this._priv = new BN(this._makeNum());
	}
	this._pub = this._gen.toRed(this._prime).redPow(this._priv).fromRed();
	return this.getPublicKey();
};

DH.prototype.computeSecret = function (other) {
	other = new BN(other);
	other = other.toRed(this._prime);
	var secret = other.redPow(this._priv).fromRed();
	var out = new Buffer(secret.toArray());
	var prime = this.getPrime();
	if (out.length < prime.length) {
		var front = new Buffer(prime.length - out.length);
		front.fill(0);
		out = Buffer.concat([front, out]);
	}
	return out;
};
DH.prototype.getPublicKey = function getPublicKey(enc) {
	return returnValue(this._pub, enc);
};
DH.prototype.getPrivateKey = function getPrivateKey(enc) {
	return returnValue(this._priv, enc);
};

DH.prototype.getPrime = function (enc) {
	return returnValue(this.__prime, enc);
};
DH.prototype.getGenerator = function (enc) {
	return returnValue(this._gen, enc);
};
DH.prototype.setGenerator = function (gen, enc) {
	enc = enc || 'utf8';
	if (!Buffer.isBuffer(gen)) {
		gen = new Buffer(gen, enc);
	}
	this._gen = new BN(gen);
};

function returnValue(bn, enc) {
	var buf = new Buffer(bn.toArray());
	if (!enc) {
		return buf;
	} else {
		return buf.toString(enc);
	}
}
}).call(this,require("buffer").Buffer)
},{"./generatePrime":102,"bn.js":104,"buffer":7,"miller-rabin":105}],102:[function(require,module,exports){

module.exports = findPrime;
findPrime.simpleSieve = simpleSieve;
findPrime.fermatTest = fermatTest;
var BN = require('bn.js');
var TWENTYFOUR = new BN(24);
var MillerRabin = require('miller-rabin');
var millerRabin = new MillerRabin();
var ONE = new BN(1);
var TWO = new BN(2);
var FIVE = new BN(5);
var SIXTEEN = new BN(16);
var EIGHT = new BN(8);
var TEN = new BN(10);
var THREE = new BN(3);
var SEVEN = new BN(7);
var ELEVEN = new BN(11);
var FOUR = new BN(4);
var TWELVE = new BN(12);
var primes = null;

function _getPrimes() {
  if (primes !== null)
    return primes;

  var limit = 0x100000;
  var res = [];
  res[0] = 2;
  for (var i = 1, k = 3; k < limit; k += 2) {
    var sqrt = Math.ceil(Math.sqrt(k));
    for (var j = 0; j < i && res[j] <= sqrt; j++)
      if (k % res[j] === 0)
        break;

    if (i !== j && res[j] <= sqrt)
      continue;

    res[i++] = k;
  }
  primes = res;
  return res;
}
function simpleSieve(p) {
  var primes = _getPrimes();

  for (var i = 0; i < primes.length; i++)
    if (p.modn(primes[i]) === 0)
      return false;

  return true;
}
function fermatTest(p) {
  var red = BN.mont(p);
  return TWO.toRed(red).redPow(p.subn(1)).fromRed().cmpn(1) === 0;
}
function findPrime(bits, gen ,crypto) {
  gen = new BN(gen);
  var runs, comp;
  function generateRandom(bits) {
    runs = -1;
    var r = crypto.randomBytes(Math.ceil(bits / 8));
    r[0] |= 0xc0;
    r[r.length - 1] |= 3;
    var rem;
    var out = new BN(r);
    if (!gen.cmp(TWO)) {
      while (out.mod(TWENTYFOUR).cmp(ELEVEN)) {
        out.iadd(FOUR);
      }
      comp = {
        major: [TWENTYFOUR],
        minor: [TWELVE]
      };
    } else if (!gen.cmp(FIVE)) {
      rem = out.mod(TEN);
      while (rem.cmp(THREE)) {
        out.iadd(FOUR);
        rem = out.mod(TEN);
      }
      comp = {
        major: [FOUR, SIXTEEN],
        minor: [TWO, EIGHT]
      };
    } else {
      comp = {
        major: [FOUR],
        minor: [TWO]
      }
    }
    return out;
  }
  var num = generateRandom(bits);



  var n2 = num.shrn(1);

  while (true) {
    if (num.bitLength() > bits) {
      num = generateRandom(bits);
      n2 = num.shrn(1);
    }
    runs++;
    if (simpleSieve(n2) &&
      fermatTest(n2) &&
      millerRabin.test(n2) &&
      simpleSieve(num) &&
      fermatTest(num) &&
      millerRabin.test(num)) {
      return num;
    }
    num.iadd(comp.major[runs%comp.major.length]);
    n2.iadd(comp.minor[runs%comp.minor.length]);
  }

}
},{"bn.js":104,"miller-rabin":105}],103:[function(require,module,exports){
(function (Buffer){
var primes = require('./primes.json');
var DH = require('./dh');
var generatePrime = require('./generatePrime');
module.exports = function (crypto, exports) {
	exports.DiffieHellmanGroup =
    exports.createDiffieHellmanGroup =
    exports.getDiffieHellman = DiffieHellmanGroup;
	function DiffieHellmanGroup(mod) {
		return new DH(new Buffer(primes[mod].prime, 'hex'),
			new Buffer(primes[mod].gen, 'hex'), crypto);
	}
	exports.createDiffieHellman = exports.DiffieHellman = DiffieHellman;
	function DiffieHellman(prime, enc, generator, genc) {
		
		if (Buffer.isBuffer(enc) ||
			(typeof enc === 'string' && ['hex', 'binary', 'base64'].indexOf(enc) === -1)) {
			genc = generator;
			generator = enc
			enc = void 0;
		}
		enc = enc || 'binary';
		genc = genc || 'binary';
		generator = generator || new Buffer([2]);
		if (!Buffer.isBuffer(generator)) {
			generator = new Buffer(generator, genc);
		}
		if (typeof prime === 'number') {
			return new DH(generatePrime(prime, generator, crypto), generator, crypto, true);
		}
		if (!Buffer.isBuffer(prime)) {
			prime = new Buffer(prime, enc);
		}
		
		return new DH(prime, generator, crypto, true);
	};
}
}).call(this,require("buffer").Buffer)
},{"./dh":101,"./generatePrime":102,"./primes.json":107,"buffer":7}],104:[function(require,module,exports){
module.exports=require(36)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/bn.js/lib/bn.js":36}],105:[function(require,module,exports){
var bn = require('bn.js');
var brorand = require('brorand');

function MillerRabin(rand) {
  this.rand = rand || new brorand.Rand();
}
module.exports = MillerRabin;

MillerRabin.create = function create(rand) {
  return new MillerRabin(rand);
};

MillerRabin.prototype._rand = function _rand(n) {
  var len = n.bitLength();
  var buf = this.rand.generate(Math.ceil(len / 8));

  // Set low bits
  buf[0] |= 3;

  // Mask high bits
  var mask = len & 0x7;
  if (mask !== 0)
    buf[buf.length - 1] >>= 7 - mask;

  return new bn(buf);
}

MillerRabin.prototype.test = function test(n, k, cb) {
  var len = n.bitLength();
  var red = bn.mont(n);
  var rone = new bn(1).toRed(red);

  if (!k)
    k = Math.max(1, (len / 48) | 0);

  // Find d and s, (n - 1) = (2 ^ s) * d;
  var n1 = n.subn(1);
  var n2 = n1.subn(1);
  for (var s = 0; !n1.testn(s); s++) {}
  var d = n.shrn(s);

  var rn1 = n1.toRed(red);

  var prime = true;
  for (; k > 0; k--) {
    var a = this._rand(n2);
    if (cb)
      cb(a);

    var x = a.toRed(red).redPow(d);
    if (x.cmp(rone) === 0 || x.cmp(rn1) === 0)
      continue;

    for (var i = 1; i < s; i++) {
      x = x.redSqr();

      if (x.cmp(rone) === 0)
        return false;
      if (x.cmp(rn1) === 0)
        break;
    }

    if (i === s)
      return false;
  }

  return prime;
};

MillerRabin.prototype.getDivisor = function getDivisor(n, k) {
  var len = n.bitLength();
  var red = bn.mont(n);
  var rone = new bn(1).toRed(red);

  if (!k)
    k = Math.max(1, (len / 48) | 0);

  // Find d and s, (n - 1) = (2 ^ s) * d;
  var n1 = n.subn(1);
  var n2 = n1.subn(1);
  for (var s = 0; !n1.testn(s); s++) {}
  var d = n.shrn(s);

  var rn1 = n1.toRed(red);

  var prime = true;
  for (; k > 0; k--) {
    var a = this._rand(n2);

    var g = n.gcd(a);
    if (g.cmpn(1) !== 0)
      return g;

    var x = a.toRed(red).redPow(d);
    if (x.cmp(rone) === 0 || x.cmp(rn1) === 0)
      continue;

    for (var i = 1; i < s; i++) {
      x = x.redSqr();

      if (x.cmp(rone) === 0)
        return x.fromRed().subn(1).gcd(n);
      if (x.cmp(rn1) === 0)
        break;
    }

    if (i === s) {
      x = x.redSqr();
      return x.fromRed().subn(1).gcd(n);
    }
  }

  return prime;
};

},{"bn.js":104,"brorand":106}],106:[function(require,module,exports){
module.exports=require(49)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/elliptic/node_modules/brorand/index.js":49}],107:[function(require,module,exports){
module.exports={
    "modp1": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a63a3620ffffffffffffffff"
    },
    "modp2": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece65381ffffffffffffffff"
    },
    "modp5": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"
    },
    "modp14": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff"
    },
    "modp15": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a93ad2caffffffffffffffff"
    },
    "modp16": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c934063199ffffffffffffffff"
    },
    "modp17": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dcc4024ffffffffffffffff"
    },
    "modp18": {
        "gen": "02",
        "prime": "ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dbe115974a3926f12fee5e438777cb6a932df8cd8bec4d073b931ba3bc832b68d9dd300741fa7bf8afc47ed2576f6936ba424663aab639c5ae4f5683423b4742bf1c978238f16cbe39d652de3fdb8befc848ad922222e04a4037c0713eb57a81a23f0c73473fc646cea306b4bcbc8862f8385ddfa9d4b7fa2c087e879683303ed5bdd3a062b3cf5b3a278a66d2a13f83f44f82ddf310ee074ab6a364597e899a0255dc164f31cc50846851df9ab48195ded7ea1b1d510bd7ee74d73faf36bc31ecfa268359046f4eb879f924009438b481c6cd7889a002ed5ee382bc9190da6fc026e479558e4475677e9aa9e3050e2765694dfc81f56e880b96e7160c980dd98edd3dfffffffffffffffff"
    }
}
},{}],108:[function(require,module,exports){
(function (Buffer){
module.exports = function(crypto) {
  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
    if ('function' === typeof digest) {
      callback = digest
      digest = undefined
    }

    if ('function' !== typeof callback)
      throw new Error('No callback provided to pbkdf2')

    setTimeout(function() {
      var result

      try {
        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
      } catch (e) {
        return callback(e)
      }

      callback(undefined, result)
    })
  }

  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
    if ('number' !== typeof iterations)
      throw new TypeError('Iterations not a number')

    if (iterations < 0)
      throw new TypeError('Bad iterations')

    if ('number' !== typeof keylen)
      throw new TypeError('Key length not a number')

    if (keylen < 0)
      throw new TypeError('Bad key length')

    digest = digest || 'sha1'

    if (!Buffer.isBuffer(password)) password = new Buffer(password)
    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

    var hLen, l = 1, r, T
    var DK = new Buffer(keylen)
    var block1 = new Buffer(salt.length + 4)
    salt.copy(block1, 0, 0, salt.length)

    for (var i = 1; i <= l; i++) {
      block1.writeUInt32BE(i, salt.length)

      var U = crypto.createHmac(digest, password).update(block1).digest()

      if (!hLen) {
        hLen = U.length
        T = new Buffer(hLen)
        l = Math.ceil(keylen / hLen)
        r = keylen - (l - 1) * hLen

        if (keylen > (Math.pow(2, 32) - 1) * hLen)
          throw new TypeError('keylen exceeds maximum length')
      }

      U.copy(T, 0, 0, hLen)

      for (var j = 1; j < iterations; j++) {
        U = crypto.createHmac(digest, password).update(U).digest()

        for (var k = 0; k < hLen; k++) {
          T[k] ^= U[k]
        }
      }

      var destPos = (i - 1) * hLen
      var len = (i == l ? r : hLen)
      T.copy(DK, destPos, 0, len)
    }

    return DK
  }

  return {
    pbkdf2: pbkdf2,
    pbkdf2Sync: pbkdf2Sync
  }
}

}).call(this,require("buffer").Buffer)
},{"buffer":7}],109:[function(require,module,exports){

module.exports = function (exports, crypto) {
  exports.publicEncrypt = require('./publicEncrypt')(crypto);
  exports.privateDecrypt = require('./privateDecrypt')(crypto);
};
},{"./privateDecrypt":132,"./publicEncrypt":133}],110:[function(require,module,exports){
(function (Buffer){
module.exports = function (seed, len, crypto) {
  var t = new Buffer('');
  var  i = 0, c;
  while (t.length < len) {
    c = i2ops(i++);
    t = Buffer.concat([t, crypto.createHash('sha1').update(seed).update(c).digest()]);
  }
  return t.slice(0, len);
};

function i2ops(c) {
  var out = new Buffer(4);
  out.writeUInt32BE(c,0);
  return out;
}
}).call(this,require("buffer").Buffer)
},{"buffer":7}],111:[function(require,module,exports){
// Utils

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
}

// Could use `inherits` module, but don't want to move from single file
// architecture yet.
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  var TempCtor = function () {}
  TempCtor.prototype = superCtor.prototype
  ctor.prototype = new TempCtor()
  ctor.prototype.constructor = ctor
}

// BN

function BN(number, base, endian) {
  // May be `new BN(bn)` ?
  if (number !== null &&
      typeof number === 'object' &&
      Array.isArray(number.words)) {
    return number;
  }

  this.sign = false;
  this.words = null;
  this.length = 0;

  // Reduction context
  this.red = null;

  if (base === 'le' || base === 'be') {
    endian = base;
    base = 10;
  }

  if (number !== null)
    this._init(number || 0, base || 10, endian || 'be');
}
if (typeof module === 'object')
  module.exports = BN;

BN.BN = BN;
BN.wordSize = 26;

BN.prototype._init = function init(number, base, endian) {
  if (typeof number === 'number') {
    if (number < 0) {
      this.sign = true;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    }
    return;
  } else if (typeof number === 'object') {
    return this._initArray(number, base, endian);
  }
  if (base === 'hex')
    base = 16;
  assert(base === (base | 0) && base >= 2 && base <= 36);

  number = number.toString().replace(/\s+/g, '');
  var start = 0;
  if (number[0] === '-')
    start++;

  if (base === 16)
    this._parseHex(number, start);
  else
    this._parseBase(number, base, start);

  if (number[0] === '-')
    this.sign = true;

  this.strip();
};

BN.prototype._initArray = function _initArray(number, base, endian) {
  // Perhaps a Uint8Array
  assert(typeof number.length === 'number');
  this.length = Math.ceil(number.length / 3);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  var off = 0;
  if (endian === 'be') {
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  } else if (endian === 'le') {
    for (var i = 0, j = 0; i < number.length; i += 3) {
      var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  }
  return this.strip();
};

BN.prototype._parseHex = function parseHex(number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseInt(number.slice(i, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseInt(number.slice(start, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this.strip();
};

BN.prototype._parseBase = function parseBase(number, base, start) {
  // Initialize as zero
  this.words = [ 0 ];
  this.length = 1;

  var word = 0;
  var q = 1;
  var p = 0;
  var bigQ = null;
  for (var i = start; i < number.length; i++) {
    var digit;
    var ch = number[i];
    if (base === 10 || ch <= '9')
      digit = ch | 0;
    else if (ch >= 'a')
      digit = ch.charCodeAt(0) - 97 + 10;
    else
      digit = ch.charCodeAt(0) - 65 + 10;
    word *= base;
    word += digit;
    q *= base;
    p++;

    if (q > 0xfffff) {
      assert(q <= 0x3ffffff);
      if (!bigQ)
        bigQ = new BN(q);
      this.mul(bigQ).copy(this);
      this.iadd(new BN(word));
      word = 0;
      q = 1;
      p = 0;
    }
  }
  if (p !== 0) {
    this.mul(new BN(q)).copy(this);
    this.iadd(new BN(word));
  }
};

BN.prototype.copy = function copy(dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.sign = this.sign;
  dest.red = this.red;
};

BN.prototype.clone = function clone() {
  var r = new BN(null);
  this.copy(r);
  return r;
};

// Remove leading `0` from `this`
BN.prototype.strip = function strip() {
  while (this.length > 1 && this.words[this.length - 1] === 0)
    this.length--;
  return this._normSign();
};

BN.prototype._normSign = function _normSign() {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0)
    this.sign = false;
  return this;
};

BN.prototype.inspect = function inspect() {
  return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
};

/*

var zeros = [];
var groupSizes = [];
var groupBases = [];

var s = '';
var i = -1;
while (++i < BN.wordSize) {
  zeros[i] = s;
  s += '0';
}
groupSizes[0] = 0;
groupSizes[1] = 0;
groupBases[0] = 0;
groupBases[1] = 0;
var base = 2 - 1;
while (++base < 36 + 1) {
  var groupSize = 0;
  var groupBase = 1;
  // TODO: <=
  while (groupBase < (1 << BN.wordSize) / base) {
    groupBase *= base;
    groupSize += 1;
  }
  groupSizes[base] = groupSize;
  groupBases[base] = groupBase;
}

*/

var zeros = [
  '',
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '0000000',
  '00000000',
  '000000000',
  '0000000000',
  '00000000000',
  '000000000000',
  '0000000000000',
  '00000000000000',
  '000000000000000',
  '0000000000000000',
  '00000000000000000',
  '000000000000000000',
  '0000000000000000000',
  '00000000000000000000',
  '000000000000000000000',
  '0000000000000000000000',
  '00000000000000000000000',
  '000000000000000000000000',
  '0000000000000000000000000'
];

var groupSizes = [
  0, 0,
  25, 16, 12, 11, 10, 9, 8,
  8, 7, 7, 7, 7, 6, 6,
  6, 6, 6, 6, 6, 5, 5,
  5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5
];

var groupBases = [
  0, 0,
  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
];

BN.prototype.toString = function toString(base, padding) {
  base = base || 10;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var padding = padding | 0 || 1;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = zeros[6 - word.length] + word + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else if (base === (base | 0) && base >= 2 && base <= 36) {
    // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
    var groupSize = groupSizes[base];
    // var groupBase = Math.pow(base, groupSize);
    var groupBase = groupBases[base];
    var out = '';
    var c = this.clone();
    c.sign = false;
    while (c.cmpn(0) !== 0) {
      var r = c.modn(groupBase).toString(base);
      c = c.idivn(groupBase);

      if (c.cmpn(0) !== 0)
        out = zeros[groupSize - r.length] + r + out;
      else
        out = r + out;
    }
    if (this.cmpn(0) === 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else {
    assert(false, 'Base should be between 2 and 36');
  }
};

BN.prototype.toJSON = function toJSON() {
  return this.toString(16);
};

BN.prototype.toArray = function toArray() {
  this.strip();
  var res = new Array(this.byteLength());
  res[0] = 0;

  var q = this.clone();
  for (var i = 0; q.cmpn(0) !== 0; i++) {
    var b = q.andln(0xff);
    q.ishrn(8);

    // Assume big-endian
    res[res.length - i - 1] = b;
  }

  return res;
};

/*
function genCountBits(bits) {
  var arr = [];

  for (var i = bits - 1; i >= 0; i--) {
    var bit = '0x' + (1 << i).toString(16);
    arr.push('w >= ' + bit + ' ? ' + (i + 1));
  }

  return new Function('w', 'return ' + arr.join(' :\n') + ' :\n0;');
};

BN.prototype._countBits = genCountBits(26);
*/

// Sadly chrome apps could not contain `new Function()` calls
BN.prototype._countBits = function _countBits(w) {
  return w >= 0x2000000 ? 26 :
         w >= 0x1000000 ? 25 :
         w >= 0x800000 ? 24 :
         w >= 0x400000 ? 23 :
         w >= 0x200000 ? 22 :
         w >= 0x100000 ? 21 :
         w >= 0x80000 ? 20 :
         w >= 0x40000 ? 19 :
         w >= 0x20000 ? 18 :
         w >= 0x10000 ? 17 :
         w >= 0x8000 ? 16 :
         w >= 0x4000 ? 15 :
         w >= 0x2000 ? 14 :
         w >= 0x1000 ? 13 :
         w >= 0x800 ? 12 :
         w >= 0x400 ? 11 :
         w >= 0x200 ? 10 :
         w >= 0x100 ? 9 :
         w >= 0x80 ? 8 :
         w >= 0x40 ? 7 :
         w >= 0x20 ? 6 :
         w >= 0x10 ? 5 :
         w >= 0x8 ? 4 :
         w >= 0x4 ? 3 :
         w >= 0x2 ? 2 :
         w >= 0x1 ? 1 :
         0;
};

// Return number of used bits in a BN
BN.prototype.bitLength = function bitLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  var hi = this._countBits(w);
  return (this.length - 1) * 26 + hi;
};

BN.prototype.byteLength = function byteLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  return Math.ceil(this.bitLength() / 8);
};

// Return negative clone of `this`
BN.prototype.neg = function neg() {
  if (this.cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.sign = !this.sign;
  return r;
};

// Add `num` to `this` in-place
BN.prototype.iadd = function iadd(num) {
  // negative + positive
  if (this.sign && !num.sign) {
    this.sign = false;
    var r = this.isub(num);
    this.sign = !this.sign;
    return this._normSign();

  // positive + negative
  } else if (!this.sign && num.sign) {
    num.sign = false;
    var r = this.isub(num);
    num.sign = true;
    return r._normSign();
  }

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] + b.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  // Copy the rest of the words
  } else if (a !== this) {
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  }

  return this;
};

// Add `num` to `this`
BN.prototype.add = function add(num) {
  if (num.sign && !this.sign) {
    num.sign = false;
    var res = this.sub(num);
    num.sign = true;
    return res;
  } else if (!num.sign && this.sign) {
    this.sign = false;
    var res = num.sub(this);
    this.sign = true;
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

// Subtract `num` from `this` in-place
BN.prototype.isub = function isub(num) {
  // this - (-num) = this + num
  if (num.sign) {
    num.sign = false;
    var r = this.iadd(num);
    num.sign = true;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.sign) {
    this.sign = false;
    this.iadd(num);
    this.sign = true;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.sign = false;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  if (cmp > 0) {
    var a = this;
    var b = num;
  } else {
    var a = num;
    var b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] - b.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.sign = true;

  return this.strip();
};

// Subtract `num` from `this`
BN.prototype.sub = function sub(num) {
  return this.clone().isub(num);
};

/*
// NOTE: This could be potentionally used to generate loop-less multiplications
function _genCombMulTo(alen, blen) {
  var len = alen + blen - 1;
  var src = [
    'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
        'mask = 0x3ffffff, shift = 0x4000000;',
    'out.length = ' + len + ';'
  ];
  for (var k = 0; k < len; k++) {
    var minJ = Math.max(0, k - alen + 1);
    var maxJ = Math.min(k, blen - 1);

    for (var j = minJ; j <= maxJ; j++) {
      var i = k - j;
      var mul = 'a[' + i + '] * b[' + j + ']';

      if (j === minJ) {
        src.push('w = ' + mul + ' + c;');
        src.push('c = (w / shift) | 0;');
      } else {
        src.push('w += ' + mul + ';');
        src.push('c += (w / shift) | 0;');
      }
      src.push('w &= mask;');
    }
    src.push('o[' + k + '] = w;');
  }
  src.push('if (c !== 0) {',
           '  o[' + k + '] = c;',
           '  out.length++;',
           '}',
           'return out;');

  return src.join('\n');
}
*/

BN.prototype._smallMulTo = function _smallMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;
    }
    out.words[k] = rword;
    carry = ncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype._bigMulTo = function _bigMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  var hncarry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = hncarry;
    hncarry = 0;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;

      hncarry += ncarry >>> 26;
      ncarry &= 0x3ffffff;
    }
    out.words[k] = rword;
    carry = ncarry;
    ncarry = hncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype.mulTo = function mulTo(num, out) {
  var res;
  if (this.length + num.length < 63)
    res = this._smallMulTo(num, out);
  else
    res = this._bigMulTo(num, out);
  return res;
};

// Multiply `this` by `num`
BN.prototype.mul = function mul(num) {
  var out = new BN(null);
  out.words = new Array(this.length + num.length);
  return this.mulTo(num, out);
};

// In-place Multiplication
BN.prototype.imul = function imul(num) {
  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
    this.words[0] = 0;
    this.length = 1;
    return this;
  }

  var tlen = this.length;
  var nlen = num.length;

  this.sign = num.sign !== this.sign;
  this.length = this.length + num.length;
  this.words[this.length - 1] = 0;

  var lastCarry = 0;
  for (var k = this.length - 2; k >= 0; k--) {
    // Sum all words with the same `i + j = k` and accumulate `carry`,
    // note that carry could be >= 0x3ffffff
    var carry = 0;
    var rword = 0;
    var maxJ = Math.min(k, nlen - 1);
    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i];
      var b = num.words[j];
      var r = a * b;

      var lo = r & 0x3ffffff;
      carry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      carry += lo >>> 26;
    }
    this.words[k] = rword;
    this.words[k + 1] += carry;
    carry = 0;
  }

  // Propagate overflows
  var carry = 0;
  for (var i = 1; i < this.length; i++) {
    var w = this.words[i] + carry;
    this.words[i] = w & 0x3ffffff;
    carry = w >>> 26;
  }

  return this.strip();
};

// `this` * `this`
BN.prototype.sqr = function sqr() {
  return this.mul(this);
};

// `this` * `this` in-place
BN.prototype.isqr = function isqr() {
  return this.mul(this);
};

// Shift-left in-place
BN.prototype.ishln = function ishln(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  var o = this.clone();
  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = (this.words[i] - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this.strip();
};

// Shift-right in-place
// NOTE: `hint` is a lowest bit before trailing zeroes
// NOTE: if `extended` is true - { lo: ..., hi: } object will be returned
BN.prototype.ishrn = function ishrn(bits, hint, extended) {
  assert(typeof bits === 'number' && bits >= 0);
  if (hint)
    hint = (hint - (hint % 26)) / 26;
  else
    hint = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  hint -= s;
  hint = Math.max(0, hint);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= hint); i--) {
    var word = this.words[i];
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this.strip();
  if (extended)
    return { hi: this, lo: maskedWords };

  return this;
};

// Shift-left
BN.prototype.shln = function shln(bits) {
  return this.clone().ishln(bits);
};

// Shift-right
BN.prototype.shrn = function shrn(bits) {
  return this.clone().ishrn(bits);
};

// Test if n bit is set
BN.prototype.testn = function testn(bit) {
  assert(typeof bit === 'number' && bit >= 0);
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    return false;
  }

  // Check bit and return
  var w = this.words[s];

  return !!(w & q);
};

// Return only lowers bits of number (in-place)
BN.prototype.imaskn = function imaskn(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;

  assert(!this.sign, 'imaskn works only with positive numbers');

  if (r !== 0)
    s++;
  this.length = Math.min(s, this.length);

  if (r !== 0) {
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    this.words[this.length - 1] &= mask;
  }

  return this.strip();
};

// Return only lowers bits of number
BN.prototype.maskn = function maskn(bits) {
  return this.clone().imaskn(bits);
};

// Add plain number `num` to `this`
BN.prototype.iaddn = function iaddn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.isubn(-num);

  // Possible sign change
  if (this.sign) {
    if (this.length === 1 && this.words[0] < num) {
      this.words[0] = num - this.words[0];
      this.sign = false;
      return this;
    }

    this.sign = false;
    this.isubn(num);
    this.sign = true;
    return this;
  }
  this.words[0] += num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
    this.words[i] -= 0x4000000;
    if (i === this.length - 1)
      this.words[i + 1] = 1;
    else
      this.words[i + 1]++;
  }
  this.length = Math.max(this.length, i + 1);

  return this;
};

// Subtract plain number `num` from `this`
BN.prototype.isubn = function isubn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.iaddn(-num);

  if (this.sign) {
    this.sign = false;
    this.iaddn(num);
    this.sign = true;
    return this;
  }

  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this.strip();
};

BN.prototype.addn = function addn(num) {
  return this.clone().iaddn(num);
};

BN.prototype.subn = function subn(num) {
  return this.clone().isubn(num);
};

BN.prototype.iabs = function iabs() {
  this.sign = false;

  return this
};

BN.prototype.abs = function abs() {
  return this.clone().iabs();
};

BN.prototype._wordDiv = function _wordDiv(num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  var q = mode !== 'mod' && new BN(0);
  var sign = false;

  // Approximate quotient at each step
  while (a.length > b.length) {
    // NOTE: a.length is always >= 2, because of the condition .div()
    var hi = a.words[a.length - 1] * 0x4000000 + a.words[a.length - 2];
    var sq = (hi / b.words[b.length - 1]);
    var sqhi = (sq / 0x4000000) | 0;
    var sqlo = sq & 0x3ffffff;
    sq = new BN(null);
    sq.words = [ sqlo, sqhi ];
    sq.length = 2;

    // Collect quotient
    var shift = (a.length - b.length - 1) * 26;
    if (q) {
      var t = sq.shln(shift);
      if (a.sign)
        q.isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b).ishln(shift);
    if (a.sign)
      a.iadd(sq)
    else
      a.isub(sq);
  }
  // At this point a.length <= b.length
  while (a.ucmp(b) >= 0) {
    // NOTE: a.length is always >= 2, because of the condition above
    var hi = a.words[a.length - 1];
    var sq = new BN((hi / b.words[b.length - 1]) | 0);
    var shift = (a.length - b.length) * 26;

    if (q) {
      var t = sq.shln(shift);
      if (a.sign)
        q.isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b).ishln(shift);

    if (a.sign)
      a.iadd(sq);
    else
      a.isub(sq);
  }

  if (a.sign) {
    if (q)
      q.isubn(1);
    a.iadd(b);
  }
  return { div: q ? q : null, mod: a };
};

BN.prototype.divmod = function divmod(num, mode) {
  assert(num.cmpn(0) !== 0);

  if (this.sign && !num.sign) {
    var res = this.neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div.neg();
    if (mode !== 'div')
      mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
    return {
      div: div,
      mod: mod
    };
  } else if (!this.sign && num.sign) {
    var res = this.divmod(num.neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div.neg();
    return { div: div, mod: res.mod };
  } else if (this.sign && num.sign) {
    return this.neg().divmod(num.neg(), mode);
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BN(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this.divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BN(this.modn(num.words[0])) };
    return {
      div: this.divn(num.words[0]),
      mod: new BN(this.modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

// Find `this` / `num`
BN.prototype.div = function div(num) {
  return this.divmod(num, 'div').div;
};

// Find `this` % `num`
BN.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod').mod;
};

// Find Round(`this` / `num`)
BN.prototype.divRound = function divRound(num) {
  var dm = this.divmod(num);

  // Fast case - exact division
  if (dm.mod.cmpn(0) === 0)
    return dm.div;

  var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

  var half = num.shrn(1);
  var r2 = num.andln(1);
  var cmp = mod.cmp(half);

  // Round down
  if (cmp < 0 || r2 === 1 && cmp === 0)
    return dm.div;

  // Round up
  return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
};

BN.prototype.modn = function modn(num) {
  assert(num <= 0x3ffffff);
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + this.words[i]) % num;

  return acc;
};

// In-place division by number
BN.prototype.idivn = function idivn(num) {
  assert(num <= 0x3ffffff);

  var carry = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var w = this.words[i] + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this.strip();
};

BN.prototype.divn = function divn(num) {
  return this.clone().idivn(num);
};

BN.prototype._egcd = function _egcd(x1, p) {
  assert(!p.sign);
  assert(p.cmpn(0) !== 0);

  var a = this;
  var b = p.clone();

  if (a.sign)
    a = a.mod(p);
  else
    a = a.clone();

  var x2 = new BN(0);
  while (b.isEven())
    b.ishrn(1);
  var delta = b.clone();
  while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
    while (a.isEven()) {
      a.ishrn(1);
      if (x1.isEven())
        x1.ishrn(1);
      else
        x1.iadd(delta).ishrn(1);
    }
    while (b.isEven()) {
      b.ishrn(1);
      if (x2.isEven())
        x2.ishrn(1);
      else
        x2.iadd(delta).ishrn(1);
    }
    if (a.cmp(b) >= 0) {
      a.isub(b);
      x1.isub(x2);
    } else {
      b.isub(a);
      x2.isub(x1);
    }
  }
  if (a.cmpn(1) === 0)
    return x1;
  else
    return x2;
};

BN.prototype.gcd = function gcd(num) {
  if (this.cmpn(0) === 0)
    return num.clone();
  if (num.cmpn(0) === 0)
    return this.clone();

  var a = this.clone();
  var b = num.clone();
  a.sign = false;
  b.sign = false;

  // Remove common factor of two
  for (var shift = 0; a.isEven() && b.isEven(); shift++) {
    a.ishrn(1);
    b.ishrn(1);
  }

  while (a.isEven())
    a.ishrn(1);

  do {
    while (b.isEven())
      b.ishrn(1);

    // Swap `a` and `b` to make `a` always bigger than `b`
    if (a.cmp(b) < 0) {
      var t = a;
      a = b;
      b = t;
    }
    a.isub(a.div(b).mul(b));
  } while (a.cmpn(0) !== 0 && b.cmpn(0) !== 0);
  if (a.cmpn(0) === 0)
    return b.ishln(shift);
  else
    return a.ishln(shift);
};

// Invert number in the field F(num)
BN.prototype.invm = function invm(num) {
  return this._egcd(new BN(1), num).mod(num);
};

BN.prototype.isEven = function isEven(num) {
  return (this.words[0] & 1) === 0;
};

BN.prototype.isOdd = function isOdd(num) {
  return (this.words[0] & 1) === 1;
};

// And first word and num
BN.prototype.andln = function andln(num) {
  return this.words[0] & num;
};

// Increment at the bit position in-line
BN.prototype.bincn = function bincn(bit) {
  assert(typeof bit === 'number');
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    for (var i = this.length; i < s + 1; i++)
      this.words[i] = 0;
    this.words[s] |= q;
    this.length = s + 1;
    return this;
  }

  // Add bit and propagate, if needed
  var carry = q;
  for (var i = s; carry !== 0 && i < this.length; i++) {
    var w = this.words[i];
    w += carry;
    carry = w >>> 26;
    w &= 0x3ffffff;
    this.words[i] = w;
  }
  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }
  return this;
};

BN.prototype.cmpn = function cmpn(num) {
  var sign = num < 0;
  if (sign)
    num = -num;

  if (this.sign && !sign)
    return -1;
  else if (!this.sign && sign)
    return 1;

  num &= 0x3ffffff;
  this.strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0];
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.sign)
    res = -res;
  return res;
};

// Compare two numbers and return:
// 1 - if `this` > `num`
// 0 - if `this` == `num`
// -1 - if `this` < `num`
BN.prototype.cmp = function cmp(num) {
  if (this.sign && !num.sign)
    return -1;
  else if (!this.sign && num.sign)
    return 1;

  var res = this.ucmp(num);
  if (this.sign)
    return -res;
  else
    return res;
};

// Unsigned comparison
BN.prototype.ucmp = function ucmp(num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i];
    var b = num.words[i];

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};

//
// A reduce context, could be using montgomery or something better, depending
// on the `m` itself.
//
BN.red = function red(num) {
  return new Red(num);
};

BN.prototype.toRed = function toRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  assert(!this.sign, 'red works only with positives');
  return ctx.convertTo(this)._forceRed(ctx);
};

BN.prototype.fromRed = function fromRed() {
  assert(this.red, 'fromRed works only with numbers in reduction context');
  return this.red.convertFrom(this);
};

BN.prototype._forceRed = function _forceRed(ctx) {
  this.red = ctx;
  return this;
};

BN.prototype.forceRed = function forceRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  return this._forceRed(ctx);
};

BN.prototype.redAdd = function redAdd(num) {
  assert(this.red, 'redAdd works only with red numbers');
  return this.red.add(this, num);
};

BN.prototype.redIAdd = function redIAdd(num) {
  assert(this.red, 'redIAdd works only with red numbers');
  return this.red.iadd(this, num);
};

BN.prototype.redSub = function redSub(num) {
  assert(this.red, 'redSub works only with red numbers');
  return this.red.sub(this, num);
};

BN.prototype.redISub = function redISub(num) {
  assert(this.red, 'redISub works only with red numbers');
  return this.red.isub(this, num);
};

BN.prototype.redShl = function redShl(num) {
  assert(this.red, 'redShl works only with red numbers');
  return this.red.shl(this, num);
};

BN.prototype.redMul = function redMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.mul(this, num);
};

BN.prototype.redIMul = function redIMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.imul(this, num);
};

BN.prototype.redSqr = function redSqr() {
  assert(this.red, 'redSqr works only with red numbers');
  this.red._verify1(this);
  return this.red.sqr(this);
};

BN.prototype.redISqr = function redISqr() {
  assert(this.red, 'redISqr works only with red numbers');
  this.red._verify1(this);
  return this.red.isqr(this);
};

// Square root over p
BN.prototype.redSqrt = function redSqrt() {
  assert(this.red, 'redSqrt works only with red numbers');
  this.red._verify1(this);
  return this.red.sqrt(this);
};

BN.prototype.redInvm = function redInvm() {
  assert(this.red, 'redInvm works only with red numbers');
  this.red._verify1(this);
  return this.red.invm(this);
};

// Return negative clone of `this` % `red modulo`
BN.prototype.redNeg = function redNeg() {
  assert(this.red, 'redNeg works only with red numbers');
  this.red._verify1(this);
  return this.red.neg(this);
};

BN.prototype.redPow = function redPow(num) {
  assert(this.red && !num.red, 'redPow(normalNum)');
  this.red._verify1(this);
  return this.red.pow(this, num);
};

// Prime numbers with efficient reduction
var primes = {
  k256: null,
  p224: null,
  p192: null,
  p25519: null
};

// Pseudo-Mersenne prime
function MPrime(name, p) {
  // P = 2 ^ N - K
  this.name = name;
  this.p = new BN(p, 16);
  this.n = this.p.bitLength();
  this.k = new BN(1).ishln(this.n).isub(this.p);

  this.tmp = this._tmp();
}

MPrime.prototype._tmp = function _tmp() {
  var tmp = new BN(null);
  tmp.words = new Array(Math.ceil(this.n / 13));
  return tmp;
};

MPrime.prototype.ireduce = function ireduce(num) {
  // Assumes that `num` is less than `P^2`
  // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
  var r = num;
  var rlen;

  do {
    var pair = r.ishrn(this.n, 0, this.tmp);
    r = this.imulK(pair.hi);
    r = r.iadd(pair.lo);
    rlen = r.bitLength();
  } while (rlen > this.n);

  var cmp = rlen < this.n ? -1 : r.cmp(this.p);
  if (cmp === 0) {
    r.words[0] = 0;
    r.length = 1;
  } else if (cmp > 0) {
    r.isub(this.p);
  } else {
    r.strip();
  }

  return r;
};

MPrime.prototype.imulK = function imulK(num) {
  return num.imul(this.k);
};

function K256() {
  MPrime.call(
    this,
    'k256',
    'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
}
inherits(K256, MPrime);

K256.prototype.imulK = function imulK(num) {
  // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
  num.words[num.length] = 0;
  num.words[num.length + 1] = 0;
  num.length += 2;
  for (var i = num.length - 3; i >= 0; i--) {
    var w = num.words[i];
    var hi = w * 0x40;
    var lo = w * 0x3d1;
    hi += (lo / 0x4000000) | 0;
    var uhi = (hi / 0x4000000) | 0;
    hi &= 0x3ffffff;
    lo &= 0x3ffffff;

    num.words[i + 2] += uhi;
    num.words[i + 1] += hi;
    num.words[i] = lo;
  }
  var w = num.words[num.length - 2];
  if (w >= 0x4000000) {
    num.words[num.length - 1] += w >>> 26;
    num.words[num.length - 2] = w & 0x3ffffff;
  }
  if (num.words[num.length - 1] === 0)
    num.length--;
  if (num.words[num.length - 1] === 0)
    num.length--;
  return num;
};

function P224() {
  MPrime.call(
    this,
    'p224',
    'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
}
inherits(P224, MPrime);

function P192() {
  MPrime.call(
    this,
    'p192',
    'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
}
inherits(P192, MPrime);

function P25519() {
  // 2 ^ 255 - 19
  MPrime.call(
    this,
    '25519',
    '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
}
inherits(P25519, MPrime);

P25519.prototype.imulK = function imulK(num) {
  // K = 0x13
  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var hi = num.words[i] * 0x13 + carry;
    var lo = hi & 0x3ffffff;
    hi >>>= 26;

    num.words[i] = lo;
    carry = hi;
  }
  if (carry !== 0)
    num.words[num.length++] = carry;
  return num;
};

// Exported mostly for testing purposes, use plain name instead
BN._prime = function prime(name) {
  // Cached version of prime
  if (primes[name])
    return primes[name];

  var prime;
  if (name === 'k256')
    prime = new K256();
  else if (name === 'p224')
    prime = new P224();
  else if (name === 'p192')
    prime = new P192();
  else if (name === 'p25519')
    prime = new P25519();
  else
    throw new Error('Unknown prime ' + name);
  primes[name] = prime;

  return prime;
}

//
// Base reduction engine
//
function Red(m) {
  if (typeof m === 'string') {
    var prime = BN._prime(m);
    this.m = prime.p;
    this.prime = prime;
  } else {
    this.m = m;
    this.prime = null;
  }
}

Red.prototype._verify1 = function _verify1(a) {
  assert(!a.sign, 'red works only with positives');
  assert(a.red, 'red works only with red numbers');
};

Red.prototype._verify2 = function _verify2(a, b) {
  assert(!a.sign && !b.sign, 'red works only with positives');
  assert(a.red && a.red === b.red,
         'red works only with red numbers');
};

Red.prototype.imod = function imod(a) {
  if (this.prime)
    return this.prime.ireduce(a)._forceRed(this);
  return a.mod(this.m)._forceRed(this);
};

Red.prototype.neg = function neg(a) {
  var r = a.clone();
  r.sign = !r.sign;
  return r.iadd(this.m)._forceRed(this);
};

Red.prototype.add = function add(a, b) {
  this._verify2(a, b);

  var res = a.add(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res._forceRed(this);
};

Red.prototype.iadd = function iadd(a, b) {
  this._verify2(a, b);

  var res = a.iadd(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res;
};

Red.prototype.sub = function sub(a, b) {
  this._verify2(a, b);

  var res = a.sub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res._forceRed(this);
};

Red.prototype.isub = function isub(a, b) {
  this._verify2(a, b);

  var res = a.isub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res;
};

Red.prototype.shl = function shl(a, num) {
  this._verify1(a);
  return this.imod(a.shln(num));
};

Red.prototype.imul = function imul(a, b) {
  this._verify2(a, b);
  return this.imod(a.imul(b));
};

Red.prototype.mul = function mul(a, b) {
  this._verify2(a, b);
  return this.imod(a.mul(b));
};

Red.prototype.isqr = function isqr(a) {
  return this.imul(a, a);
};

Red.prototype.sqr = function sqr(a) {
  return this.mul(a, a);
};

Red.prototype.sqrt = function sqrt(a) {
  if (a.cmpn(0) === 0)
    return a.clone();

  var mod3 = this.m.andln(3);
  assert(mod3 % 2 === 1);

  // Fast case
  if (mod3 === 3) {
    var pow = this.m.add(new BN(1)).ishrn(2);
    var r = this.pow(a, pow);
    return r;
  }

  // Tonelli-Shanks algorithm (Totally unoptimized and slow)
  //
  // Find Q and S, that Q * 2 ^ S = (P - 1)
  var q = this.m.subn(1);
  var s = 0;
  while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
    s++;
    q.ishrn(1);
  }
  assert(q.cmpn(0) !== 0);

  var one = new BN(1).toRed(this);
  var nOne = one.redNeg();

  // Find quadratic non-residue
  // NOTE: Max is such because of generalized Riemann hypothesis.
  var lpow = this.m.subn(1).ishrn(1);
  var z = this.m.bitLength();
  z = new BN(2 * z * z).toRed(this);
  while (this.pow(z, lpow).cmp(nOne) !== 0)
    z.redIAdd(nOne);

  var c = this.pow(z, q);
  var r = this.pow(a, q.addn(1).ishrn(1));
  var t = this.pow(a, q);
  var m = s;
  while (t.cmp(one) !== 0) {
    var tmp = t;
    for (var i = 0; tmp.cmp(one) !== 0; i++)
      tmp = tmp.redSqr();
    assert(i < m);
    var b = this.pow(c, new BN(1).ishln(m - i - 1));

    r = r.redMul(b);
    c = b.redSqr();
    t = t.redMul(c);
    m = i;
  }

  return r;
};

Red.prototype.invm = function invm(a) {
  var inv = a._egcd(new BN(1), this.m);
  if (inv.sign) {
    inv.sign = false;
    return this.imod(inv).redNeg();
  } else {
    return this.imod(inv);
  }
};

Red.prototype.pow = function pow(a, num) {
  var w = [];
  var q = num.clone();
  while (q.cmpn(0) !== 0) {
    w.push(q.andln(1));
    q.ishrn(1);
  }

  // Skip leading zeroes
  var res = a;
  for (var i = 0; i < w.length; i++, res = this.sqr(res))
    if (w[i] !== 0)
      break;

  if (++i < w.length) {
    for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
      if (w[i] === 0)
        continue;
      res = this.mul(res, q);
    }
  }

  return res;
};

Red.prototype.convertTo = function convertTo(num) {
  return num.clone();
};

Red.prototype.convertFrom = function convertFrom(num) {
  var res = num.clone();
  res.red = null;
  return res;
};

//
// Montgomery method engine
//

BN.mont = function mont(num) {
  return new Mont(num);
};

function Mont(m) {
  Red.call(this, m);

  this.shift = this.m.bitLength();
  if (this.shift % 26 !== 0)
    this.shift += 26 - (this.shift % 26);
  this.r = new BN(1).ishln(this.shift);
  this.r2 = this.imod(this.r.sqr());
  this.rinv = this.r.invm(this.m);

  // TODO(indutny): simplify it
  this.minv = this.rinv.mul(this.r)
                       .sub(new BN(1))
                       .div(this.m)
                       .neg()
                       .mod(this.r);
}
inherits(Mont, Red);

Mont.prototype.convertTo = function convertTo(num) {
  return this.imod(num.shln(this.shift));
};

Mont.prototype.convertFrom = function convertFrom(num) {
  var r = this.imod(num.mul(this.rinv));
  r.red = null;
  return r;
};

Mont.prototype.imul = function imul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
    a.words[0] = 0;
    a.length = 1;
    return a;
  }

  var t = a.imul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.mul = function mul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
    return new BN(0)._forceRed(this);

  var t = a.mul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.invm = function invm(a) {
  // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
  var res = this.imod(a.invm(this.m).mul(this.r2));
  return res._forceRed(this);
};

},{}],112:[function(require,module,exports){
module.exports=require(57)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/EVP_BytesToKey.js":57,"buffer":7}],113:[function(require,module,exports){
module.exports=require(58)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/aesid.json":58}],114:[function(require,module,exports){
module.exports=require(59)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/asn1.js":59,"asn1.js":118,"asn1.js-rfc3280":117}],115:[function(require,module,exports){
module.exports=require(60)
},{"./EVP_BytesToKey":112,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/fixProc.js":60,"buffer":7}],116:[function(require,module,exports){
module.exports=require(61)
},{"./aesid.json":113,"./asn1":114,"./fixProc":115,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/index.js":61,"buffer":7,"pemstrip":131}],117:[function(require,module,exports){
module.exports=require(62)
},{"../..":116,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js-rfc3280/index.js":62,"asn1.js":118}],118:[function(require,module,exports){
module.exports=require(63)
},{"./asn1/api":119,"./asn1/base":121,"./asn1/constants":125,"./asn1/decoders":127,"./asn1/encoders":129,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1.js":63,"bn.js":130}],119:[function(require,module,exports){
module.exports=require(64)
},{"../asn1":118,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/api.js":64,"util":164,"vm":165}],120:[function(require,module,exports){
module.exports=require(65)
},{"../base":121,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/base/buffer.js":65,"assert":5,"buffer":7,"util":164}],121:[function(require,module,exports){
module.exports=require(66)
},{"./buffer":120,"./node":122,"./reporter":123,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/base/index.js":66}],122:[function(require,module,exports){
module.exports=require(67)
},{"../base":121,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/base/node.js":67,"assert":5}],123:[function(require,module,exports){
module.exports=require(68)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/base/reporter.js":68,"util":164}],124:[function(require,module,exports){
module.exports=require(69)
},{"../constants":125,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/constants/der.js":69}],125:[function(require,module,exports){
module.exports=require(70)
},{"./der":124,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/constants/index.js":70}],126:[function(require,module,exports){
module.exports=require(71)
},{"../../asn1":118,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/decoders/der.js":71,"util":164}],127:[function(require,module,exports){
module.exports=require(72)
},{"./der":126,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/decoders/index.js":72}],128:[function(require,module,exports){
module.exports=require(73)
},{"../../asn1":118,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/encoders/der.js":73,"buffer":7,"util":164}],129:[function(require,module,exports){
module.exports=require(74)
},{"./der":128,"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/asn1.js/lib/asn1/encoders/index.js":74}],130:[function(require,module,exports){
module.exports=require(36)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/bn.js/lib/bn.js":36}],131:[function(require,module,exports){
module.exports=require(75)
},{"/home/oada/client/node_modules/oadaIdClient/node_modules/grunt-browserify/node_modules/browserify/node_modules/crypto-browserify/node_modules/browserify-sign/node_modules/parse-asn1/node_modules/pemstrip/index.js":75}],132:[function(require,module,exports){
(function (Buffer){
var parseKeys = require('parse-asn1');
var mgf = require('./mgf');
var xor = require('./xor');
var bn = require('bn.js');

module.exports = function (crypto) {
  return privateDecrypt;
  function privateDecrypt(private_key, enc) {
    var padding;
    if (private_key.padding) {
      padding = private_key.padding;
    } else {
      padding = 4;
    }
    
    var key = parseKeys(private_key, crypto);
    var k = key.modulus.byteLength();
    if (enc.length > k || new bn(enc).cmp(key.modulus) >= 0) {
      throw new Error('decryption error');
    }
    var msg = crt(enc, key);
    var zBuffer = new Buffer(k - msg.length);
    zBuffer.fill(0);
    msg = Buffer.concat([zBuffer, msg], k);
    if (padding === 4) {
      return oaep(key, msg, crypto);
    } else if (padding === 1) {
      return pkcs1(key, msg, crypto);
    } else if (padding === 3) {
      return msg;
    } else {
      throw new Error('unknown padding');
    }
  }
};
function crt(msg, priv) {
  var c1 = new bn(msg).toRed(bn.mont(priv.prime1));
  var c2 = new bn(msg).toRed(bn.mont(priv.prime2));
  var qinv = new bn(priv.coefficient);
  var p = new bn(priv.prime1);
  var q = new bn(priv.prime2);
  var m1 = c1.redPow(priv.exponent1);
  var m2 = c2.redPow(priv.exponent2);
  m1 = m1.fromRed();
  m2 = m2.fromRed();
  var h = m1.isub(m2).imul(qinv).mod(p);
  h.imul(q);
  m2.iadd(h);
  return new Buffer(m2.toArray());
}
function oaep(key, msg, crypto){
  var n = key.modulus;
  var k = key.modulus.byteLength();
  var mLen = msg.length;
  var iHash = crypto.createHash('sha1').update(new Buffer('')).digest();
  var hLen = iHash.length;
  var hLen2 = 2 * hLen;
  if (msg[0] !== 0) {
    throw new Error('decryption error');
  }
  var maskedSeed = msg.slice(1, hLen + 1);
  var maskedDb =  msg.slice(hLen + 1);
  var seed = xor(maskedSeed, mgf(maskedDb, hLen, crypto));
  var db = xor(maskedDb, mgf(seed, k - hLen - 1, crypto));
  if (compare(iHash, db.slice(0, hLen))) {
    throw new Error('decryption error');
  }
  var i = hLen;
  while (db[i] === 0) {
    i++;
  }
  if (db[i++] !== 1) {
    throw new Error('decryption error');
  }
  return db.slice(i);
}

function pkcs1(key, msg, crypto){
  var p1 = msg.slice(0, 2);
  var i = 2;
  var status = 0;
  while (msg[i++] !== 0) {
    if (i >= msg.length) {
      status++;
      break;
    }
  }
  var ps = msg.slice(2, i - 1);
  var p2 = msg.slice(i - 1, i);

  if (p1.toString('hex') !== '0002') {
    status++;
  }
  if (ps.length < 8) {
    status++;
  }
  return  msg.slice(i);
}
function compare(a, b){
  var dif = 0;
  var len = a.length;
  if (a.length !== b.length) {
    dif++;
    len = Math.min(a.length, b.length);
  }
  var i = -1;
  while (++i < len) {
    dif += (a[i] ^ b[i]);
  }
  return dif;
}
}).call(this,require("buffer").Buffer)
},{"./mgf":110,"./xor":134,"bn.js":111,"buffer":7,"parse-asn1":116}],133:[function(require,module,exports){
(function (Buffer){
var parseKeys = require('parse-asn1');
var mgf = require('./mgf');
var xor = require('./xor');
var bn = require('bn.js');
var constants = {
  RSA_PKCS1_OAEP_PADDING: 4,
  RSA_PKCS1_PADDIN: 1,
  RSA_NO_PADDING: 3
};

module.exports = function (crypto) {
  return publicEncrypt;
  function publicEncrypt(public_key, msg) {
    var padding;
    if (public_key.padding) {
      padding = public_key.padding;
    } else {
      padding = 4;
    }
    var key = parseKeys(public_key);
    var paddedMsg;
    if (padding === 4) {
      paddedMsg = oaep(key, msg, crypto);
    } else if (padding === 1) {
      paddedMsg = pkcs1(key, msg, crypto);
    } else if (padding === 3) {
      paddedMsg = new bn(msg);
      if (paddedMsg.cmp(key.modulus) >= 0) {
        throw new Error('data too long for modulus');
      }
    } else {
      throw new Error('unknown padding');
    }
    var enc = paddedMsg
      .toRed(bn.mont(key.modulus))
      .redPow(new bn(key.publicExponent))
      .fromRed()
      .toArray();
    return new Buffer(enc);
  }
};

function oaep(key, msg, crypto){
  var k = key.modulus.byteLength();
  var mLen = msg.length;
  var iHash = crypto.createHash('sha1').update(new Buffer('')).digest();
  var hLen = iHash.length;
  var hLen2 = 2 * hLen;
  if (mLen > k - hLen2 - 2) {
    throw new Error('message too long');
  }
  var ps = new Buffer(k - mLen - hLen2 - 2);
  ps.fill(0);
  var dblen = k - hLen - 1;
  var seed = crypto.randomBytes(hLen);
  var maskedDb = xor(Buffer.concat([iHash, ps, new Buffer([1]), msg], dblen), mgf(seed, dblen, crypto));
  var maskedSeed = xor(seed, mgf(maskedDb, hLen, crypto));
  return new bn(Buffer.concat([new Buffer([0]), maskedSeed, maskedDb], k));
}
function pkcs1(key, msg, crypto){
  var mLen = msg.length;
  var k = key.modulus.byteLength();
  if (mLen > k - 11) {
    throw new Error('message too long');
  }
  var ps = nonZero(k - mLen - 3, crypto);
  return new bn(Buffer.concat([new Buffer([0, 2]), ps, new Buffer([0]), msg], k));
}
function nonZero(len, crypto) {
  var out = new Buffer(len);
  var i = 0;
  var cache = crypto.randomBytes(len*2);
  var cur = 0;
  var num;
  while (i < len) {
    if (cur === cache.length) {
      cache = crypto.randomBytes(len*2);
      cur = 0;
    }
    num = cache[cur++];
    if (num) {
      out[i++] = num;
    }
  }
  return out;
}
}).call(this,require("buffer").Buffer)
},{"./mgf":110,"./xor":134,"bn.js":111,"buffer":7,"parse-asn1":116}],134:[function(require,module,exports){
module.exports = function xor(a, b) {
  var len = a.length;
  var i = -1;
  while (++i < len) {
    a[i] ^= b[i];
  }
  return a
};
},{}],135:[function(require,module,exports){
(function (Buffer){

module.exports = ripemd160



/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/** @preserve
(c) 2012 by Cédric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Constants table
var zl = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
var zr = [
    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
var sl = [
     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
var sr = [
    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

var bytesToWords = function (bytes) {
  var words = [];
  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32);
  }
  return words;
};

var wordsToBytes = function (words) {
  var bytes = [];
  for (var b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
  }
  return bytes;
};

var processBlock = function (H, M, offset) {

  // Swap endian
  for (var i = 0; i < 16; i++) {
    var offset_i = offset + i;
    var M_offset_i = M[offset_i];

    // Swap
    M[offset_i] = (
        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    );
  }

  // Working variables
  var al, bl, cl, dl, el;
  var ar, br, cr, dr, er;

  ar = al = H[0];
  br = bl = H[1];
  cr = cl = H[2];
  dr = dl = H[3];
  er = el = H[4];
  // Computation
  var t;
  for (var i = 0; i < 80; i += 1) {
    t = (al +  M[offset+zl[i]])|0;
    if (i<16){
        t +=  f1(bl,cl,dl) + hl[0];
    } else if (i<32) {
        t +=  f2(bl,cl,dl) + hl[1];
    } else if (i<48) {
        t +=  f3(bl,cl,dl) + hl[2];
    } else if (i<64) {
        t +=  f4(bl,cl,dl) + hl[3];
    } else {// if (i<80) {
        t +=  f5(bl,cl,dl) + hl[4];
    }
    t = t|0;
    t =  rotl(t,sl[i]);
    t = (t+el)|0;
    al = el;
    el = dl;
    dl = rotl(cl, 10);
    cl = bl;
    bl = t;

    t = (ar + M[offset+zr[i]])|0;
    if (i<16){
        t +=  f5(br,cr,dr) + hr[0];
    } else if (i<32) {
        t +=  f4(br,cr,dr) + hr[1];
    } else if (i<48) {
        t +=  f3(br,cr,dr) + hr[2];
    } else if (i<64) {
        t +=  f2(br,cr,dr) + hr[3];
    } else {// if (i<80) {
        t +=  f1(br,cr,dr) + hr[4];
    }
    t = t|0;
    t =  rotl(t,sr[i]) ;
    t = (t+er)|0;
    ar = er;
    er = dr;
    dr = rotl(cr, 10);
    cr = br;
    br = t;
  }
  // Intermediate hash value
  t    = (H[1] + cl + dr)|0;
  H[1] = (H[2] + dl + er)|0;
  H[2] = (H[3] + el + ar)|0;
  H[3] = (H[4] + al + br)|0;
  H[4] = (H[0] + bl + cr)|0;
  H[0] =  t;
};

function f1(x, y, z) {
  return ((x) ^ (y) ^ (z));
}

function f2(x, y, z) {
  return (((x)&(y)) | ((~x)&(z)));
}

function f3(x, y, z) {
  return (((x) | (~(y))) ^ (z));
}

function f4(x, y, z) {
  return (((x) & (z)) | ((y)&(~(z))));
}

function f5(x, y, z) {
  return ((x) ^ ((y) |(~(z))));
}

function rotl(x,n) {
  return (x<<n) | (x>>>(32-n));
}

function ripemd160(message) {
  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

  if (typeof message == 'string')
    message = new Buffer(message, 'utf8');

  var m = bytesToWords(message);

  var nBitsLeft = message.length * 8;
  var nBitsTotal = message.length * 8;

  // Add padding
  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
  );

  for (var i=0 ; i<m.length; i += 16) {
    processBlock(H, m, i);
  }

  // Swap endian
  for (var i = 0; i < 5; i++) {
      // Shortcut
    var H_i = H[i];

    // Swap
    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
  }

  var digestbytes = wordsToBytes(H);
  return new Buffer(digestbytes);
}



}).call(this,require("buffer").Buffer)
},{"buffer":7}],136:[function(require,module,exports){
(function (Buffer){


//prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
  this._s = 0
}

Hash.prototype.init = function () {
  this._s = 0
  this._len = 0
}

Hash.prototype.update = function (data, enc) {
  if ("string" === typeof data) {
    enc = enc || "utf8"
    data = new Buffer(data, enc)
  }

  var l = this._len += data.length
  var s = this._s = (this._s || 0)
  var f = 0
  var buffer = this._block

  while (s < l) {
    var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
    var ch = (t - f)

    for (var i = 0; i < ch; i++) {
      buffer[(s % this._blockSize) + i] = data[i + f]
    }

    s += ch
    f += ch

    if ((s % this._blockSize) === 0) {
      this._update(buffer)
    }
  }
  this._s = s

  return this
}

Hash.prototype.digest = function (enc) {
  // Suppose the length of the message M, in bits, is l
  var l = this._len * 8

  // Append the bit 1 to the end of the message
  this._block[this._len % this._blockSize] = 0x80

  // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
  this._block.fill(0, this._len % this._blockSize + 1)

  if (l % (this._blockSize * 8) >= this._finalSize * 8) {
    this._update(this._block)
    this._block.fill(0)
  }

  // to this append the block which is equal to the number l written in binary
  // TODO: handle case where l is > Math.pow(2, 29)
  this._block.writeInt32BE(l, this._blockSize - 4)

  var hash = this._update(this._block) || this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

}).call(this,require("buffer").Buffer)
},{"buffer":7}],137:[function(require,module,exports){
var exports = module.exports = function (alg) {
  var Alg = exports[alg.toLowerCase()]
  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
  return new Alg()
}


exports.sha1 = require('./sha1')
exports.sha224 = require('./sha224')
exports.sha256 = require('./sha256')
exports.sha384 = require('./sha384')
exports.sha512 = require('./sha512')

},{"./sha1":138,"./sha224":139,"./sha256":140,"./sha384":141,"./sha512":142}],138:[function(require,module,exports){
(function (Buffer){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = require('util').inherits

var Hash = require('./hash')

var A = 0|0
var B = 4|0
var C = 8|0
var D = 12|0
var E = 16|0

var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

var POOL = []

function Sha1 () {
  if(POOL.length)
    return POOL.pop().init()

  if(!(this instanceof Sha1)) return new Sha1()
  this._w = W
  Hash.call(this, 16*4, 14*4)

  this._h = null
  this.init()
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  Hash.prototype.init.call(this)
  return this
}

Sha1.prototype._POOL = POOL
Sha1.prototype._update = function (X) {

  var a, b, c, d, e, _a, _b, _c, _d, _e

  a = _a = this._a
  b = _b = this._b
  c = _c = this._c
  d = _d = this._d
  e = _e = this._e

  var w = this._w

  for(var j = 0; j < 80; j++) {
    var W = w[j] = j < 16 ? X.readInt32BE(j*4)
      : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

    var t = add(
      add(rol(a, 5), sha1_ft(j, b, c, d)),
      add(add(e, W), sha1_kt(j))
    )

    e = d
    d = c
    c = rol(b, 30)
    b = a
    a = t
  }

  this._a = add(a, _a)
  this._b = add(b, _b)
  this._c = add(c, _c)
  this._d = add(d, _d)
  this._e = add(e, _e)
}

Sha1.prototype._hash = function () {
  if(POOL.length < 100) POOL.push(this)
  var H = new Buffer(20)
  //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
  H.writeInt32BE(this._a|0, A)
  H.writeInt32BE(this._b|0, B)
  H.writeInt32BE(this._c|0, C)
  H.writeInt32BE(this._d|0, D)
  H.writeInt32BE(this._e|0, E)
  return H
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d) {
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t) {
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 * //dominictarr: this is 10 years old, so maybe this can be dropped?)
 *
 */
function add(x, y) {
  return (x + y ) | 0
//lets see how this goes on testling.
//  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
//  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
//  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = Sha1


}).call(this,require("buffer").Buffer)
},{"./hash":136,"buffer":7,"util":164}],139:[function(require,module,exports){
(function (Buffer){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('util').inherits
var SHA256 = require('./sha256')
var Hash = require('./hash')

var W = new Array(64)

function Sha224() {
  this.init()

  this._w = W //new Array(64)

  Hash.call(this, 16*4, 14*4)
}

inherits(Sha224, SHA256)

Sha224.prototype.init = function () {

  this._a = 0xc1059ed8|0
  this._b = 0x367cd507|0
  this._c = 0x3070dd17|0
  this._d = 0xf70e5939|0
  this._e = 0xffc00b31|0
  this._f = 0x68581511|0
  this._g = 0x64f98fa7|0
  this._h = 0xbefa4fa4|0

  this._len = this._s = 0

  return this
}


Sha224.prototype._hash = function () {
  var H = new Buffer(28)

  H.writeInt32BE(this._a,  0)
  H.writeInt32BE(this._b,  4)
  H.writeInt32BE(this._c,  8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

}).call(this,require("buffer").Buffer)
},{"./hash":136,"./sha256":140,"buffer":7,"util":164}],140:[function(require,module,exports){
(function (Buffer){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('util').inherits

var Hash = require('./hash')

var K = [
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
    0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
    0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
    0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
    0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
    0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
    0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
    0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
    0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
    0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
    0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
    0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
    0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
    0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
    0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
  ]

var W = new Array(64)

function Sha256() {
  this.init()

  this._w = W //new Array(64)

  Hash.call(this, 16*4, 14*4)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {

  this._a = 0x6a09e667|0
  this._b = 0xbb67ae85|0
  this._c = 0x3c6ef372|0
  this._d = 0xa54ff53a|0
  this._e = 0x510e527f|0
  this._f = 0x9b05688c|0
  this._g = 0x1f83d9ab|0
  this._h = 0x5be0cd19|0

  this._len = this._s = 0

  return this
}

function S (X, n) {
  return (X >>> n) | (X << (32 - n));
}

function R (X, n) {
  return (X >>> n);
}

function Ch (x, y, z) {
  return ((x & y) ^ ((~x) & z));
}

function Maj (x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
}

function Sigma0256 (x) {
  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
}

function Sigma1256 (x) {
  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
}

function Gamma0256 (x) {
  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
}

function Gamma1256 (x) {
  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
}

Sha256.prototype._update = function(M) {

  var W = this._w
  var a, b, c, d, e, f, g, h
  var T1, T2

  a = this._a | 0
  b = this._b | 0
  c = this._c | 0
  d = this._d | 0
  e = this._e | 0
  f = this._f | 0
  g = this._g | 0
  h = this._h | 0

  for (var j = 0; j < 64; j++) {
    var w = W[j] = j < 16
      ? M.readInt32BE(j * 4)
      : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

    T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

    T2 = Sigma0256(a) + Maj(a, b, c);
    h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0

};

Sha256.prototype._hash = function () {
  var H = new Buffer(32)

  H.writeInt32BE(this._a,  0)
  H.writeInt32BE(this._b,  4)
  H.writeInt32BE(this._c,  8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

}).call(this,require("buffer").Buffer)
},{"./hash":136,"buffer":7,"util":164}],141:[function(require,module,exports){
(function (Buffer){
var inherits = require('util').inherits
var SHA512 = require('./sha512');
var Hash = require('./hash')

var W = new Array(160)

function Sha384() {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {

  this._a = 0xcbbb9d5d|0
  this._b = 0x629a292a|0
  this._c = 0x9159015a|0
  this._d = 0x152fecd8|0
  this._e = 0x67332667|0
  this._f = 0x8eb44a87|0
  this._g = 0xdb0c2e0d|0
  this._h = 0x47b5481d|0

  this._al = 0xc1059ed8|0
  this._bl = 0x367cd507|0
  this._cl = 0x3070dd17|0
  this._dl = 0xf70e5939|0
  this._el = 0xffc00b31|0
  this._fl = 0x68581511|0
  this._gl = 0x64f98fa7|0
  this._hl = 0xbefa4fa4|0

  this._len = this._s = 0

  return this
}



Sha384.prototype._hash = function () {
  var H = new Buffer(48)

  function writeInt64BE(h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._a, this._al, 0)
  writeInt64BE(this._b, this._bl, 8)
  writeInt64BE(this._c, this._cl, 16)
  writeInt64BE(this._d, this._dl, 24)
  writeInt64BE(this._e, this._el, 32)
  writeInt64BE(this._f, this._fl, 40)

  return H
}

module.exports = Sha384

}).call(this,require("buffer").Buffer)
},{"./hash":136,"./sha512":142,"buffer":7,"util":164}],142:[function(require,module,exports){
(function (Buffer){
var inherits = require('util').inherits

var Hash = require('./hash')

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512() {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {

  this._a = 0x6a09e667|0
  this._b = 0xbb67ae85|0
  this._c = 0x3c6ef372|0
  this._d = 0xa54ff53a|0
  this._e = 0x510e527f|0
  this._f = 0x9b05688c|0
  this._g = 0x1f83d9ab|0
  this._h = 0x5be0cd19|0

  this._al = 0xf3bcc908|0
  this._bl = 0x84caa73b|0
  this._cl = 0xfe94f82b|0
  this._dl = 0x5f1d36f1|0
  this._el = 0xade682d1|0
  this._fl = 0x2b3e6c1f|0
  this._gl = 0xfb41bd6b|0
  this._hl = 0x137e2179|0

  this._len = this._s = 0

  return this
}

function S (X, Xl, n) {
  return (X >>> n) | (Xl << (32 - n))
}

function Ch (x, y, z) {
  return ((x & y) ^ ((~x) & z));
}

function Maj (x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
}

Sha512.prototype._update = function(M) {

  var W = this._w
  var a, b, c, d, e, f, g, h
  var al, bl, cl, dl, el, fl, gl, hl

  a = this._a | 0
  b = this._b | 0
  c = this._c | 0
  d = this._d | 0
  e = this._e | 0
  f = this._f | 0
  g = this._g | 0
  h = this._h | 0

  al = this._al | 0
  bl = this._bl | 0
  cl = this._cl | 0
  dl = this._dl | 0
  el = this._el | 0
  fl = this._fl | 0
  gl = this._gl | 0
  hl = this._hl | 0

  for (var i = 0; i < 80; i++) {
    var j = i * 2

    var Wi, Wil

    if (i < 16) {
      Wi = W[j] = M.readInt32BE(j * 4)
      Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

    } else {
      var x  = W[j - 15*2]
      var xl = W[j - 15*2 + 1]
      var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
      var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

      x  = W[j - 2*2]
      xl = W[j - 2*2 + 1]
      var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
      var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

      // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
      var Wi7  = W[j - 7*2]
      var Wi7l = W[j - 7*2 + 1]

      var Wi16  = W[j - 16*2]
      var Wi16l = W[j - 16*2 + 1]

      Wil = gamma0l + Wi7l
      Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
      Wil = Wil + gamma1l
      Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
      Wil = Wil + Wi16l
      Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

      W[j] = Wi
      W[j + 1] = Wil
    }

    var maj = Maj(a, b, c)
    var majl = Maj(al, bl, cl)

    var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
    var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
    var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
    var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

    // t1 = h + sigma1 + ch + K[i] + W[i]
    var Ki = K[j]
    var Kil = K[j + 1]

    var ch = Ch(e, f, g)
    var chl = Ch(el, fl, gl)

    var t1l = hl + sigma1l
    var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
    t1l = t1l + chl
    t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
    t1l = t1l + Kil
    t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
    t1l = t1l + Wil
    t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

    // t2 = sigma0 + maj
    var t2l = sigma0l + majl
    var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

    h  = g
    hl = gl
    g  = f
    gl = fl
    f  = e
    fl = el
    el = (dl + t1l) | 0
    e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
    d  = c
    dl = cl
    c  = b
    cl = bl
    b  = a
    bl = al
    al = (t1l + t2l) | 0
    a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
  this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
  this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
  this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
  this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
  this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
  this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
  this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
}

Sha512.prototype._hash = function () {
  var H = new Buffer(64)

  function writeInt64BE(h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._a, this._al, 0)
  writeInt64BE(this._b, this._bl, 8)
  writeInt64BE(this._c, this._cl, 16)
  writeInt64BE(this._d, this._dl, 24)
  writeInt64BE(this._e, this._el, 32)
  writeInt64BE(this._f, this._fl, 40)
  writeInt64BE(this._g, this._gl, 48)
  writeInt64BE(this._h, this._hl, 56)

  return H
}

module.exports = Sha512

}).call(this,require("buffer").Buffer)
},{"./hash":136,"buffer":7,"util":164}],143:[function(require,module,exports){
'use strict';
var pbkdf2Export = require('pbkdf2-compat/pbkdf2')

module.exports = function (crypto, exports) {
  exports = exports || {}

  var exported = pbkdf2Export(crypto)

  exports.pbkdf2 = exported.pbkdf2
  exports.pbkdf2Sync = exported.pbkdf2Sync

  return exports
}

},{"pbkdf2-compat/pbkdf2":108}],144:[function(require,module,exports){
(function (global,Buffer){
'use strict';
(function() {
  var g = ('undefined' === typeof window ? global : window) || {}
  var _crypto = (
    g.crypto || g.msCrypto || require('crypto')
  )
  module.exports = function(size) {
    // Modern Browsers
    if(_crypto.getRandomValues) {
      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
      /* This will not work in older browsers.
       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
       */

      _crypto.getRandomValues(bytes);
      return bytes;
    }
    else if (_crypto.pseudoRandomBytes) {
      return _crypto.pseudoRandomBytes(size)
    }
    else
      throw new Error(
        'pseudo random number generation not yet implemented for this browser\n'+
        'use chrome, FireFox or Internet Explorer 11'
      )
  }
}())

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":7,"crypto":6}],145:[function(require,module,exports){
(function (global,Buffer){
'use strict';
(function() {
  var g = ('undefined' === typeof window ? global : window) || {}
  var _crypto = (
    g.crypto || g.msCrypto || require('crypto')
  )
  module.exports = function(size) {
    // Modern Browsers
    if(_crypto.getRandomValues) {
      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
      /* This will not work in older browsers.
       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
       */

      _crypto.getRandomValues(bytes);
      return bytes;
    }
    else if (_crypto.randomBytes) {
      return _crypto.randomBytes(size)
    }
    else
      throw new Error(
        'secure random number generation not supported by this browser\n'+
        'use chrome, FireFox or Internet Explorer 11'
      )
  }
}())

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":7,"crypto":6}],146:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],147:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],148:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],149:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],150:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":151}],151:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))
},{"./_stream_readable":153,"./_stream_writable":155,"_process":149,"core-util-is":156,"inherits":147}],152:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":154,"core-util-is":156,"inherits":147}],153:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (n === null || isNaN(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;
  var ret;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    ret = null;

    // In cases where the decoder did not receive enough data
    // to produce a full chunk, then immediately received an
    // EOF, state.buffer will contain [<Buffer >, <Buffer 00 ...>].
    // howMuchToRead will see this and coerce the amount to
    // read to zero (because it's looking at the length of the
    // first <Buffer > in state.buffer), and we'll end up here.
    //
    // This can only happen via state.decoder -- no other venue
    // exists for pushing a zero-length chunk into state.buffer
    // and triggering this behavior. In this case, we return our
    // remaining data and end the stream, if appropriate.
    if (state.length > 0 && state.decoder) {
      ret = fromList(n, state);
      state.length -= ret.length;
    }

    if (state.length === 0)
      endReadable(this);

    return ret;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    process.nextTick(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    process.nextTick(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      process.nextTick(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    //if (state.objectMode && util.isNullOrUndefined(chunk))
    if (state.objectMode && (chunk === null || chunk === undefined))
      return;
    else if (!state.objectMode && (!chunk || !chunk.length))
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"_process":149,"buffer":7,"core-util-is":156,"events":146,"inherits":147,"isarray":148,"stream":161,"string_decoder/":162}],154:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":151,"core-util-is":156,"inherits":147}],155:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      cb(er);
    });
  else
    cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))
},{"./_stream_duplex":151,"_process":149,"buffer":7,"core-util-is":156,"inherits":147,"stream":161}],156:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,require("buffer").Buffer)
},{"buffer":7}],157:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":152}],158:[function(require,module,exports){
var Stream = require('stream'); // hack to fix a circular dependency issue when used with browserify
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":151,"./lib/_stream_passthrough.js":152,"./lib/_stream_readable.js":153,"./lib/_stream_transform.js":154,"./lib/_stream_writable.js":155,"stream":161}],159:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":154}],160:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":155}],161:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":146,"inherits":147,"readable-stream/duplex.js":150,"readable-stream/passthrough.js":157,"readable-stream/readable.js":158,"readable-stream/transform.js":159,"readable-stream/writable.js":160}],162:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":7}],163:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],164:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":163,"_process":149,"inherits":147}],165:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":166}],166:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],167:[function(require,module,exports){
var jws = require('jws');

module.exports.decode = function (jwt) {
  var decoded = jws.decode(jwt, {json: true});
  return decoded && decoded.payload;
};

module.exports.sign = function(payload, secretOrPrivateKey, options) {
  options = options || {};

  var header = {typ: 'JWT', alg: options.algorithm || 'HS256'};

  if (options.header) {
    Object.keys(options.header).forEach(function (k) {
      header[k] = options.header[k];
    });
  }

  payload.iat = Math.floor(Date.now() / 1000);

  if (options.expiresInMinutes) {
    var ms = options.expiresInMinutes * 60;
    payload.exp = payload.iat + ms;
  }

  if (options.audience)
    payload.aud = options.audience;

  if (options.issuer)
    payload.iss = options.issuer;

  if (options.subject)
    payload.sub = options.subject;

  var signed = jws.sign({header: header, payload: payload, secret: secretOrPrivateKey});

  return signed;
};

module.exports.verify = function(jwtString, secretOrPublicKey, options, callback) {
  if ((typeof options === 'function') && !callback) callback = options;
  if (!options) options = {};

  if (!jwtString)
    return callback(new JsonWebTokenError('jwt must be provided'));

  var parts = jwtString.split('.');
  if (parts.length !== 3)
    return callback(new JsonWebTokenError('jwt malformed'));

  if (parts[2].trim() === '' && secretOrPublicKey)
    return callback(new JsonWebTokenError('jwt signature is required'));

  var valid;
  try {
    valid = jws.verify(jwtString, secretOrPublicKey);
  }
  catch (e) {
    return callback(e);
  }

  if (!valid)
    return callback(new JsonWebTokenError('invalid signature'));

  var payload;

  try {
   payload = this.decode(jwtString);
  } catch(err) {
    return callback(err);
  }

  if (payload.exp) {
    if (Math.floor(Date.now() / 1000) >= payload.exp)
      return callback(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000)));
  }

  if (options.audience) {
    var audiences = Array.isArray(options.audience)? options.audience : [options.audience];
    var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    
    var match = target.some(function(aud) { return audiences.indexOf(aud) != -1; });

    if (!match)
      return callback(new JsonWebTokenError('jwt audience invalid. expected: ' + payload.aud));
  }

  if (options.issuer) {
    if (payload.iss !== options.issuer)
      return callback(new JsonWebTokenError('jwt issuer invalid. expected: ' + payload.iss));
  }

  callback(null, payload);
};

var JsonWebTokenError = module.exports.JsonWebTokenError = function (message, error) {
  Error.call(this, message);
  this.name = 'JsonWebTokenError';
  this.message = message;
  if (error) this.inner = error;
};

JsonWebTokenError.prototype = Object.create(Error.prototype);
JsonWebTokenError.prototype.constructor = JsonWebTokenError;

var TokenExpiredError = module.exports.TokenExpiredError = function (message, expiredAt) {
  JsonWebTokenError.call(this, message);
  this.name = 'TokenExpiredError';
  this.expiredAt = expiredAt;
};
TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);
TokenExpiredError.prototype.constructor = TokenExpiredError;

},{"jws":172}],168:[function(require,module,exports){
(function (Buffer){

var navigator = {};
navigator.uesrAgent = false;

var window = {};
/*
 * jsrsasign 4.2.1 (c) 2010-2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
yahoo-min.js
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var b=arguments,g=null,e,c,f;for(e=0;e<b.length;e=e+1){f=(""+b[e]).split(".");g=YAHOO;for(c=(f[0]=="YAHOO")?1:0;c<f.length;c=c+1){g[f[c]]=g[f[c]]||{};g=g[f[c]];}}return g;};YAHOO.log=function(d,a,c){var b=YAHOO.widget.Logger;if(b&&b.log){return b.log(d,a,c);}else{return false;}};YAHOO.register=function(a,f,e){var k=YAHOO.env.modules,c,j,h,g,d;if(!k[a]){k[a]={versions:[],builds:[]};}c=k[a];j=e.version;h=e.build;g=YAHOO.env.listeners;c.name=a;c.version=j;c.build=h;c.versions.push(j);c.builds.push(h);c.mainClass=f;for(d=0;d<g.length;d=d+1){g[d](c);}if(f){f.VERSION=j;f.BUILD=h;}else{YAHOO.log("mainClass is undefined for module "+a,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(a){return YAHOO.env.modules[a]||null;};YAHOO.env.parseUA=function(d){var e=function(i){var j=0;return parseFloat(i.replace(/\./g,function(){return(j++==1)?"":".";}));},h=navigator,g={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:h&&h.cajaVersion,secure:false,os:null},c=d||(navigator&&navigator.userAgent),f=window&&window.location,b=f&&f.href,a;g.secure=b&&(b.toLowerCase().indexOf("https")===0);if(c){if((/windows|win32/i).test(c)){g.os="windows";}else{if((/macintosh/i).test(c)){g.os="macintosh";}else{if((/rhino/i).test(c)){g.os="rhino";}}}if((/KHTML/).test(c)){g.webkit=1;}a=c.match(/AppleWebKit\/([^\s]*)/);if(a&&a[1]){g.webkit=e(a[1]);if(/ Mobile\//.test(c)){g.mobile="Apple";a=c.match(/OS ([^\s]*)/);if(a&&a[1]){a=e(a[1].replace("_","."));}g.ios=a;g.ipad=g.ipod=g.iphone=0;a=c.match(/iPad|iPod|iPhone/);if(a&&a[0]){g[a[0].toLowerCase()]=g.ios;}}else{a=c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);if(a){g.mobile=a[0];}if(/webOS/.test(c)){g.mobile="WebOS";a=c.match(/webOS\/([^\s]*);/);if(a&&a[1]){g.webos=e(a[1]);}}if(/ Android/.test(c)){g.mobile="Android";a=c.match(/Android ([^\s]*);/);if(a&&a[1]){g.android=e(a[1]);}}}a=c.match(/Chrome\/([^\s]*)/);if(a&&a[1]){g.chrome=e(a[1]);}else{a=c.match(/AdobeAIR\/([^\s]*)/);if(a){g.air=a[0];}}}if(!g.webkit){a=c.match(/Opera[\s\/]([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);a=c.match(/Version\/([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);}a=c.match(/Opera Mini[^;]*/);if(a){g.mobile=a[0];}}else{a=c.match(/MSIE\s([^;]*)/);if(a&&a[1]){g.ie=e(a[1]);}else{a=c.match(/Gecko\/([^\s]*)/);if(a){g.gecko=1;a=c.match(/rv:([^\s\)]*)/);if(a&&a[1]){g.gecko=e(a[1]);}}}}}}return g;};YAHOO.env.ua=YAHOO.env.parseUA();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var b=YAHOO_config.listener,a=YAHOO.env.listeners,d=true,c;if(b){for(c=0;c<a.length;c++){if(a[c]==b){d=false;break;}}if(d){a.push(b);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var f=YAHOO.lang,a=Object.prototype,c="[object Array]",h="[object Function]",i="[object Object]",b=[],g={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;","`":"&#x60;"},d=["toString","valueOf"],e={isArray:function(j){return a.toString.apply(j)===c;},isBoolean:function(j){return typeof j==="boolean";},isFunction:function(j){return(typeof j==="function")||a.toString.apply(j)===h;},isNull:function(j){return j===null;},isNumber:function(j){return typeof j==="number"&&isFinite(j);},isObject:function(j){return(j&&(typeof j==="object"||f.isFunction(j)))||false;},isString:function(j){return typeof j==="string";},isUndefined:function(j){return typeof j==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(l,k){var j,n,m;for(j=0;j<d.length;j=j+1){n=d[j];m=k[n];if(f.isFunction(m)&&m!=a[n]){l[n]=m;}}}:function(){},escapeHTML:function(j){return j.replace(/[&<>"'\/`]/g,function(k){return g[k];});},extend:function(m,n,l){if(!n||!m){throw new Error("extend failed, please check that "+"all dependencies are included.");}var k=function(){},j;k.prototype=n.prototype;m.prototype=new k();m.prototype.constructor=m;m.superclass=n.prototype;if(n.prototype.constructor==a.constructor){n.prototype.constructor=n;}if(l){for(j in l){if(f.hasOwnProperty(l,j)){m.prototype[j]=l[j];}}f._IEEnumFix(m.prototype,l);}},augmentObject:function(n,m){if(!m||!n){throw new Error("Absorb failed, verify dependencies.");}var j=arguments,l,o,k=j[2];if(k&&k!==true){for(l=2;l<j.length;l=l+1){n[j[l]]=m[j[l]];}}else{for(o in m){if(k||!(o in n)){n[o]=m[o];}}f._IEEnumFix(n,m);}return n;},augmentProto:function(m,l){if(!l||!m){throw new Error("Augment failed, verify dependencies.");}var j=[m.prototype,l.prototype],k;for(k=2;k<arguments.length;k=k+1){j.push(arguments[k]);}f.augmentObject.apply(this,j);return m;},dump:function(j,p){var l,n,r=[],t="{...}",k="f(){...}",q=", ",m=" => ";if(!f.isObject(j)){return j+"";}else{if(j instanceof Date||("nodeType" in j&&"tagName" in j)){return j;}else{if(f.isFunction(j)){return k;}}}p=(f.isNumber(p))?p:3;if(f.isArray(j)){r.push("[");for(l=0,n=j.length;l<n;l=l+1){if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}if(r.length>1){r.pop();}r.push("]");}else{r.push("{");for(l in j){if(f.hasOwnProperty(j,l)){r.push(l+m);if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}}if(r.length>1){r.pop();}r.push("}");}return r.join("");},substitute:function(x,y,E,l){var D,C,B,G,t,u,F=[],p,z=x.length,A="dump",r=" ",q="{",m="}",n,w;for(;;){D=x.lastIndexOf(q,z);if(D<0){break;}C=x.indexOf(m,D);if(D+1>C){break;}p=x.substring(D+1,C);G=p;u=null;B=G.indexOf(r);if(B>-1){u=G.substring(B+1);G=G.substring(0,B);}t=y[G];if(E){t=E(G,t,u);}if(f.isObject(t)){if(f.isArray(t)){t=f.dump(t,parseInt(u,10));}else{u=u||"";n=u.indexOf(A);if(n>-1){u=u.substring(4);}w=t.toString();if(w===i||n>-1){t=f.dump(t,parseInt(u,10));}else{t=w;}}}else{if(!f.isString(t)&&!f.isNumber(t)){t="~-"+F.length+"-~";F[F.length]=p;}}x=x.substring(0,D)+t+x.substring(C+1);if(l===false){z=D-1;}}for(D=F.length-1;D>=0;D=D-1){x=x.replace(new RegExp("~-"+D+"-~"),"{"+F[D]+"}","g");}return x;},trim:function(j){try{return j.replace(/^\s+|\s+$/g,"");}catch(k){return j;
}},merge:function(){var n={},k=arguments,j=k.length,m;for(m=0;m<j;m=m+1){f.augmentObject(n,k[m],true);}return n;},later:function(t,k,u,n,p){t=t||0;k=k||{};var l=u,s=n,q,j;if(f.isString(u)){l=k[u];}if(!l){throw new TypeError("method undefined");}if(!f.isUndefined(n)&&!f.isArray(s)){s=[n];}q=function(){l.apply(k,s||b);};j=(p)?setInterval(q,t):setTimeout(q,t);return{interval:p,cancel:function(){if(this.interval){clearInterval(j);}else{clearTimeout(j);}}};},isValue:function(j){return(f.isObject(j)||f.isString(j)||f.isNumber(j)||f.isBoolean(j));}};f.hasOwnProperty=(a.hasOwnProperty)?function(j,k){return j&&j.hasOwnProperty&&j.hasOwnProperty(k);}:function(j,k){return !f.isUndefined(j[k])&&j.constructor.prototype[k]!==j[k];};e.augmentObject(f,e,true);YAHOO.util.Lang=f;f.augment=f.augmentProto;YAHOO.augment=f.augmentProto;YAHOO.extend=f.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.9.0",build:"2800"});
/*! CryptoJS v3.1.2 core-fix.js
 * code.google.com/p/crypto-js
 * (c) 2009-2013 by Jeff Mott. All rights reserved.
 * code.google.com/p/crypto-js/wiki/License
 * THIS IS FIX of 'core.js' to fix Hmac issue.
 * https://code.google.com/p/crypto-js/issues/detail?id=84
 * https://crypto-js.googlecode.com/svn-history/r667/branches/3.x/src/core.js
 */
var CryptoJS=CryptoJS||(function(e,g){var a={};var b=a.lib={};var j=b.Base=(function(){function n(){}return{extend:function(p){n.prototype=this;var o=new n();if(p){o.mixIn(p)}if(!o.hasOwnProperty("init")){o.init=function(){o.$super.init.apply(this,arguments)}}o.init.prototype=o;o.$super=this;return o},create:function(){var o=this.extend();o.init.apply(o,arguments);return o},init:function(){},mixIn:function(p){for(var o in p){if(p.hasOwnProperty(o)){this[o]=p[o]}}if(p.hasOwnProperty("toString")){this.toString=p.toString}},clone:function(){return this.init.prototype.extend(this)}}}());var l=b.WordArray=j.extend({init:function(o,n){o=this.words=o||[];if(n!=g){this.sigBytes=n}else{this.sigBytes=o.length*4}},toString:function(n){return(n||h).stringify(this)},concat:function(t){var q=this.words;var p=t.words;var n=this.sigBytes;var s=t.sigBytes;this.clamp();if(n%4){for(var r=0;r<s;r++){var o=(p[r>>>2]>>>(24-(r%4)*8))&255;q[(n+r)>>>2]|=o<<(24-((n+r)%4)*8)}}else{for(var r=0;r<s;r+=4){q[(n+r)>>>2]=p[r>>>2]}}this.sigBytes+=s;return this},clamp:function(){var o=this.words;var n=this.sigBytes;o[n>>>2]&=4294967295<<(32-(n%4)*8);o.length=e.ceil(n/4)},clone:function(){var n=j.clone.call(this);n.words=this.words.slice(0);return n},random:function(p){var o=[];for(var n=0;n<p;n+=4){o.push((e.random()*4294967296)|0)}return new l.init(o,p)}});var m=a.enc={};var h=m.Hex={stringify:function(p){var r=p.words;var o=p.sigBytes;var q=[];for(var n=0;n<o;n++){var s=(r[n>>>2]>>>(24-(n%4)*8))&255;q.push((s>>>4).toString(16));q.push((s&15).toString(16))}return q.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o+=2){q[o>>>3]|=parseInt(p.substr(o,2),16)<<(24-(o%8)*4)}return new l.init(q,n/2)}};var d=m.Latin1={stringify:function(q){var r=q.words;var p=q.sigBytes;var n=[];for(var o=0;o<p;o++){var s=(r[o>>>2]>>>(24-(o%4)*8))&255;n.push(String.fromCharCode(s))}return n.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o++){q[o>>>2]|=(p.charCodeAt(o)&255)<<(24-(o%4)*8)}return new l.init(q,n)}};var c=m.Utf8={stringify:function(n){try{return decodeURIComponent(escape(d.stringify(n)))}catch(o){throw new Error("Malformed UTF-8 data")}},parse:function(n){return d.parse(unescape(encodeURIComponent(n)))}};var i=b.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new l.init();this._nDataBytes=0},_append:function(n){if(typeof n=="string"){n=c.parse(n)}this._data.concat(n);this._nDataBytes+=n.sigBytes},_process:function(w){var q=this._data;var x=q.words;var n=q.sigBytes;var t=this.blockSize;var v=t*4;var u=n/v;if(w){u=e.ceil(u)}else{u=e.max((u|0)-this._minBufferSize,0)}var s=u*t;var r=e.min(s*4,n);if(s){for(var p=0;p<s;p+=t){this._doProcessBlock(x,p)}var o=x.splice(0,s);q.sigBytes-=r}return new l.init(o,r)},clone:function(){var n=j.clone.call(this);n._data=this._data.clone();return n},_minBufferSize:0});var f=b.Hasher=i.extend({cfg:j.extend(),init:function(n){this.cfg=this.cfg.extend(n);this.reset()},reset:function(){i.reset.call(this);this._doReset()},update:function(n){this._append(n);this._process();return this},finalize:function(n){if(n){this._append(n)}var o=this._doFinalize();return o},blockSize:512/32,_createHelper:function(n){return function(p,o){return new n.init(o).finalize(p)}},_createHmacHelper:function(n){return function(p,o){return new k.HMAC.init(n,o).finalize(p)}}});var k=a.algo={};return a}(Math));/*
CryptoJS v3.1.2 x64-core-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(g){var a=CryptoJS,f=a.lib,e=f.Base,h=f.WordArray,a=a.x64={};a.Word=e.extend({init:function(b,c){this.high=b;this.low=c}});a.WordArray=e.extend({init:function(b,c){b=this.words=b||[];this.sigBytes=c!=g?c:8*b.length},toX32:function(){for(var b=this.words,c=b.length,a=[],d=0;d<c;d++){var e=b[d];a.push(e.high);a.push(e.low)}return h.create(a,this.sigBytes)},clone:function(){for(var b=e.clone.call(this),c=b.words=this.words.slice(0),a=c.length,d=0;d<a;d++)c[d]=c[d].clone();return b}})})();
/*
CryptoJS v3.1.2 hmac-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,k=c.enc.Utf8;c.algo.HMAC=c.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=k.parse(b));var c=a.blockSize,e=4*c;b.sigBytes>e&&(b=a.finalize(b));b.clamp();for(var f=this._oKey=b.clone(),g=this._iKey=b.clone(),h=f.words,j=g.words,d=0;d<c;d++)h[d]^=1549556828,j[d]^=909522486;f.sigBytes=g.sigBytes=e;this.reset()},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey)},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}})})();
/*
CryptoJS v3.1.2 sha256-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(k){for(var g=CryptoJS,h=g.lib,v=h.WordArray,j=h.Hasher,h=g.algo,s=[],t=[],u=function(q){return 4294967296*(q-(q|0))|0},l=2,b=0;64>b;){var d;a:{d=l;for(var w=k.sqrt(d),r=2;r<=w;r++)if(!(d%r)){d=!1;break a}d=!0}d&&(8>b&&(s[b]=u(k.pow(l,0.5))),t[b]=u(k.pow(l,1/3)),b++);l++}var n=[],h=h.SHA256=j.extend({_doReset:function(){this._hash=new v.init(s.slice(0))},_doProcessBlock:function(q,h){for(var a=this._hash.words,c=a[0],d=a[1],b=a[2],k=a[3],f=a[4],g=a[5],j=a[6],l=a[7],e=0;64>e;e++){if(16>e)n[e]=
q[h+e]|0;else{var m=n[e-15],p=n[e-2];n[e]=((m<<25|m>>>7)^(m<<14|m>>>18)^m>>>3)+n[e-7]+((p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10)+n[e-16]}m=l+((f<<26|f>>>6)^(f<<21|f>>>11)^(f<<7|f>>>25))+(f&g^~f&j)+t[e]+n[e];p=((c<<30|c>>>2)^(c<<19|c>>>13)^(c<<10|c>>>22))+(c&d^c&b^d&b);l=j;j=g;g=f;f=k+m|0;k=b;b=d;d=c;c=m+p|0}a[0]=a[0]+c|0;a[1]=a[1]+d|0;a[2]=a[2]+b|0;a[3]=a[3]+k|0;a[4]=a[4]+f|0;a[5]=a[5]+g|0;a[6]=a[6]+j|0;a[7]=a[7]+l|0},_doFinalize:function(){var d=this._data,b=d.words,a=8*this._nDataBytes,c=8*d.sigBytes;
b[c>>>5]|=128<<24-c%32;b[(c+64>>>9<<4)+14]=k.floor(a/4294967296);b[(c+64>>>9<<4)+15]=a;d.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var b=j.clone.call(this);b._hash=this._hash.clone();return b}});g.SHA256=j._createHelper(h);g.HmacSHA256=j._createHmacHelper(h)})(Math);
/*
CryptoJS v3.1.2 sha224-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,d=b.lib.WordArray,a=b.algo,c=a.SHA256,a=a.SHA224=c.extend({_doReset:function(){this._hash=new d.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var a=c._doFinalize.call(this);a.sigBytes-=4;return a}});b.SHA224=c._createHelper(a);b.HmacSHA224=c._createHmacHelper(a)})();
/*
CryptoJS v3.1.2 sha512-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function a(){return d.create.apply(d,arguments)}for(var n=CryptoJS,r=n.lib.Hasher,e=n.x64,d=e.Word,T=e.WordArray,e=n.algo,ea=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),
a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,
2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),
a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,
3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],v=[],w=0;80>w;w++)v[w]=a();e=e.SHA512=r.extend({_doReset:function(){this._hash=new T.init([new d.init(1779033703,4089235720),new d.init(3144134277,2227873595),new d.init(1013904242,4271175723),new d.init(2773480762,1595750129),new d.init(1359893119,2917565137),new d.init(2600822924,725511199),new d.init(528734635,4215389547),new d.init(1541459225,327033209)])},_doProcessBlock:function(a,d){for(var f=this._hash.words,
F=f[0],e=f[1],n=f[2],r=f[3],G=f[4],H=f[5],I=f[6],f=f[7],w=F.high,J=F.low,X=e.high,K=e.low,Y=n.high,L=n.low,Z=r.high,M=r.low,$=G.high,N=G.low,aa=H.high,O=H.low,ba=I.high,P=I.low,ca=f.high,Q=f.low,k=w,g=J,z=X,x=K,A=Y,y=L,U=Z,B=M,l=$,h=N,R=aa,C=O,S=ba,D=P,V=ca,E=Q,m=0;80>m;m++){var s=v[m];if(16>m)var j=s.high=a[d+2*m]|0,b=s.low=a[d+2*m+1]|0;else{var j=v[m-15],b=j.high,p=j.low,j=(b>>>1|p<<31)^(b>>>8|p<<24)^b>>>7,p=(p>>>1|b<<31)^(p>>>8|b<<24)^(p>>>7|b<<25),u=v[m-2],b=u.high,c=u.low,u=(b>>>19|c<<13)^(b<<
3|c>>>29)^b>>>6,c=(c>>>19|b<<13)^(c<<3|b>>>29)^(c>>>6|b<<26),b=v[m-7],W=b.high,t=v[m-16],q=t.high,t=t.low,b=p+b.low,j=j+W+(b>>>0<p>>>0?1:0),b=b+c,j=j+u+(b>>>0<c>>>0?1:0),b=b+t,j=j+q+(b>>>0<t>>>0?1:0);s.high=j;s.low=b}var W=l&R^~l&S,t=h&C^~h&D,s=k&z^k&A^z&A,T=g&x^g&y^x&y,p=(k>>>28|g<<4)^(k<<30|g>>>2)^(k<<25|g>>>7),u=(g>>>28|k<<4)^(g<<30|k>>>2)^(g<<25|k>>>7),c=ea[m],fa=c.high,da=c.low,c=E+((h>>>14|l<<18)^(h>>>18|l<<14)^(h<<23|l>>>9)),q=V+((l>>>14|h<<18)^(l>>>18|h<<14)^(l<<23|h>>>9))+(c>>>0<E>>>0?1:
0),c=c+t,q=q+W+(c>>>0<t>>>0?1:0),c=c+da,q=q+fa+(c>>>0<da>>>0?1:0),c=c+b,q=q+j+(c>>>0<b>>>0?1:0),b=u+T,s=p+s+(b>>>0<u>>>0?1:0),V=S,E=D,S=R,D=C,R=l,C=h,h=B+c|0,l=U+q+(h>>>0<B>>>0?1:0)|0,U=A,B=y,A=z,y=x,z=k,x=g,g=c+b|0,k=q+s+(g>>>0<c>>>0?1:0)|0}J=F.low=J+g;F.high=w+k+(J>>>0<g>>>0?1:0);K=e.low=K+x;e.high=X+z+(K>>>0<x>>>0?1:0);L=n.low=L+y;n.high=Y+A+(L>>>0<y>>>0?1:0);M=r.low=M+B;r.high=Z+U+(M>>>0<B>>>0?1:0);N=G.low=N+h;G.high=$+l+(N>>>0<h>>>0?1:0);O=H.low=O+C;H.high=aa+R+(O>>>0<C>>>0?1:0);P=I.low=P+D;
I.high=ba+S+(P>>>0<D>>>0?1:0);Q=f.low=Q+E;f.high=ca+V+(Q>>>0<E>>>0?1:0)},_doFinalize:function(){var a=this._data,d=a.words,f=8*this._nDataBytes,e=8*a.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+128>>>10<<5)+30]=Math.floor(f/4294967296);d[(e+128>>>10<<5)+31]=f;a.sigBytes=4*d.length;this._process();return this._hash.toX32()},clone:function(){var a=r.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});n.SHA512=r._createHelper(e);n.HmacSHA512=r._createHmacHelper(e)})();
/*
CryptoJS v3.1.2 sha384-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,a=c.x64,b=a.Word,e=a.WordArray,a=c.algo,d=a.SHA512,a=a.SHA384=d.extend({_doReset:function(){this._hash=new e.init([new b.init(3418070365,3238371032),new b.init(1654270250,914150663),new b.init(2438529370,812702999),new b.init(355462360,4144912697),new b.init(1731405415,4290775857),new b.init(2394180231,1750603025),new b.init(3675008525,1694076839),new b.init(1203062813,3204075428)])},_doFinalize:function(){var a=d._doFinalize.call(this);a.sigBytes-=16;return a}});c.SHA384=
d._createHelper(a);c.HmacSHA384=d._createHmacHelper(a)})();
/*
CryptoJS v3.1.2 md5-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(E){function h(a,f,g,j,p,h,k){a=a+(f&g|~f&j)+p+k;return(a<<h|a>>>32-h)+f}function k(a,f,g,j,p,h,k){a=a+(f&j|g&~j)+p+k;return(a<<h|a>>>32-h)+f}function l(a,f,g,j,h,k,l){a=a+(f^g^j)+h+l;return(a<<k|a>>>32-k)+f}function n(a,f,g,j,h,k,l){a=a+(g^(f|~j))+h+l;return(a<<k|a>>>32-k)+f}for(var r=CryptoJS,q=r.lib,F=q.WordArray,s=q.Hasher,q=r.algo,a=[],t=0;64>t;t++)a[t]=4294967296*E.abs(E.sin(t+1))|0;q=q.MD5=s.extend({_doReset:function(){this._hash=new F.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(m,f){for(var g=0;16>g;g++){var j=f+g,p=m[j];m[j]=(p<<8|p>>>24)&16711935|(p<<24|p>>>8)&4278255360}var g=this._hash.words,j=m[f+0],p=m[f+1],q=m[f+2],r=m[f+3],s=m[f+4],t=m[f+5],u=m[f+6],v=m[f+7],w=m[f+8],x=m[f+9],y=m[f+10],z=m[f+11],A=m[f+12],B=m[f+13],C=m[f+14],D=m[f+15],b=g[0],c=g[1],d=g[2],e=g[3],b=h(b,c,d,e,j,7,a[0]),e=h(e,b,c,d,p,12,a[1]),d=h(d,e,b,c,q,17,a[2]),c=h(c,d,e,b,r,22,a[3]),b=h(b,c,d,e,s,7,a[4]),e=h(e,b,c,d,t,12,a[5]),d=h(d,e,b,c,u,17,a[6]),c=h(c,d,e,b,v,22,a[7]),
b=h(b,c,d,e,w,7,a[8]),e=h(e,b,c,d,x,12,a[9]),d=h(d,e,b,c,y,17,a[10]),c=h(c,d,e,b,z,22,a[11]),b=h(b,c,d,e,A,7,a[12]),e=h(e,b,c,d,B,12,a[13]),d=h(d,e,b,c,C,17,a[14]),c=h(c,d,e,b,D,22,a[15]),b=k(b,c,d,e,p,5,a[16]),e=k(e,b,c,d,u,9,a[17]),d=k(d,e,b,c,z,14,a[18]),c=k(c,d,e,b,j,20,a[19]),b=k(b,c,d,e,t,5,a[20]),e=k(e,b,c,d,y,9,a[21]),d=k(d,e,b,c,D,14,a[22]),c=k(c,d,e,b,s,20,a[23]),b=k(b,c,d,e,x,5,a[24]),e=k(e,b,c,d,C,9,a[25]),d=k(d,e,b,c,r,14,a[26]),c=k(c,d,e,b,w,20,a[27]),b=k(b,c,d,e,B,5,a[28]),e=k(e,b,
c,d,q,9,a[29]),d=k(d,e,b,c,v,14,a[30]),c=k(c,d,e,b,A,20,a[31]),b=l(b,c,d,e,t,4,a[32]),e=l(e,b,c,d,w,11,a[33]),d=l(d,e,b,c,z,16,a[34]),c=l(c,d,e,b,C,23,a[35]),b=l(b,c,d,e,p,4,a[36]),e=l(e,b,c,d,s,11,a[37]),d=l(d,e,b,c,v,16,a[38]),c=l(c,d,e,b,y,23,a[39]),b=l(b,c,d,e,B,4,a[40]),e=l(e,b,c,d,j,11,a[41]),d=l(d,e,b,c,r,16,a[42]),c=l(c,d,e,b,u,23,a[43]),b=l(b,c,d,e,x,4,a[44]),e=l(e,b,c,d,A,11,a[45]),d=l(d,e,b,c,D,16,a[46]),c=l(c,d,e,b,q,23,a[47]),b=n(b,c,d,e,j,6,a[48]),e=n(e,b,c,d,v,10,a[49]),d=n(d,e,b,c,
C,15,a[50]),c=n(c,d,e,b,t,21,a[51]),b=n(b,c,d,e,A,6,a[52]),e=n(e,b,c,d,r,10,a[53]),d=n(d,e,b,c,y,15,a[54]),c=n(c,d,e,b,p,21,a[55]),b=n(b,c,d,e,w,6,a[56]),e=n(e,b,c,d,D,10,a[57]),d=n(d,e,b,c,u,15,a[58]),c=n(c,d,e,b,B,21,a[59]),b=n(b,c,d,e,s,6,a[60]),e=n(e,b,c,d,z,10,a[61]),d=n(d,e,b,c,q,15,a[62]),c=n(c,d,e,b,x,21,a[63]);g[0]=g[0]+b|0;g[1]=g[1]+c|0;g[2]=g[2]+d|0;g[3]=g[3]+e|0},_doFinalize:function(){var a=this._data,f=a.words,g=8*this._nDataBytes,j=8*a.sigBytes;f[j>>>5]|=128<<24-j%32;var h=E.floor(g/
4294967296);f[(j+64>>>9<<4)+15]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;f[(j+64>>>9<<4)+14]=(g<<8|g>>>24)&16711935|(g<<24|g>>>8)&4278255360;a.sigBytes=4*(f.length+1);this._process();a=this._hash;f=a.words;for(g=0;4>g;g++)j=f[g],f[g]=(j<<8|j>>>24)&16711935|(j<<24|j>>>8)&4278255360;return a},clone:function(){var a=s.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=s._createHelper(q);r.HmacMD5=s._createHmacHelper(q)})(Math);
/*
CryptoJS v3.1.2 enc-base64-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
/*
CryptoJS v3.1.2 cipher-core-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
CryptoJS.lib.Cipher||function(u){var g=CryptoJS,f=g.lib,k=f.Base,l=f.WordArray,q=f.BufferedBlockAlgorithm,r=g.enc.Base64,v=g.algo.EvpKDF,n=f.Cipher=q.extend({cfg:k.extend(),createEncryptor:function(a,b){return this.create(this._ENC_XFORM_MODE,a,b)},createDecryptor:function(a,b){return this.create(this._DEC_XFORM_MODE,a,b)},init:function(a,b,c){this.cfg=this.cfg.extend(c);this._xformMode=a;this._key=b;this.reset()},reset:function(){q.reset.call(this);this._doReset()},process:function(a){this._append(a);
return this._process()},finalize:function(a){a&&this._append(a);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(a){return{encrypt:function(b,c,d){return("string"==typeof c?s:j).encrypt(a,b,c,d)},decrypt:function(b,c,d){return("string"==typeof c?s:j).decrypt(a,b,c,d)}}}});f.StreamCipher=n.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var m=g.mode={},t=function(a,b,c){var d=this._iv;d?this._iv=u:d=this._prevBlock;for(var e=
0;e<c;e++)a[b+e]^=d[e]},h=(f.BlockCipherMode=k.extend({createEncryptor:function(a,b){return this.Encryptor.create(a,b)},createDecryptor:function(a,b){return this.Decryptor.create(a,b)},init:function(a,b){this._cipher=a;this._iv=b}})).extend();h.Encryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize;t.call(this,a,b,d);c.encryptBlock(a,b);this._prevBlock=a.slice(b,b+d)}});h.Decryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize,e=a.slice(b,b+d);c.decryptBlock(a,
b);t.call(this,a,b,d);this._prevBlock=e}});m=m.CBC=h;h=(g.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,e=[],f=0;f<c;f+=4)e.push(d);c=l.create(e,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};f.BlockCipher=n.extend({cfg:n.cfg.extend({mode:m,padding:h}),reset:function(){n.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;
this._mode=c.call(a,this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var p=f.CipherParams=k.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),m=(g.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;
return(a?l.create([1398893684,1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=l.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return p.create({ciphertext:a,salt:c})}},j=f.SerializableCipher=k.extend({cfg:k.extend({format:m}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var e=a.createEncryptor(c,d);b=e.finalize(b);e=e.cfg;return p.create({ciphertext:b,key:c,iv:e.iv,algorithm:a,mode:e.mode,padding:e.padding,
blockSize:a.blockSize,formatter:d.format})},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),g=(g.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=l.random(8));a=v.create({keySize:b+c}).compute(a,d);c=l.create(a.words.slice(b),4*c);a.sigBytes=4*b;return p.create({key:a,iv:c,salt:d})}},s=f.PasswordBasedCipher=j.extend({cfg:j.cfg.extend({kdf:g}),encrypt:function(a,
b,c,d){d=this.cfg.extend(d);c=d.kdf.execute(c,a.keySize,a.ivSize);d.iv=c.iv;a=j.encrypt.call(this,a,b,c.key,d);a.mixIn(c);return a},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);c=d.kdf.execute(c,a.keySize,a.ivSize,b.salt);d.iv=c.iv;return j.decrypt.call(this,a,b,c.key,d)}})}();
/*
CryptoJS v3.1.2 aes-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){for(var q=CryptoJS,x=q.lib.BlockCipher,r=q.algo,j=[],y=[],z=[],A=[],B=[],C=[],s=[],u=[],v=[],w=[],g=[],k=0;256>k;k++)g[k]=128>k?k<<1:k<<1^283;for(var n=0,l=0,k=0;256>k;k++){var f=l^l<<1^l<<2^l<<3^l<<4,f=f>>>8^f&255^99;j[n]=f;y[f]=n;var t=g[n],D=g[t],E=g[D],b=257*g[f]^16843008*f;z[n]=b<<24|b>>>8;A[n]=b<<16|b>>>16;B[n]=b<<8|b>>>24;C[n]=b;b=16843009*E^65537*D^257*t^16843008*n;s[f]=b<<24|b>>>8;u[f]=b<<16|b>>>16;v[f]=b<<8|b>>>24;w[f]=b;n?(n=t^g[g[g[E^t]]],l^=g[g[l]]):n=l=1}var F=[0,1,2,4,8,
16,32,64,128,27,54],r=r.AES=x.extend({_doReset:function(){for(var c=this._key,e=c.words,a=c.sigBytes/4,c=4*((this._nRounds=a+6)+1),b=this._keySchedule=[],h=0;h<c;h++)if(h<a)b[h]=e[h];else{var d=b[h-1];h%a?6<a&&4==h%a&&(d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255]):(d=d<<8|d>>>24,d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255],d^=F[h/a|0]<<24);b[h]=b[h-a]^d}e=this._invKeySchedule=[];for(a=0;a<c;a++)h=c-a,d=a%4?b[h]:b[h-4],e[a]=4>a||4>=h?d:s[j[d>>>24]]^u[j[d>>>16&255]]^v[j[d>>>
8&255]]^w[j[d&255]]},encryptBlock:function(c,e){this._doCryptBlock(c,e,this._keySchedule,z,A,B,C,j)},decryptBlock:function(c,e){var a=c[e+1];c[e+1]=c[e+3];c[e+3]=a;this._doCryptBlock(c,e,this._invKeySchedule,s,u,v,w,y);a=c[e+1];c[e+1]=c[e+3];c[e+3]=a},_doCryptBlock:function(c,e,a,b,h,d,j,m){for(var n=this._nRounds,f=c[e]^a[0],g=c[e+1]^a[1],k=c[e+2]^a[2],p=c[e+3]^a[3],l=4,t=1;t<n;t++)var q=b[f>>>24]^h[g>>>16&255]^d[k>>>8&255]^j[p&255]^a[l++],r=b[g>>>24]^h[k>>>16&255]^d[p>>>8&255]^j[f&255]^a[l++],s=
b[k>>>24]^h[p>>>16&255]^d[f>>>8&255]^j[g&255]^a[l++],p=b[p>>>24]^h[f>>>16&255]^d[g>>>8&255]^j[k&255]^a[l++],f=q,g=r,k=s;q=(m[f>>>24]<<24|m[g>>>16&255]<<16|m[k>>>8&255]<<8|m[p&255])^a[l++];r=(m[g>>>24]<<24|m[k>>>16&255]<<16|m[p>>>8&255]<<8|m[f&255])^a[l++];s=(m[k>>>24]<<24|m[p>>>16&255]<<16|m[f>>>8&255]<<8|m[g&255])^a[l++];p=(m[p>>>24]<<24|m[f>>>16&255]<<16|m[g>>>8&255]<<8|m[k&255])^a[l++];c[e]=q;c[e+1]=r;c[e+2]=s;c[e+3]=p},keySize:8});q.AES=x._createHelper(r)})();
/*
CryptoJS v3.1.2 tripledes-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function j(b,c){var a=(this._lBlock>>>b^this._rBlock)&c;this._rBlock^=a;this._lBlock^=a<<b}function l(b,c){var a=(this._rBlock>>>b^this._lBlock)&c;this._lBlock^=a;this._rBlock^=a<<b}var h=CryptoJS,e=h.lib,n=e.WordArray,e=e.BlockCipher,g=h.algo,q=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],p=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,
55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],r=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],s=[{"0":8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,
2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,
1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{"0":1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,
75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,
276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{"0":260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,
14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,
17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{"0":2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,
98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,
1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{"0":128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,
10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,
83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{"0":268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,
2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{"0":1048576,
16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,
496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{"0":134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,
2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,
2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],t=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],m=g.DES=e.extend({_doReset:function(){for(var b=this._key.words,c=[],a=0;56>a;a++){var f=q[a]-1;c[a]=b[f>>>5]>>>31-f%32&1}b=this._subKeys=[];for(f=0;16>f;f++){for(var d=b[f]=[],e=r[f],a=0;24>a;a++)d[a/6|0]|=c[(p[a]-1+e)%28]<<31-a%6,d[4+(a/6|0)]|=c[28+(p[a+24]-1+e)%28]<<31-a%6;d[0]=d[0]<<1|d[0]>>>31;for(a=1;7>a;a++)d[a]>>>=
4*(a-1)+3;d[7]=d[7]<<5|d[7]>>>27}c=this._invSubKeys=[];for(a=0;16>a;a++)c[a]=b[15-a]},encryptBlock:function(b,c){this._doCryptBlock(b,c,this._subKeys)},decryptBlock:function(b,c){this._doCryptBlock(b,c,this._invSubKeys)},_doCryptBlock:function(b,c,a){this._lBlock=b[c];this._rBlock=b[c+1];j.call(this,4,252645135);j.call(this,16,65535);l.call(this,2,858993459);l.call(this,8,16711935);j.call(this,1,1431655765);for(var f=0;16>f;f++){for(var d=a[f],e=this._lBlock,h=this._rBlock,g=0,k=0;8>k;k++)g|=s[k][((h^
d[k])&t[k])>>>0];this._lBlock=h;this._rBlock=e^g}a=this._lBlock;this._lBlock=this._rBlock;this._rBlock=a;j.call(this,1,1431655765);l.call(this,8,16711935);l.call(this,2,858993459);j.call(this,16,65535);j.call(this,4,252645135);b[c]=this._lBlock;b[c+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});h.DES=e._createHelper(m);g=g.TripleDES=e.extend({_doReset:function(){var b=this._key.words;this._des1=m.createEncryptor(n.create(b.slice(0,2)));this._des2=m.createEncryptor(n.create(b.slice(2,4)));this._des3=
m.createEncryptor(n.create(b.slice(4,6)))},encryptBlock:function(b,c){this._des1.encryptBlock(b,c);this._des2.decryptBlock(b,c);this._des3.encryptBlock(b,c)},decryptBlock:function(b,c){this._des3.decryptBlock(b,c);this._des2.encryptBlock(b,c);this._des1.decryptBlock(b,c)},keySize:6,ivSize:2,blockSize:2});h.TripleDES=e._createHelper(g)})();
/*
CryptoJS v3.1.2 sha1-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var k=CryptoJS,b=k.lib,m=b.WordArray,l=b.Hasher,d=[],b=k.algo.SHA1=l.extend({_doReset:function(){this._hash=new m.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(n,p){for(var a=this._hash.words,e=a[0],f=a[1],h=a[2],j=a[3],b=a[4],c=0;80>c;c++){if(16>c)d[c]=n[p+c]|0;else{var g=d[c-3]^d[c-8]^d[c-14]^d[c-16];d[c]=g<<1|g>>>31}g=(e<<5|e>>>27)+b+d[c];g=20>c?g+((f&h|~f&j)+1518500249):40>c?g+((f^h^j)+1859775393):60>c?g+((f&h|f&j|h&j)-1894007588):g+((f^h^
j)-899497514);b=j;j=h;h=f<<30|f>>>2;f=e;e=g}a[0]=a[0]+e|0;a[1]=a[1]+f|0;a[2]=a[2]+h|0;a[3]=a[3]+j|0;a[4]=a[4]+b|0},_doFinalize:function(){var b=this._data,d=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=Math.floor(a/4294967296);d[(e+64>>>9<<4)+15]=a;b.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var b=l.clone.call(this);b._hash=this._hash.clone();return b}});k.SHA1=l._createHelper(b);k.HmacSHA1=l._createHmacHelper(b)})();
/*
CryptoJS v3.1.2 ripemd160-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/*

(c) 2012 by Cedric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(){var q=CryptoJS,d=q.lib,n=d.WordArray,p=d.Hasher,d=q.algo,x=n.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),y=n.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),z=n.create([11,14,15,12,
5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=n.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),B=n.create([0,1518500249,1859775393,2400959708,2840853838]),C=n.create([1352829926,1548603684,1836072691,
2053994217,0]),d=d.RIPEMD160=p.extend({_doReset:function(){this._hash=n.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,v){for(var b=0;16>b;b++){var c=v+b,f=e[c];e[c]=(f<<8|f>>>24)&16711935|(f<<24|f>>>8)&4278255360}var c=this._hash.words,f=B.words,d=C.words,n=x.words,q=y.words,p=z.words,w=A.words,t,g,h,j,r,u,k,l,m,s;u=t=c[0];k=g=c[1];l=h=c[2];m=j=c[3];s=r=c[4];for(var a,b=0;80>b;b+=1)a=t+e[v+n[b]]|0,a=16>b?a+((g^h^j)+f[0]):32>b?a+((g&h|~g&j)+f[1]):48>b?
a+(((g|~h)^j)+f[2]):64>b?a+((g&j|h&~j)+f[3]):a+((g^(h|~j))+f[4]),a|=0,a=a<<p[b]|a>>>32-p[b],a=a+r|0,t=r,r=j,j=h<<10|h>>>22,h=g,g=a,a=u+e[v+q[b]]|0,a=16>b?a+((k^(l|~m))+d[0]):32>b?a+((k&m|l&~m)+d[1]):48>b?a+(((k|~l)^m)+d[2]):64>b?a+((k&l|~k&m)+d[3]):a+((k^l^m)+d[4]),a|=0,a=a<<w[b]|a>>>32-w[b],a=a+s|0,u=s,s=m,m=l<<10|l>>>22,l=k,k=a;a=c[1]+h+m|0;c[1]=c[2]+j+s|0;c[2]=c[3]+r+u|0;c[3]=c[4]+t+k|0;c[4]=c[0]+g+l|0;c[0]=a},_doFinalize:function(){var e=this._data,d=e.words,b=8*this._nDataBytes,c=8*e.sigBytes;
d[c>>>5]|=128<<24-c%32;d[(c+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;e.sigBytes=4*(d.length+1);this._process();e=this._hash;d=e.words;for(b=0;5>b;b++)c=d[b],d[b]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return e},clone:function(){var d=p.clone.call(this);d._hash=this._hash.clone();return d}});q.RIPEMD160=p._createHelper(d);q.HmacRIPEMD160=p._createHmacHelper(d)})(Math);
/*
CryptoJS v3.1.2 pbkdf2-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,a=b.lib,d=a.Base,m=a.WordArray,a=b.algo,q=a.HMAC,l=a.PBKDF2=d.extend({cfg:d.extend({keySize:4,hasher:a.SHA1,iterations:1}),init:function(a){this.cfg=this.cfg.extend(a)},compute:function(a,b){for(var c=this.cfg,f=q.create(c.hasher,a),g=m.create(),d=m.create([1]),l=g.words,r=d.words,n=c.keySize,c=c.iterations;l.length<n;){var h=f.update(b).finalize(d);f.reset();for(var j=h.words,s=j.length,k=h,p=1;p<c;p++){k=f.finalize(k);f.reset();for(var t=k.words,e=0;e<s;e++)j[e]^=t[e]}g.concat(h);
r[0]++}g.sigBytes=4*n;return g}});b.PBKDF2=function(a,b,c){return l.create(c).compute(a,b)}})();

/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64pad="=";function hex2b64(d){var b;var e;var a="";for(b=0;b+3<=d.length;b+=3){e=parseInt(d.substring(b,b+3),16);a+=b64map.charAt(e>>6)+b64map.charAt(e&63)}if(b+1==d.length){e=parseInt(d.substring(b,b+1),16);a+=b64map.charAt(e<<2)}else{if(b+2==d.length){e=parseInt(d.substring(b,b+2),16);a+=b64map.charAt(e>>2)+b64map.charAt((e&3)<<4)}}if(b64pad){while((a.length&3)>0){a+=b64pad}}return a}function b64tohex(f){var d="";var e;var b=0;var c;var a;for(e=0;e<f.length;++e){if(f.charAt(e)==b64pad){break}a=b64map.indexOf(f.charAt(e));if(a<0){continue}if(b==0){d+=int2char(a>>2);c=a&3;b=1}else{if(b==1){d+=int2char((c<<2)|(a>>4));c=a&15;b=2}else{if(b==2){d+=int2char(c);d+=int2char(a>>2);c=a&3;b=3}else{d+=int2char((c<<2)|(a>>4));d+=int2char(a&15);b=0}}}}if(b==1){d+=int2char(c<<2)}return d}function b64toBA(e){var d=b64tohex(e);var c;var b=new Array();for(c=0;2*c<d.length;++c){b[c]=parseInt(d.substring(2*c,2*c+2),16)}return b};
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f)}else{if(d==null&&"string"!=typeof e){this.fromString(e,256)}else{this.fromString(e,d)}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455}return o}if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a]}b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a}else{if(a<-1){this[0]=a+this.DV}else{this.t=0}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==256){e=8}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true}continue}d=false;if(f==0){this[this.t++]=a}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f))}else{this[this.t-1]|=a<<f}}f+=e;if(f>=this.DB){f-=this.DB}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this)}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l)}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e)}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f}}if(l>0){a=true}if(a){h+=int2char(l)}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return(this.s<0)?-d:d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16}if((b=a>>8)!=0){a=b;c+=8}if((b=a>>4)!=0){a=b;c+=4}if((b=a>>2)!=0){a=b;c+=2}if((b=a>>1)!=0){a=b;c+=1}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a]}for(a=c-1;a>=0;--a){b[a]=0}b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a]}b.t=Math.max(this.t-c,0);b.s=this.s}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b}for(d=f-1;d>=0;--d){e[d]=0}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp()}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b}if(b>0){d[this.t-e-1]|=(this.s&f)<<a}d.t=this.t-e;d.clamp()}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB}g-=d.s}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g}else{if(g>0){f[e++]=g}}f.t=e;f.clamp()}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t)}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e)}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1)}d.s=0;d.clamp()}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0)}if(g!=null){this.copyTo(g)}return}if(g==null){g=nbi()}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g)}else{w.copyTo(d);k.copyTo(g)}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g)}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g)}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h)}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g)}if(a<0){BigInteger.ZERO.subTo(g,g)}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c)}return c}function Classic(a){this.m=a}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}function cSqrTo(a,b){a.squareTo(b);this.reduce(b)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b)}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b)}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f)}else{var b=f;f=a;a=b}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a)}else{c=new Montgomery(a)}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h)}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0)}if(e){BigInteger.ZERO.subTo(this,this)}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1)}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this)}if(this.isEven()){this.dAddOffset(1,0)}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this)}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1)}else{d[0]=0}this.fromString(d,256)}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e))}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8)}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b}}if((f&128)!=0){f|=-256}if(a==0&&(this.s&128)!=(f&128)){++a}if(a>0||f!=this.s){c[a++]=f}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d])}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g)}e.t=this.t}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d])}e.t=c.t}e.s=h(this.s,c.s);e.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a]}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a)}else{this.lShiftTo(b,a)}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a)}else{this.rShiftTo(b,a)}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16}if((a&255)==0){a>>=8;b+=8}if((a&15)==0){a>>=4;b+=4}if((a&3)==0){a>>=2;b+=2}if((a&1)==0){++b}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a)}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB}g+=d.s}f.s=(g<0)?-1:0;if(g>0){f[e++]=g}else{if(g<-1){f[e++]=this.DV+g}}f.t=e;f.clamp()}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0}++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t)}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d)}e.clamp()}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e)}d.clamp();d.drShiftTo(1,d)}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp()}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1)}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b)}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1}else{if(o<48){h=3}else{if(o<144){h=4}else{if(o<768){h=5}else{h=6}}}}}if(o<8){v=new Classic(f)}else{if(f.isEven()){v=new Barrett(f)}else{v=new Montgomery(f)}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s)}}d=h;while((x&1)==0){x>>=1;--d}if((o-=d)<0){o+=this.DB;--l}if(u){p[x].copyTo(b);u=false}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2}if(d>0){v.sqrTo(b,c)}else{y=b;b=c;c=y}v.mulTo(c,p[x],b)}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h)}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b)}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h)}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b)}else{h.subTo(b,h);h.rShiftTo(1,h)}}if(f>0){h.lShiftTo(f,h)}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e)}g.rShiftTo(1,g)}else{if(!e.isEven()){e.subTo(f,e)}}e.rShiftTo(1,e)}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k)}l.rShiftTo(1,l)}else{if(!k.isEven()){k.subTo(f,k)}}k.rShiftTo(1,k)}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g)}e.subTo(k,e)}else{h.subTo(i,h);if(j){l.subTo(g,l)}k.subTo(e,k)}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k)}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++]}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Arcfour(){this.i=0;this.j=0;this.S=new Array()}function ARC4init(d){var c,a,b;for(c=0;c<256;++c){this.S[c]=c}a=0;for(c=0;c<256;++c){a=(a+this.S[c]+d[c%d.length])&255;b=this.S[c];this.S[c]=this.S[a];this.S[a]=b}this.i=0;this.j=0}function ARC4next(){var a;this.i=(this.i+1)&255;this.j=(this.j+this.S[this.i])&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[(a+this.S[this.i])&255]}Arcfour.prototype.init=ARC4init;Arcfour.prototype.next=ARC4next;function prng_newstate(){return new Arcfour()}var rng_psize=256;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var rng_state;var rng_pool;var rng_pptr;function rng_seed_int(a){rng_pool[rng_pptr++]^=a&255;rng_pool[rng_pptr++]^=(a>>8)&255;rng_pool[rng_pptr++]^=(a>>16)&255;rng_pool[rng_pptr++]^=(a>>24)&255;if(rng_pptr>=rng_psize){rng_pptr-=rng_psize}}function rng_seed_time(){rng_seed_int(new Date().getTime())}if(rng_pool==null){rng_pool=new Array();rng_pptr=0;var t;if(navigator.appName=="Netscape"&&navigator.appVersion<"5"&&window.crypto){var z=window.crypto.random(32);for(t=0;t<z.length;++t){rng_pool[rng_pptr++]=z.charCodeAt(t)&255}}while(rng_pptr<rng_psize){t=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=t>>>8;rng_pool[rng_pptr++]=t&255}rng_pptr=0;rng_seed_time()}function rng_get_byte(){if(rng_state==null){rng_seed_time();rng_state=prng_newstate();rng_state.init(rng_pool);for(rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr){rng_pool[rng_pptr]=0}rng_pptr=0}return rng_state.next()}function rng_get_bytes(b){var a;for(a=0;a<b.length;++a){b[a]=rng_get_byte()}}function SecureRandom(){}SecureRandom.prototype.nextBytes=rng_get_bytes;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function parseBigInt(b,a){return new BigInteger(b,a)}function linebrk(c,d){var a="";var b=0;while(b+d<c.length){a+=c.substring(b,b+d)+"\n";b+=d}return a+c.substring(b,c.length)}function byte2Hex(a){if(a<16){return"0"+a.toString(16)}else{return a.toString(16)}}function pkcs1pad2(e,h){if(h<e.length+11){alert("Message too long for RSA");return null}var g=new Array();var d=e.length-1;while(d>=0&&h>0){var f=e.charCodeAt(d--);if(f<128){g[--h]=f}else{if((f>127)&&(f<2048)){g[--h]=(f&63)|128;g[--h]=(f>>6)|192}else{g[--h]=(f&63)|128;g[--h]=((f>>6)&63)|128;g[--h]=(f>>12)|224}}}g[--h]=0;var b=new SecureRandom();var a=new Array();while(h>2){a[0]=0;while(a[0]==0){b.nextBytes(a)}g[--h]=a[0]}g[--h]=2;g[--h]=0;return new BigInteger(g)}function oaep_mgf1_arr(c,a,e){var b="",d=0;while(b.length<a){b+=e(String.fromCharCode.apply(String,c.concat([(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255])));d+=1}return b}var SHA1_SIZE=20;function oaep_pad(l,a,c){if(l.length+2*SHA1_SIZE+2>a){throw"Message too long for RSA"}var h="",d;for(d=0;d<a-l.length-2*SHA1_SIZE-2;d+=1){h+="\x00"}var e=rstr_sha1("")+h+"\x01"+l;var f=new Array(SHA1_SIZE);new SecureRandom().nextBytes(f);var g=oaep_mgf1_arr(f,e.length,c||rstr_sha1);var k=[];for(d=0;d<e.length;d+=1){k[d]=e.charCodeAt(d)^g.charCodeAt(d)}var j=oaep_mgf1_arr(k,f.length,rstr_sha1);var b=[0];for(d=0;d<f.length;d+=1){b[d+1]=f[d]^j.charCodeAt(d)}return new BigInteger(b.concat(k))}function RSAKey(){this.n=null;this.e=0;this.d=null;this.p=null;this.q=null;this.dmp1=null;this.dmq1=null;this.coeff=null}function RSASetPublic(b,a){this.isPublic=true;if(typeof b!=="string"){this.n=b;this.e=a}else{if(b!=null&&a!=null&&b.length>0&&a.length>0){this.n=parseBigInt(b,16);this.e=parseInt(a,16)}else{alert("Invalid RSA public key")}}}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(d){var a=pkcs1pad2(d,(this.n.bitLength()+7)>>3);if(a==null){return null}var e=this.doPublic(a);if(e==null){return null}var b=e.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}function RSAEncryptOAEP(e,d){var a=oaep_pad(e,(this.n.bitLength()+7)>>3,d);if(a==null){return null}var f=this.doPublic(a);if(f==null){return null}var b=f.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}RSAKey.prototype.doPublic=RSADoPublic;RSAKey.prototype.setPublic=RSASetPublic;RSAKey.prototype.encrypt=RSAEncrypt;RSAKey.prototype.encryptOAEP=RSAEncryptOAEP;RSAKey.prototype.type="RSA";
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function pkcs1unpad2(g,j){var a=g.toByteArray();var f=0;while(f<a.length&&a[f]==0){++f}if(a.length-f!=j-1||a[f]!=2){return null}++f;while(a[f]!=0){if(++f>=a.length){return null}}var e="";while(++f<a.length){var h=a[f]&255;if(h<128){e+=String.fromCharCode(h)}else{if((h>191)&&(h<224)){e+=String.fromCharCode(((h&31)<<6)|(a[f+1]&63));++f}else{e+=String.fromCharCode(((h&15)<<12)|((a[f+1]&63)<<6)|(a[f+2]&63));f+=2}}}return e}function oaep_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=e(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]));d+=1}return b}var SHA1_SIZE=20;function oaep_unpad(l,b,e){l=l.toByteArray();var f;for(f=0;f<l.length;f+=1){l[f]&=255}while(l.length<b){l.unshift(0)}l=String.fromCharCode.apply(String,l);if(l.length<2*SHA1_SIZE+2){throw"Cipher too short"}var c=l.substr(1,SHA1_SIZE);var o=l.substr(SHA1_SIZE+1);var m=oaep_mgf1_str(o,SHA1_SIZE,e||rstr_sha1);var h=[],f;for(f=0;f<c.length;f+=1){h[f]=c.charCodeAt(f)^m.charCodeAt(f)}var j=oaep_mgf1_str(String.fromCharCode.apply(String,h),l.length-SHA1_SIZE,rstr_sha1);var g=[];for(f=0;f<o.length;f+=1){g[f]=o.charCodeAt(f)^j.charCodeAt(f)}g=String.fromCharCode.apply(String,g);if(g.substr(0,SHA1_SIZE)!==rstr_sha1("")){throw"Hash mismatch"}g=g.substr(SHA1_SIZE);var a=g.indexOf("\x01");var k=(a!=-1)?g.substr(0,a).lastIndexOf("\x00"):-1;if(k+1!=a){throw"Malformed data"}return g.substr(a+1)}function RSASetPrivate(c,a,b){this.isPrivate=true;if(typeof c!=="string"){this.n=c;this.e=a;this.d=b}else{if(c!=null&&a!=null&&c.length>0&&a.length>0){this.n=parseBigInt(c,16);this.e=parseInt(a,16);this.d=parseBigInt(b,16)}else{alert("Invalid RSA private key")}}}function RSASetPrivateEx(g,d,e,c,b,a,h,f){this.isPrivate=true;if(g==null){throw"RSASetPrivateEx N == null"}if(d==null){throw"RSASetPrivateEx E == null"}if(g.length==0){throw"RSASetPrivateEx N.length == 0"}if(d.length==0){throw"RSASetPrivateEx E.length == 0"}if(g!=null&&d!=null&&g.length>0&&d.length>0){this.n=parseBigInt(g,16);this.e=parseInt(d,16);this.d=parseBigInt(e,16);this.p=parseBigInt(c,16);this.q=parseBigInt(b,16);this.dmp1=parseBigInt(a,16);this.dmq1=parseBigInt(h,16);this.coeff=parseBigInt(f,16)}else{alert("Invalid RSA private key in RSASetPrivateEx")}}function RSAGenerate(b,i){var a=new SecureRandom();var f=b>>1;this.e=parseInt(i,16);var c=new BigInteger(i,16);for(;;){for(;;){this.p=new BigInteger(b-f,1,a);if(this.p.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.p.isProbablePrime(10)){break}}for(;;){this.q=new BigInteger(f,1,a);if(this.q.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.q.isProbablePrime(10)){break}}if(this.p.compareTo(this.q)<=0){var h=this.p;this.p=this.q;this.q=h}var g=this.p.subtract(BigInteger.ONE);var d=this.q.subtract(BigInteger.ONE);var e=g.multiply(d);if(e.gcd(c).compareTo(BigInteger.ONE)==0){this.n=this.p.multiply(this.q);this.d=c.modInverse(e);this.dmp1=this.d.mod(g);this.dmq1=this.d.mod(d);this.coeff=this.q.modInverse(this.p);break}}}function RSADoPrivate(a){if(this.p==null||this.q==null){return a.modPow(this.d,this.n)}var c=a.mod(this.p).modPow(this.dmp1,this.p);var b=a.mod(this.q).modPow(this.dmq1,this.q);while(c.compareTo(b)<0){c=c.add(this.p)}return c.subtract(b).multiply(this.coeff).mod(this.p).multiply(this.q).add(b)}function RSADecrypt(b){var d=parseBigInt(b,16);var a=this.doPrivate(d);if(a==null){return null}return pkcs1unpad2(a,(this.n.bitLength()+7)>>3)}function RSADecryptOAEP(d,b){var e=parseBigInt(d,16);var a=this.doPrivate(e);if(a==null){return null}return oaep_unpad(a,(this.n.bitLength()+7)>>3,b)}RSAKey.prototype.doPrivate=RSADoPrivate;RSAKey.prototype.setPrivate=RSASetPrivate;RSAKey.prototype.setPrivateEx=RSASetPrivateEx;RSAKey.prototype.generate=RSAGenerate;RSAKey.prototype.decrypt=RSADecrypt;RSAKey.prototype.decryptOAEP=RSADecryptOAEP;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function ECFieldElementFp(b,a){this.x=a;this.q=b}function feFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.x.equals(a.x))}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;function ECPointFp(c,a,d,b){this.curve=c;this.x=a;this.y=d;if(b==null){this.z=BigInteger.ONE}else{this.z=b}this.zinv=null}function pointFpGetX(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){if(a==this){return true}if(this.isInfinity()){return a.isInfinity()}if(a.isInfinity()){return this.isInfinity()}var c,b;c=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q);if(!c.equals(BigInteger.ZERO)){return false}b=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);return b.equals(BigInteger.ZERO)}function pointFpIsInfinity(){if((this.x==null)&&(this.y==null)){return true}return this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(l){if(this.isInfinity()){return l}if(l.isInfinity()){return this}var p=l.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(l.z)).mod(this.curve.q);var o=l.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(l.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(o)){if(BigInteger.ZERO.equals(p)){return this.twice()}return this.curve.getInfinity()}var j=new BigInteger("3");var e=this.x.toBigInteger();var n=this.y.toBigInteger();var c=l.x.toBigInteger();var k=l.y.toBigInteger();var m=o.square();var i=m.multiply(o);var d=e.multiply(m);var g=p.square().multiply(this.z);var a=g.subtract(d.shiftLeft(1)).multiply(l.z).subtract(i).multiply(o).mod(this.curve.q);var h=d.multiply(j).multiply(p).subtract(n.multiply(i)).subtract(g.multiply(p)).multiply(l.z).add(p.multiply(i)).mod(this.curve.q);var f=i.multiply(this.z).multiply(l.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(h),f)}function pointFpTwice(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var g=new BigInteger("3");var c=this.x.toBigInteger();var h=this.y.toBigInteger();var e=h.multiply(this.z);var j=e.multiply(h).mod(this.curve.q);var i=this.curve.a.toBigInteger();var k=c.square().multiply(g);if(!BigInteger.ZERO.equals(i)){k=k.add(this.z.square().multiply(i))}k=k.mod(this.curve.q);var b=k.square().subtract(c.shiftLeft(3).multiply(j)).shiftLeft(1).multiply(e).mod(this.curve.q);var f=k.multiply(g).multiply(c).subtract(j.shiftLeft(1)).shiftLeft(2).multiply(j).subtract(k.square().multiply(k)).mod(this.curve.q);var d=e.square().multiply(e).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(f),d)}function pointFpMultiply(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add(a?this:l)}}return d}function pointFpMultiplyTwo(c,a,b){var d;if(c.bitLength()>b.bitLength()){d=c.bitLength()-1}else{d=b.bitLength()-1}var f=this.curve.getInfinity();var e=this.add(a);while(d>=0){f=f.twice();if(c.testBit(d)){if(b.testBit(d)){f=f.add(e)}else{f=f.add(this)}}else{if(b.testBit(d)){f=f.add(a)}}--d}return f}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;function ECCurveFp(e,d,c){this.q=e;this.a=this.fromBigInteger(d);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null)}function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b))}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(d){switch(parseInt(d.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var a=(d.length-2)/2;var c=d.substr(2,a);var b=d.substr(a+2,a);return new ECPointFp(this,this.fromBigInteger(new BigInteger(c,16)),this.fromBigInteger(new BigInteger(b,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;
/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
 */
ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(c){var d=function(h,f){var g=h.toByteArrayUnsigned();if(f<g.length){g=g.slice(g.length-f)}else{while(f>g.length){g.unshift(0)}}return g};var a=this.getX().toBigInteger();var e=this.getY().toBigInteger();var b=d(a,32);if(c){if(e.isEven()){b.unshift(2)}else{b.unshift(3)}}else{b.unshift(4);b=b.concat(d(e,32))}return b};ECPointFp.decodeFrom=function(g,c){var f=c[0];var e=c.length-1;var d=c.slice(1,1+e/2);var b=c.slice(1+e/2,1+e);d.unshift(0);b.unshift(0);var a=new BigInteger(d);var h=new BigInteger(b);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.decodeFromHex=function(g,c){var f=c.substr(0,2);var e=c.length-2;var d=c.substr(2,e/2);var b=c.substr(2+e/2,e/2);var a=new BigInteger(d,16);var h=new BigInteger(b,16);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.prototype.add2D=function(c){if(this.isInfinity()){return c}if(c.isInfinity()){return this}if(this.x.equals(c.x)){if(this.y.equals(c.y)){return this.twice()}return this.curve.getInfinity()}var g=c.x.subtract(this.x);var e=c.y.subtract(this.y);var a=e.divide(g);var d=a.square().subtract(this.x).subtract(c.x);var f=a.multiply(this.x.subtract(d)).subtract(this.y);return new ECPointFp(this.curve,d,f)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var b=this.curve.fromBigInteger(BigInteger.valueOf(2));var e=this.curve.fromBigInteger(BigInteger.valueOf(3));var a=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(b));var c=a.square().subtract(this.x.multiply(b));var d=a.multiply(this.x.subtract(c)).subtract(this.y);return new ECPointFp(this.curve,c,d)};ECPointFp.prototype.multiply2D=function(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add2D(a?this:l)}}return d};ECPointFp.prototype.isOnCurve=function(){var d=this.getX().toBigInteger();var i=this.getY().toBigInteger();var f=this.curve.getA().toBigInteger();var c=this.curve.getB().toBigInteger();var h=this.curve.getQ();var e=i.multiply(i).mod(h);var g=d.multiply(d).multiply(d).add(f.multiply(d)).add(c).mod(h);return e.equals(g)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var c=this.curve.getQ();if(this.isInfinity()){throw new Error("Point is at infinity.")}var a=this.getX().toBigInteger();var b=this.getY().toBigInteger();if(a.compareTo(BigInteger.ONE)<0||a.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("x coordinate out of bounds")}if(b.compareTo(BigInteger.ONE)<0||b.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("y coordinate out of bounds")}if(!this.isOnCurve()){throw new Error("Point is not on the curve.")}if(this.multiply(c).isInfinity()){throw new Error("Point is not a scalar multiple of G.")}return true};
/*! asn1-1.0.4.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);if((b.length%2)==1){b="0"+b}return b};this.bigIntToMinTwosComplementsHex=function(j){var f=j.toString(16);if(f.substr(0,1)!="-"){if(f.length%2==1){f="0"+f}else{if(!f.match(/^[0-7]/)){f="00"+f}}}else{var a=f.substr(1);var e=a.length;if(e%2==1){e+=1}else{if(!f.match(/^[0-7]/)){e+=2}}var g="";for(var d=0;d<e;d++){g+="f"}var c=new BigInteger(g,16);var b=c.xor(j).add(BigInteger.ONE);f=b.toString(16).replace(/^-/,"")}return f};this.getPEMStringFromHex=function(a,b){var c=KJUR.asn1;var f=CryptoJS.enc.Hex.parse(a);var d=CryptoJS.enc.Base64.stringify(f);var e=d.replace(/(.{64})/g,"$1\r\n");e=e.replace(/\r\n$/,"");return"-----BEGIN "+b+"-----\r\n"+e+"\r\n-----END "+b+"-----\r\n"};this.newObject=function(b){var g=KJUR.asn1;var k=Object.keys(b);if(k.length!=1){throw"key of param shall be only one."}var j=k[0];if(":bool:int:bitstr:octstr:null:oid:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:seq:set:tag:".indexOf(":"+j+":")==-1){throw"undefined key: "+j}if(j=="bool"){return new g.DERBoolean(b[j])}if(j=="int"){return new g.DERInteger(b[j])}if(j=="bitstr"){return new g.DERBitString(b[j])}if(j=="octstr"){return new g.DEROctetString(b[j])}if(j=="null"){return new g.DERNull(b[j])}if(j=="oid"){return new g.DERObjectIdentifier(b[j])}if(j=="utf8str"){return new g.DERUTF8String(b[j])}if(j=="numstr"){return new g.DERNumericString(b[j])}if(j=="prnstr"){return new g.DERPrintableString(b[j])}if(j=="telstr"){return new g.DERTeletexString(b[j])}if(j=="ia5str"){return new g.DERIA5String(b[j])}if(j=="utctime"){return new g.DERUTCTime(b[j])}if(j=="gentime"){return new g.DERGeneralizedTime(b[j])}if(j=="seq"){var m=b[j];var h=[];for(var e=0;e<m.length;e++){var l=g.ASN1Util.newObject(m[e]);h.push(l)}return new g.DERSequence({array:h})}if(j=="set"){var m=b[j];var h=[];for(var e=0;e<m.length;e++){var l=g.ASN1Util.newObject(m[e]);h.push(l)}return new g.DERSet({array:h})}if(j=="tag"){var c=b[j];if(Object.prototype.toString.call(c)==="[object Array]"&&c.length==3){var d=g.ASN1Util.newObject(c[2]);return new g.DERTaggedObject({tag:c[0],explicit:c[1],obj:d})}else{var f={};if(c.explicit!==undefined){f.explicit=c.explicit}if(c.tag!==undefined){f.tag=c.tag}if(c.obj===undefined){throw"obj shall be specified for 'tag'."}f.obj=g.ASN1Util.newObject(c.obj);return new g.DERTaggedObject(f)}}};this.jsonToASN1HEX=function(b){var a=this.newObject(b);return a.getEncodedHex()}};KJUR.asn1.ASN1Object=function(){var c=true;var b=null;var d="00";var e="00";var a="";this.getLengthHexFromValue=function(){if(typeof this.hV=="undefined"||this.hV==null){throw"this.hV is null or undefined."}if(this.hV.length%2==1){throw"value hex must be even length: n="+a.length+",v="+this.hV}var i=this.hV.length/2;var h=i.toString(16);if(h.length%2==1){h="0"+h}if(i<128){return h}else{var g=h.length/2;if(g>15){throw"ASN.1 length too long to represent by 8x: n = "+i.toString(16)}var f=128+g;return f.toString(16)+h}};this.getEncodedHex=function(){if(this.hTLV==null||this.isModified){this.hV=this.getFreshValueHex();this.hL=this.getLengthHexFromValue();this.hTLV=this.hT+this.hL+this.hV;this.isModified=false}return this.hTLV};this.getValueHex=function(){this.getEncodedHex();return this.hV};this.getFreshValueHex=function(){return""}};KJUR.asn1.DERAbstractString=function(c){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var b=null;var a=null;this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(this.s)};this.setStringHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"){this.setString(c)}else{if(typeof c.str!="undefined"){this.setString(c.str)}else{if(typeof c.hex!="undefined"){this.setStringHex(c.hex)}}}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractTime=function(c){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);var b=null;var a=null;this.localDateToUTC=function(f){utc=f.getTime()+(f.getTimezoneOffset()*60000);var e=new Date(utc);return e};this.formatDate=function(j,l){var e=this.zeroPadding;var k=this.localDateToUTC(j);var m=String(k.getFullYear());if(l=="utc"){m=m.substr(2,2)}var i=e(String(k.getMonth()+1),2);var n=e(String(k.getDate()),2);var f=e(String(k.getHours()),2);var g=e(String(k.getMinutes()),2);var h=e(String(k.getSeconds()),2);return m+i+n+f+g+h+"Z"};this.zeroPadding=function(e,d){if(e.length>=d){return e}return new Array(d-e.length+1).join("0")+e};this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(d)};this.setByDateValue=function(h,j,e,d,f,g){var i=new Date(Date.UTC(h,j-1,e,d,f,g,0));this.setByDate(i)};this.getFreshValueHex=function(){return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractStructured=function(b){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var a=null;this.setByASN1ObjectArray=function(c){this.hTLV=null;this.isModified=true;this.asn1Array=c};this.appendASN1Object=function(c){this.hTLV=null;this.isModified=true;this.asn1Array.push(c)};this.asn1Array=new Array();if(typeof b!="undefined"){if(typeof b.array!="undefined"){this.asn1Array=b.array}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object);KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this);this.hT="01";this.hTLV="0101ff"};YAHOO.lang.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object);KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this);this.hT="02";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b)};this.setValueHex=function(b){this.hV=b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.bigint!="undefined"){this.setByBigInteger(a.bigint)}else{if(typeof a["int"]!="undefined"){this.setByInteger(a["int"])}else{if(typeof a=="number"){this.setByInteger(a)}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object);KJUR.asn1.DERBitString=function(a){KJUR.asn1.DERBitString.superclass.constructor.call(this);this.hT="03";this.setHexValueIncludingUnusedBits=function(b){this.hTLV=null;this.isModified=true;this.hV=b};this.setUnusedBitsAndHexValue=function(b,d){if(b<0||7<b){throw"unused bits shall be from 0 to 7: u = "+b}var c="0"+b;this.hTLV=null;this.isModified=true;this.hV=c+d};this.setByBinaryString=function(e){e=e.replace(/0+$/,"");var f=8-e.length%8;if(f==8){f=0}for(var g=0;g<=f;g++){e+="0"}var j="";for(var g=0;g<e.length-1;g+=8){var d=e.substr(g,8);var c=parseInt(d,2).toString(16);if(c.length==1){c="0"+c}j+=c}this.hTLV=null;this.isModified=true;this.hV="0"+f+j};this.setByBooleanArray=function(d){var c="";for(var b=0;b<d.length;b++){if(d[b]==true){c+="1"}else{c+="0"}}this.setByBinaryString(c)};this.newFalseArray=function(d){var b=new Array(d);for(var c=0;c<d;c++){b[c]=false}return b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a=="string"&&a.toLowerCase().match(/^[0-9a-f]+$/)){this.setHexValueIncludingUnusedBits(a)}else{if(typeof a.hex!="undefined"){this.setHexValueIncludingUnusedBits(a.hex)}else{if(typeof a.bin!="undefined"){this.setByBinaryString(a.bin)}else{if(typeof a.array!="undefined"){this.setByBooleanArray(a.array)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object);KJUR.asn1.DEROctetString=function(a){KJUR.asn1.DEROctetString.superclass.constructor.call(this,a);this.hT="04"};YAHOO.lang.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this);this.hT="05";this.hTLV="0500"};YAHOO.lang.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object);KJUR.asn1.DERObjectIdentifier=function(c){var b=function(d){var e=d.toString(16);if(e.length==1){e="0"+e}return e};var a=function(k){var j="";var e=new BigInteger(k,10);var d=e.toString(2);var f=7-d.length%7;if(f==7){f=0}var m="";for(var g=0;g<f;g++){m+="0"}d=m+d;for(var g=0;g<d.length-1;g+=7){var l=d.substr(g,7);if(g!=d.length-7){l="1"+l}j+=b(parseInt(l,2))}return j};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);this.hT="06";this.setValueHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.setValueOidString=function(f){if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var d=f.split(".");var j=parseInt(d[0])*40+parseInt(d[1]);g+=b(j);d.splice(0,2);for(var e=0;e<d.length;e++){g+=a(d[e])}this.hTLV=null;this.isModified=true;this.s=null;this.hV=g};this.setValueName=function(e){if(typeof KJUR.asn1.x509.OID.name2oidList[e]!="undefined"){var d=KJUR.asn1.x509.OID.name2oidList[e];this.setValueOidString(d)}else{throw"DERObjectIdentifier oidName undefined: "+e}};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"&&c.match(/^[0-2].[0-9.]+$/)){this.setValueOidString(c)}else{if(KJUR.asn1.x509.OID.name2oidList[c]!==undefined){this.setValueOidString(KJUR.asn1.x509.OID.name2oidList[c])}else{if(typeof c.oid!="undefined"){this.setValueOidString(c.oid)}else{if(typeof c.hex!="undefined"){this.setValueHex(c.hex)}else{if(typeof c.name!="undefined"){this.setValueName(c.name)}}}}}}};YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a);this.hT="0c"};YAHOO.lang.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a);this.hT="12"};YAHOO.lang.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a);this.hT="13"};YAHOO.lang.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a);this.hT="14"};YAHOO.lang.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a);this.hT="16"};YAHOO.lang.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a);this.hT="17";this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s)};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{12}Z$/)){this.setString(a)}else{if(typeof a.hex!="undefined"){this.setStringHex(a.hex)}else{if(typeof a.date!="undefined"){this.setByDate(a.date)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a);this.hT="18";this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"gen");this.hV=stohex(this.s)};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{14}Z$/)){this.setString(a)}else{if(typeof a.hex!="undefined"){this.setStringHex(a.hex)}else{if(typeof a.date!="undefined"){this.setByDate(a.date)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a);this.hT="30";this.getFreshValueHex=function(){var c="";for(var b=0;b<this.asn1Array.length;b++){var d=this.asn1Array[b];c+=d.getEncodedHex()}this.hV=c;return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a);this.hT="31";this.getFreshValueHex=function(){var b=new Array();for(var c=0;c<this.asn1Array.length;c++){var d=this.asn1Array[c];b.push(d.getEncodedHex())}b.sort();this.hV=b.join("");return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);this.hT="a0";this.hV="";this.isExplicit=true;this.asn1Object=null;this.setASN1Object=function(b,c,d){this.hT=c;this.isExplicit=b;this.asn1Object=d;if(this.isExplicit){this.hV=this.asn1Object.getEncodedHex();this.hTLV=null;this.isModified=true}else{this.hV=null;this.hTLV=d.getEncodedHex();this.hTLV=this.hTLV.replace(/^../,c);this.isModified=false}};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.tag!="undefined"){this.hT=a.tag}if(typeof a.explicit!="undefined"){this.isExplicit=a.explicit}if(typeof a.obj!="undefined"){this.asn1Object=a.obj;this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)}}};YAHOO.lang.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object);
/*! asn1hex-1.1.4.js (c) 2012-2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var ASN1HEX=new function(){this.getByteLengthOfL_AtObj=function(b,c){if(b.substring(c+2,c+3)!="8"){return 1}var a=parseInt(b.substring(c+3,c+4));if(a==0){return -1}if(0<a&&a<10){return a+1}return -2};this.getHexOfL_AtObj=function(b,c){var a=this.getByteLengthOfL_AtObj(b,c);if(a<1){return""}return b.substring(c+2,c+2+a*2)};this.getIntOfL_AtObj=function(c,d){var b=this.getHexOfL_AtObj(c,d);if(b==""){return -1}var a;if(parseInt(b.substring(0,1))<8){a=new BigInteger(b,16)}else{a=new BigInteger(b.substring(2),16)}return a.intValue()};this.getStartPosOfV_AtObj=function(b,c){var a=this.getByteLengthOfL_AtObj(b,c);if(a<0){return a}return c+(a+1)*2};this.getHexOfV_AtObj=function(c,d){var b=this.getStartPosOfV_AtObj(c,d);var a=this.getIntOfL_AtObj(c,d);return c.substring(b,b+a*2)};this.getHexOfTLV_AtObj=function(c,e){var b=c.substr(e,2);var d=this.getHexOfL_AtObj(c,e);var a=this.getHexOfV_AtObj(c,e);return b+d+a};this.getPosOfNextSibling_AtObj=function(c,d){var b=this.getStartPosOfV_AtObj(c,d);var a=this.getIntOfL_AtObj(c,d);return b+a*2};this.getPosArrayOfChildren_AtObj=function(f,j){var c=new Array();var i=this.getStartPosOfV_AtObj(f,j);c.push(i);var b=this.getIntOfL_AtObj(f,j);var g=i;var d=0;while(1){var e=this.getPosOfNextSibling_AtObj(f,g);if(e==null||(e-i>=(b*2))){break}if(d>=200){break}c.push(e);g=e;d++}return c};this.getNthChildIndex_AtObj=function(d,b,e){var c=this.getPosArrayOfChildren_AtObj(d,b);return c[e]};this.getDecendantIndexByNthList=function(e,d,c){if(c.length==0){return d}var f=c.shift();var b=this.getPosArrayOfChildren_AtObj(e,d);return this.getDecendantIndexByNthList(e,b[f],c)};this.getDecendantHexTLVByNthList=function(d,c,b){var a=this.getDecendantIndexByNthList(d,c,b);return this.getHexOfTLV_AtObj(d,a)};this.getDecendantHexVByNthList=function(d,c,b){var a=this.getDecendantIndexByNthList(d,c,b);return this.getHexOfV_AtObj(d,a)}};ASN1HEX.getVbyList=function(d,c,b,e){var a=this.getDecendantIndexByNthList(d,c,b);if(a===undefined){throw"can't find nthList object"}if(e!==undefined){if(d.substr(a,2)!=e){throw"checking tag doesn't match: "+d.substr(a,2)+"!="+e}}return this.getHexOfV_AtObj(d,a)};
/*! asn1x509-1.0.7.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.x509=="undefined"||!KJUR.asn1.x509){KJUR.asn1.x509={}}KJUR.asn1.x509.Certificate=function(g){KJUR.asn1.x509.Certificate.superclass.constructor.call(this);var b=null;var d=null;var f=null;var c=null;var a=null;var e=null;this.setRsaPrvKeyByPEMandPass=function(i,k){var h=PKCS5PKEY.getDecryptedKeyHex(i,k);var j=new RSAKey();j.readPrivateKeyFromASN1HexString(h);this.prvKey=j};this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:"SHA1withRSA"});sig.init(this.prvKey);sig.updateHex(this.asn1TBSCert.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var h=new KJUR.asn1.DERSequence({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=h.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var j=this.getEncodedHex();var h=CryptoJS.enc.Hex.parse(j);var i=CryptoJS.enc.Base64.stringify(h);var k=i.replace(/(.{64})/g,"$1\r\n");return"-----BEGIN CERTIFICATE-----\r\n"+k+"\r\n-----END CERTIFICATE-----\r\n"};if(typeof g!="undefined"){if(typeof g.tbscertobj!="undefined"){this.asn1TBSCert=g.tbscertobj}if(typeof g.prvkeyobj!="undefined"){this.prvKey=g.prvkeyobj}else{if(typeof g.rsaprvkey!="undefined"){this.prvKey=g.rsaprvkey}else{if((typeof g.rsaprvpem!="undefined")&&(typeof g.rsaprvpas!="undefined")){this.setRsaPrvKeyByPEMandPass(g.rsaprvpem,g.rsaprvpas)}}}}};YAHOO.lang.extend(KJUR.asn1.x509.Certificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertificate=function(a){KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new KJUR.asn1.DERTaggedObject({obj:new KJUR.asn1.DERInteger({"int":2})});this.asn1SerialNumber=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1NotBefore=null;this.asn1NotAfter=null;this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array()};this.setSerialNumberByParam=function(b){this.asn1SerialNumber=new KJUR.asn1.DERInteger(b)};this.setSignatureAlgByParam=function(b){this.asn1SignatureAlg=new KJUR.asn1.x509.AlgorithmIdentifier(b)};this.setIssuerByParam=function(b){this.asn1Issuer=new KJUR.asn1.x509.X500Name(b)};this.setNotBeforeByParam=function(b){this.asn1NotBefore=new KJUR.asn1.x509.Time(b)};this.setNotAfterByParam=function(b){this.asn1NotAfter=new KJUR.asn1.x509.Time(b)};this.setSubjectByParam=function(b){this.asn1Subject=new KJUR.asn1.x509.X500Name(b)};this.setSubjectPublicKeyByParam=function(b){this.asn1SubjPKey=new KJUR.asn1.x509.SubjectPublicKeyInfo(b)};this.setSubjectPublicKeyByGetKey=function(c){var b=KEYUTIL.getKey(c);this.asn1SubjPKey=new KJUR.asn1.x509.SubjectPublicKeyInfo(b)};this.appendExtension=function(b){this.extensionsArray.push(b)};this.appendExtensionByName=function(d,b){if(d.toLowerCase()=="basicconstraints"){var c=new KJUR.asn1.x509.BasicConstraints(b);this.appendExtension(c)}else{if(d.toLowerCase()=="keyusage"){var c=new KJUR.asn1.x509.KeyUsage(b);this.appendExtension(c)}else{if(d.toLowerCase()=="crldistributionpoints"){var c=new KJUR.asn1.x509.CRLDistributionPoints(b);this.appendExtension(c)}else{if(d.toLowerCase()=="extkeyusage"){var c=new KJUR.asn1.x509.ExtKeyUsage(b);this.appendExtension(c)}else{throw"unsupported extension name: "+d}}}}};this.getEncodedHex=function(){if(this.asn1NotBefore==null||this.asn1NotAfter==null){throw"notBefore and/or notAfter not set"}var c=new KJUR.asn1.DERSequence({array:[this.asn1NotBefore,this.asn1NotAfter]});this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1SerialNumber);this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(c);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var d=new KJUR.asn1.DERSequence({array:this.extensionsArray});var b=new KJUR.asn1.DERTaggedObject({explicit:true,tag:"a3",obj:d});this.asn1Array.push(b)}var e=new KJUR.asn1.DERSequence({array:this.asn1Array});this.hTLV=e.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension=function(b){KJUR.asn1.x509.Extension.superclass.constructor.call(this);var a=null;this.getEncodedHex=function(){var f=new KJUR.asn1.DERObjectIdentifier({oid:this.oid});var e=new KJUR.asn1.DEROctetString({hex:this.getExtnValueHex()});var d=new Array();d.push(f);if(this.critical){d.push(new KJUR.asn1.DERBoolean())}d.push(e);var c=new KJUR.asn1.DERSequence({array:d});return c.getEncodedHex()};this.critical=false;if(typeof b!="undefined"){if(typeof b.critical!="undefined"){this.critical=b.critical}}};YAHOO.lang.extend(KJUR.asn1.x509.Extension,KJUR.asn1.ASN1Object);KJUR.asn1.x509.KeyUsage=function(a){KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this,a);this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.15";if(typeof a!="undefined"){if(typeof a.bin!="undefined"){this.asn1ExtnValue=new KJUR.asn1.DERBitString(a)}}};YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.BasicConstraints=function(c){KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this,c);var a=false;var b=-1;this.getExtnValueHex=function(){var e=new Array();if(this.cA){e.push(new KJUR.asn1.DERBoolean())}if(this.pathLen>-1){e.push(new KJUR.asn1.DERInteger({"int":this.pathLen}))}var d=new KJUR.asn1.DERSequence({array:e});this.asn1ExtnValue=d;return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.19";this.cA=false;this.pathLen=-1;if(typeof c!="undefined"){if(typeof c.cA!="undefined"){this.cA=c.cA}if(typeof c.pathLen!="undefined"){this.pathLen=c.pathLen}}};YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRLDistributionPoints=function(a){KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this,a);this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.setByDPArray=function(b){this.asn1ExtnValue=new KJUR.asn1.DERSequence({array:b})};this.setByOneURI=function(e){var b=new KJUR.asn1.x509.GeneralNames([{uri:e}]);var d=new KJUR.asn1.x509.DistributionPointName(b);var c=new KJUR.asn1.x509.DistributionPoint({dpobj:d});this.setByDPArray([c])};this.oid="2.5.29.31";if(typeof a!="undefined"){if(typeof a.array!="undefined"){this.setByDPArray(a.array)}else{if(typeof a.uri!="undefined"){this.setByOneURI(a.uri)}}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.ExtKeyUsage=function(a){KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this,a);this.setPurposeArray=function(b){this.asn1ExtnValue=new KJUR.asn1.DERSequence();for(var c=0;c<b.length;c++){var d=new KJUR.asn1.DERObjectIdentifier(b[c]);this.asn1ExtnValue.appendASN1Object(d)}};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.37";if(typeof a!="undefined"){if(typeof a.array!="undefined"){this.setPurposeArray(a.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRL=function(f){KJUR.asn1.x509.CRL.superclass.constructor.call(this);var a=null;var c=null;var e=null;var b=null;var d=null;this.setRsaPrvKeyByPEMandPass=function(h,j){var g=PKCS5PKEY.getDecryptedKeyHex(h,j);var i=new RSAKey();i.readPrivateKeyFromASN1HexString(g);this.rsaPrvKey=i};this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCertList.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:"SHA1withRSA",prov:"cryptojs/jsrsa"});sig.initSign(this.rsaPrvKey);sig.updateHex(this.asn1TBSCertList.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var g=new KJUR.asn1.DERSequence({array:[this.asn1TBSCertList,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=g.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var i=this.getEncodedHex();var g=CryptoJS.enc.Hex.parse(i);var h=CryptoJS.enc.Base64.stringify(g);var j=h.replace(/(.{64})/g,"$1\r\n");return"-----BEGIN X509 CRL-----\r\n"+j+"\r\n-----END X509 CRL-----\r\n"};if(typeof f!="undefined"){if(typeof f.tbsobj!="undefined"){this.asn1TBSCertList=f.tbsobj}if(typeof f.rsaprvkey!="undefined"){this.rsaPrvKey=f.rsaprvkey}if((typeof f.rsaprvpem!="undefined")&&(typeof f.rsaprvpas!="undefined")){this.setRsaPrvKeyByPEMandPass(f.rsaprvpem,f.rsaprvpas)}}};YAHOO.lang.extend(KJUR.asn1.x509.CRL,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertList=function(b){KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);var a=null;this.setSignatureAlgByParam=function(c){this.asn1SignatureAlg=new KJUR.asn1.x509.AlgorithmIdentifier(c)};this.setIssuerByParam=function(c){this.asn1Issuer=new KJUR.asn1.x509.X500Name(c)};this.setThisUpdateByParam=function(c){this.asn1ThisUpdate=new KJUR.asn1.x509.Time(c)};this.setNextUpdateByParam=function(c){this.asn1NextUpdate=new KJUR.asn1.x509.Time(c)};this.addRevokedCert=function(c,d){var f={};if(c!=undefined&&c!=null){f.sn=c}if(d!=undefined&&d!=null){f.time=d}var e=new KJUR.asn1.x509.CRLEntry(f);this.aRevokedCert.push(e)};this.getEncodedHex=function(){this.asn1Array=new Array();if(this.asn1Version!=null){this.asn1Array.push(this.asn1Version)}this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(this.asn1ThisUpdate);if(this.asn1NextUpdate!=null){this.asn1Array.push(this.asn1NextUpdate)}if(this.aRevokedCert.length>0){var c=new KJUR.asn1.DERSequence({array:this.aRevokedCert});this.asn1Array.push(c)}var d=new KJUR.asn1.DERSequence({array:this.asn1Array});this.hTLV=d.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize=function(){this.asn1Version=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1ThisUpdate=null;this.asn1NextUpdate=null;this.aRevokedCert=new Array()};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList,KJUR.asn1.ASN1Object);KJUR.asn1.x509.CRLEntry=function(c){KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);var b=null;var a=null;this.setCertSerial=function(d){this.sn=new KJUR.asn1.DERInteger(d)};this.setRevocationDate=function(d){this.time=new KJUR.asn1.x509.Time(d)};this.getEncodedHex=function(){var d=new KJUR.asn1.DERSequence({array:[this.sn,this.time]});this.TLV=d.getEncodedHex();return this.TLV};if(typeof c!="undefined"){if(typeof c.time!="undefined"){this.setRevocationDate(c.time)}if(typeof c.sn!="undefined"){this.setCertSerial(c.sn)}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name=function(a){KJUR.asn1.x509.X500Name.superclass.constructor.call(this);this.asn1Array=new Array();this.setByString=function(b){var c=b.split("/");c.shift();for(var d=0;d<c.length;d++){this.asn1Array.push(new KJUR.asn1.x509.RDN({str:c[d]}))}};this.getEncodedHex=function(){var b=new KJUR.asn1.DERSequence({array:this.asn1Array});this.TLV=b.getEncodedHex();return this.TLV};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.setByString(a.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.X500Name,KJUR.asn1.ASN1Object);KJUR.asn1.x509.RDN=function(a){KJUR.asn1.x509.RDN.superclass.constructor.call(this);this.asn1Array=new Array();this.addByString=function(b){this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({str:b}))};this.getEncodedHex=function(){var b=new KJUR.asn1.DERSet({array:this.asn1Array});this.TLV=b.getEncodedHex();return this.TLV};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.addByString(a.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.RDN,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AttributeTypeAndValue=function(b){KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);var d=null;var c=null;var a="utf8";this.setByString=function(e){if(e.match(/^([^=]+)=(.+)$/)){this.setByAttrTypeAndValueStr(RegExp.$1,RegExp.$2)}else{throw"malformed attrTypeAndValueStr: "+e}};this.setByAttrTypeAndValueStr=function(g,f){this.typeObj=KJUR.asn1.x509.OID.atype2obj(g);var e=a;if(g=="C"){e="prn"}this.valueObj=this.getValueObj(e,f)};this.getValueObj=function(f,e){if(f=="utf8"){return new KJUR.asn1.DERUTF8String({str:e})}if(f=="prn"){return new KJUR.asn1.DERPrintableString({str:e})}if(f=="tel"){return new KJUR.asn1.DERTeletexString({str:e})}if(f=="ia5"){return new KJUR.asn1.DERIA5String({str:e})}throw"unsupported directory string type: type="+f+" value="+e};this.getEncodedHex=function(){var e=new KJUR.asn1.DERSequence({array:[this.typeObj,this.valueObj]});this.TLV=e.getEncodedHex();return this.TLV};if(typeof b!="undefined"){if(typeof b.str!="undefined"){this.setByString(b.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.x509.SubjectPublicKeyInfo=function(d){KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);var b=null;var c=null;var a=null;this.setRSAKey=function(e){if(!RSAKey.prototype.isPrototypeOf(e)){throw"argument is not RSAKey instance"}this.rsaKey=e;var g=new KJUR.asn1.DERInteger({bigint:e.n});var f=new KJUR.asn1.DERInteger({"int":e.e});var i=new KJUR.asn1.DERSequence({array:[g,f]});var h=i.getEncodedHex();this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+h})};this.setRSAPEM=function(g){if(g.match(/-----BEGIN PUBLIC KEY-----/)){var n=g;n=n.replace(/^-----[^-]+-----/,"");n=n.replace(/-----[^-]+-----\s*$/,"");var m=n.replace(/\s+/g,"");var f=CryptoJS.enc.Base64.parse(m);var i=CryptoJS.enc.Hex.stringify(f);var k=_rsapem_getHexValueArrayOfChildrenFromHex(i);var h=k[1];var l=h.substr(2);var e=_rsapem_getHexValueArrayOfChildrenFromHex(l);var j=new RSAKey();j.setPublic(e[0],e[1]);this.setRSAKey(j)}else{throw"key not supported"}};this.getASN1Object=function(){if(this.asn1AlgId==null||this.asn1SubjPKey==null){throw"algId and/or subjPubKey not set"}var e=new KJUR.asn1.DERSequence({array:[this.asn1AlgId,this.asn1SubjPKey]});return e};this.getEncodedHex=function(){var e=this.getASN1Object();this.hTLV=e.getEncodedHex();return this.hTLV};this._setRSAKey=function(e){var g=KJUR.asn1.ASN1Util.newObject({seq:[{"int":{bigint:e.n}},{"int":{"int":e.e}}]});var f=g.getEncodedHex();this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+f})};this._setEC=function(e){var f=new KJUR.asn1.DERObjectIdentifier({name:e.curveName});this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"ecPublicKey",asn1params:f});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+e.pubKeyHex})};this._setDSA=function(e){var f=new KJUR.asn1.ASN1Util.newObject({seq:[{"int":{bigint:e.p}},{"int":{bigint:e.q}},{"int":{bigint:e.g}}]});this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"dsa",asn1params:f});var g=new KJUR.asn1.DERInteger({bigint:e.y});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+g.getEncodedHex()})};if(typeof d!="undefined"){if(typeof RSAKey!="undefined"&&d instanceof RSAKey){this._setRSAKey(d)}else{if(typeof KJUR.crypto.ECDSA!="undefined"&&d instanceof KJUR.crypto.ECDSA){this._setEC(d)}else{if(typeof KJUR.crypto.DSA!="undefined"&&d instanceof KJUR.crypto.DSA){this._setDSA(d)}else{if(typeof d.rsakey!="undefined"){this.setRSAKey(d.rsakey)}else{if(typeof d.rsapem!="undefined"){this.setRSAPEM(d.rsapem)}}}}}}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Time=function(c){KJUR.asn1.x509.Time.superclass.constructor.call(this);var b=null;var a=null;this.setTimeParams=function(d){this.timeParams=d};this.getEncodedHex=function(){if(this.timeParams==null){throw"timeParams shall be specified. ({'str':'130403235959Z'}}"}var d=null;if(this.type=="utc"){d=new KJUR.asn1.DERUTCTime(this.timeParams)}else{d=new KJUR.asn1.DERGeneralizedTime(this.timeParams)}this.TLV=d.getEncodedHex();return this.TLV};this.type="utc";if(typeof c!="undefined"){if(typeof c.type!="undefined"){this.type=c.type}this.timeParams=c}};YAHOO.lang.extend(KJUR.asn1.x509.Time,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AlgorithmIdentifier=function(e){KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);var a=null;var d=null;var b=null;var c=false;this.getEncodedHex=function(){if(this.nameAlg==null&&this.asn1Alg==null){throw"algorithm not specified"}if(this.nameAlg!=null&&this.asn1Alg==null){this.asn1Alg=KJUR.asn1.x509.OID.name2obj(this.nameAlg)}var f=[this.asn1Alg];if(!this.paramEmpty){f.push(this.asn1Params)}var g=new KJUR.asn1.DERSequence({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(typeof e!="undefined"){if(typeof e.name!="undefined"){this.nameAlg=e.name}if(typeof e.asn1params!="undefined"){this.asn1Params=e.asn1params}if(typeof e.paramempty!="undefined"){this.paramEmpty=e.paramempty}}if(this.asn1Params==null){this.asn1Params=new KJUR.asn1.DERNull()}};YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralName=function(d){KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);var c=null;var b=null;var a={rfc822:"81",dns:"82",uri:"86"};this.setByParam=function(g){var f=null;var e=null;if(typeof g.rfc822!="undefined"){this.type="rfc822";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(typeof g.dns!="undefined"){this.type="dns";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(typeof g.uri!="undefined"){this.type="uri";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(this.type==null){throw"unsupported type in params="+g}this.asn1Obj=new KJUR.asn1.DERTaggedObject({explicit:false,tag:a[this.type],obj:e})};this.getEncodedHex=function(){return this.asn1Obj.getEncodedHex()};if(typeof d!="undefined"){this.setByParam(d)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralNames=function(b){KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);var a=null;this.setByParamArray=function(e){for(var c=0;c<e.length;c++){var d=new KJUR.asn1.x509.GeneralName(e[c]);this.asn1Array.push(d)}};this.getEncodedHex=function(){var c=new KJUR.asn1.DERSequence({array:this.asn1Array});return c.getEncodedHex()};this.asn1Array=new Array();if(typeof b!="undefined"){this.setByParamArray(b)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPointName=function(b){KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);var e=null;var c=null;var a=null;var d=null;this.getEncodedHex=function(){if(this.type!="full"){throw"currently type shall be 'full': "+this.type}this.asn1Obj=new KJUR.asn1.DERTaggedObject({explicit:false,tag:this.tag,obj:this.asn1V});this.hTLV=this.asn1Obj.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(KJUR.asn1.x509.GeneralNames.prototype.isPrototypeOf(b)){this.type="full";this.tag="a0";this.asn1V=b}else{throw"This class supports GeneralNames only as argument"}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPoint=function(b){KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);var a=null;this.getEncodedHex=function(){var c=new KJUR.asn1.DERSequence();if(this.asn1DP!=null){var d=new KJUR.asn1.DERTaggedObject({explicit:true,tag:"a0",obj:this.asn1DP});c.appendASN1Object(d)}this.hTLV=c.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.dpobj!="undefined"){this.asn1DP=b.dpobj}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint,KJUR.asn1.ASN1Object);KJUR.asn1.x509.OID=new function(a){this.atype2oidList={C:"2.5.4.6",O:"2.5.4.10",OU:"2.5.4.11",ST:"2.5.4.8",L:"2.5.4.7",CN:"2.5.4.3",};this.name2oidList={sha384:"2.16.840.1.101.3.4.2.2",sha224:"2.16.840.1.101.3.4.2.4",MD2withRSA:"1.2.840.113549.1.1.2",MD4withRSA:"1.2.840.113549.1.1.3",MD5withRSA:"1.2.840.113549.1.1.4",SHA1withRSA:"1.2.840.113549.1.1.5",SHA224withRSA:"1.2.840.113549.1.1.14",SHA256withRSA:"1.2.840.113549.1.1.11",SHA384withRSA:"1.2.840.113549.1.1.12",SHA512withRSA:"1.2.840.113549.1.1.13",SHA1withECDSA:"1.2.840.10045.4.1",SHA224withECDSA:"1.2.840.10045.4.3.1",SHA256withECDSA:"1.2.840.10045.4.3.2",SHA384withECDSA:"1.2.840.10045.4.3.3",SHA512withECDSA:"1.2.840.10045.4.3.4",dsa:"1.2.840.10040.4.1",SHA1withDSA:"1.2.840.10040.4.3",SHA224withDSA:"2.16.840.1.101.3.4.3.1",SHA256withDSA:"2.16.840.1.101.3.4.3.2",rsaEncryption:"1.2.840.113549.1.1.1",subjectKeyIdentifier:"2.5.29.14",countryName:"2.5.4.6",organization:"2.5.4.10",organizationalUnit:"2.5.4.11",stateOrProvinceName:"2.5.4.8",locality:"2.5.4.7",commonName:"2.5.4.3",keyUsage:"2.5.29.15",basicConstraints:"2.5.29.19",cRLDistributionPoints:"2.5.29.31",certificatePolicies:"2.5.29.32",authorityKeyIdentifier:"2.5.29.35",extKeyUsage:"2.5.29.37",anyExtendedKeyUsage:"2.5.29.37.0",serverAuth:"1.3.6.1.5.5.7.3.1",clientAuth:"1.3.6.1.5.5.7.3.2",codeSigning:"1.3.6.1.5.5.7.3.3",emailProtection:"1.3.6.1.5.5.7.3.4",timeStamping:"1.3.6.1.5.5.7.3.8",ocspSigning:"1.3.6.1.5.5.7.3.9",ecPublicKey:"1.2.840.10045.2.1",secp256r1:"1.2.840.10045.3.1.7",secp256k1:"1.3.132.0.10",secp384r1:"1.3.132.0.34",pkcs5PBES2:"1.2.840.113549.1.5.13",pkcs5PBKDF2:"1.2.840.113549.1.5.12","des-EDE3-CBC":"1.2.840.113549.3.7",};this.objCache={};this.name2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.name2oidList[b]=="undefined"){throw"Name of ObjectIdentifier not defined: "+b}var c=this.name2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d};this.atype2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.atype2oidList[b]=="undefined"){throw"AttributeType name undefined: "+b}var c=this.atype2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d}};KJUR.asn1.x509.X509Util=new function(){this.getPKCS8PubKeyPEMfromRSAKey=function(i){var h=null;var f=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(i.n);var j=KJUR.asn1.ASN1Util.integerToByteHex(i.e);var a=new KJUR.asn1.DERInteger({hex:f});var g=new KJUR.asn1.DERInteger({hex:j});var l=new KJUR.asn1.DERSequence({array:[a,g]});var c=l.getEncodedHex();var d=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});var b=new KJUR.asn1.DERBitString({hex:"00"+c});var k=new KJUR.asn1.DERSequence({array:[d,b]});var e=k.getEncodedHex();var h=KJUR.asn1.ASN1Util.getPEMStringFromHex(e,"PUBLIC KEY");return h}};KJUR.asn1.x509.X509Util.newCertPEM=function(f){var c=KJUR.asn1.x509;var e=new c.TBSCertificate();if(f.serial!==undefined){e.setSerialNumberByParam(f.serial)}else{throw"serial number undefined."}if(typeof f.sigalg.name=="string"){e.setSignatureAlgByParam(f.sigalg)}else{throw"unproper signature algorithm name"}if(f.issuer!==undefined){e.setIssuerByParam(f.issuer)}else{throw"issuer name undefined."}if(f.notbefore!==undefined){e.setNotBeforeByParam(f.notbefore)}else{throw"notbefore undefined."}if(f.notafter!==undefined){e.setNotAfterByParam(f.notafter)}else{throw"notafter undefined."}if(f.subject!==undefined){e.setSubjectByParam(f.subject)}else{throw"subject name undefined."}if(f.sbjpubkey!==undefined){e.setSubjectPublicKeyByGetKey(f.sbjpubkey)}else{throw"subject public key undefined."}if(f.ext.length!==undefined){for(var b=0;b<f.ext.length;b++){for(key in f.ext[b]){e.appendExtensionByName(key,f.ext[b][key])}}}var d=null;if(f.cakey){d=KEYUTIL.getKey.apply(null,f.cakey)}else{throw"ca key undefined"}var a=new c.Certificate({tbscertobj:e,prvkeyobj:d});a.sign();return a.getPEMString()};
/*! base64x-1.1.2 (c) 2013 Kenji Urushima | kjur.github.com/jsjws/license
 */
function Base64x(){}function stoBA(d){var b=new Array();for(var c=0;c<d.length;c++){b[c]=d.charCodeAt(c)}return b}function BAtos(b){var d="";for(var c=0;c<b.length;c++){d=d+String.fromCharCode(b[c])}return d}function BAtohex(b){var e="";for(var d=0;d<b.length;d++){var c=b[d].toString(16);if(c.length==1){c="0"+c}e=e+c}return e}function stohex(a){return BAtohex(stoBA(a))}function stob64(a){return hex2b64(stohex(a))}function stob64u(a){return b64tob64u(hex2b64(stohex(a)))}function b64utos(a){return BAtos(b64toBA(b64utob64(a)))}function b64tob64u(a){a=a.replace(/\=/g,"");a=a.replace(/\+/g,"-");a=a.replace(/\//g,"_");return a}function b64utob64(a){if(a.length%4==2){a=a+"=="}else{if(a.length%4==3){a=a+"="}}a=a.replace(/-/g,"+");a=a.replace(/_/g,"/");return a}function hextob64u(a){return b64tob64u(hex2b64(a))}function b64utohex(a){return b64tohex(b64utob64(a))}var utf8tob64u,b64utoutf8;if(typeof Buffer==="function"){utf8tob64u=function(a){return b64tob64u(new Buffer(a,"utf8").toString("base64"))};b64utoutf8=function(a){return new Buffer(b64utob64(a),"base64").toString("utf8")}}else{utf8tob64u=function(a){return hextob64u(uricmptohex(encodeURIComponentAll(a)))};b64utoutf8=function(a){return decodeURIComponent(hextouricmp(b64utohex(a)))}}function utf8tob64(a){return hex2b64(uricmptohex(encodeURIComponentAll(a)))}function b64toutf8(a){return decodeURIComponent(hextouricmp(b64tohex(a)))}function utf8tohex(a){return uricmptohex(encodeURIComponentAll(a))}function hextoutf8(a){return decodeURIComponent(hextouricmp(a))}function hextorstr(c){var b="";for(var a=0;a<c.length-1;a+=2){b+=String.fromCharCode(parseInt(c.substr(a,2),16))}return b}function rstrtohex(c){var a="";for(var b=0;b<c.length;b++){a+=("0"+c.charCodeAt(b).toString(16)).slice(-2)}return a}function uricmptohex(a){return a.replace(/%/g,"")}function hextouricmp(a){return a.replace(/(..)/g,"%$1")}function encodeURIComponentAll(a){var d=encodeURIComponent(a);var b="";for(var c=0;c<d.length;c++){if(d[c]=="%"){b=b+d.substr(c,3);c=c+2}else{b=b+"%"+stohex(d[c])}}return b}function newline_toUnix(a){a=a.replace(/\r\n/mg,"\n");return a}function newline_toDos(a){a=a.replace(/\r\n/mg,"\n");a=a.replace(/\n/mg,"\r\n");return a};
/*! crypto-1.1.5.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.Util=new function(){this.DIGESTINFOHEAD={sha1:"3021300906052b0e03021a05000414",sha224:"302d300d06096086480165030402040500041c",sha256:"3031300d060960864801650304020105000420",sha384:"3041300d060960864801650304020205000430",sha512:"3051300d060960864801650304020305000440",md2:"3020300c06082a864886f70d020205000410",md5:"3020300c06082a864886f70d020505000410",ripemd160:"3021300906052b2403020105000414",};this.DEFAULTPROVIDER={md5:"cryptojs",sha1:"cryptojs",sha224:"cryptojs",sha256:"cryptojs",sha384:"cryptojs",sha512:"cryptojs",ripemd160:"cryptojs",hmacmd5:"cryptojs",hmacsha1:"cryptojs",hmacsha224:"cryptojs",hmacsha256:"cryptojs",hmacsha384:"cryptojs",hmacsha512:"cryptojs",hmacripemd160:"cryptojs",MD5withRSA:"cryptojs/jsrsa",SHA1withRSA:"cryptojs/jsrsa",SHA224withRSA:"cryptojs/jsrsa",SHA256withRSA:"cryptojs/jsrsa",SHA384withRSA:"cryptojs/jsrsa",SHA512withRSA:"cryptojs/jsrsa",RIPEMD160withRSA:"cryptojs/jsrsa",MD5withECDSA:"cryptojs/jsrsa",SHA1withECDSA:"cryptojs/jsrsa",SHA224withECDSA:"cryptojs/jsrsa",SHA256withECDSA:"cryptojs/jsrsa",SHA384withECDSA:"cryptojs/jsrsa",SHA512withECDSA:"cryptojs/jsrsa",RIPEMD160withECDSA:"cryptojs/jsrsa",SHA1withDSA:"cryptojs/jsrsa",SHA224withDSA:"cryptojs/jsrsa",SHA256withDSA:"cryptojs/jsrsa",MD5withRSAandMGF1:"cryptojs/jsrsa",SHA1withRSAandMGF1:"cryptojs/jsrsa",SHA224withRSAandMGF1:"cryptojs/jsrsa",SHA256withRSAandMGF1:"cryptojs/jsrsa",SHA384withRSAandMGF1:"cryptojs/jsrsa",SHA512withRSAandMGF1:"cryptojs/jsrsa",RIPEMD160withRSAandMGF1:"cryptojs/jsrsa",};this.CRYPTOJSMESSAGEDIGESTNAME={md5:"CryptoJS.algo.MD5",sha1:"CryptoJS.algo.SHA1",sha224:"CryptoJS.algo.SHA224",sha256:"CryptoJS.algo.SHA256",sha384:"CryptoJS.algo.SHA384",sha512:"CryptoJS.algo.SHA512",ripemd160:"CryptoJS.algo.RIPEMD160"};this.getDigestInfoHex=function(a,b){if(typeof this.DIGESTINFOHEAD[b]=="undefined"){throw"alg not supported in Util.DIGESTINFOHEAD: "+b}return this.DIGESTINFOHEAD[b]+a};this.getPaddedDigestInfoHex=function(h,a,j){var c=this.getDigestInfoHex(h,a);var d=j/4;if(c.length+22>d){throw"key is too short for SigAlg: keylen="+j+","+a}var b="0001";var k="00"+c;var g="";var l=d-b.length-k.length;for(var f=0;f<l;f+=2){g+="ff"}var e=b+g+k;return e};this.hashString=function(a,c){var b=new KJUR.crypto.MessageDigest({alg:c});return b.digestString(a)};this.hashHex=function(b,c){var a=new KJUR.crypto.MessageDigest({alg:c});return a.digestHex(b)};this.sha1=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha1",prov:"cryptojs"});return b.digestString(a)};this.sha256=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestString(a)};this.sha256Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestHex(a)};this.sha512=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestString(a)};this.sha512Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestHex(a)};this.md5=function(a){var b=new KJUR.crypto.MessageDigest({alg:"md5",prov:"cryptojs"});return b.digestString(a)};this.ripemd160=function(a){var b=new KJUR.crypto.MessageDigest({alg:"ripemd160",prov:"cryptojs"});return b.digestString(a)};this.getCryptoJSMDByName=function(a){}};KJUR.crypto.MessageDigest=function(params){var md=null;var algName=null;var provName=null;this.setAlgAndProvider=function(alg,prov){if(alg!=null&&prov===undefined){prov=KJUR.crypto.Util.DEFAULTPROVIDER[alg]}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(alg)!=-1&&prov=="cryptojs"){try{this.md=eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg]).create()}catch(ex){throw"setAlgAndProvider hash alg set fail alg="+alg+"/"+ex}this.updateString=function(str){this.md.update(str)};this.updateHex=function(hex){var wHex=CryptoJS.enc.Hex.parse(hex);this.md.update(wHex)};this.digest=function(){var hash=this.md.finalize();return hash.toString(CryptoJS.enc.Hex)};this.digestString=function(str){this.updateString(str);return this.digest()};this.digestHex=function(hex){this.updateHex(hex);return this.digest()}}if(":sha256:".indexOf(alg)!=-1&&prov=="sjcl"){try{this.md=new sjcl.hash.sha256()}catch(ex){throw"setAlgAndProvider hash alg set fail alg="+alg+"/"+ex}this.updateString=function(str){this.md.update(str)};this.updateHex=function(hex){var baHex=sjcl.codec.hex.toBits(hex);this.md.update(baHex)};this.digest=function(){var hash=this.md.finalize();return sjcl.codec.hex.fromBits(hash)};this.digestString=function(str){this.updateString(str);return this.digest()};this.digestHex=function(hex){this.updateHex(hex);return this.digest()}}};this.updateString=function(str){throw"updateString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.updateHex=function(hex){throw"updateHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digest=function(){throw"digest() not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestString=function(str){throw"digestString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestHex=function(hex){throw"digestHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};if(params!==undefined){if(params.alg!==undefined){this.algName=params.alg;if(params.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.Mac=function(params){var mac=null;var pass=null;var algName=null;var provName=null;var algProv=null;this.setAlgAndProvider=function(alg,prov){if(alg==null){alg="hmacsha1"}alg=alg.toLowerCase();if(alg.substr(0,4)!="hmac"){throw"setAlgAndProvider unsupported HMAC alg: "+alg}if(prov===undefined){prov=KJUR.crypto.Util.DEFAULTPROVIDER[alg]}this.algProv=alg+"/"+prov;var hashAlg=alg.substr(4);if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(hashAlg)!=-1&&prov=="cryptojs"){try{var mdObj=eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[hashAlg]);this.mac=CryptoJS.algo.HMAC.create(mdObj,this.pass)}catch(ex){throw"setAlgAndProvider hash alg set fail hashAlg="+hashAlg+"/"+ex}this.updateString=function(str){this.mac.update(str)};this.updateHex=function(hex){var wHex=CryptoJS.enc.Hex.parse(hex);this.mac.update(wHex)};this.doFinal=function(){var hash=this.mac.finalize();return hash.toString(CryptoJS.enc.Hex)};this.doFinalString=function(str){this.updateString(str);return this.doFinal()};this.doFinalHex=function(hex){this.updateHex(hex);return this.doFinal()}}};this.updateString=function(str){throw"updateString(str) not supported for this alg/prov: "+this.algProv};this.updateHex=function(hex){throw"updateHex(hex) not supported for this alg/prov: "+this.algProv};this.doFinal=function(){throw"digest() not supported for this alg/prov: "+this.algProv};this.doFinalString=function(str){throw"digestString(str) not supported for this alg/prov: "+this.algProv};this.doFinalHex=function(hex){throw"digestHex(hex) not supported for this alg/prov: "+this.algProv};if(params!==undefined){if(params.pass!==undefined){this.pass=params.pass}if(params.alg!==undefined){this.algName=params.alg;if(params.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.Signature=function(o){var q=null;var n=null;var r=null;var c=null;var l=null;var d=null;var k=null;var h=null;var p=null;var e=null;var b=-1;var g=null;var j=null;var a=null;var i=null;var f=null;this._setAlgNames=function(){if(this.algName.match(/^(.+)with(.+)$/)){this.mdAlgName=RegExp.$1.toLowerCase();this.pubkeyAlgName=RegExp.$2.toLowerCase()}};this._zeroPaddingOfSignature=function(x,w){var v="";var t=w/4-x.length;for(var u=0;u<t;u++){v=v+"0"}return v+x};this.setAlgAndProvider=function(u,t){this._setAlgNames();if(t!="cryptojs/jsrsa"){throw"provider not supported: "+t}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName)!=-1){try{this.md=new KJUR.crypto.MessageDigest({alg:this.mdAlgName})}catch(s){throw"setAlgAndProvider hash alg set fail alg="+this.mdAlgName+"/"+s}this.init=function(w,x){var y=null;try{if(x===undefined){y=KEYUTIL.getKey(w)}else{y=KEYUTIL.getKey(w,x)}}catch(v){throw"init failed:"+v}if(y.isPrivate===true){this.prvKey=y;this.state="SIGN"}else{if(y.isPublic===true){this.pubKey=y;this.state="VERIFY"}else{throw"init failed.:"+y}}};this.initSign=function(v){if(typeof v.ecprvhex=="string"&&typeof v.eccurvename=="string"){this.ecprvhex=v.ecprvhex;this.eccurvename=v.eccurvename}else{this.prvKey=v}this.state="SIGN"};this.initVerifyByPublicKey=function(v){if(typeof v.ecpubhex=="string"&&typeof v.eccurvename=="string"){this.ecpubhex=v.ecpubhex;this.eccurvename=v.eccurvename}else{if(v instanceof KJUR.crypto.ECDSA){this.pubKey=v}else{if(v instanceof RSAKey){this.pubKey=v}}}this.state="VERIFY"};this.initVerifyByCertificatePEM=function(v){var w=new X509();w.readCertPEM(v);this.pubKey=w.subjectPublicKeyRSA;this.state="VERIFY"};this.updateString=function(v){this.md.updateString(v)};this.updateHex=function(v){this.md.updateHex(v)};this.sign=function(){this.sHashHex=this.md.digest();if(typeof this.ecprvhex!="undefined"&&typeof this.eccurvename!="undefined"){var v=new KJUR.crypto.ECDSA({curve:this.eccurvename});this.hSign=v.signHex(this.sHashHex,this.ecprvhex)}else{if(this.pubkeyAlgName=="rsaandmgf1"){this.hSign=this.prvKey.signWithMessageHashPSS(this.sHashHex,this.mdAlgName,this.pssSaltLen)}else{if(this.pubkeyAlgName=="rsa"){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex,this.mdAlgName)}else{if(this.prvKey instanceof KJUR.crypto.ECDSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{if(this.prvKey instanceof KJUR.crypto.DSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}return this.hSign};this.signString=function(v){this.updateString(v);this.sign()};this.signHex=function(v){this.updateHex(v);this.sign()};this.verify=function(v){this.sHashHex=this.md.digest();if(typeof this.ecpubhex!="undefined"&&typeof this.eccurvename!="undefined"){var w=new KJUR.crypto.ECDSA({curve:this.eccurvename});return w.verifyHex(this.sHashHex,v,this.ecpubhex)}else{if(this.pubkeyAlgName=="rsaandmgf1"){return this.pubKey.verifyWithMessageHashPSS(this.sHashHex,v,this.mdAlgName,this.pssSaltLen)}else{if(this.pubkeyAlgName=="rsa"){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(this.pubKey instanceof KJUR.crypto.ECDSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(this.pubKey instanceof KJUR.crypto.DSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}}}};this.init=function(s,t){throw"init(key, pass) not supported for this alg:prov="+this.algProvName};this.initVerifyByPublicKey=function(s){throw"initVerifyByPublicKey(rsaPubKeyy) not supported for this alg:prov="+this.algProvName};this.initVerifyByCertificatePEM=function(s){throw"initVerifyByCertificatePEM(certPEM) not supported for this alg:prov="+this.algProvName};this.initSign=function(s){throw"initSign(prvKey) not supported for this alg:prov="+this.algProvName};this.updateString=function(s){throw"updateString(str) not supported for this alg:prov="+this.algProvName};this.updateHex=function(s){throw"updateHex(hex) not supported for this alg:prov="+this.algProvName};this.sign=function(){throw"sign() not supported for this alg:prov="+this.algProvName};this.signString=function(s){throw"digestString(str) not supported for this alg:prov="+this.algProvName};this.signHex=function(s){throw"digestHex(hex) not supported for this alg:prov="+this.algProvName};this.verify=function(s){throw"verify(hSigVal) not supported for this alg:prov="+this.algProvName};this.initParams=o;if(o!==undefined){if(o.alg!==undefined){this.algName=o.alg;if(o.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}else{this.provName=o.prov}this.algProvName=this.algName+":"+this.provName;this.setAlgAndProvider(this.algName,this.provName);this._setAlgNames()}if(o.psssaltlen!==undefined){this.pssSaltLen=o.psssaltlen}if(o.prvkeypem!==undefined){if(o.prvkeypas!==undefined){throw"both prvkeypem and prvkeypas parameters not supported"}else{try{var q=new RSAKey();q.readPrivateKeyFromPEMString(o.prvkeypem);this.initSign(q)}catch(m){throw"fatal error to load pem private key: "+m}}}}};KJUR.crypto.OID=new function(){this.oidhex2name={"2a864886f70d010101":"rsaEncryption","2a8648ce3d0201":"ecPublicKey","2a8648ce380401":"dsa","2a8648ce3d030107":"secp256r1","2b8104001f":"secp192k1","2b81040021":"secp224r1","2b8104000a":"secp256k1","2b81040023":"secp521r1","2b81040022":"secp384r1","2a8648ce380403":"SHA1withDSA","608648016503040301":"SHA224withDSA","608648016503040302":"SHA256withDSA",}};
/*! ecdsa-modified-1.0.4.js (c) Stephan Thomas, Kenji Urushima | github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECDSA=function(h){var e="secp256r1";var g=null;var b=null;var f=null;var a=new SecureRandom();var d=null;this.type="EC";function c(s,o,r,n){var j=Math.max(o.bitLength(),n.bitLength());var t=s.add2D(r);var q=s.curve.getInfinity();for(var p=j-1;p>=0;--p){q=q.twice2D();q.z=BigInteger.ONE;if(o.testBit(p)){if(n.testBit(p)){q=q.add2D(t)}else{q=q.add2D(s)}}else{if(n.testBit(p)){q=q.add2D(r)}}}return q}this.getBigRandom=function(i){return new BigInteger(i.bitLength(),a).mod(i.subtract(BigInteger.ONE)).add(BigInteger.ONE)};this.setNamedCurve=function(i){this.ecparams=KJUR.crypto.ECParameterDB.getByName(i);this.prvKeyHex=null;this.pubKeyHex=null;this.curveName=i};this.setPrivateKeyHex=function(i){this.isPrivate=true;this.prvKeyHex=i};this.setPublicKeyHex=function(i){this.isPublic=true;this.pubKeyHex=i};this.generateKeyPairHex=function(){var k=this.ecparams.n;var n=this.getBigRandom(k);var l=this.ecparams.G.multiply(n);var q=l.getX().toBigInteger();var o=l.getY().toBigInteger();var i=this.ecparams.keylen/4;var m=("0000000000"+n.toString(16)).slice(-i);var r=("0000000000"+q.toString(16)).slice(-i);var p=("0000000000"+o.toString(16)).slice(-i);var j="04"+r+p;this.setPrivateKeyHex(m);this.setPublicKeyHex(j);return{ecprvhex:m,ecpubhex:j}};this.signWithMessageHash=function(i){return this.signHex(i,this.prvKeyHex)};this.signHex=function(o,j){var t=new BigInteger(j,16);var l=this.ecparams.n;var q=new BigInteger(o,16);do{var m=this.getBigRandom(l);var u=this.ecparams.G;var p=u.multiply(m);var i=p.getX().toBigInteger().mod(l)}while(i.compareTo(BigInteger.ZERO)<=0);var v=m.modInverse(l).multiply(q.add(t.multiply(i))).mod(l);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(i,v)};this.sign=function(m,u){var q=u;var j=this.ecparams.n;var p=BigInteger.fromByteArrayUnsigned(m);do{var l=this.getBigRandom(j);var t=this.ecparams.G;var o=t.multiply(l);var i=o.getX().toBigInteger().mod(j)}while(i.compareTo(BigInteger.ZERO)<=0);var v=l.modInverse(j).multiply(p.add(q.multiply(i))).mod(j);return this.serializeSig(i,v)};this.verifyWithMessageHash=function(j,i){return this.verifyHex(j,i,this.pubKeyHex)};this.verifyHex=function(m,i,p){var l,j;var o=KJUR.crypto.ECDSA.parseSigHex(i);l=o.r;j=o.s;var k;k=ECPointFp.decodeFromHex(this.ecparams.curve,p);var n=new BigInteger(m,16);return this.verifyRaw(n,l,j,k)};this.verify=function(o,p,j){var l,i;if(Bitcoin.Util.isArray(p)){var n=this.parseSig(p);l=n.r;i=n.s}else{if("object"===typeof p&&p.r&&p.s){l=p.r;i=p.s}else{throw"Invalid value for signature"}}var k;if(j instanceof ECPointFp){k=j}else{if(Bitcoin.Util.isArray(j)){k=ECPointFp.decodeFrom(this.ecparams.curve,j)}else{throw"Invalid format for pubkey value, must be byte array or ECPointFp"}}var m=BigInteger.fromByteArrayUnsigned(o);return this.verifyRaw(m,l,i,k)};this.verifyRaw=function(o,i,w,m){var l=this.ecparams.n;var u=this.ecparams.G;if(i.compareTo(BigInteger.ONE)<0||i.compareTo(l)>=0){return false}if(w.compareTo(BigInteger.ONE)<0||w.compareTo(l)>=0){return false}var p=w.modInverse(l);var k=o.multiply(p).mod(l);var j=i.multiply(p).mod(l);var q=u.multiply(k).add(m.multiply(j));var t=q.getX().toBigInteger().mod(l);return t.equals(i)};this.serializeSig=function(k,j){var l=k.toByteArraySigned();var i=j.toByteArraySigned();var m=[];m.push(2);m.push(l.length);m=m.concat(l);m.push(2);m.push(i.length);m=m.concat(i);m.unshift(m.length);m.unshift(48);return m};this.parseSig=function(n){var m;if(n[0]!=48){throw new Error("Signature not a valid DERSequence")}m=2;if(n[m]!=2){throw new Error("First element in signature must be a DERInteger")}var l=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];if(n[m]!=2){throw new Error("Second element in signature must be a DERInteger")}var i=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];var k=BigInteger.fromByteArrayUnsigned(l);var j=BigInteger.fromByteArrayUnsigned(i);return{r:k,s:j}};this.parseSigCompact=function(m){if(m.length!==65){throw"Signature has the wrong length"}var j=m[0]-27;if(j<0||j>7){throw"Invalid signature type"}var o=this.ecparams.n;var l=BigInteger.fromByteArrayUnsigned(m.slice(1,33)).mod(o);var k=BigInteger.fromByteArrayUnsigned(m.slice(33,65)).mod(o);return{r:l,s:k,i:j}};if(h!==undefined){if(h.curve!==undefined){this.curveName=h.curve}}if(this.curveName===undefined){this.curveName=e}this.setNamedCurve(this.curveName);if(h!==undefined){if(h.prv!==undefined){this.setPrivateKeyHex(h.prv)}if(h.pub!==undefined){this.setPublicKeyHex(h.pub)}}};KJUR.crypto.ECDSA.parseSigHex=function(a){var b=KJUR.crypto.ECDSA.parseSigHexInHexRS(a);var d=new BigInteger(b.r,16);var c=new BigInteger(b.s,16);return{r:d,s:c}};KJUR.crypto.ECDSA.parseSigHexInHexRS=function(c){if(c.substr(0,2)!="30"){throw"signature is not a ASN.1 sequence"}var b=ASN1HEX.getPosArrayOfChildren_AtObj(c,0);if(b.length!=2){throw"number of signature ASN.1 sequence elements seem wrong"}var g=b[0];var f=b[1];if(c.substr(g,2)!="02"){throw"1st item of sequene of signature is not ASN.1 integer"}if(c.substr(f,2)!="02"){throw"2nd item of sequene of signature is not ASN.1 integer"}var e=ASN1HEX.getHexOfV_AtObj(c,g);var d=ASN1HEX.getHexOfV_AtObj(c,f);return{r:e,s:d}};KJUR.crypto.ECDSA.asn1SigToConcatSig=function(c){var d=KJUR.crypto.ECDSA.parseSigHexInHexRS(c);var b=d.r;var a=d.s;if(b.substr(0,2)=="00"&&(((b.length/2)*8)%(16*8))==8){b=b.substr(2)}if(a.substr(0,2)=="00"&&(((a.length/2)*8)%(16*8))==8){a=a.substr(2)}if((((b.length/2)*8)%(16*8))!=0){throw"unknown ECDSA sig r length error"}if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA sig s length error"}return b+a};KJUR.crypto.ECDSA.concatSigToASN1Sig=function(a){if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA concatinated r-s sig  length error"}var c=a.substr(0,a.length/2);var b=a.substr(a.length/2);return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(c,b)};KJUR.crypto.ECDSA.hexRSSigToASN1Sig=function(b,a){var d=new BigInteger(b,16);var c=new BigInteger(a,16);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(d,c)};KJUR.crypto.ECDSA.biRSSigToASN1Sig=function(e,c){var b=new KJUR.asn1.DERInteger({bigint:e});var a=new KJUR.asn1.DERInteger({bigint:c});var d=new KJUR.asn1.DERSequence({array:[b,a]});return d.getEncodedHex()};
/*! ecparam-1.0.0.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECParameterDB=new function(){var b={};var c={};function a(d){return new BigInteger(d,16)}this.getByName=function(e){var d=e;if(typeof c[d]!="undefined"){d=c[e]}if(typeof b[d]!="undefined"){return b[d]}throw"unregistered EC curve name: "+d};this.regist=function(A,l,o,g,m,e,j,f,k,u,d,x){b[A]={};var s=a(o);var z=a(g);var y=a(m);var t=a(e);var w=a(j);var r=new ECCurveFp(s,z,y);var q=r.decodePointHex("04"+f+k);b[A]["name"]=A;b[A]["keylen"]=l;b[A]["curve"]=r;b[A]["G"]=q;b[A]["n"]=t;b[A]["h"]=w;b[A]["oid"]=d;b[A]["info"]=x;for(var v=0;v<u.length;v++){c[u[v]]=A}}};KJUR.crypto.ECParameterDB.regist("secp128r1",128,"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC","E87579C11079F43DD824993C2CEE5ED3","FFFFFFFE0000000075A30D1B9038A115","1","161FF7528B899B2D0C28607CA52C5B86","CF5AC8395BAFEB13C02DA292DDED7A83",[],"","secp128r1 : SECG curve over a 128 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160k1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73","0","7","0100000000000000000001B8FA16DFAB9ACA16B6B3","1","3B4C382CE37AA192A4019E763036F4F5DD4D7EBB","938CF935318FDCED6BC28286531733C3F03C4FEE",[],"","secp160k1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160r1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC","1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45","0100000000000000000001F4C8F927AED3CA752257","1","4A96B5688EF573284664698968C38BB913CBFC82","23A628553168947D59DCC912042351377AC5FB32",[],"","secp160r1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp192k1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37","0","3","FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D","1","DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D","9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D",[]);KJUR.crypto.ECParameterDB.regist("secp192r1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC","64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1","FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831","1","188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012","07192B95FFC8DA78631011ED6B24CDD573F977A11E794811",[]);KJUR.crypto.ECParameterDB.regist("secp224r1",224,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE","B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4","FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D","1","B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21","BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34",[]);KJUR.crypto.ECParameterDB.regist("secp256k1",256,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F","0","7","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141","1","79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",[]);KJUR.crypto.ECParameterDB.regist("secp256r1",256,"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC","5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B","FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551","1","6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296","4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",["NIST P-256","P-256","prime256v1"]);KJUR.crypto.ECParameterDB.regist("secp384r1",384,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC","B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973","1","AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7","3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f",["NIST P-384","P-384"]);KJUR.crypto.ECParameterDB.regist("secp521r1",521,"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC","051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409","1","C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66","011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650",["NIST P-521","P-521"]);
/*! dsa-modified-1.0.1.js (c) Recurity Labs GmbH, Kenji Urushimma | github.com/openpgpjs/openpgpjs/blob/master/LICENSE
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.DSA=function(){this.p=null;this.q=null;this.g=null;this.y=null;this.x=null;this.type="DSA";this.setPrivate=function(z,w,v,A,u){this.isPrivate=true;this.p=z;this.q=w;this.g=v;this.y=A;this.x=u};this.setPublic=function(w,v,u,z){this.isPublic=true;this.p=w;this.q=v;this.g=u;this.y=z;this.x=null};this.signWithMessageHash=function(z){var v=this.p;var u=this.q;var C=this.g;var D=this.y;var E=this.x;var A=z.substr(0,u.bitLength()/4);var B=new BigInteger(z,16);var w=n(BigInteger.ONE.add(BigInteger.ONE),u.subtract(BigInteger.ONE));var G=(C.modPow(w,v)).mod(u);var F=(w.modInverse(u).multiply(B.add(E.multiply(G)))).mod(u);var H=KJUR.asn1.ASN1Util.jsonToASN1HEX({seq:[{"int":{bigint:G}},{"int":{bigint:F}}]});return H};this.verifyWithMessageHash=function(C,B){var z=this.p;var u=this.q;var G=this.g;var H=this.y;var E=this.parseASN1Signature(B);var K=E[0];var J=E[1];var C=C.substr(0,u.bitLength()/4);var D=new BigInteger(C,16);if(BigInteger.ZERO.compareTo(K)>0||K.compareTo(u)>0||BigInteger.ZERO.compareTo(J)>0||J.compareTo(u)>0){throw"invalid DSA signature"}var I=J.modInverse(u);var A=D.multiply(I).mod(u);var v=K.multiply(I).mod(u);var F=G.modPow(A,z).multiply(H.modPow(v,z)).mod(z).mod(u);return F.compareTo(K)==0};this.parseASN1Signature=function(u){try{var y=new BigInteger(ASN1HEX.getVbyList(u,0,[0],"02"),16);var v=new BigInteger(ASN1HEX.getVbyList(u,0,[1],"02"),16);return[y,v]}catch(w){throw"malformed DSA signature"}};function d(E,w,B,v,u,C){var z=KJUR.crypto.Util.hashString(w,E.toLowerCase());var z=z.substr(0,u.bitLength()/4);var A=new BigInteger(z,16);var y=n(BigInteger.ONE.add(BigInteger.ONE),u.subtract(BigInteger.ONE));var F=(B.modPow(y,v)).mod(u);var D=(y.modInverse(u).multiply(A.add(C.multiply(F)))).mod(u);var G=new Array();G[0]=F;G[1]=D;return G}function r(v){var u=openpgp.config.config.prefer_hash_algorithm;switch(Math.round(v.bitLength()/8)){case 20:if(u!=2&&u>11&&u!=10&&u<8){return 2}return u;case 28:if(u>11&&u<8){return 11}return u;case 32:if(u>10&&u<8){return 8}return u;default:util.print_debug("DSA select hash algorithm: returning null for an unknown length of q");return null}}this.select_hash_algorithm=r;function m(I,K,J,B,z,u,F,G){var C=KJUR.crypto.Util.hashString(B,I.toLowerCase());var C=C.substr(0,u.bitLength()/4);var D=new BigInteger(C,16);if(BigInteger.ZERO.compareTo(K)>0||K.compareTo(u)>0||BigInteger.ZERO.compareTo(J)>0||J.compareTo(u)>0){util.print_error("invalid DSA Signature");return null}var H=J.modInverse(u);var A=D.multiply(H).mod(u);var v=K.multiply(H).mod(u);var E=F.modPow(A,z).multiply(G.modPow(v,z)).mod(z).mod(u);return E.compareTo(K)==0}function a(z){var A=new BigInteger(z,primeCenterie);var y=j(q,512);var u=t(p,q,z);var v;do{v=new BigInteger(q.bitCount(),rand)}while(x.compareTo(BigInteger.ZERO)!=1&&x.compareTo(q)!=-1);var w=g.modPow(x,p);return{x:v,q:A,p:y,g:u,y:w}}function j(y,z,w){if(z%64!=0){return false}var u;var v;do{u=w(bitcount,true);v=u.subtract(BigInteger.ONE);u=u.subtract(v.remainder(y))}while(!u.isProbablePrime(primeCenterie)||u.bitLength()!=l);return u}function t(B,z,A,w){var u=B.subtract(BigInteger.ONE);var y=u.divide(z);var v;do{v=w(A)}while(v.compareTo(u)!=-1&&v.compareTo(BigInteger.ONE)!=1);return v.modPow(y,B)}function o(w,y,u){var v;do{v=u(y,false)}while(v.compareTo(w)!=-1&&v.compareTo(BigInteger.ZERO)!=1);return v}function i(v,w){k=o(v);var u=g.modPow(k,w).mod(v);return u}function h(B,w,y,v,z,u){var A=B(v);s=(w.modInverse(z).multiply(A.add(u.multiply(y)))).mod(z);return s}this.sign=d;this.verify=m;function n(w,u){if(u.compareTo(w)<=0){return}var v=u.subtract(w);var y=e(v.bitLength());while(y>v){y=e(v.bitLength())}return w.add(y)}function e(w){if(w<0){return null}var u=Math.floor((w+7)/8);var v=c(u);if(w%8>0){v=String.fromCharCode((Math.pow(2,w%8)-1)&v.charCodeAt(0))+v.substring(1)}return new BigInteger(f(v),16)}function c(w){var u="";for(var v=0;v<w;v++){u+=String.fromCharCode(b())}return u}function b(){var u=new Uint32Array(1);window.crypto.getRandomValues(u);return u[0]&255}function f(y){if(y==null){return""}var v=[];var w=y.length;var z=0;var u;while(z<w){u=y[z++].charCodeAt().toString(16);while(u.length<2){u="0"+u}v.push(""+u)}return v.join("")}this.getRandomBigIntegerInRange=n;this.getRandomBigInteger=e;this.getRandomBytes=c};
/*! pkcs5pkey-1.0.5.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var PKCS5PKEY=function(){var c=function(n,p,o){return i(CryptoJS.AES,n,p,o)};var d=function(n,p,o){return i(CryptoJS.TripleDES,n,p,o)};var i=function(q,v,s,o){var p=CryptoJS.enc.Hex.parse(v);var u=CryptoJS.enc.Hex.parse(s);var n=CryptoJS.enc.Hex.parse(o);var r={};r.key=u;r.iv=n;r.ciphertext=p;var t=q.decrypt(r,u,{iv:n});return CryptoJS.enc.Hex.stringify(t)};var j=function(n,p,o){return e(CryptoJS.AES,n,p,o)};var m=function(n,p,o){return e(CryptoJS.TripleDES,n,p,o)};var e=function(s,x,v,p){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(v);var o=CryptoJS.enc.Hex.parse(p);var n={};var u=s.encrypt(r,w,{iv:o});var q=CryptoJS.enc.Hex.parse(u.toString());var t=CryptoJS.enc.Base64.stringify(q);return t};var g={"AES-256-CBC":{proc:c,eproc:j,keylen:32,ivlen:16},"AES-192-CBC":{proc:c,eproc:j,keylen:24,ivlen:16},"AES-128-CBC":{proc:c,eproc:j,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:d,eproc:m,keylen:24,ivlen:8}};var b=function(n){return g[n]["proc"]};var k=function(n){var p=CryptoJS.lib.WordArray.random(n);var o=CryptoJS.enc.Hex.stringify(p);return o};var l=function(q){var r={};if(q.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"))){r.cipher=RegExp.$1;r.ivsalt=RegExp.$2}if(q.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))){r.type=RegExp.$1}var p=-1;var t=0;if(q.indexOf("\r\n\r\n")!=-1){p=q.indexOf("\r\n\r\n");t=2}if(q.indexOf("\n\n")!=-1){p=q.indexOf("\n\n");t=1}var o=q.indexOf("-----END");if(p!=-1&&o!=-1){var n=q.substring(p+t*2,o-t);n=n.replace(/\s+/g,"");r.data=n}return r};var h=function(o,w,n){var t=n.substring(0,16);var r=CryptoJS.enc.Hex.parse(t);var p=CryptoJS.enc.Utf8.parse(w);var s=g[o]["keylen"]+g[o]["ivlen"];var v="";var u=null;for(;;){var q=CryptoJS.algo.MD5.create();if(u!=null){q.update(u)}q.update(p);q.update(r);u=q.finalize();v=v+CryptoJS.enc.Hex.stringify(u);if(v.length>=s*2){break}}var x={};x.keyhex=v.substr(0,g[o]["keylen"]*2);x.ivhex=v.substr(g[o]["keylen"]*2,g[o]["ivlen"]*2);return x};var a=function(n,t,p,u){var q=CryptoJS.enc.Base64.parse(n);var o=CryptoJS.enc.Hex.stringify(q);var s=g[t]["proc"];var r=s(o,p,u);return r};var f=function(n,q,o,s){var p=g[q]["eproc"];var r=p(n,o,s);return r};return{version:"1.0.5",getHexFromPEM:function(o,r){var p=o;if(p.indexOf("BEGIN "+r)==-1){throw"can't find PEM header: "+r}p=p.replace("-----BEGIN "+r+"-----","");p=p.replace("-----END "+r+"-----","");var q=p.replace(/\s+/g,"");var n=b64tohex(q);return n},getDecryptedKeyHexByKeyIV:function(o,r,q,p){var n=b(r);return n(o,q,p)},parsePKCS5PEM:function(n){return l(n)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(o,n,p){return h(o,n,p)},decryptKeyB64:function(n,p,o,q){return a(n,p,o,q)},getDecryptedKeyHex:function(w,v){var o=l(w);var r=o.type;var p=o.cipher;var n=o.ivsalt;var q=o.data;var u=h(p,v,n);var t=u.keyhex;var s=a(q,p,t,n);return s},getRSAKeyFromEncryptedPKCS5PEM:function(p,o){var q=this.getDecryptedKeyHex(p,o);var n=new RSAKey();n.readPrivateKeyFromASN1HexString(q);return n},getEryptedPKCS5PEMFromPrvKeyHex:function(q,x,r,p){var n="";if(typeof r=="undefined"||r==null){r="AES-256-CBC"}if(typeof g[r]=="undefined"){throw"PKCS5PKEY unsupported algorithm: "+r}if(typeof p=="undefined"||p==null){var t=g[r]["ivlen"];var s=k(t);p=s.toUpperCase()}var w=h(r,x,p);var v=w.keyhex;var u=f(q,r,v,p);var o=u.replace(/(.{64})/g,"$1\r\n");var n="-----BEGIN RSA PRIVATE KEY-----\r\n";n+="Proc-Type: 4,ENCRYPTED\r\n";n+="DEK-Info: "+r+","+p+"\r\n";n+="\r\n";n+=o;n+="\r\n-----END RSA PRIVATE KEY-----\r\n";return n},getEryptedPKCS5PEMFromRSAKey:function(C,D,o,s){var A=new KJUR.asn1.DERInteger({"int":0});var v=new KJUR.asn1.DERInteger({bigint:C.n});var z=new KJUR.asn1.DERInteger({"int":C.e});var B=new KJUR.asn1.DERInteger({bigint:C.d});var t=new KJUR.asn1.DERInteger({bigint:C.p});var r=new KJUR.asn1.DERInteger({bigint:C.q});var y=new KJUR.asn1.DERInteger({bigint:C.dmp1});var u=new KJUR.asn1.DERInteger({bigint:C.dmq1});var x=new KJUR.asn1.DERInteger({bigint:C.coeff});var E=new KJUR.asn1.DERSequence({array:[A,v,z,B,t,r,y,u,x]});var w=E.getEncodedHex();return this.getEryptedPKCS5PEMFromPrvKeyHex(w,D,o,s)},newEncryptedPKCS5PEM:function(n,o,r,s){if(typeof o=="undefined"||o==null){o=1024}if(typeof r=="undefined"||r==null){r="10001"}var p=new RSAKey();p.generate(o,r);var q=null;if(typeof s=="undefined"||s==null){q=this.getEncryptedPKCS5PEMFromRSAKey(pkey,n)}else{q=this.getEncryptedPKCS5PEMFromRSAKey(pkey,n,s)}return q},getRSAKeyFromPlainPKCS8PEM:function(p){if(p.match(/ENCRYPTED/)){throw"pem shall be not ENCRYPTED"}var o=this.getHexFromPEM(p,"PRIVATE KEY");var n=this.getRSAKeyFromPlainPKCS8Hex(o);return n},getRSAKeyFromPlainPKCS8Hex:function(q){var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=3){throw"outer DERSequence shall have 3 elements: "+p.length}var o=ASN1HEX.getHexOfTLV_AtObj(q,p[1]);if(o!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmIdentifier is not rsaEnc: "+o}var o=ASN1HEX.getHexOfTLV_AtObj(q,p[1]);var r=ASN1HEX.getHexOfTLV_AtObj(q,p[2]);var s=ASN1HEX.getHexOfV_AtObj(r,0);var n=new RSAKey();n.readPrivateKeyFromASN1HexString(s);return n},parseHexOfEncryptedPKCS8:function(u){var q={};var p=ASN1HEX.getPosArrayOfChildren_AtObj(u,0);if(p.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+p.length}q.ciphertext=ASN1HEX.getHexOfV_AtObj(u,p[1]);var w=ASN1HEX.getPosArrayOfChildren_AtObj(u,p[0]);if(w.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+w.length}if(ASN1HEX.getHexOfV_AtObj(u,w[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(u,w[1]);if(w.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+n.length}var o=ASN1HEX.getPosArrayOfChildren_AtObj(u,n[1]);if(o.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+o.length}if(ASN1HEX.getHexOfV_AtObj(u,o[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}q.encryptionSchemeAlg="TripleDES";q.encryptionSchemeIV=ASN1HEX.getHexOfV_AtObj(u,o[1]);var r=ASN1HEX.getPosArrayOfChildren_AtObj(u,n[0]);if(r.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+r.length}if(ASN1HEX.getHexOfV_AtObj(u,r[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var v=ASN1HEX.getPosArrayOfChildren_AtObj(u,r[1]);if(v.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+v.length}q.pbkdf2Salt=ASN1HEX.getHexOfV_AtObj(u,v[0]);var s=ASN1HEX.getHexOfV_AtObj(u,v[1]);try{q.pbkdf2Iter=parseInt(s,16)}catch(t){throw"malformed format pbkdf2Iter: "+s}return q},getPBKDF2KeyHexFromParam:function(s,n){var r=CryptoJS.enc.Hex.parse(s.pbkdf2Salt);var o=s.pbkdf2Iter;var q=CryptoJS.PBKDF2(n,r,{keySize:192/32,iterations:o});var p=CryptoJS.enc.Hex.stringify(q);return p},getPlainPKCS8HexFromEncryptedPKCS8PEM:function(v,w){var p=this.getHexFromPEM(v,"ENCRYPTED PRIVATE KEY");var n=this.parseHexOfEncryptedPKCS8(p);var s=PKCS5PKEY.getPBKDF2KeyHexFromParam(n,w);var t={};t.ciphertext=CryptoJS.enc.Hex.parse(n.ciphertext);var r=CryptoJS.enc.Hex.parse(s);var q=CryptoJS.enc.Hex.parse(n.encryptionSchemeIV);var u=CryptoJS.TripleDES.decrypt(t,r,{iv:q});var o=CryptoJS.enc.Hex.stringify(u);return o},getRSAKeyFromEncryptedPKCS8PEM:function(q,p){var o=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q,p);var n=this.getRSAKeyFromPlainPKCS8Hex(o);return n},getKeyFromEncryptedPKCS8PEM:function(q,o){var n=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q,o);var p=this.getKeyFromPlainPrivatePKCS8Hex(n);return p},parsePlainPrivatePKCS8Hex:function(q){var o={};o.algparam=null;if(q.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(q.substr(p[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(q,p[1]);if(n.length!=2){throw"malformed PKCS8 private key(code:004)"}if(q.substr(n[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}o.algoid=ASN1HEX.getHexOfV_AtObj(q,n[0]);if(q.substr(n[1],2)=="06"){o.algparam=ASN1HEX.getHexOfV_AtObj(q,n[1])}if(q.substr(p[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}o.keyidx=ASN1HEX.getStartPosOfV_AtObj(q,p[2]);return o},getKeyFromPlainPrivatePKCS8PEM:function(o){var n=this.getHexFromPEM(o,"PRIVATE KEY");var p=this.getKeyFromPlainPrivatePKCS8Hex(n);return p},getKeyFromPlainPrivatePKCS8Hex:function(n){var p=this.parsePlainPrivatePKCS8Hex(n);if(p.algoid=="2a864886f70d010101"){this.parsePrivateRawRSAKeyHexAtObj(n,p);var o=p.key;var q=new RSAKey();q.setPrivateEx(o.n,o.e,o.d,o.p,o.q,o.dp,o.dq,o.co);return q}else{if(p.algoid=="2a8648ce3d0201"){this.parsePrivateRawECKeyHexAtObj(n,p);if(KJUR.crypto.OID.oidhex2name[p.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+p.algparam}var r=KJUR.crypto.OID.oidhex2name[p.algparam];var q=new KJUR.crypto.ECDSA({curve:r,prv:p.key});return q}else{throw"unsupported private key algorithm"}}},getRSAKeyFromPublicPKCS8PEM:function(o){var p=this.getHexFromPEM(o,"PUBLIC KEY");var n=this.getRSAKeyFromPublicPKCS8Hex(p);return n},getKeyFromPublicPKCS8PEM:function(o){var p=this.getHexFromPEM(o,"PUBLIC KEY");var n=this.getKeyFromPublicPKCS8Hex(p);return n},getKeyFromPublicPKCS8Hex:function(o){var n=this.parsePublicPKCS8Hex(o);if(n.algoid=="2a864886f70d010101"){var r=this.parsePublicRawRSAKeyHex(n.key);var p=new RSAKey();p.setPublic(r.n,r.e);return p}else{if(n.algoid=="2a8648ce3d0201"){if(KJUR.crypto.OID.oidhex2name[n.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+n.algparam}var q=KJUR.crypto.OID.oidhex2name[n.algparam];var p=new KJUR.crypto.ECDSA({curve:q,pub:n.key});return p}else{throw"unsupported public key algorithm"}}},parsePublicRawRSAKeyHex:function(p){var n={};if(p.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var o=ASN1HEX.getPosArrayOfChildren_AtObj(p,0);if(o.length!=2){throw"malformed RSA key(code:002)"}if(p.substr(o[0],2)!="02"){throw"malformed RSA key(code:003)"}n.n=ASN1HEX.getHexOfV_AtObj(p,o[0]);if(p.substr(o[1],2)!="02"){throw"malformed RSA key(code:004)"}n.e=ASN1HEX.getHexOfV_AtObj(p,o[1]);return n},parsePrivateRawRSAKeyHexAtObj:function(o,q){var p=q.keyidx;if(o.substr(p,2)!="30"){throw"malformed RSA private key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(o,p);if(n.length!=9){throw"malformed RSA private key(code:002)"}q.key={};q.key.n=ASN1HEX.getHexOfV_AtObj(o,n[1]);q.key.e=ASN1HEX.getHexOfV_AtObj(o,n[2]);q.key.d=ASN1HEX.getHexOfV_AtObj(o,n[3]);q.key.p=ASN1HEX.getHexOfV_AtObj(o,n[4]);q.key.q=ASN1HEX.getHexOfV_AtObj(o,n[5]);q.key.dp=ASN1HEX.getHexOfV_AtObj(o,n[6]);q.key.dq=ASN1HEX.getHexOfV_AtObj(o,n[7]);q.key.co=ASN1HEX.getHexOfV_AtObj(o,n[8])},parsePrivateRawECKeyHexAtObj:function(o,q){var p=q.keyidx;if(o.substr(p,2)!="30"){throw"malformed ECC private key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(o,p);if(n.length!=3){throw"malformed ECC private key(code:002)"}if(o.substr(n[1],2)!="04"){throw"malformed ECC private key(code:003)"}q.key=ASN1HEX.getHexOfV_AtObj(o,n[1])},parsePublicPKCS8Hex:function(q){var o={};o.algparam=null;var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=2){throw"outer DERSequence shall have 2 elements: "+p.length}var r=p[0];if(q.substr(r,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(q,r);if(n.length!=2){throw"malformed PKCS8 public key(code:002)"}if(q.substr(n[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}o.algoid=ASN1HEX.getHexOfV_AtObj(q,n[0]);if(q.substr(n[1],2)=="06"){o.algparam=ASN1HEX.getHexOfV_AtObj(q,n[1])}if(q.substr(p[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}o.key=ASN1HEX.getHexOfV_AtObj(q,p[1]).substr(2);return o},getRSAKeyFromPublicPKCS8Hex:function(r){var q=ASN1HEX.getPosArrayOfChildren_AtObj(r,0);if(q.length!=2){throw"outer DERSequence shall have 2 elements: "+q.length}var p=ASN1HEX.getHexOfTLV_AtObj(r,q[0]);if(p!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmId is not rsaEncryption"}if(r.substr(q[1],2)!="03"){throw"PKCS8 Public Key is not BITSTRING encapslated."}var t=ASN1HEX.getStartPosOfV_AtObj(r,q[1])+2;if(r.substr(t,2)!="30"){throw"PKCS8 Public Key is not SEQUENCE."}var n=ASN1HEX.getPosArrayOfChildren_AtObj(r,t);if(n.length!=2){throw"inner DERSequence shall have 2 elements: "+n.length}if(r.substr(n[0],2)!="02"){throw"N is not ASN.1 INTEGER"}if(r.substr(n[1],2)!="02"){throw"E is not ASN.1 INTEGER"}var u=ASN1HEX.getHexOfV_AtObj(r,n[0]);var s=ASN1HEX.getHexOfV_AtObj(r,n[1]);var o=new RSAKey();o.setPublic(u,s);return o},}}();
/*! keyutil-1.0.4.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var KEYUTIL=function(){var d=function(p,r,q){return k(CryptoJS.AES,p,r,q)};var e=function(p,r,q){return k(CryptoJS.TripleDES,p,r,q)};var a=function(p,r,q){return k(CryptoJS.DES,p,r,q)};var k=function(s,x,u,q){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(u);var p=CryptoJS.enc.Hex.parse(q);var t={};t.key=w;t.iv=p;t.ciphertext=r;var v=s.decrypt(t,w,{iv:p});return CryptoJS.enc.Hex.stringify(v)};var l=function(p,r,q){return g(CryptoJS.AES,p,r,q)};var o=function(p,r,q){return g(CryptoJS.TripleDES,p,r,q)};var f=function(p,r,q){return g(CryptoJS.DES,p,r,q)};var g=function(t,y,v,q){var s=CryptoJS.enc.Hex.parse(y);var x=CryptoJS.enc.Hex.parse(v);var p=CryptoJS.enc.Hex.parse(q);var w=t.encrypt(s,x,{iv:p});var r=CryptoJS.enc.Hex.parse(w.toString());var u=CryptoJS.enc.Base64.stringify(r);return u};var i={"AES-256-CBC":{proc:d,eproc:l,keylen:32,ivlen:16},"AES-192-CBC":{proc:d,eproc:l,keylen:24,ivlen:16},"AES-128-CBC":{proc:d,eproc:l,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:e,eproc:o,keylen:24,ivlen:8},"DES-CBC":{proc:a,eproc:f,keylen:8,ivlen:8}};var c=function(p){return i[p]["proc"]};var m=function(p){var r=CryptoJS.lib.WordArray.random(p);var q=CryptoJS.enc.Hex.stringify(r);return q};var n=function(t){var u={};if(t.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"))){u.cipher=RegExp.$1;u.ivsalt=RegExp.$2}if(t.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))){u.type=RegExp.$1}var r=-1;var v=0;if(t.indexOf("\r\n\r\n")!=-1){r=t.indexOf("\r\n\r\n");v=2}if(t.indexOf("\n\n")!=-1){r=t.indexOf("\n\n");v=1}var q=t.indexOf("-----END");if(r!=-1&&q!=-1){var p=t.substring(r+v*2,q-v);p=p.replace(/\s+/g,"");u.data=p}return u};var j=function(q,y,p){var v=p.substring(0,16);var t=CryptoJS.enc.Hex.parse(v);var r=CryptoJS.enc.Utf8.parse(y);var u=i[q]["keylen"]+i[q]["ivlen"];var x="";var w=null;for(;;){var s=CryptoJS.algo.MD5.create();if(w!=null){s.update(w)}s.update(r);s.update(t);w=s.finalize();x=x+CryptoJS.enc.Hex.stringify(w);if(x.length>=u*2){break}}var z={};z.keyhex=x.substr(0,i[q]["keylen"]*2);z.ivhex=x.substr(i[q]["keylen"]*2,i[q]["ivlen"]*2);return z};var b=function(p,v,r,w){var s=CryptoJS.enc.Base64.parse(p);var q=CryptoJS.enc.Hex.stringify(s);var u=i[v]["proc"];var t=u(q,r,w);return t};var h=function(p,s,q,u){var r=i[s]["eproc"];var t=r(p,q,u);return t};return{version:"1.0.0",getHexFromPEM:function(q,u){var r=q;if(r.indexOf("BEGIN "+u)==-1){throw"can't find PEM header: "+u}r=r.replace("-----BEGIN "+u+"-----","");r=r.replace("-----END "+u+"-----","");var t=r.replace(/\s+/g,"");var p=b64tohex(t);return p},getDecryptedKeyHexByKeyIV:function(q,t,s,r){var p=c(t);return p(q,s,r)},parsePKCS5PEM:function(p){return n(p)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(q,p,r){return j(q,p,r)},decryptKeyB64:function(p,r,q,s){return b(p,r,q,s)},getDecryptedKeyHex:function(y,x){var q=n(y);var t=q.type;var r=q.cipher;var p=q.ivsalt;var s=q.data;var w=j(r,x,p);var v=w.keyhex;var u=b(s,r,v,p);return u},getRSAKeyFromEncryptedPKCS5PEM:function(r,q){var s=this.getDecryptedKeyHex(r,q);var p=new RSAKey();p.readPrivateKeyFromASN1HexString(s);return p},getEncryptedPKCS5PEMFromPrvKeyHex:function(x,s,A,t,r){var p="";if(typeof t=="undefined"||t==null){t="AES-256-CBC"}if(typeof i[t]=="undefined"){throw"KEYUTIL unsupported algorithm: "+t}if(typeof r=="undefined"||r==null){var v=i[t]["ivlen"];var u=m(v);r=u.toUpperCase()}var z=j(t,A,r);var y=z.keyhex;var w=h(s,t,y,r);var q=w.replace(/(.{64})/g,"$1\r\n");var p="-----BEGIN "+x+" PRIVATE KEY-----\r\n";p+="Proc-Type: 4,ENCRYPTED\r\n";p+="DEK-Info: "+t+","+r+"\r\n";p+="\r\n";p+=q;p+="\r\n-----END "+x+" PRIVATE KEY-----\r\n";return p},getEncryptedPKCS5PEMFromRSAKey:function(D,E,r,t){var B=new KJUR.asn1.DERInteger({"int":0});var w=new KJUR.asn1.DERInteger({bigint:D.n});var A=new KJUR.asn1.DERInteger({"int":D.e});var C=new KJUR.asn1.DERInteger({bigint:D.d});var u=new KJUR.asn1.DERInteger({bigint:D.p});var s=new KJUR.asn1.DERInteger({bigint:D.q});var z=new KJUR.asn1.DERInteger({bigint:D.dmp1});var v=new KJUR.asn1.DERInteger({bigint:D.dmq1});var y=new KJUR.asn1.DERInteger({bigint:D.coeff});var F=new KJUR.asn1.DERSequence({array:[B,w,A,C,u,s,z,v,y]});var x=F.getEncodedHex();return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",x,E,r,t)},newEncryptedPKCS5PEM:function(p,q,t,u){if(typeof q=="undefined"||q==null){q=1024}if(typeof t=="undefined"||t==null){t="10001"}var r=new RSAKey();r.generate(q,t);var s=null;if(typeof u=="undefined"||u==null){s=this.getEncryptedPKCS5PEMFromRSAKey(r,p)}else{s=this.getEncryptedPKCS5PEMFromRSAKey(r,p,u)}return s},getRSAKeyFromPlainPKCS8PEM:function(r){if(r.match(/ENCRYPTED/)){throw"pem shall be not ENCRYPTED"}var q=this.getHexFromPEM(r,"PRIVATE KEY");var p=this.getRSAKeyFromPlainPKCS8Hex(q);return p},getRSAKeyFromPlainPKCS8Hex:function(s){var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=3){throw"outer DERSequence shall have 3 elements: "+r.length}var q=ASN1HEX.getHexOfTLV_AtObj(s,r[1]);if(q!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmIdentifier is not rsaEnc: "+q}var q=ASN1HEX.getHexOfTLV_AtObj(s,r[1]);var t=ASN1HEX.getHexOfTLV_AtObj(s,r[2]);var u=ASN1HEX.getHexOfV_AtObj(t,0);var p=new RSAKey();p.readPrivateKeyFromASN1HexString(u);return p},parseHexOfEncryptedPKCS8:function(w){var s={};var r=ASN1HEX.getPosArrayOfChildren_AtObj(w,0);if(r.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+r.length}s.ciphertext=ASN1HEX.getHexOfV_AtObj(w,r[1]);var y=ASN1HEX.getPosArrayOfChildren_AtObj(w,r[0]);if(y.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+y.length}if(ASN1HEX.getHexOfV_AtObj(w,y[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(w,y[1]);if(y.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+p.length}var q=ASN1HEX.getPosArrayOfChildren_AtObj(w,p[1]);if(q.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+q.length}if(ASN1HEX.getHexOfV_AtObj(w,q[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}s.encryptionSchemeAlg="TripleDES";s.encryptionSchemeIV=ASN1HEX.getHexOfV_AtObj(w,q[1]);var t=ASN1HEX.getPosArrayOfChildren_AtObj(w,p[0]);if(t.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+t.length}if(ASN1HEX.getHexOfV_AtObj(w,t[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var x=ASN1HEX.getPosArrayOfChildren_AtObj(w,t[1]);if(x.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+x.length}s.pbkdf2Salt=ASN1HEX.getHexOfV_AtObj(w,x[0]);var u=ASN1HEX.getHexOfV_AtObj(w,x[1]);try{s.pbkdf2Iter=parseInt(u,16)}catch(v){throw"malformed format pbkdf2Iter: "+u}return s},getPBKDF2KeyHexFromParam:function(u,p){var t=CryptoJS.enc.Hex.parse(u.pbkdf2Salt);var q=u.pbkdf2Iter;var s=CryptoJS.PBKDF2(p,t,{keySize:192/32,iterations:q});var r=CryptoJS.enc.Hex.stringify(s);return r},getPlainPKCS8HexFromEncryptedPKCS8PEM:function(x,y){var r=this.getHexFromPEM(x,"ENCRYPTED PRIVATE KEY");var p=this.parseHexOfEncryptedPKCS8(r);var u=KEYUTIL.getPBKDF2KeyHexFromParam(p,y);var v={};v.ciphertext=CryptoJS.enc.Hex.parse(p.ciphertext);var t=CryptoJS.enc.Hex.parse(u);var s=CryptoJS.enc.Hex.parse(p.encryptionSchemeIV);var w=CryptoJS.TripleDES.decrypt(v,t,{iv:s});var q=CryptoJS.enc.Hex.stringify(w);return q},getRSAKeyFromEncryptedPKCS8PEM:function(s,r){var q=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(s,r);var p=this.getRSAKeyFromPlainPKCS8Hex(q);return p},getKeyFromEncryptedPKCS8PEM:function(s,q){var p=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(s,q);var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},parsePlainPrivatePKCS8Hex:function(s){var q={};q.algparam=null;if(s.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(s.substr(r[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(s,r[1]);if(p.length!=2){throw"malformed PKCS8 private key(code:004)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}q.algoid=ASN1HEX.getHexOfV_AtObj(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=ASN1HEX.getHexOfV_AtObj(s,p[1])}if(s.substr(r[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}q.keyidx=ASN1HEX.getStartPosOfV_AtObj(s,r[2]);return q},getKeyFromPlainPrivatePKCS8PEM:function(q){var p=this.getHexFromPEM(q,"PRIVATE KEY");var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},getKeyFromPlainPrivatePKCS8Hex:function(p){var w=this.parsePlainPrivatePKCS8Hex(p);if(w.algoid=="2a864886f70d010101"){this.parsePrivateRawRSAKeyHexAtObj(p,w);var u=w.key;var z=new RSAKey();z.setPrivateEx(u.n,u.e,u.d,u.p,u.q,u.dp,u.dq,u.co);return z}else{if(w.algoid=="2a8648ce3d0201"){this.parsePrivateRawECKeyHexAtObj(p,w);if(KJUR.crypto.OID.oidhex2name[w.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+w.algparam}var v=KJUR.crypto.OID.oidhex2name[w.algparam];var z=new KJUR.crypto.ECDSA({curve:v});z.setPublicKeyHex(w.pubkey);z.setPrivateKeyHex(w.key);z.isPublic=false;return z}else{if(w.algoid=="2a8648ce380401"){var t=ASN1HEX.getVbyList(p,0,[1,1,0],"02");var s=ASN1HEX.getVbyList(p,0,[1,1,1],"02");var y=ASN1HEX.getVbyList(p,0,[1,1,2],"02");var B=ASN1HEX.getVbyList(p,0,[2,0],"02");var r=new BigInteger(t,16);var q=new BigInteger(s,16);var x=new BigInteger(y,16);var A=new BigInteger(B,16);var z=new KJUR.crypto.DSA();z.setPrivate(r,q,x,null,A);return z}else{throw"unsupported private key algorithm"}}}},getRSAKeyFromPublicPKCS8PEM:function(q){var r=this.getHexFromPEM(q,"PUBLIC KEY");var p=this.getRSAKeyFromPublicPKCS8Hex(r);return p},getKeyFromPublicPKCS8PEM:function(q){var r=this.getHexFromPEM(q,"PUBLIC KEY");var p=this.getKeyFromPublicPKCS8Hex(r);return p},getKeyFromPublicPKCS8Hex:function(q){var p=this.parsePublicPKCS8Hex(q);if(p.algoid=="2a864886f70d010101"){var u=this.parsePublicRawRSAKeyHex(p.key);var r=new RSAKey();r.setPublic(u.n,u.e);return r}else{if(p.algoid=="2a8648ce3d0201"){if(KJUR.crypto.OID.oidhex2name[p.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+p.algparam}var s=KJUR.crypto.OID.oidhex2name[p.algparam];var r=new KJUR.crypto.ECDSA({curve:s,pub:p.key});return r}else{if(p.algoid=="2a8648ce380401"){var t=p.algparam;var v=ASN1HEX.getHexOfV_AtObj(p.key,0);var r=new KJUR.crypto.DSA();r.setPublic(new BigInteger(t.p,16),new BigInteger(t.q,16),new BigInteger(t.g,16),new BigInteger(v,16));return r}else{throw"unsupported public key algorithm"}}}},parsePublicRawRSAKeyHex:function(r){var p={};if(r.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var q=ASN1HEX.getPosArrayOfChildren_AtObj(r,0);if(q.length!=2){throw"malformed RSA key(code:002)"}if(r.substr(q[0],2)!="02"){throw"malformed RSA key(code:003)"}p.n=ASN1HEX.getHexOfV_AtObj(r,q[0]);if(r.substr(q[1],2)!="02"){throw"malformed RSA key(code:004)"}p.e=ASN1HEX.getHexOfV_AtObj(r,q[1]);return p},parsePrivateRawRSAKeyHexAtObj:function(q,s){var r=s.keyidx;if(q.substr(r,2)!="30"){throw"malformed RSA private key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,r);if(p.length!=9){throw"malformed RSA private key(code:002)"}s.key={};s.key.n=ASN1HEX.getHexOfV_AtObj(q,p[1]);s.key.e=ASN1HEX.getHexOfV_AtObj(q,p[2]);s.key.d=ASN1HEX.getHexOfV_AtObj(q,p[3]);s.key.p=ASN1HEX.getHexOfV_AtObj(q,p[4]);s.key.q=ASN1HEX.getHexOfV_AtObj(q,p[5]);s.key.dp=ASN1HEX.getHexOfV_AtObj(q,p[6]);s.key.dq=ASN1HEX.getHexOfV_AtObj(q,p[7]);s.key.co=ASN1HEX.getHexOfV_AtObj(q,p[8])},parsePrivateRawECKeyHexAtObj:function(p,t){var q=t.keyidx;var r=ASN1HEX.getVbyList(p,q,[1],"04");var s=ASN1HEX.getVbyList(p,q,[2,0],"03").substr(2);t.key=r;t.pubkey=s},parsePublicPKCS8Hex:function(s){var q={};q.algparam=null;var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=2){throw"outer DERSequence shall have 2 elements: "+r.length}var t=r[0];if(s.substr(t,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(s,t);if(p.length!=2){throw"malformed PKCS8 public key(code:002)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}q.algoid=ASN1HEX.getHexOfV_AtObj(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=ASN1HEX.getHexOfV_AtObj(s,p[1])}else{if(s.substr(p[1],2)=="30"){q.algparam={};q.algparam.p=ASN1HEX.getVbyList(s,p[1],[0],"02");q.algparam.q=ASN1HEX.getVbyList(s,p[1],[1],"02");q.algparam.g=ASN1HEX.getVbyList(s,p[1],[2],"02")}}if(s.substr(r[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}q.key=ASN1HEX.getHexOfV_AtObj(s,r[1]).substr(2);return q},getRSAKeyFromPublicPKCS8Hex:function(t){var s=ASN1HEX.getPosArrayOfChildren_AtObj(t,0);if(s.length!=2){throw"outer DERSequence shall have 2 elements: "+s.length}var r=ASN1HEX.getHexOfTLV_AtObj(t,s[0]);if(r!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmId is not rsaEncryption"}if(t.substr(s[1],2)!="03"){throw"PKCS8 Public Key is not BITSTRING encapslated."}var v=ASN1HEX.getStartPosOfV_AtObj(t,s[1])+2;if(t.substr(v,2)!="30"){throw"PKCS8 Public Key is not SEQUENCE."}var p=ASN1HEX.getPosArrayOfChildren_AtObj(t,v);if(p.length!=2){throw"inner DERSequence shall have 2 elements: "+p.length}if(t.substr(p[0],2)!="02"){throw"N is not ASN.1 INTEGER"}if(t.substr(p[1],2)!="02"){throw"E is not ASN.1 INTEGER"}var w=ASN1HEX.getHexOfV_AtObj(t,p[0]);var u=ASN1HEX.getHexOfV_AtObj(t,p[1]);var q=new RSAKey();q.setPublic(w,u);return q},}}();KEYUTIL.getKey=function(c,o,i){if(typeof RSAKey!="undefined"&&c instanceof RSAKey){return c}if(typeof KJUR.crypto.ECDSA!="undefined"&&c instanceof KJUR.crypto.ECDSA){return c}if(typeof KJUR.crypto.DSA!="undefined"&&c instanceof KJUR.crypto.DSA){return c}if(c.xy!==undefined&&c.curve!==undefined){return new KJUR.crypto.ECDSA({prv:c.xy,curve:c.curve})}if(c.n!==undefined&&c.e!==undefined&&c.d!==undefined&&c.p!==undefined&&c.q!==undefined&&c.dp!==undefined&&c.dq!==undefined&&c.co!==undefined){var n=new RSAKey();n.setPrivateEx(c.n,c.e,c.d,c.p,c.q,c.dp,c.dq,c.co);return n}if(c.p!==undefined&&c.q!==undefined&&c.g!==undefined&&c.y!==undefined&&c.x!==undefined){var n=new KJUR.crypto.DSA();n.setPrivate(c.p,c.q,c.g,c.y,c.x);return n}if(c.d!==undefined&&c.curve!==undefined){return new KJUR.crypto.ECDSA({pub:c.d,curve:c.curve})}if(c.n!==undefined&&c.e){var n=new RSAKey();n.setPublic(c.n,c.e);return n}if(c.p!==undefined&&c.q!==undefined&&c.g!==undefined&&c.y!==undefined&&c.x===undefined){var n=new KJUR.crypto.DSA();n.setPublic(c.p,c.q,c.g,c.y);return n}if(c.indexOf("-END CERTIFICATE-",0)!=-1||c.indexOf("-END X509 CERTIFICATE-",0)!=-1||c.indexOf("-END TRUSTED CERTIFICATE-",0)!=-1){return X509.getPublicKeyFromCertPEM(c)}if(i==="pkcs8pub"){return KEYUTIL.getKeyFromPublicPKCS8Hex(c)}if(c.indexOf("-END PUBLIC KEY-")!=-1){return KEYUTIL.getKeyFromPublicPKCS8PEM(c)}if(i==="pkcs5prv"){var n=new RSAKey();n.readPrivateKeyFromASN1HexString(c);return n}if(i==="pkcs5prv"){var n=new RSAKey();n.readPrivateKeyFromASN1HexString(c);return n}if(c.indexOf("-END RSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")==-1){var n=new RSAKey();n.readPrivateKeyFromPEMString(c);return n}if(c.indexOf("-END DSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")==-1){var m=this.getHexFromPEM(c,"DSA PRIVATE KEY");var b=ASN1HEX.getVbyList(m,0,[1],"02");var a=ASN1HEX.getVbyList(m,0,[2],"02");var e=ASN1HEX.getVbyList(m,0,[3],"02");var k=ASN1HEX.getVbyList(m,0,[4],"02");var l=ASN1HEX.getVbyList(m,0,[5],"02");var n=new KJUR.crypto.DSA();n.setPrivate(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(e,16),new BigInteger(k,16),new BigInteger(l,16));return n}if(c.indexOf("-END PRIVATE KEY-")!=-1){return KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(c)}if(c.indexOf("-END RSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){return KEYUTIL.getRSAKeyFromEncryptedPKCS5PEM(c,o)}if(c.indexOf("-END EC PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){var m=KEYUTIL.getDecryptedKeyHex(c,o);var n=ASN1HEX.getVbyList(m,0,[1],"04");var j=ASN1HEX.getVbyList(m,0,[2,0],"06");var d=ASN1HEX.getVbyList(m,0,[3,0],"03").substr(2);var h="";if(KJUR.crypto.OID.oidhex2name[j]!==undefined){h=KJUR.crypto.OID.oidhex2name[j]}else{throw"undefined OID(hex) in KJUR.crypto.OID: "+j}var f=new KJUR.crypto.ECDSA({name:h});f.setPublicKeyHex(d);f.setPrivateKeyHex(n);f.isPublic=false;return f}if(c.indexOf("-END DSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){var m=KEYUTIL.getDecryptedKeyHex(c,o);var b=ASN1HEX.getVbyList(m,0,[1],"02");var a=ASN1HEX.getVbyList(m,0,[2],"02");var e=ASN1HEX.getVbyList(m,0,[3],"02");var k=ASN1HEX.getVbyList(m,0,[4],"02");var l=ASN1HEX.getVbyList(m,0,[5],"02");var n=new KJUR.crypto.DSA();n.setPrivate(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(e,16),new BigInteger(k,16),new BigInteger(l,16));return n}if(c.indexOf("-END ENCRYPTED PRIVATE KEY-")!=-1){return KEYUTIL.getKeyFromEncryptedPKCS8PEM(c,o)}throw"not supported argument"};KEYUTIL.generateKeypair=function(a,c){if(a=="RSA"){var b=c;var h=new RSAKey();h.generate(b,"10001");var f=new RSAKey();var e=h.n.toString(16);var i=h.e.toString(16);f.setPublic(e,i);var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{if(a=="EC"){var d=c;var g=new KJUR.crypto.ECDSA({curve:d});var j=g.generateKeyPairHex();var h=new KJUR.crypto.ECDSA({curve:d});h.setPrivateKeyHex(j.ecprvhex);var f=new KJUR.crypto.ECDSA({curve:d});f.setPublicKeyHex(j.ecpubhex);var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{throw"unknown algorithm: "+a}}};KEYUTIL.getPEM=function(a,r,o,g,j){var v=KJUR.asn1;var u=KJUR.crypto;function p(s){var w=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{"int":{bigint:s.n}},{"int":s.e},{"int":{bigint:s.d}},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.dmp1}},{"int":{bigint:s.dmq1}},{"int":{bigint:s.coeff}}]});return w}function q(w){var s=KJUR.asn1.ASN1Util.newObject({seq:[{"int":1},{octstr:{hex:w.prvKeyHex}},{tag:["a0",true,{oid:{name:w.curveName}}]},{tag:["a1",true,{bitstr:{hex:"00"+w.pubKeyHex}}]}]});return s}function n(s){var w=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.g}},{"int":{bigint:s.y}},{"int":{bigint:s.x}}]});return w}if(((typeof RSAKey!="undefined"&&a instanceof RSAKey)||(typeof u.DSA!="undefined"&&a instanceof u.DSA)||(typeof u.ECDSA!="undefined"&&a instanceof u.ECDSA))&&a.isPublic==true&&(r===undefined||r=="PKCS8PUB")){var t=new KJUR.asn1.x509.SubjectPublicKeyInfo(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"PUBLIC KEY")}if(r=="PKCS1PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&(o===undefined||o==null)&&a.isPrivate==true){var t=p(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"RSA PRIVATE KEY")}if(r=="PKCS1PRV"&&typeof RSAKey!="undefined"&&a instanceof KJUR.crypto.ECDSA&&(o===undefined||o==null)&&a.isPrivate==true){var f=new KJUR.asn1.DERObjectIdentifier({name:a.curveName});var l=f.getEncodedHex();var e=q(a);var k=e.getEncodedHex();var i="";i+=v.ASN1Util.getPEMStringFromHex(l,"EC PARAMETERS");i+=v.ASN1Util.getPEMStringFromHex(k,"EC PRIVATE KEY");return i}if(r=="PKCS1PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&(o===undefined||o==null)&&a.isPrivate==true){var t=n(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"DSA PRIVATE KEY")}if(r=="PKCS5PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=p(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",m,o,g)}if(r=="PKCS5PRV"&&typeof KJUR.crypto.ECDSA!="undefined"&&a instanceof KJUR.crypto.ECDSA&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=q(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("EC",m,o,g)}if(r=="PKCS5PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=n(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA",m,o,g)}var h=function(w,s){var y=b(w,s);var x=new KJUR.asn1.ASN1Util.newObject({seq:[{seq:[{oid:{name:"pkcs5PBES2"}},{seq:[{seq:[{oid:{name:"pkcs5PBKDF2"}},{seq:[{octstr:{hex:y.pbkdf2Salt}},{"int":y.pbkdf2Iter}]}]},{seq:[{oid:{name:"des-EDE3-CBC"}},{octstr:{hex:y.encryptionSchemeIV}}]}]}]},{octstr:{hex:y.ciphertext}}]});return x.getEncodedHex()};var b=function(D,E){var x=100;var C=CryptoJS.lib.WordArray.random(8);var B="DES-EDE3-CBC";var s=CryptoJS.lib.WordArray.random(8);var y=CryptoJS.PBKDF2(E,C,{keySize:192/32,iterations:x});var z=CryptoJS.enc.Hex.parse(D);var A=CryptoJS.TripleDES.encrypt(z,y,{iv:s})+"";var w={};w.ciphertext=A;w.pbkdf2Salt=CryptoJS.enc.Hex.stringify(C);w.pbkdf2Iter=x;w.encryptionSchemeAlg=B;w.encryptionSchemeIV=CryptoJS.enc.Hex.stringify(s);return w};if(r=="PKCS8PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&a.isPrivate==true){var d=p(a);var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"rsaEncryption"}},{"null":true}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}if(r=="PKCS8PRV"&&typeof KJUR.crypto.ECDSA!="undefined"&&a instanceof KJUR.crypto.ECDSA&&a.isPrivate==true){var d=new KJUR.asn1.ASN1Util.newObject({seq:[{"int":1},{octstr:{hex:a.prvKeyHex}},{tag:["a1",true,{bitstr:{hex:"00"+a.pubKeyHex}}]}]});var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"ecPublicKey"}},{oid:{name:a.curveName}}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}if(r=="PKCS8PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&a.isPrivate==true){var d=new KJUR.asn1.DERInteger({bigint:a.x});var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"dsa"}},{seq:[{"int":{bigint:a.p}},{"int":{bigint:a.q}},{"int":{bigint:a.g}}]}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}throw"unsupported object nor format"};
/*! rsapem-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function _rsapem_pemToBase64(b){var a=b;a=a.replace("-----BEGIN RSA PRIVATE KEY-----","");a=a.replace("-----END RSA PRIVATE KEY-----","");a=a.replace(/[ \n]+/g,"");return a}function _rsapem_getPosArrayOfChildrenFromHex(d){var j=new Array();var k=ASN1HEX.getStartPosOfV_AtObj(d,0);var f=ASN1HEX.getPosOfNextSibling_AtObj(d,k);var h=ASN1HEX.getPosOfNextSibling_AtObj(d,f);var b=ASN1HEX.getPosOfNextSibling_AtObj(d,h);var l=ASN1HEX.getPosOfNextSibling_AtObj(d,b);var e=ASN1HEX.getPosOfNextSibling_AtObj(d,l);var g=ASN1HEX.getPosOfNextSibling_AtObj(d,e);var c=ASN1HEX.getPosOfNextSibling_AtObj(d,g);var i=ASN1HEX.getPosOfNextSibling_AtObj(d,c);j.push(k,f,h,b,l,e,g,c,i);return j}function _rsapem_getHexValueArrayOfChildrenFromHex(i){var o=_rsapem_getPosArrayOfChildrenFromHex(i);var r=ASN1HEX.getHexOfV_AtObj(i,o[0]);var f=ASN1HEX.getHexOfV_AtObj(i,o[1]);var j=ASN1HEX.getHexOfV_AtObj(i,o[2]);var k=ASN1HEX.getHexOfV_AtObj(i,o[3]);var c=ASN1HEX.getHexOfV_AtObj(i,o[4]);var b=ASN1HEX.getHexOfV_AtObj(i,o[5]);var h=ASN1HEX.getHexOfV_AtObj(i,o[6]);var g=ASN1HEX.getHexOfV_AtObj(i,o[7]);var l=ASN1HEX.getHexOfV_AtObj(i,o[8]);var m=new Array();m.push(r,f,j,k,c,b,h,g,l);return m}function _rsapem_readPrivateKeyFromASN1HexString(c){var b=_rsapem_getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])}function _rsapem_readPrivateKeyFromPEMString(e){var c=_rsapem_pemToBase64(e);var d=b64tohex(c);var b=_rsapem_getHexValueArrayOfChildrenFromHex(d);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])}RSAKey.prototype.readPrivateKeyFromPEMString=_rsapem_readPrivateKeyFromPEMString;RSAKey.prototype.readPrivateKeyFromASN1HexString=_rsapem_readPrivateKeyFromASN1HexString;
/*! rsasign-1.2.7.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var _RE_HEXDECONLY=new RegExp("");_RE_HEXDECONLY.compile("[^0-9a-f]","gi");function _rsasign_getHexPaddedDigestInfoForString(d,e,a){var b=function(f){return KJUR.crypto.Util.hashString(f,a)};var c=b(d);return KJUR.crypto.Util.getPaddedDigestInfoHex(c,a,e)}function _zeroPaddingOfSignature(e,d){var c="";var a=d/4-e.length;for(var b=0;b<a;b++){c=c+"0"}return c+e}function _rsasign_signString(d,a){var b=function(e){return KJUR.crypto.Util.hashString(e,a)};var c=b(d);return this.signWithMessageHash(c,a)}function _rsasign_signWithMessageHash(e,c){var f=KJUR.crypto.Util.getPaddedDigestInfoHex(e,c,this.n.bitLength());var b=parseBigInt(f,16);var d=this.doPrivate(b);var a=d.toString(16);return _zeroPaddingOfSignature(a,this.n.bitLength())}function _rsasign_signStringWithSHA1(a){return _rsasign_signString.call(this,a,"sha1")}function _rsasign_signStringWithSHA256(a){return _rsasign_signString.call(this,a,"sha256")}function pss_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=hextorstr(e(rstrtohex(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]))));d+=1}return b}function _rsasign_signStringPSS(e,a,d){var c=function(f){return KJUR.crypto.Util.hashHex(f,a)};var b=c(rstrtohex(e));if(d===undefined){d=-1}return this.signWithMessageHashPSS(b,a,d)}function _rsasign_signWithMessageHashPSS(l,a,k){var b=hextorstr(l);var g=b.length;var m=this.n.bitLength()-1;var c=Math.ceil(m/8);var d;var o=function(i){return KJUR.crypto.Util.hashHex(i,a)};if(k===-1||k===undefined){k=g}else{if(k===-2){k=c-g-2}else{if(k<-2){throw"invalid salt length"}}}if(c<(g+k+2)){throw"data too long"}var f="";if(k>0){f=new Array(k);new SecureRandom().nextBytes(f);f=String.fromCharCode.apply(String,f)}var n=hextorstr(o(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+b+f)));var j=[];for(d=0;d<c-k-g-2;d+=1){j[d]=0}var e=String.fromCharCode.apply(String,j)+"\x01"+f;var h=pss_mgf1_str(n,e.length,o);var q=[];for(d=0;d<e.length;d+=1){q[d]=e.charCodeAt(d)^h.charCodeAt(d)}var p=(65280>>(8*c-m))&255;q[0]&=~p;for(d=0;d<g;d++){q.push(n.charCodeAt(d))}q.push(188);return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(q)).toString(16),this.n.bitLength())}function _rsasign_getDecryptSignatureBI(a,d,c){var b=new RSAKey();b.setPublic(d,c);var e=b.doPublic(a);return e}function _rsasign_getHexDigestInfoFromSig(a,c,b){var e=_rsasign_getDecryptSignatureBI(a,c,b);var d=e.toString(16).replace(/^1f+00/,"");return d}function _rsasign_getAlgNameAndHashFromHexDisgestInfo(f){for(var e in KJUR.crypto.Util.DIGESTINFOHEAD){var d=KJUR.crypto.Util.DIGESTINFOHEAD[e];var b=d.length;if(f.substring(0,b)==d){var c=[e,f.substring(b)];return c}}return[]}function _rsasign_verifySignatureWithArgs(f,b,g,j){var e=_rsasign_getHexDigestInfoFromSig(b,g,j);var h=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(h.length==0){return false}var d=h[0];var i=h[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(i==c)}function _rsasign_verifyHexSignatureForMessage(c,b){var d=parseBigInt(c,16);var a=_rsasign_verifySignatureWithArgs(b,d,this.n.toString(16),this.e.toString(16));return a}function _rsasign_verifyString(f,j){j=j.replace(_RE_HEXDECONLY,"");j=j.replace(/[ \n]+/g,"");var b=parseBigInt(j,16);if(b.bitLength()>this.n.bitLength()){return 0}var i=this.doPublic(b);var e=i.toString(16).replace(/^1f+00/,"");var g=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(g.length==0){return false}var d=g[0];var h=g[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(h==c)}function _rsasign_verifyWithMessageHash(e,a){a=a.replace(_RE_HEXDECONLY,"");a=a.replace(/[ \n]+/g,"");var b=parseBigInt(a,16);if(b.bitLength()>this.n.bitLength()){return 0}var h=this.doPublic(b);var g=h.toString(16).replace(/^1f+00/,"");var c=_rsasign_getAlgNameAndHashFromHexDisgestInfo(g);if(c.length==0){return false}var d=c[0];var f=c[1];return(f==e)}function _rsasign_verifyStringPSS(c,b,a,f){var e=function(g){return KJUR.crypto.Util.hashHex(g,a)};var d=e(rstrtohex(c));if(f===undefined){f=-1}return this.verifyWithMessageHashPSS(d,b,a,f)}function _rsasign_verifyWithMessageHashPSS(f,s,l,c){var k=new BigInteger(s,16);if(k.bitLength()>this.n.bitLength()){return false}var r=function(i){return KJUR.crypto.Util.hashHex(i,l)};var j=hextorstr(f);var h=j.length;var g=this.n.bitLength()-1;var m=Math.ceil(g/8);var q;if(c===-1||c===undefined){c=h}else{if(c===-2){c=m-h-2}else{if(c<-2){throw"invalid salt length"}}}if(m<(h+c+2)){throw"data too long"}var a=this.doPublic(k).toByteArray();for(q=0;q<a.length;q+=1){a[q]&=255}while(a.length<m){a.unshift(0)}if(a[m-1]!==188){throw"encoded message does not end in 0xbc"}a=String.fromCharCode.apply(String,a);var d=a.substr(0,m-h-1);var e=a.substr(d.length,h);var p=(65280>>(8*m-g))&255;if((d.charCodeAt(0)&p)!==0){throw"bits beyond keysize not zero"}var n=pss_mgf1_str(e,d.length,r);var o=[];for(q=0;q<d.length;q+=1){o[q]=d.charCodeAt(q)^n.charCodeAt(q)}o[0]&=~p;var b=m-h-c-2;for(q=0;q<b;q+=1){if(o[q]!==0){throw"leftmost octets not zero"}}if(o[b]!==1){throw"0x01 marker not found"}return e===hextorstr(r(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+j+String.fromCharCode.apply(String,o.slice(-c)))))}RSAKey.prototype.signWithMessageHash=_rsasign_signWithMessageHash;RSAKey.prototype.signString=_rsasign_signString;RSAKey.prototype.signStringWithSHA1=_rsasign_signStringWithSHA1;RSAKey.prototype.signStringWithSHA256=_rsasign_signStringWithSHA256;RSAKey.prototype.sign=_rsasign_signString;RSAKey.prototype.signWithSHA1=_rsasign_signStringWithSHA1;RSAKey.prototype.signWithSHA256=_rsasign_signStringWithSHA256;RSAKey.prototype.signWithMessageHashPSS=_rsasign_signWithMessageHashPSS;RSAKey.prototype.signStringPSS=_rsasign_signStringPSS;RSAKey.prototype.signPSS=_rsasign_signStringPSS;RSAKey.SALT_LEN_HLEN=-1;RSAKey.SALT_LEN_MAX=-2;RSAKey.prototype.verifyWithMessageHash=_rsasign_verifyWithMessageHash;RSAKey.prototype.verifyString=_rsasign_verifyString;RSAKey.prototype.verifyHexSignatureForMessage=_rsasign_verifyHexSignatureForMessage;RSAKey.prototype.verify=_rsasign_verifyString;RSAKey.prototype.verifyHexSignatureForByteArrayMessage=_rsasign_verifyHexSignatureForMessage;RSAKey.prototype.verifyWithMessageHashPSS=_rsasign_verifyWithMessageHashPSS;RSAKey.prototype.verifyStringPSS=_rsasign_verifyStringPSS;RSAKey.prototype.verifyPSS=_rsasign_verifyStringPSS;RSAKey.SALT_LEN_RECOVER=-2;
/*! x509-1.1.2.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function X509(){this.subjectPublicKeyRSA=null;this.subjectPublicKeyRSA_hN=null;this.subjectPublicKeyRSA_hE=null;this.hex=null;this.getSerialNumberHex=function(){return ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,1])};this.getIssuerHex=function(){return ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,3])};this.getIssuerString=function(){return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,3]))};this.getSubjectHex=function(){return ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,5])};this.getSubjectString=function(){return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,5]))};this.getNotBefore=function(){var a=ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,4,0]);a=a.replace(/(..)/g,"%$1");a=decodeURIComponent(a);return a};this.getNotAfter=function(){var a=ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,4,1]);a=a.replace(/(..)/g,"%$1");a=decodeURIComponent(a);return a};this.readCertPEM=function(c){var e=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(e);var d=new RSAKey();d.setPublic(b[0],b[1]);this.subjectPublicKeyRSA=d;this.subjectPublicKeyRSA_hN=b[0];this.subjectPublicKeyRSA_hE=b[1];this.hex=e};this.readCertPEMWithoutRSAInit=function(c){var d=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(d);this.subjectPublicKeyRSA.setPublic(b[0],b[1]);this.subjectPublicKeyRSA_hN=b[0];this.subjectPublicKeyRSA_hE=b[1];this.hex=d}}X509.pemToBase64=function(a){var b=a;b=b.replace("-----BEGIN CERTIFICATE-----","");b=b.replace("-----END CERTIFICATE-----","");b=b.replace(/[ \n]+/g,"");return b};X509.pemToHex=function(a){var c=X509.pemToBase64(a);var b=b64tohex(c);return b};X509.getSubjectPublicKeyPosFromCertHex=function(f){var e=X509.getSubjectPublicKeyInfoPosFromCertHex(f);if(e==-1){return -1}var b=ASN1HEX.getPosArrayOfChildren_AtObj(f,e);if(b.length!=2){return -1}var d=b[1];if(f.substring(d,d+2)!="03"){return -1}var c=ASN1HEX.getStartPosOfV_AtObj(f,d);if(f.substring(c,c+2)!="00"){return -1}return c+2};X509.getSubjectPublicKeyInfoPosFromCertHex=function(d){var c=ASN1HEX.getStartPosOfV_AtObj(d,0);var b=ASN1HEX.getPosArrayOfChildren_AtObj(d,c);if(b.length<1){return -1}if(d.substring(b[0],b[0]+10)=="a003020102"){if(b.length<6){return -1}return b[6]}else{if(b.length<5){return -1}return b[5]}};X509.getPublicKeyHexArrayFromCertHex=function(f){var e=X509.getSubjectPublicKeyPosFromCertHex(f);var b=ASN1HEX.getPosArrayOfChildren_AtObj(f,e);if(b.length!=2){return[]}var d=ASN1HEX.getHexOfV_AtObj(f,b[0]);var c=ASN1HEX.getHexOfV_AtObj(f,b[1]);if(d!=null&&c!=null){return[d,c]}else{return[]}};X509.getHexTbsCertificateFromCert=function(b){var a=ASN1HEX.getStartPosOfV_AtObj(b,0);return a};X509.getPublicKeyHexArrayFromCertPEM=function(c){var d=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(d);return b};X509.hex2dn=function(e){var f="";var c=ASN1HEX.getPosArrayOfChildren_AtObj(e,0);for(var d=0;d<c.length;d++){var b=ASN1HEX.getHexOfTLV_AtObj(e,c[d]);f=f+"/"+X509.hex2rdn(b)}return f};X509.hex2rdn=function(a){var f=ASN1HEX.getDecendantHexTLVByNthList(a,0,[0,0]);var e=ASN1HEX.getDecendantHexVByNthList(a,0,[0,1]);var c="";try{c=X509.DN_ATTRHEX[f]}catch(b){c=f}e=e.replace(/(..)/g,"%$1");var d=decodeURIComponent(e);return c+"="+d};X509.DN_ATTRHEX={"0603550406":"C","060355040a":"O","060355040b":"OU","0603550403":"CN","0603550405":"SN","0603550408":"ST","0603550407":"L",};X509.getPublicKeyFromCertPEM=function(f){var c=X509.getPublicKeyInfoPropOfCertPEM(f);if(c.algoid=="2a864886f70d010101"){var i=KEYUTIL.parsePublicRawRSAKeyHex(c.keyhex);var j=new RSAKey();j.setPublic(i.n,i.e);return j}else{if(c.algoid=="2a8648ce3d0201"){var e=KJUR.crypto.OID.oidhex2name[c.algparam];var j=new KJUR.crypto.ECDSA({curve:e,info:c.keyhex});j.setPublicKeyHex(c.keyhex);return j}else{if(c.algoid=="2a8648ce380401"){var b=ASN1HEX.getVbyList(c.algparam,0,[0],"02");var a=ASN1HEX.getVbyList(c.algparam,0,[1],"02");var d=ASN1HEX.getVbyList(c.algparam,0,[2],"02");var h=ASN1HEX.getHexOfV_AtObj(c.keyhex,0);h=h.substr(2);var j=new KJUR.crypto.DSA();j.setPublic(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(d,16),new BigInteger(h,16));return j}else{throw"unsupported key"}}}};X509.getPublicKeyInfoPropOfCertPEM=function(e){var c={};c.algparam=null;var g=X509.pemToHex(e);var d=ASN1HEX.getPosArrayOfChildren_AtObj(g,0);if(d.length!=3){throw"malformed X.509 certificate PEM (code:001)"}if(g.substr(d[0],2)!="30"){throw"malformed X.509 certificate PEM (code:002)"}var b=ASN1HEX.getPosArrayOfChildren_AtObj(g,d[0]);if(b.length<7){throw"malformed X.509 certificate PEM (code:003)"}var h=ASN1HEX.getPosArrayOfChildren_AtObj(g,b[6]);if(h.length!=2){throw"malformed X.509 certificate PEM (code:004)"}var f=ASN1HEX.getPosArrayOfChildren_AtObj(g,h[0]);if(f.length!=2){throw"malformed X.509 certificate PEM (code:005)"}c.algoid=ASN1HEX.getHexOfV_AtObj(g,f[0]);if(g.substr(f[1],2)=="06"){c.algparam=ASN1HEX.getHexOfV_AtObj(g,f[1])}else{if(g.substr(f[1],2)=="30"){c.algparam=ASN1HEX.getHexOfTLV_AtObj(g,f[1])}}if(g.substr(h[1],2)!="03"){throw"malformed X.509 certificate PEM (code:006)"}var a=ASN1HEX.getHexOfV_AtObj(g,h[1]);c.keyhex=a.substr(2);return c};/*! Mike Samuel (c) 2009 | code.google.com/p/json-sans-eval
 */
var jsonParse=(function(){var e="(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)";var j='(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';var i='(?:"'+j+'*")';var d=new RegExp("(?:false|true|null|[\\{\\}\\[\\]]|"+e+"|"+i+")","g");var k=new RegExp("\\\\(?:([^u])|u(.{4}))","g");var g={'"':'"',"/":"/","\\":"\\",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"};function h(l,m,n){return m?g[m]:String.fromCharCode(parseInt(n,16))}var c=new String("");var a="\\";var f={"{":Object,"[":Array};var b=Object.hasOwnProperty;return function(u,q){var p=u.match(d);var x;var v=p[0];var l=false;if("{"===v){x={}}else{if("["===v){x=[]}else{x=[];l=true}}var t;var r=[x];for(var o=1-l,m=p.length;o<m;++o){v=p[o];var w;switch(v.charCodeAt(0)){default:w=r[0];w[t||w.length]=+(v);t=void 0;break;case 34:v=v.substring(1,v.length-1);if(v.indexOf(a)!==-1){v=v.replace(k,h)}w=r[0];if(!t){if(w instanceof Array){t=w.length}else{t=v||c;break}}w[t]=v;t=void 0;break;case 91:w=r[0];r.unshift(w[t||w.length]=[]);t=void 0;break;case 93:r.shift();break;case 102:w=r[0];w[t||w.length]=false;t=void 0;break;case 110:w=r[0];w[t||w.length]=null;t=void 0;break;case 116:w=r[0];w[t||w.length]=true;t=void 0;break;case 123:w=r[0];r.unshift(w[t||w.length]={});t=void 0;break;case 125:r.shift();break}}if(l){if(r.length!==1){throw new Error()}x=x[0]}else{if(r.length){throw new Error()}}if(q){var s=function(C,B){var D=C[B];if(D&&typeof D==="object"){var n=null;for(var z in D){if(b.call(D,z)&&D!==C){var y=s(D,z);if(y!==void 0){D[z]=y}else{if(!n){n=[]}n.push(z)}}}if(n){for(var A=n.length;--A>=0;){delete D[n[A]]}}}return q.call(C,B,D)};x=s({"":x},"")}return x}})();/*! jws-3.0.2 (c) 2013 Kenji Urushima | kjur.github.com/jsjws/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={}}KJUR.jws.JWS=function(){this.parseJWS=function(n,p){if((this.parsedJWS!==undefined)&&(p||(this.parsedJWS.sigvalH!==undefined))){return}if(n.match(/^([^.]+)\.([^.]+)\.([^.]+)$/)==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}var q=RegExp.$1;var l=RegExp.$2;var r=RegExp.$3;var t=q+"."+l;this.parsedJWS={};this.parsedJWS.headB64U=q;this.parsedJWS.payloadB64U=l;this.parsedJWS.sigvalB64U=r;this.parsedJWS.si=t;if(!p){var o=b64utohex(r);var m=parseBigInt(o,16);this.parsedJWS.sigvalH=o;this.parsedJWS.sigvalBI=m}var k=b64utoutf8(q);var s=b64utoutf8(l);this.parsedJWS.headS=k;this.parsedJWS.payloadS=s;if(!this.isSafeJSONString(k,this.parsedJWS,"headP")){throw"malformed JSON string for JWS Head: "+k}};function b(l,k){return utf8tob64u(l)+"."+utf8tob64u(k)}function f(m,l){var k=function(n){return KJUR.crypto.Util.hashString(n,l)};if(k==null){throw"hash function not defined in jsrsasign: "+l}return k(m)}function h(q,n,k,o,m){var p=b(q,n);var l=parseBigInt(k,16);return _rsasign_verifySignatureWithArgs(p,l,o,m)}this.verifyJWSByNE=function(m,l,k){this.parseJWS(m);return _rsasign_verifySignatureWithArgs(this.parsedJWS.si,this.parsedJWS.sigvalBI,l,k)};this.verifyJWSByKey=function(n,m){this.parseJWS(n);var k=c(this.parsedJWS.headP);var l=this.parsedJWS.headP.alg.substr(0,2)=="PS";if(m.hashAndVerify){return m.hashAndVerify(k,new Buffer(this.parsedJWS.si,"utf8").toString("base64"),b64utob64(this.parsedJWS.sigvalB64U),"base64",l)}else{if(l){return m.verifyStringPSS(this.parsedJWS.si,this.parsedJWS.sigvalH,k)}else{return m.verifyString(this.parsedJWS.si,this.parsedJWS.sigvalH)}}};this.verifyJWSByPemX509Cert=function(m,k){this.parseJWS(m);var l=new X509();l.readCertPEM(k);return l.subjectPublicKeyRSA.verifyString(this.parsedJWS.si,this.parsedJWS.sigvalH)};function c(l){var m=l.alg;var k="";if(m!="RS256"&&m!="RS512"&&m!="PS256"&&m!="PS512"){throw"JWS signature algorithm not supported: "+m}if(m.substr(2)=="256"){k="sha256"}if(m.substr(2)=="512"){k="sha512"}return k}function e(k){return c(jsonParse(k))}function j(k,p,s,m,q,r){var n=new RSAKey();n.setPrivate(m,q,r);var l=e(k);var o=n.signString(s,l);return o}function i(q,p,o,n,m){var k=null;if(typeof m=="undefined"){k=e(q)}else{k=c(m)}var l=m.alg.substr(0,2)=="PS";if(n.hashAndSign){return b64tob64u(n.hashAndSign(k,o,"binary","base64",l))}else{if(l){return hextob64u(n.signStringPSS(o,k))}else{return hextob64u(n.signString(o,k))}}}function g(p,m,o,l,n){var k=b(p,m);return j(p,m,k,o,l,n)}this.generateJWSByNED=function(r,n,q,m,p){if(!this.isSafeJSONString(r)){throw"JWS Head is not safe JSON string: "+r}var l=b(r,n);var o=j(r,n,l,q,m,p);var k=hextob64u(o);this.parsedJWS={};this.parsedJWS.headB64U=l.split(".")[0];this.parsedJWS.payloadB64U=l.split(".")[1];this.parsedJWS.sigvalB64U=k;return l+"."+k};this.generateJWSByKey=function(p,n,k){var o={};if(!this.isSafeJSONString(p,o,"headP")){throw"JWS Head is not safe JSON string: "+p}var m=b(p,n);var l=i(p,n,m,k,o.headP);this.parsedJWS={};this.parsedJWS.headB64U=m.split(".")[0];this.parsedJWS.payloadB64U=m.split(".")[1];this.parsedJWS.sigvalB64U=l;return m+"."+l};function d(q,p,o,l){var n=new RSAKey();n.readPrivateKeyFromPEMString(l);var k=e(q);var m=n.signString(o,k);return m}this.generateJWSByP1PrvKey=function(p,n,k){if(!this.isSafeJSONString(p)){throw"JWS Head is not safe JSON string: "+p}var m=b(p,n);var o=d(p,n,m,k);var l=hextob64u(o);this.parsedJWS={};this.parsedJWS.headB64U=m.split(".")[0];this.parsedJWS.payloadB64U=m.split(".")[1];this.parsedJWS.sigvalB64U=l;return m+"."+l}};KJUR.jws.JWS.sign=function(b,p,i,l,k){var j=KJUR.jws.JWS;if(!j.isSafeJSONString(p)){throw"JWS Head is not safe JSON string: "+sHead}var e=j.readSafeJSONString(p);if((b==""||b==null)&&e.alg!==undefined){b=e.alg}if((b!=""&&b!=null)&&e.alg===undefined){e.alg=b;p=JSON.stringify(e)}var d=null;if(j.jwsalg2sigalg[b]===undefined){throw"unsupported alg name: "+b}else{d=j.jwsalg2sigalg[b]}var c=utf8tob64u(p);var g=utf8tob64u(i);var n=c+"."+g;var m="";if(d.substr(0,4)=="Hmac"){if(l===undefined){throw"hexadecimal key shall be specified for HMAC"}var h=new KJUR.crypto.Mac({alg:d,pass:hextorstr(l)});h.updateString(n);m=h.doFinal()}else{if(d.indexOf("withECDSA")!=-1){var o=new KJUR.crypto.Signature({alg:d});o.init(l,k);o.updateString(n);hASN1Sig=o.sign();m=KJUR.crypto.ECDSA.asn1SigToConcatSig(hASN1Sig)}else{if(d!="none"){var o=new KJUR.crypto.Signature({alg:d});o.init(l,k);o.updateString(n);m=o.sign()}}}var f=hextob64u(m);return n+"."+f};KJUR.jws.JWS.verify=function(d,m){var k=KJUR.jws.JWS;var l=d.split(".");var c=l[0];var h=l[1];var o=c+"."+h;var n=b64utohex(l[2]);var f=k.readSafeJSONString(b64utoutf8(l[0]));var b=null;if(f.alg===undefined){throw"algorithm not specified in header"}else{b=f.alg}var e=null;if(k.jwsalg2sigalg[f.alg]===undefined){throw"unsupported alg name: "+b}else{e=k.jwsalg2sigalg[b]}if(e=="none"){return true}else{if(e.substr(0,4)=="Hmac"){if(m===undefined){throw"hexadecimal key shall be specified for HMAC"}var j=new KJUR.crypto.Mac({alg:e,pass:hextorstr(m)});j.updateString(o);hSig2=j.doFinal();return n==hSig2}else{if(e.indexOf("withECDSA")!=-1){var g=null;try{g=KJUR.crypto.ECDSA.concatSigToASN1Sig(n)}catch(i){return false}var p=new KJUR.crypto.Signature({alg:e});p.init(m);p.updateString(o);return p.verify(g)}else{var p=new KJUR.crypto.Signature({alg:e});p.init(m);p.updateString(o);return p.verify(n)}}}};KJUR.jws.JWS.jwsalg2sigalg={HS256:"HmacSHA256",HS512:"HmacSHA512",RS256:"SHA256withRSA",RS384:"SHA384withRSA",RS512:"SHA512withRSA",ES256:"SHA256withECDSA",ES384:"SHA384withECDSA",PS256:"SHA256withRSAandMGF1",PS384:"SHA384withRSAandMGF1",PS512:"SHA512withRSAandMGF1",none:"none",};KJUR.jws.JWS.isSafeJSONString=function(d,c,e){var f=null;try{f=jsonParse(d);if(typeof f!="object"){return 0}if(f.constructor===Array){return 0}if(c){c[e]=f}return 1}catch(b){return 0}};KJUR.jws.JWS.readSafeJSONString=function(c){var d=null;try{d=jsonParse(c);if(typeof d!="object"){return null}if(d.constructor===Array){return null}return d}catch(b){return null}};KJUR.jws.JWS.getEncodedSignatureValueFromJWS=function(b){if(b.match(/^[^.]+\.[^.]+\.([^.]+)$/)==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}return RegExp.$1};KJUR.jws.IntDate=function(){};KJUR.jws.IntDate.get=function(b){if(b=="now"){return KJUR.jws.IntDate.getNow()}else{if(b=="now + 1hour"){return KJUR.jws.IntDate.getNow()+60*60}else{if(b=="now + 1day"){return KJUR.jws.IntDate.getNow()+60*60*24}else{if(b=="now + 1month"){return KJUR.jws.IntDate.getNow()+60*60*24*30}else{if(b=="now + 1year"){return KJUR.jws.IntDate.getNow()+60*60*24*365}else{if(b.match(/Z$/)){return KJUR.jws.IntDate.getZulu(b)}else{if(b.match(/^[0-9]+$/)){return parseInt(b)}}}}}}}throw"unsupported format: "+b};KJUR.jws.IntDate.getZulu=function(h){if(a=h.match(/(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)Z/)){var g=parseInt(RegExp.$1);var i=parseInt(RegExp.$2)-1;var c=parseInt(RegExp.$3);var b=parseInt(RegExp.$4);var e=parseInt(RegExp.$5);var f=parseInt(RegExp.$6);var j=new Date(Date.UTC(g,i,c,b,e,f));return ~~(j/1000)}throw"unsupported format: "+h};KJUR.jws.IntDate.getNow=function(){var b=~~(new Date()/1000);return b};KJUR.jws.IntDate.intDate2UTCString=function(b){var c=new Date(b*1000);return c.toUTCString()};KJUR.jws.IntDate.intDate2Zulu=function(f){var j=new Date(f*1000);var i=("0000"+j.getUTCFullYear()).slice(-4);var h=("00"+(j.getUTCMonth()+1)).slice(-2);var c=("00"+j.getUTCDate()).slice(-2);var b=("00"+j.getUTCHours()).slice(-2);var e=("00"+j.getUTCMinutes()).slice(-2);var g=("00"+j.getUTCSeconds()).slice(-2);return i+h+c+b+e+g+"Z"};/*! jwsjs-2.0.0 (c) 2013 Kenji Urushima | kjur.github.com/jsjws/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={}}KJUR.jws.JWSJS=function(){this.aHeader=[];this.sPayload="";this.aSignature=[];this.init=function(){this.aHeader=[];this.sPayload="";this.aSignature=[]};this.initWithJWS=function(b){this.init();var a=new KJUR.jws.JWS();a.parseJWS(b);this.aHeader.push(a.parsedJWS.headB64U);this.sPayload=a.parsedJWS.payloadB64U;this.aSignature.push(a.parsedJWS.sigvalB64U)};this.addSignatureByHeaderKey=function(d,a){var c=b64utoutf8(this.sPayload);var b=new KJUR.jws.JWS();var e=b.generateJWSByP1PrvKey(d,c,a);this.aHeader.push(b.parsedJWS.headB64U);this.aSignature.push(b.parsedJWS.sigvalB64U)};this.addSignatureByHeaderPayloadKey=function(d,c,a){var b=new KJUR.jws.JWS();var e=b.generateJWSByP1PrvKey(d,c,a);this.aHeader.push(b.parsedJWS.headB64U);this.sPayload=b.parsedJWS.payloadB64U;this.aSignature.push(b.parsedJWS.sigvalB64U)};this.verifyWithCerts=function(b){if(this.aHeader.length!=b.length){throw"num headers does not match with num certs"}if(this.aSignature.length!=b.length){throw"num signatures does not match with num certs"}var j=this.sPayload;var f="";for(var c=0;c<b.length;c++){var d=b[c];var e=this.aHeader[c];var l=this.aSignature[c];var a=e+"."+j+"."+l;var h=new KJUR.jws.JWS();try{var k=h.verifyJWSByPemX509Cert(a,d);if(k!=1){f+=(c+1)+"th signature unmatch. "}}catch(g){f+=(c+1)+"th signature fail("+g+"). "}}if(f==""){return 1}else{throw f}};this.readJWSJS=function(a){var c=new KJUR.jws.JWS();var b=c.readSafeJSONString(a);if(b==null){throw"argument is not JSON string: "+a}this.aHeader=b.headers;this.sPayload=b.payload;this.aSignature=b.signatures};this.getJSON=function(){return{headers:this.aHeader,payload:this.sPayload,signatures:this.aSignature}};this.isEmpty=function(){if(this.aHeader.length==0){return 1}return 0}};
exports.BigInteger = BigInteger;
exports.RSAKey = RSAKey;
exports.ECDSA = KJUR.crypto.ECDSA;
exports.DSA = KJUR.crypto.DSA;
exports.Signature = KJUR.crypto.Signature;
exports.MessageDigest = KJUR.crypto.MessageDigest;
exports.Mac = KJUR.crypto.Mac;
exports.KEYUTIL = KEYUTIL;
exports.ASN1HEX = ASN1HEX;

// ext/base64.js
exports.b64tohex = b64tohex;
exports.b64tohex = b64toBA;

// base64x.js
exports.stoBA = stoBA;
exports.stoBA = BAtos;
exports.stoBA = BAtohex;
exports.stohex = stohex;
exports.stob64 = stob64;
exports.stob64u = stob64u;
exports.b64utos = b64utos;
exports.b64tob64u = b64tob64u;
exports.b64utob64 = b64utob64;
exports.hextob64u = hextob64u;
exports.b64utohex = b64utohex;
exports.b64tohex = b64tohex;
exports.utf8tob64u = utf8tob64u;
exports.b64utoutf8 = b64utoutf8;
exports.utf8tob64 = utf8tob64;
exports.b64toutf8 = b64toutf8;
exports.utf8tohex = utf8tohex;
exports.hextoutf8 = hextoutf8;
exports.hextorstr = hextorstr;
exports.rstrtohex = rstrtohex;
exports.newline_toUnix = newline_toUnix;
exports.newline_toDos = newline_toDos;

exports.crypto = KJUR.crypto;
exports.asn1 = KJUR.asn1;
exports.jws = KJUR.jws;

}).call(this,require("buffer").Buffer)
},{"buffer":7}],169:[function(require,module,exports){
/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint browser: true*/
'use strict';

var jsrsasign = require('jsrsasign');
var jsjws = jsrsasign.jws;
var utils = require('./utils');

// Fix it?
jsjws.JWS.prototype.isSafeJSONString = jsjws.JWS.isSafeJSONString;

var shims = {};

shims.sign = function() {
    throw new Error('JWS signing not supported in browser');
};

shims.verify = function(signature, secretOrKey) {
    var jwk = utils.jwkForSignature(signature, secretOrKey);

    if (!jwk) {
        // Make PEMs still work
        jwk.pem = secretOrKey;
        jwk.kty = 'PEM';
    }

    switch (jwk.kty) {
        case 'PEM':
            return (new jsjws.JWS()).verifyJWSByKey(signature, jwk.pem);
        case 'RSA':
            var hN = jsrsasign.b64utohex(jwk.n);
            var hE = jsrsasign.b64utohex(jwk.e);
            return (new jsjws.JWS()).verifyJWSByNE(signature, hN, hE);
        default:
            throw new utils.KeyTypeError();
    }
};

module.exports = shims;

},{"./utils":171,"jsrsasign":168}],170:[function(require,module,exports){
/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var jws = require('jws');
var objectAssign = require('object-assign');
var shims = require('./shims.js');

objectAssign(module.exports, jws, shims);

// Globally replace jws module with myself, to make magic possible
module.exports.shim = function() {
    return objectAssign(jws, shims);
};

},{"./shims.js":169,"jws":172,"object-assign":175}],171:[function(require,module,exports){
/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var jws = require('jws');

var utils = {};

// Decide if an object is a JWK
utils.isJWK = function isJWK(key) {
    return !!(key && key.kty);
};
// Decide if an object is a set of JWKs
utils.isJWKset = function isJWKset(set) {
    var keys = set && set.keys;

    return keys && (typeof keys.some === 'function') && keys.some(utils.isJWK);
};

// Pick a JWK from a JWK set by its Key ID
utils.findJWK = function findJWK(kid, jwks) {
    var res;

    jwks.keys.every(function(jwk) {
        if (utils.isJWK(jwk) && (jwk.kid === kid)) {
            res = jwk;
            return false;
        }
        return true;
    });

    if (!res) {
        throw new Error('Provided JWKs did not contain the JWK for this JWS');
    }

    return res;
};

utils.jwkForSignature = function jwkForSignature(signature, secretOrKey) {
    var jwk;

    if (utils.isJWKset(secretOrKey)) {
        var kid = jws.decode(signature).header.kid;

        jwk = utils.findJWK(kid, secretOrKey);
    } else if (utils.isJWK(secretOrKey)) {
        jwk = secretOrKey;
    }

    return jwk;
};

utils.KeyTypeError = function KeyTypeError(kty) {
    this.name = 'JSONWebKeyTypeError';
    this.message = 'Unsupported JWK Key Type' + (kty && (': ' + kty) || '');
};
utils.KeyTypeError.prototype = TypeError.prototype;

module.exports = utils;

},{"jws":172}],172:[function(require,module,exports){
(function (process){
/*global process, exports*/
const Buffer = require('buffer').Buffer;
const Stream = require('stream');
const util = require('util');
const base64url = require('base64url');
const jwa = require('jwa');

const ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
];

function toString(obj) {
  if (typeof obj === 'string')
    return obj;
  if (typeof obj === 'number' || Buffer.isBuffer(obj))
    return obj.toString();
  return JSON.stringify(obj);
}

function jwsSecuredInput(header, payload) {
  const encodedHeader = base64url(toString(header));
  const encodedPayload = base64url(toString(payload));
  return util.format('%s.%s', encodedHeader, encodedPayload);
}

function jwsSign(opts) {
  const header = opts.header;
  const payload = opts.payload;
  const secretOrKey = opts.secret || opts.privateKey;
  const algo = jwa(header.alg);
  const securedInput = jwsSecuredInput(header, payload);
  const signature = algo.sign(securedInput, secretOrKey);
  return util.format('%s.%s', securedInput, signature);
}

function isObject(thing) {
  return Object.prototype.toString.call(thing) === '[object Object]';
}

function safeJsonParse(thing) {
  if (isObject(thing))
    return thing;
  try { return JSON.parse(thing) }
  catch (e) { return undefined }
}

function headerFromJWS(jwsSig) {
  const encodedHeader = jwsSig.split('.', 1)[0];
  return safeJsonParse(base64url.decode(encodedHeader));
}

function securedInputFromJWS(jwsSig) {
  return jwsSig.split('.', 2).join('.');
}

function algoFromJWS(jwsSig) {
  var err;
  const header = headerFromJWS(jwsSig);
  if (typeof header != 'object') {
    err = new Error("Invalid token: no header in signature '" + jwsSig + "'");
    err.code = "MISSING_HEADER";
    err.signature = jwsSig;
    throw err;
  }
  if (!header.alg) {
    err = new Error("Missing `alg` field in header for signature '"+ jwsSig +"'");
    err.code = "MISSING_ALGORITHM";
    err.header = header;
    err.signature = jwsSig;
    throw err;
  }
  return header.alg;
}

function signatureFromJWS(jwsSig) {
  return jwsSig.split('.')[2];
}

function payloadFromJWS(jwsSig) {
  const payload = jwsSig.split('.')[1];
  return base64url.decode(payload);
}

const JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
function isValidJws(string) {
  if (!JWS_REGEX.test(string))
    return false;
  if (!headerFromJWS(string))
    return false;
  return true;
}

function jwsVerify(jwsSig, secretOrKey) {
  jwsSig = toString(jwsSig);
  const signature = signatureFromJWS(jwsSig);
  const securedInput = securedInputFromJWS(jwsSig);
  const algo = jwa(algoFromJWS(jwsSig));
  return algo.verify(securedInput, signature, secretOrKey);
}

function jwsDecode(jwsSig, opts) {
  opts = opts || {};
  jwsSig = toString(jwsSig);
  if (!isValidJws(jwsSig))
    return null;
  const header = headerFromJWS(jwsSig);
  if (!header)
    return null;
  var payload = payloadFromJWS(jwsSig);
  if (header.typ === 'JWT' || opts.json)
    payload = JSON.parse(payload);
  return {
    header: header,
    payload: payload,
    signature: signatureFromJWS(jwsSig),
  };
}

function SignStream(opts) {
  const secret = opts.secret||opts.privateKey||opts.key;
  const secretStream = new DataStream(secret);
  this.readable = true;
  this.header = opts.header;
  this.secret = this.privateKey = this.key = secretStream;
  this.payload = new DataStream(opts.payload);
  this.secret.once('close', function () {
    if (!this.payload.writable && this.readable)
      this.sign();
  }.bind(this));

  this.payload.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.sign();
  }.bind(this));
}
util.inherits(SignStream, Stream);
SignStream.prototype.sign = function sign() {
  const signature = jwsSign({
    header: this.header,
    payload: this.payload.buffer,
    secret: this.secret.buffer,
  });
  this.emit('done', signature);
  this.emit('data', signature);
  this.emit('end');
  this.readable = false;
  return signature;
};

function VerifyStream(opts) {
  opts = opts || {};
  const secretOrKey = opts.secret||opts.publicKey||opts.key;
  const secretStream = new DataStream(secretOrKey);
  this.readable = true;
  this.secret = this.publicKey = this.key = secretStream;
  this.signature = new DataStream(opts.signature);
  this.secret.once('close', function () {
    if (!this.signature.writable && this.readable)
      this.verify();
  }.bind(this));

  this.signature.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.verify();
  }.bind(this));
}
util.inherits(VerifyStream, Stream);
VerifyStream.prototype.verify = function verify() {
  const valid = jwsVerify(this.signature.buffer, this.key.buffer);
  const obj = jwsDecode(this.signature.buffer);
  this.emit('done', valid, obj);
  this.emit('data', valid);
  this.emit('end');
  this.readable = false;
  return valid;
};

function DataStream(data) {
  this.buffer = Buffer(data||0);
  this.writable = true;
  this.readable = true;
  if (!data)
    return this;
  if (typeof data.pipe === 'function')
    data.pipe(this);
  else if (data.length) {
    this.writable = false;
    process.nextTick(function () {
      this.buffer = data;
      this.emit('end', data);
      this.readable = false;
      this.emit('close');
    }.bind(this));
  }
}
util.inherits(DataStream, Stream);

DataStream.prototype.write = function write(data) {
  this.buffer = Buffer.concat([this.buffer, Buffer(data)]);
  this.emit('data', data);
};

DataStream.prototype.end = function end(data) {
  if (data)
    this.write(data);
  this.emit('end', data);
  this.emit('close');
  this.writable = false;
  this.readable = false;
};

exports.ALGORITHMS = ALGORITHMS;
exports.sign = jwsSign;
exports.verify = jwsVerify;
exports.decode = jwsDecode;
exports.isValid = isValidJws;
exports.createSign = function createSign(opts) {
  return new SignStream(opts);
};
exports.createVerify = function createVerify(opts) {
  return new VerifyStream(opts);
};

}).call(this,require('_process'))
},{"_process":149,"base64url":173,"buffer":7,"jwa":174,"stream":161,"util":164}],173:[function(require,module,exports){
(function (Buffer){
function fromBase64(base64string) {
  return (
    base64string
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}

function toBase64(base64UrlString) {
  if (Buffer.isBuffer(base64UrlString))
    base64UrlString = base64UrlString.toString()

  const b64str = padString(base64UrlString)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  return b64str;
}

function padString(string) {
  const segmentLength = 4;
  const stringLength = string.length;
  const diff = string.length % segmentLength;
  if (!diff)
    return string;
  var position = stringLength;
  var padLength = segmentLength - diff;
  const paddedStringLength = stringLength + padLength;
  const buffer = Buffer(paddedStringLength);
  buffer.write(string);
  while (padLength--)
    buffer.write('=', position++);
  return buffer.toString();
}

function decodeBase64Url(base64UrlString, encoding) {
  return Buffer(toBase64(base64UrlString), 'base64').toString(encoding);
}

function base64url(stringOrBuffer) {
  return fromBase64(Buffer(stringOrBuffer).toString('base64'));
}

function toBuffer(base64string) {
  return Buffer(toBase64(base64string), 'base64');
}

base64url.toBase64 = toBase64;
base64url.fromBase64 = fromBase64;
base64url.decode = decodeBase64Url;
base64url.toBuffer = toBuffer;

module.exports = base64url;

}).call(this,require("buffer").Buffer)
},{"buffer":7}],174:[function(require,module,exports){
(function (Buffer){
const base64url = require('base64url');
const crypto = require('crypto');
const util = require('util');

const MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512" and "none".'
const MSG_INVALID_SECRET = 'secret must be a string or buffer';
const MSG_INVALID_KEY = 'key must be a string or buffer';

function typeError(template) {
  const args = [].slice.call(arguments, 1);
  const errMsg = util.format.bind(util, template).apply(null, args);
  return new TypeError(errMsg);
}

function bufferOrString(obj) {
  return Buffer.isBuffer(obj) || typeof obj === 'string';
}

function normalizeInput(thing) {
  if (!bufferOrString(thing))
    thing = JSON.stringify(thing);
  return thing;
}

function createHmacSigner(bits) {
  return function sign(thing, secret) {
    if (!bufferOrString(secret))
      throw typeError(MSG_INVALID_SECRET);
    thing = normalizeInput(thing);
    const hmac = crypto.createHmac('SHA' + bits, secret);
    const sig = (hmac.update(thing), hmac.digest('base64'))
    return base64url.fromBase64(sig);
  }
}

function createHmacVerifier(bits) {
  return function verify(thing, signature, secret) {
    const computedSig = createHmacSigner(bits)(thing, secret);
    return signature === computedSig;
  }
}

function createKeySigner(bits) {
  return function sign(thing, privateKey) {
    if (!bufferOrString(privateKey))
      throw typeError(MSG_INVALID_KEY);
    thing = normalizeInput(thing);
    const signer = crypto.createSign('RSA-SHA' + bits);
    const sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
    return base64url.fromBase64(sig);
  }
}

function createKeyVerifier(bits) {
  return function verify(thing, signature, publicKey) {
    if (!bufferOrString(publicKey))
      throw typeError(MSG_INVALID_KEY);
    thing = normalizeInput(thing);
    signature = base64url.toBase64(signature);
    const verifier = crypto.createVerify('RSA-SHA' + bits);
    verifier.update(thing);
    return verifier.verify(publicKey, signature, 'base64');
  }
}

function createNoneSigner() {
  return function sign() {
    return '';
  }
}

function createNoneVerifier() {
  return function verify(thing, signature) {
    return signature === '';
  }
}

module.exports = function jwa(algorithm) {
  const signerFactories = {
    hs: createHmacSigner,
    rs: createKeySigner,
    es: createKeySigner,
    none: createNoneSigner,
  }
  const verifierFactories = {
    hs: createHmacVerifier,
    rs: createKeyVerifier,
    es: createKeyVerifier,
    none: createNoneVerifier,
  }
  const match = algorithm.match(/(RS|ES|HS|none)(256|384|512)?/i);
  if (!match)
    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
  const algo = match[1].toLowerCase();
  const bits = match[2];

  return {
    sign: signerFactories[algo](bits),
    verify: verifierFactories[algo](bits),
  }
};
}).call(this,require("buffer").Buffer)
},{"base64url":173,"buffer":7,"crypto":14,"util":164}],175:[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var pendingException;
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			try {
				to[keys[i]] = from[keys[i]];
			} catch (err) {
				if (pendingException === undefined) {
					pendingException = err;
				}
			}
		}
	}

	if (pendingException) {
		throw pendingException;
	}

	return to;
};

},{}],176:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":177,"reduce":178}],177:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],178:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],179:[function(require,module,exports){
/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint browser: true*/
'use strict';

// TODO: URIjs is:ta big, find smaller alternative
var URI = require('URIjs');
var objectAssign = require('object-assign');
var core = require('./core.js');

var browser = {};

browser.init = core.init;

function popUpRedirect(authFun, opts) {
    return function(domain, options, callback) {
        var params = objectAssign({display: 'popup'}, opts, options);
        var win = window.open('', '_blank', 'width=500,height=400');

        // TODO: Do this differently
        window._oadaIdClientPopUpFunction = core.handleRedirect;

        authFun(domain, params, function redirect(err, uri) {
            if (err) { return win.close(); } // TODO: Do something with err?

            win.location.assign(uri);
        }, callback);
    };
}

browser.getIDToken =
    popUpRedirect(core.getIDToken, {'response_type': 'id_token'});

browser.getAccessToken =
    popUpRedirect(core.getAccessToken, {'response_type': 'token'});

browser.handleRedirect = function() {
    var uri = new URI(window.location);
    var params = uri.query(uri.fragment()).query(true);

    window.opener._oadaIdClientPopUpFunction(params);
    window.close();
};

module.exports = browser;

},{"./core.js":180,"URIjs":3,"object-assign":175}],180:[function(require,module,exports){
/* Copyright 2014 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var request = require('superagent');
// TODO: URIjs is big, find smaller alternative
var URI = require('URIjs');
var objectAssign = require('object-assign');
var jwt = require('jsonwebtoken');
// Make jws better
require('jws-jwk').shim();
var crypto = require('crypto');

var core = {};

var options = {};
var stuff = {};

core.init = function(opts) {
    objectAssign(options, opts);
};

function storeState(stateObj, callback) {
    // Make sure neither or both state storing functions are overridden
    if (core.retrieveState != retrieveState) {
        callback('Overrode retrieveState but not storeState!');
    }

    // Cryptographically secure random bytes
    var stateTok = crypto.randomBytes(16);

    // Make it base64URL
    stateTok = stateTok.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    // Rembmer stuff
    stuff[stateTok] = stateObj;

    return callback(null, stateTok);
}

function retrieveState(stateTok, callback) {
    // Make sure neither or both state storing functions are overridden
    if (core.storeState != storeState) {
        callback('Overrode storeState but not retrieveState!');
    }

    // Retrie stored state
    var stateObj = stuff[stateTok];

    // Only use each state once
    delete stuff[stateTok];

    return callback(null, stateObj);
}

// These can be replaced with to change how state is stored
// TODO: Should these be exposed somehow for browser and/or middleware?
core.storeState = storeState;
core.retrieveState = retrieveState;

function authorize(domain, configuration, parameters, redirect, callback) {
    var params = objectAssign({}, options, parameters);
    var key = params.privateKey;

    // Assume key is PEM ecnoded
    if (key) { key.kty = key.kty || 'PEM'; }
    delete params.privateKey;

    // Should I be passing the error to both?
    var errCallback = combineCallbacks(redirect, callback);

    var req =
        request.get('https://' + domain + '/.well-known/' + configuration);
    if (req.buffer) { req.buffer(); }
    req.end(function(err, resp) {
        var e = err || resp.error;
        if (e) { return errCallback(e); }

        try {
            var conf = JSON.parse(resp.text);
            // Stuff to remember for when redirect is received
            var stateObj = {
                key: key,
                domain: domain,
                conf: conf,
                callback: callback,
                options: params,
            };

            core.storeState(stateObj, function(err, stateTok) {
                // Construct authorization redirect
                var uri = new URI(conf['authorization_endpoint']);
                uri.addQuery({state: stateTok}).addQuery(params);
                // Do not send client_secret here
                uri.removeQuery('client_secret');

                // Redirect the user to constructed uri
                return redirect(err, uri && uri.toString());
            });
        } catch (err) {
            return errCallback(err);
        }
    });
}

core.getIDToken = function getIDToken(domain, opts, redirect, cb) {
    var configuration = 'openid-configuration';
    var params = objectAssign({scope: ''}, opts);

    // Make sure we have openid scope
    if (params.scope.split(' ').indexOf('openid') === -1) {
        params.scope += ' openid';
    }

    // Add nonce
    params.nonce = crypto.randomBytes(12)
        .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

    authorize(domain, configuration, params, redirect, cb);
};

core.getAccessToken = function getAccessToken(domain, opts, redirect, cb) {
    var configuration = 'oada-configuration';
    var params = objectAssign({scope: ''}, opts);

    authorize(domain, configuration, params, redirect, cb);
};

function combineCallbacks() {
    var callbacks = arguments;

    return function callback(err, result) {
        for (var i = 0; i < callbacks.length; i++) {
            if (typeof callbacks[i] === 'function') {
                callbacks[i](err, result);
            }
        }
    };
}

// TODO: Check issuer
function verifyIDToken(state, parameters, callback) {
    if (!parameters || !parameters['id_token']) {
        return callback(null, parameters);
    }

    var req = request.get(state.conf['jwks_uri']);
    if (req.buffer) { req.buffer(); }
    req.end(function(err, resp) {
        var e = err || resp.error;
        if (e) { return callback(e, parameters); }

        try {
            var jwks;
            try {
                jwks = JSON.parse(resp.text);
            } catch (err) {
                // Give a better error than what JSON.parse throws
                throw new Error('Could not parse JWKs URI as JSON');
            }

            jwt.verify(parameters['id_token'], jwks, function(err, token) {
                if (!err) {
                    // Check nonce
                    if (state.options.nonce === token.nonce) {
                        parameters['id_token'] = token;
                    } else {
                        err = new Error('Nonces did not match');
                    }
                }

                return callback(err, parameters);
            });
        } catch (err) {
            return callback(err, parameters);
        }
    });
}

function generateClientSecret(key, issuer, audience, accessCode) {
    var sec = {
        ac: accessCode,
    };
    var options = {
        algorithm: 'RS256',
        audience: audience,
        issuer: issuer,
    };

    return jwt.sign(sec, key, options);
}

function exchangeCode(state, parameters, callback) {
    if (!parameters['code']) {
        return verifyIDToken(state, parameters, callback);
    }

    // Use the provided client_secret, else generate one as per OADA
    var secret = state.options['client_secret'] ||
        generateClientSecret(
            state.key,
            state.options['client_id'],
            state.conf['token_endpoint'],
            parameters.code);

    var params = {
        'grant_type': 'authorization_code',
        'redirect_uri': state.options['redirect_uri'],
        'client_secret': secret,
        'client_id': state.options['client_id'],
        'code': parameters.code,
    };

    console.log(params);

    request.post(state.conf['token_endpoint'])
        .type('form')
        .send(params)
        .end(function(err, resp) {
            var e = err || resp.error;
            if (e) { return callback(e); }

            var token;
            try {
                token = JSON.parse(resp.text);
            } catch (err) {
                return callback(err);
            }

            verifyIDToken(state, token, callback);
        });
}

// TODO: Should I be able to register callbacks in two places?
core.handleRedirect = function handleRedirect(parameters, callback) {
    var stateTok = parameters.state;

    core.retrieveState(stateTok, function(err, stateObj) {
        var cb = combineCallbacks(stateObj && stateObj.callback, callback);

        if (stateObj) {
            exchangeCode(stateObj, parameters, cb);
        } else {
            cb('Spurrious redirect received', parameters);
        }
    });
};

module.exports = core;

},{"URIjs":3,"crypto":14,"jsonwebtoken":167,"jws-jwk":170,"object-assign":175,"superagent":176}]},{},[179])(179)
});