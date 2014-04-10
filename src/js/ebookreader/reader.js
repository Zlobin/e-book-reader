/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(win, undef) {
  'use strict';

  var EBR = win.EBookReader,
      JEZ = win.JEZ,
      parameters = win.EBRParams,
      ebr_reader,
      ebr_screen_mode,
      ebr_screen_mode_single,
      ebr_screen_mode_dual;

  /**
   * Reader Base.
   *
   * @class
   * @constructor
   * @version 0.1.0
   **/
  EBR.Reader = function() {
    var opts = parameters.options;

    this.setSettings_()
        .parseURLHash_()
        .setLocale_();

    if (opts.enable_DNS_prefetch && opts.CDN_host !== '') {
      this.setupDNSPrefetch_();
    }
  };

  ebr_reader = EBR.Reader.prototype;

  /**
   * Set default settings.
   *
   * @private
   * @method setSettings_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.setSettings_ = function() {
    var opts = parameters.options;

    parameters.params = {
      'storage_hash': (opts.book_ID >> 0) + '_',
      'set_screen_mode': opts.default_screen_mode,
      'enable_chapters': opts.enable_chapters,
      'enable_sidebar': opts.enable_sidebar,
      'enable_search': opts.enable_search,
      'enable_print': opts.enable_print,
      'print_popup': false,
      'current_page': opts.start_page,
      'enable_fullscreen': false,
      'enable_thumbnails': false,
      'enable_invert': false,
      'search_string': '',
      'page_height': null,
      'page_width': null,
      'current_angle': 0,
      'current_zoom': 1,
      'number_pages': null,
      'current_screen_mode': null,
      'loaded_images': {
        'img': [],
        'page': []
      }
    };

    return this;
  };

  /**
   * Set locale.
   *
   * @private
   * @method setLocale_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.setLocale_ = function() {
    JEZ.dom('html')
        .find()
        .set('lang', parameters.options.locale);

    return this;
  };

  /**
   * Parse URL Hash.
   *
   * @private
   * @method parseURLHash_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.parseURLHash_ = function() {
    var win_hash = win.location.hash,
        param_value,
        url_params,
        param_name,
        params = parameters.params,
        counter,
        hash,
        i;

    if (win_hash !== '') {
      url_params = win_hash.split('/');
      for (i = 1, counter = url_params.length; i < counter; i += 2) {
        param_name = url_params[i];
        param_value = url_params[i + 1];

        if (param_value !== undef) {
          switch (param_name) {
            case 'page':
              parameters.params.current_page = param_value >> 0;
              break;
            case 'mode':
              parameters.params.set_screen_mode = param_value.toString();
              break;
            case 'print':
              parameters.params.enable_print = !!(param_value >> 0);
              break;
            case 'print_popup':
              parameters.params.print_popup = !!(param_value >> 0);
              break;
            case 'thumbnails':
              parameters.params.enable_thumbnails = !!(param_value >> 0);
              break;
            case 'fullscreen':
              parameters.params.enable_fullscreen = !!(param_value >> 0);
              break;
            case 'search':
              parameters.params.enable_search = !!(param_value >> 0);
              break;
            case 'invert':
              parameters.params.enable_invert = !!(param_value >> 0);
              break;
            case 'chapters':
              parameters.params.enable_chapters = !!(param_value >> 0);
              break;
            case 'sidebar':
              parameters.params.enable_sidebar = !!(param_value >> 0);
              break;
            case 'angle':
              parameters.params.current_angle = param_value >> 0;
              break;
            case 'zoom':
              parameters.params.current_zoom = parseFloat(param_value.toString().replace(/\_/g, '.'));
              break;
            case 'search_string':
              parameters.params.search_string = param_value;
              break;
          }
        }
      }
    } else {
      hash = [
        '#!',
        'page',
          params.current_page >> 0,
        'mode',
          params.set_screen_mode,
        'print',
          params.enable_print >> 0,
        'print_popup',
          params.print_popup >> 0,
        'thumbnails',
          params.enable_thumbnails >> 0,
        'fullscreen',
          params.enable_fullscreen >> 0,
        'sidebar',
          params.enable_sidebar >> 0,
        'chapters',
          params.enable_chapters >> 0,
        'search',
          params.enable_search >> 0,
        'invert',
          params.enable_invert >> 0,
        'angle',
          params.current_angle >> 0,
        'zoom',
          params.current_zoom.toString().replace(/\./g, '_'),
        'search_string',
          params.search_string
      ];
      this.updateURLHash(hash);
    }

    parameters.params.number_pages = parameters.options.images[params.set_screen_mode].length;

    return this;
  };

  /**
   * Update URL Hash.
   *
   * @method updateURLHash
   * @version 0.1.0   
   * @param {Array} params
   * @param {String} type
   * @returns {Object}
   */
  ebr_reader.updateURLHash = function(params, type) {
    var win_hash = win.location.hash,
        new_hash,
        reg_exp,
        consts = parameters.consts;

    type = type || consts.TYPE_FULLREPLACE;

    if (type === consts.TYPE_FULLREPLACE) {
      win.location.hash = params.join('/');
    } else if (type === consts.TYPE_PARTLYREPLACE) {
      reg_exp = new RegExp('\/' + params.name + '\/\\w+\/', 'i');

      if (win_hash !== '') {
        new_hash = win_hash.replace(reg_exp, '/' + params.name + '/' + params.value + '/');
        if (new_hash !== win_hash) {
          win.location.hash = new_hash;
        }
      }
    }

    return this;
  };

  /**
   * Setup DNS prefetch.
   * Reduce DNS lookup time by pre-resolving at the browser.
   * 
   * DNS resolution time varies from <1ms for locally cached results,
   * to hundreds of milliseconds due to the cascading nature of DNS.
   * This can contribute significantly towards total page load time.
   * This filter reduces DNS lookup time by providing hints to the browser at
   * the beginning of the HTML, which allows the browser to pre-resolve DNS for resources on the page.
   *
   * @private
   * @method setupDNSPrefetch_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.setupDNSPrefetch_ = function() {
    // <meta http-equiv="x-dns-prefetch-control" content="on">
    // <link rel="dns-prefetch" href="//<HOST>">
    var meta = JEZ.dom('meta').create({
          'httpEquiv': 'x-dns-prefetch-control',
          'content': 'on'
        }),
        link = JEZ.dom('link').create({
          'rel': 'dns-prefetch',
          'href': '//' + parameters.options.CDN_host
        }),
        head = JEZ.dom('head').find();

    head.append(link)
        .append(meta);

    return this;
  };

  /**
   * Go to first page.
   *
   * @method firstPage
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.firstPage = function() {
    this.gotoPage(1);
    return this;
  };

  /**
   * Enable or disable invert.
   *
   * @method invert
   * @version 0.1.0
   * @param {String} status
   */
  ebr_reader.invert = JEZ.noop; // enabled || disabled

  /**
   * Go to last page.
   *
   * @method lastPage
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.lastPage = function() {
    this.gotoPage(parameters.params.number_pages);
    return this;
  };

  /**
   * Go to next page.
   *
   * @method nextPage
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.nextPage = function() {
    this.gotoPage(parameters.params.current_page + 1);
    return this;
  };

  /**
   * Go to previous page.
   *
   * @method previousPage
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_reader.previousPage = function() {
    this.gotoPage(parameters.params.current_page - 1);
    return this;
  };

  /**
   * Go to page.
   *
   * @method gotoPage
   * @version 0.1.0
   * @param {Number} page_num
   * @returns {Object}
   */
  ebr_reader.gotoPage = JEZ.noop;

  // _ Screen Mode _____________________________________________________________

  /**
   * Screen Mode Interface.
   *
   * @interface
   * @version 0.1.0
   **/
  EBR.Reader.ScreenMode = JEZ.noop;

  ebr_screen_mode = EBR.Reader.ScreenMode.prototype;

  /**
   * Zoom page.
   *
   * @method zoom
   * @version 0.1.0
   * @param {String} type
   */
  ebr_screen_mode.zoom = JEZ.noop; // in || out

  /**
   * Turn page.
   *
   * @method turn
   * @version 0.1.0
   * @param {String} type
   */
  ebr_screen_mode.turn = JEZ.noop; // left || right

  /**
   * Load page.
   *
   * @method loadPage
   * @version 0.1.0
   */
  ebr_screen_mode.loadPage = JEZ.noop;

  // _ Single Screen Mode ______________________________________________________

  /**
   * Single Screen Mode.
   *
   * @abstract
   * @class
   * @version 0.1.0
   * @implements EBookReader.Reader.ScreenMode
   **/
  EBR.Reader.ScreenMode.Single = JEZ.noop;

  JEZ.inherits(EBR.Reader.ScreenMode.Single, EBR.Reader.ScreenMode);
  ebr_screen_mode_single = EBR.Reader.ScreenMode.Single.prototype;

  /**
   * Show or hide Table of Content.
   *
   * @method TOC
   * @version 0.1.0
   * @param {String} status
   */
  ebr_screen_mode_single.thumbnails = JEZ.noop; // enabled || disabled

  /**
   * Show or hide Table of Content.
   *
   * @method updateScrollByPage
   * @version 0.1.0
   * @param {Object} container
   * @param {Number} page
   */
  ebr_screen_mode_single.updateScrollByPage = JEZ.noop;

  // _ Dual Screen Mode ________________________________________________________

  /**
   * Dual Screen Mode.
   *
   * @abstract
   * @class
   * @version 0.1.0
   * @implements EBookReader.Reader.ScreenMode
   **/
  EBR.Reader.ScreenMode.Dual = JEZ.noop;

  JEZ.inherits(EBR.Reader.ScreenMode.Dual, EBR.Reader.ScreenMode);
  ebr_screen_mode_dual = EBR.Reader.ScreenMode.Dual.prototype;

  /**
   * Leaf on the left.
   *
   * @method leafLeft
   * @version 0.1.0
   */
  ebr_screen_mode_dual.leafLeft = JEZ.noop;

  /**
   * Leaf on the right.
   *
   * @method leafRight
   * @version 0.1.0
   */
  ebr_screen_mode_dual.leafRight = JEZ.noop;
}(this));
