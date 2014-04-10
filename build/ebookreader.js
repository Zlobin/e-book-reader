/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(win, undef) {
  'use strict';

  var JEZ = win.JEZ,
      ImageLoader;

  // Asynchronous loading of images
  ImageLoader = function(img_src, onComplete, onError, onProgress) {
    // Available: ready, progress, stopped, error, done, destroyed
    this.status = 'ready';
    this.loader = undef;

    onComplete = onComplete || JEZ.noop;
    onError = onError || JEZ.noop;
    onProgress = onProgress || JEZ.noop;

    var onCompleteLoad = (function(event) {
          this.status = 'done';
          onComplete(event);
        }.bind(this)),
        onErrorLoad = (function(event) {
          this.status = 'error';
          onError(event);
        }.bind(this)),
        onProgressLoad = (function(event) {
          onProgress(event);
        }.bind(this));

    /*
     * May be used for loading images from own domain or subdomain.
     * Or if need to load images from another domain, you should use CORS (cross-domain request).
     * @link http://www.html5rocks.com/en/tutorials/file/xhr2/#toc-cors
     */
    this.XHRLoader = function() {
      var xhr = JEZ.getXHR();

      JEZ.dom(xhr)
        .on('load', function() {
          if (this.status !== 200 || this.readyState !== 4) {
            onErrorLoad(this);
            return;
          }

          onCompleteLoad(this);
        })
        // For instance, you can use it for a progress bar.
        .on('progress', function(event) {
          if (event.lengthComputable) {
            onProgressLoad(Math.round((event.loaded / event.total) * 100));
          }
        });

      xhr.open('GET', img_src, true);
      xhr.responseType = 'blob';
      xhr.timeout = 50000;

      return {
        'start': function() {
          xhr.send();
          win.setTimeout(function () {
            if (xhr.readyState === 3) {
              xhr.abort();
            }
          }, xhr.timeout);
        },
        'stop': function() {
          xhr.abort();
        },
        'destroy': function() {
          xhr.abort();
        }
      };
    };

    this.DOMLoader = function() {
      var $img = JEZ.dom(JEZ.dom('img').create());

      return {
        'start': function() {
          var errorSetted = false,
              onErrorImg = function(event) {
                if (!errorSetted) {
                  errorSetted = true;
                  onErrorLoad(event);
                }
              };

          $img
            .on('load', function(event) {
              var el = event.target;

              win.URL.revokeObjectURL(img_src);
              if ((el.naturalWidth === undef || el.naturalWidth === 0) || !el.complete) {
                onErrorImg(event);
              } else {
                onCompleteLoad(event);
              }
            }, this)
            .on('error', function(event) {
              onErrorImg(event);
            }, this)
            .set('src', img_src);
        },
        'stop': function() {
          $img.set('src', '');
        },
        'destroy': function() {
          $img.set('src', '');
        }
      };
    };

    if (!JEZ.support_xhr || !JEZ.isCurrentHost(img_src)) {
      this.loader = new this.DOMLoader();
    } else {
      this.loader = new this.XHRLoader();
    }

    return {
      'start': (function() {
        this.loader.start();
        this.status = 'progress';

        return this;
      }.bind(this)),
      'stop': (function() {
        this.loader.stop();
        this.status = 'stopped';

        return this;
      }.bind(this)),
      'destroy': (function() {
        this.stop();
        this.loader.destroy();
        this.status = 'destroyed';

        return this;
      }.bind(this))
    };
  };

  win.ImageLoader = ImageLoader;
}(this));

// English localization for eBookReader
(function(win) {
  'use strict';

  var JEZ_locale = win.JEZ_locale || [];

  JEZ_locale['en-us'] = {
    'Single Page': 'Single Page',
    'Dual Page': 'Dual Page',
    'thumbnails': 'thumbnails',
    'Invert': 'Invert',
    'First page': 'First page',
    'Previous page': 'Previous page',
    'Next page': 'Next page',
    'Last page': 'Last page',
    'Turn left': 'Turn left',
    'Turn right': 'Turn right',
    'Print': 'Print',
    'Zoom in': 'Zoom in',
    'Zoom out': 'Zoom out',
    'Full Screen': 'Full Screen',
    'Search text': 'Search text',
    'Printing options': 'Printing options',
    'All pages': 'All pages',
    'Current page': 'Current page',
    'from': 'from',
    'to': 'to',
    'Paper size': 'Paper size',
    'A4': 'A4',
    'Letter': 'Letter',
    'Send to print': 'Send to print',
    'Loading. Please wait': 'Loading. Please wait...',
    'Printout': 'Printout'
  };

  win.JEZ_locale = JEZ_locale;
}(this));

// Russian localization for eBookReader
(function(win) {
  'use strict';

  var JEZ_locale = win.JEZ_locale || [];

  JEZ_locale['ru-ru'] = {
    'Single Page': 'Одностраничный режим',
    'Dual Page': 'Двухстраничный режим',
    'thumbnails': 'Миниатюры',
    'Invert': 'Инвертировать цвета',
    'First page': 'Первая страница',
    'Previous page': 'Предыдущая страница',
    'Next page': 'Следующая страница',
    'Last page': 'Последняя страница',
    'Turn left': 'Повернуть налево',
    'Turn right': 'Повернуть направо',
    'Print': 'Печать',
    'Zoom in': 'Увеличить',
    'Zoom out': 'Уменьшить',
    'Full Screen': 'Полноэкранный режим',
    'Search text': 'Поиск',
    'Printing options': 'Опции печати',
    'All pages': 'Все страницы',
    'Current page': 'Текущая страница',
    'from': 'с',
    'to': 'по',
    'Paper size': 'Размер бумаги',
    'A4': 'A4',
    'Letter': 'Письмо',
    'Send to print': 'На печать',
    'Loading. Please wait': 'Загрузка. Пожалуйста, подождите',
    'Printout': 'Вывод на печать'
  };

  win.JEZ_locale = JEZ_locale;
}(this));

/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

/**
 * eBookReader
 * Updated: "2014-04-10T11:17:32.317Z"
 * @author Eugene Zlobin http://zlobin.pro/
 * @version 0.1.0
 */
(function(win) {
  'use strict';

  var JEZ = win.JEZ,
      parameters = {
        'options': {},
        'params': {},
        'consts': {},
        'root_element': ''
      },
      EBookReader;

  /**
   * eBookReader JS application.
   *
   * @constructor
   * @version 0.1.0
   * @param {Object} user_options
   */
  EBookReader = function(user_options) {
    
    var opts,
        el_id,
        root_el,
        Factory = function(module) {
          var reader;

          if (module === 'image') {
            reader = new EBookReader.ImageReader();
          } else if (module === 'html') {
            reader = new EBookReader.HTMLReader();
          } else {
            throw new Error('Mode "' + opts.default_screen_mode + '" does not exist');
          }

          return reader;
        };

    /**
     * Current version of the application.
     *
     * @const
     **/
    this.VERSION = '0.1.0';

    /**
     * Global reader.
     *
     * @type {Object}
     **/
    this.reader = null;

    /**
     * Default options.
     *
     * @define
     **/
    this.defaults = {
      'root_element_ID': 'EBookReader',
      'reader_module': 'image', // image || html
      'default_screen_mode': 'single', // single || dual
      'start_page': 1,
      'search_URL': '',
      'book_ID': 0,
      'auto_height': true,
      /*
        Example for param "TOC_images":
        [
          'img_toc_1.png', 'img_toc_2.png', ...
        ]
      */
      'thumbnails_images': [],
      'thumbnails_width': 150, // px
      'thumbnails_images_preload': true,
      /*
        Example for param "images":
        {
          'single'       : ['img_s_1.png', 'img_s_2.png', ...],
          'dual'         : ['img_d_1.png', 'img_d_2.png', ...],
          'print_a4'     : ['img_p4_1.png', 'img_p4_2.png', ...],
          'print_letter' : ['img_pl_1.png', 'img_pl_2.png', ...]
        }
      */
      'images': {},
      'images_preload': true,
      /*
        Example for param "chapters":
        {
          'Chapter Title #1' : {'page': 1},
          'Chapter Title #2' : {'page': 19},
          'Chapter Title #3' : {'page': 55},
          ...
        }
      */
      'chapters': {},
      'enable_chapters': false,
      'enable_search': false,
      'enable_print': true,
      'enable_sidebar': false,
      /*
        Example for param "sidebar_info":
        {
          'Title' : 'Book Title',
          'Author' : 'Book author',
          'Publication date' : '12.12.1931',
          ...
        }
      */
      'sidebar_info': {},
       // It possible using, for instance for CDN.
      'enable_DNS_prefetch': true,
       // This parameter is related to "enable_DNS_prefetch".
      'CDN_host': 'site.com',
      'locale': 'en-us',
      'direction': 'ltr', // lrt || rtl
      'screen_mode_params': {
        'single': {
          'autofit': 'width', // width || height || none
          'percent': '100',
          'onLoadImage': JEZ.noop,
          // px, DO NOT change positions of names (top, right, bottom, left).
          'padding': {
            'top': 10,
            'right': 10,
            'bottom': 10,
            'left': 10
          }
        },
        'dual': {
          'autofit': 'height', // width || height || none
          'percent': '100',
          'onLoadImage': JEZ.noop
        }
      },
      'onChangePage': JEZ.noop,
      'onBeforeLoad': JEZ.noop,
      'onAfterLoad': JEZ.noop
    };

    /**
     * Options for application.
     **/
    parameters.options = JEZ.extend(this.defaults, user_options);
    opts = parameters.options;
    el_id = opts.root_element_ID;
    delete this.defaults;

    /**
     * Consts.
     **/
    parameters.consts = {
      'TYPE_PARTLYREPLACE': 'partly_replace',
      'TYPE_FULLREPLACE': 'full_replace',
      'SINGLE_MODE': 'single',
      'DUAL_MODE': 'dual'
    };

    /**
     * Root element.
     **/
    parameters.root_element = JEZ.dom('#' + el_id).find(false);
    root_el = parameters.root_element;

    if (root_el === null) {
      throw new Error('Root Element with ID ' + el_id + ' does not exist');
    }

    opts.onBeforeLoad();
    JEZ.dom(root_el).html('');
    this.reader = new Factory(opts.reader_module);
    opts.onAfterLoad();

    
    return;
  };

  win.EBookReader = EBookReader;
  win.EBRParams = parameters;
}(this));

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

/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(win, undef) {
  'use strict';

  var parameters = win.EBRParams,
      EBR = win.EBookReader,
      JEZ = win.JEZ,
      doc = win.document,
      ebr_image_reader,
      __; // Localization

  /**
   * Image Reader base.
   *
   * @class
   * @constructor
   * @version 0.1.0
   * @extends EBookReader.Reader
   **/
  EBR.ImageReader = function() {
    EBR.Reader.call(this);
    var params = parameters.params,
        storage = JEZ.storage;

    this.IMAGE_TYPE_PRINT_LETTER = 'print_letter';
    this.IMAGE_TYPE_PRINT_A4 = 'print_a4';
    this.IMAGE_TYPE_SINGLE = 'single';
    this.IMAGE_TYPE_DUAL = 'dual';

    this.toolbar_paginator = {};
    this.print_wrapper = {};
    this.sm_container = {};
    this.screen_mode = {};
    this.page_view = {};
    this.wrapper = {};
    this.toolbar = {};

    __ = JEZ.__(parameters.options.locale);

    parameters.params.hash_images_sizes = params.storage_hash + 'images_sizes';
    parameters.params.image_sizes = storage.get(params.hash_images_sizes, false);
    parameters.params.image_sizes = params.image_sizes ||
        {
          'single': {
            'width': null,
            'height': null
          },
          'dual': {
            'width': null,
            'height': null
          }
        };

    
    this.initFullScreenHandler_()
        .createWrapper_()
        .initToolbar_()
        .initToolbarPagination_()
        .createPageView_()
        .createScreenModeContainer_()
        .changeScreenMode_(params.set_screen_mode)
        .initEvents_()
        .setupResizeEvent_()
        .setupKeyListener_()
        .render_();
    

    parameters.params.page_height = storage.get(this.getHash_() + '_height', null);
    parameters.params.page_width = storage.get(this.getHash_() + '_width', null);
    this.changeStateScreenModeButtons_()
        .gotoPage(params.current_page);

    if (JEZ.is_mobile) {
      this.addMobileFeatures_();
    }
  };

  JEZ.inherits(EBR.ImageReader, EBR.Reader);
  ebr_image_reader = EBR.ImageReader.prototype;

  /**
   * Init events.
   *
   * @private
   * @method initEvents_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initEvents_ = function() {
    var opts = parameters.options;

    this.initToolbarPaginationEvents_()
        .initToolbarButtons_()
        .initToolbarVisibility_()
        .initScrollEvent_()
        .initMouseWheelEvent_()
        .initURLEvents_();

    if (opts.enable_chapters) {
      this.initToolbarChapters_();
    }
    if (opts.enable_search) {
      this.initToolbarSearch_();
    }
    if (opts.enable_print) {
      this.initToolbarPrint_();
    }

    return this;
  };

  /**
   * Init update url events.
   *
   * @private
   * @method initURLEvents_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initURLEvents_ = function() {
    var consts = parameters.consts;

    JEZ.dom(parameters.root_element)
        .on('change:url:partly', function(params) {
          this.updateURLHash({
            'name': params.data.name,
            'value': params.data.value
          }, consts.TYPE_PARTLYREPLACE);
        }.bind(this))
        .on('change:url:full', function(params) {
          this.updateURLHash({
            'name': params.data.name,
            'value': params.data.value
          }, consts.TYPE_FULLREPLACE);
        }.bind(this));

    return this;
  };

  /**
   * Init scroll event.
   *
   * @private
   * @method initScrollEvent_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initScrollEvent_ = function() {
    var params = parameters.params,
        single = parameters.consts.SINGLE_MODE;

    JEZ.dom(this.page_view)
        .on('scroll', function(event, data) {
          var $el = JEZ.dom(event.target),
              current_page,
              prev_page;

          if (params.current_screen_mode === single && !$el.data('disable_scroll')) {
            current_page = data.screen_mode.getPageByScroll(data.page_view);
            prev_page = params.current_page;

            if (prev_page !== current_page) {
              data.gotoPage(current_page, 'by_scroll');
            }
          } else {
            $el.data('disable_scroll', false);
          }

          return;
        }, this);

    return this;
  };

  /**
   * Init mouse wheel event.
   *
   * @private
   * @method initMouseWheelEvent_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initMouseWheelEvent_ = function() {
    /* var scale = 1.5;
    var originx = 0;
    var originy = 0;

    JEZ.dom(this.page_view)
        .on('mousewheel', function(event, data) {
          // Zooming
          // var mousex = event.clientX - canvas.offsetLeft;
          // var mousey = event.clientY - canvas.offsetTop;
          var wheel = event.wheelDelta / 120; //n or -n
          var zoom = Math.pow(1 + Math.abs(wheel) / 2 , wheel > 0 ? 1 : -1);

          context.translate(
                originx,
                originy
            );
            context.scale(zoom,zoom);
            context.translate(
                -( mousex / scale + originx - mousex / ( scale * zoom ) ),
                -( mousey / scale + originy - mousey / ( scale * zoom ) )
            );

            originx = ( mousex / scale + originx - mousex / ( scale * zoom ) );
            originy = ( mousey / scale + originy - mousey / ( scale * zoom ) );
            scale *= zoom;

          return;
        }, this); */

    return this;
  };

  /**
   * Get hash.
   *
   * @private
   * @method getHash_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.getHash_ = function() {
    var params = parameters.params,
        hash = params.storage_hash,
        consts = parameters.consts,
        screen_mode = params.current_screen_mode;

    if (screen_mode === consts.SINGLE_MODE) {
      hash += this.IMAGE_TYPE_SINGLE;
    } else if (screen_mode === consts.DUAL_MODE) {
      hash += this.IMAGE_TYPE_DUAL;
    }

    return hash;
  };

  /**
   * Create wrapper.
   *
   * @private
   * @method createWrapper_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.createWrapper_ = function() {
    this.wrapper = JEZ.dom('div').create({
      'className': 'EBR_wrapper',
      'id': 'EBR_wrapper'
    });

    return this;
  };

  /**
   * Init toolbar.
   *
   * @private
   * @method initToolbar_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbar_ = function() {
    this.toolbar = JEZ.dom('div').create({
      'className': 'EBR_toolbar',
      'id': 'EBR_toolbar'
    });

    JEZ.dom(this.wrapper).append(this.toolbar);

    return this;
  };

  /**
   * Init toolbar visibility events.
   *
   * @private
   * @method initToolbarVisibility_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarVisibility_ = function() {
    var $el = JEZ.dom(this.toolbar);

    $el
      .on('mouseover', function(event, data) {
        event = event || {};

        $el.removeClass('hide');
        data.screen_mode.recalculateSizes();
      }, this)
      .on('mouseout', function(event, data) {
        event = event || {};

        $el.addClass('hide');
        data.screen_mode.recalculateSizes();
      }, this);

    return this;
  };
  

  /**
   * Init toolbar buttons.
   *
   * @private
   * @method initToolbarButtons_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarButtons_ = function() {
    var toolbar_buttons = [],
        toolbar_button,
        button,
        current_button,
        params = parameters.params,
        buttons_wrapper = JEZ.dom('div').create({
          'className': 'EBR_buttons_wrapper',
          'id': 'EBR_buttons_wrapper'
        }),
        $buttons_wrapper = JEZ.dom(buttons_wrapper),
        buttons = {
          'single_screen_mode': {
            'title': __('Single Page'),
            'icon': 'doc-text',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.changeScreenMode_(params.SINGLE_MODE);
              }
            }
          },
          'dual_screen_mode': {
            'title': __('Dual Page'),
            'icon': 'book-open',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.changeScreenMode_(params.DUAL_MODE);
              }
            }
          },
          'thumbnails': {
            'title': __('thumbnails'),
            'icon': 'th-list',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                var type = params.enable_thumbnails ? 'off' : 'on';

                data.screen_mode.thumbnails(type);
              }
            }
          },
          'invert': {
            'title': __('Invert'),
            'icon': 'adjust-1',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                var type = params.enable_invert ? 'off' : 'on';

                data.invert(type);
              }
            }
          },
          'first_page': {
            'title': __('First page'),
            'icon': 'backward',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.firstPage();
              }
            }
          },
          'previous_page': {
            'title': __('Previous page'),
            'icon': 'reply',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.previousPage();
              }
            }
          },
          'next_page': {
            'title': __('Next page'),
            'icon': 'forward',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.nextPage();
              }
            }
          },
          'last_page': {
            'title': __('Last page'),
            'icon': 'forward-1',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.lastPage();
              }
            }
          },
          'turn_left': { // Turn on -90 degree.
            'title': __('Turn left'),
            'icon': 'ccw',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.screen_mode.turn('left');
              }
            }
          },
          'turn_right': { // Turn on 90 degree.
            'title': __('Turn right'),
            'icon': 'cw',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.screen_mode.turn('right');
              }
            }
          },
          'print': {
            'title': __('Print'),
            'icon': 'print',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                var type = params.print_popup ? 'off' : 'on';

                data.print(type);
              }
            }
          },
          'zoom_in': {
            'title': __('Zoom in'),
            'icon': 'zoom-in',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.screen_mode.zoom('in');
              }
            }
          },
          'zoom_out': {
            'title': __('Zoom out'),
            'icon': 'zoom-out',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                data.screen_mode.zoom('out');
              }
            }
          },
          'fullscreen': {
            'title': __('Full Screen'),
            'icon': 'resize-full-alt',
            'events': {
              'click': function(event, data) {
                event.preventDefault();
                var type = params.enable_fullscreen ? 'off' : 'on';

                data.fullScreen(type);
              }
            }
          }
        };

    for (button in buttons) {
      if (JEZ.hop.call(buttons, button)) {
        current_button = JEZ.dom('button').create({
          'id': 'EBR_button_' + button,
          'className': 'EBR_button'
        });

        if (buttons[button].icon) {
          JEZ.dom(current_button).addClass('icon-' + buttons[button].icon);
        }

        current_button.title = buttons[button].title;

        if (buttons[button].events !== undef) {
          this.initToolbarButtonEvents_(current_button, buttons[button].events === 'click' ?
              JEZ.click_event() :
              buttons[button].events);
        }

        toolbar_buttons.push(current_button);
      }
    }

    for (toolbar_button in toolbar_buttons) {
      if (JEZ.hop.call(toolbar_buttons, toolbar_button)) {
        $buttons_wrapper.append(toolbar_buttons[toolbar_button]);
      }
    }

    JEZ.dom(this.toolbar).append(buttons_wrapper);

    return this;
  };

  /**
   * Init toolbar button events.
   *
   * @private
   * @method initToolbarButtonEvents_
   * @version 0.1.0
   * @param {Object} button
   * @param {Object} events
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarButtonEvents_ = function(button, events) {
    var event_name,
        $button = JEZ.dom(button);

    for (event_name in events) {
      if (JEZ.hop.call(events, event_name)) {
        $button.on(event_name, events[event_name], this);
      }
    }

    return this;
  };

  /**
   * Setup resize event. Recalculate image sizes after resizing browser's window.
   *
   * @private
   * @method setupResizeEvent_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_image_reader.setupResizeEvent_ = function() {
    win.onresize = function() {
      this.screen_mode.recalculateSizes();
    }.bind(this);

    return this;
  };

  /**
   * Setup key listeners.
   *
   * @private
   * @method setupKeyListener_
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_image_reader.setupKeyListener_ = function() {
    // @todo implement it

    // CTRL + SHIFT + 1 = "single screen mode"
    // CTRL + SHIFT + 2 = "dual screen mode"
    // CTRL + SHIFT + I = invert
    // CTRL + SHIFT + S = search
    // left arrow = page - 1
    // right arrow = page + 1
    // HOME = first page
    // END = last page
    // ALT + ENTER = fullscreen mode
    // CTRL + wheel mouse up = zoom in
    // CTRL + wheel mouse down = zoom out
    // left arrow + top arrow = turn left
    // right arrow + top arrow = turn right
    JEZ.dom(doc)
        .on('keydown', function(event, data) {
          switch (event.keyCode) {
            case JEZ.keys.LEFT:
              data.previousPage();
              break;
            case JEZ.keys.RIGHT:
              data.nextPage();
              break;
            case JEZ.keys.HOME:
              data.firstPage();
              break;
            case JEZ.keys.END:
              data.lastPage();
              break;
          }
        }, this);

    // disable mouse right click
    JEZ.dom(this.sm_container)
        .on('contextmenu', function(event) {
          event.preventDefault();
        });

    return this;
  };

  /**
   * Init toolbar search.
   *
   * @private
   * @method initToolbarSearch_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarSearch_ = function() {
    var search_wrapper = JEZ.dom('div').create({
          'className': 'EBR_search_wrapper',
          'id': 'EBR_search_wrapper'
        }),
        search_form = JEZ.dom('form').create({
          'id': 'EBR_search_form'
        }),
        search_input_button = JEZ.dom('input').create({
          'id': 'EBR_search_button',
          'className': 'EBR_search_button'
        }),
        search_input_text = JEZ.dom('input').create({
          'id': 'EBR_search_text',
          'className': 'EBR_search_text',
          'autocomplete': 'on',
          'spellcheck': 'true',
          'autocorrect': 'off',
          'required': 'required',
          'placeholder': __('Search text'),
          'x-webkit-speech': ''
        });

    JEZ.dom(search_form)
        .append(search_input_text)
        .append(search_input_button);
    JEZ.dom(search_wrapper)
        .append(search_form);
    JEZ.dom(this.toolbar)
        .append(search_wrapper);

    return this;
  };

  /**
   * Init toolbar pagination.
   *
   * @private
   * @method initToolbarPagination_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarPagination_ = function() {
    var pagination_wrapper = JEZ.dom('div').create({
          'className': 'EBR_pagination_wrapper',
          'id': 'EBR_pagination_wrapper'
        }),
        pagination_form = JEZ.dom('div').create({
          'id': 'EBR_pagination_form'
        });

    this.toolbar_paginator = JEZ.dom('input').create({
      'className': 'EBR_pagination_input',
      'name': 'EBR_pagination_input',
      'id': 'EBR_pagination_input',
      'value': parameters.params.current_page,
      'type': 'text'
    });

    JEZ.dom(pagination_form)
        .append(this.toolbar_paginator);
    JEZ.dom(pagination_wrapper)
        .append(pagination_form);
    JEZ.dom(this.toolbar)
        .append(pagination_wrapper);

    return this;
  };

  /**
   * Init toolbar pagination events.
   * Disable all buttons, exclude number 0..9.
   *
   * @private
   * @method initToolbarPaginationEvents_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarPaginationEvents_ = function() {
    JEZ.dom(this.toolbar_paginator)
        .on('keypress', function(event) {
          if (event.keyCode < JEZ.keys.ZERO || event.keyCode > JEZ.keys.NINE) {
            event.preventDefault();
          }
        })
        .on('keyup', function(event, data) {
          var el = event.target,
              val = parseInt(el.value, 10) >> 0;

          if (val < 1) {
            event.target.value = 1;
          } else if (val > data.number_pages) {
            event.target.value = data.number_pages;
          }

          data.gotoPage(el.value);
        }, this);

    return this;
  };

  /**
   * HTML Markup for print form at the toolbar.
   *
   * @private
   * @method printForm_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.printForm_ = function() {
    var params = parameters.params,
        print_page = 'input type="radio" class="EBR_print_selector" name="EBR_print_range"',
        print_size = 'input type="radio" class="EBR_paper_type" name="EBR_paper_size"',
        print_range = 'input type="text" class="EBR_print_pages" ',
        print_form = [
            '<form class="EBR_print_form">',
            '<div class="EBR_printing_page_options">',
            '  <div class="EBR_print_title">' + __('Printing options') + ':</div>',
            '  <label for="EBR_print_all">',
            '    <' + print_page + ' value="all" id="EBR_print_all" checked="checked">',
            '    ' + __('All pages'),
            '  </label>',
            '  <label for="EBR_print_current">',
            '    <' + print_page + ' value="current" id="EBR_print_current">',
            '    ' + __('Current page'),
            '  </label>',
            '  <label for="EBR_print_range">',
            '    <' + print_page + ' value="range" id="EBR_print_range">',
            '    ' + __('from') + ' ',
            '  </label>',
            '  <' + print_range + 'name="EBR_print_from" id="EBR_print_from" value="' + params.current_page + '">',
            '  ' + __('to') + ' ',
            '  <' + print_range + 'name="EBR_print_to" id="EBR_print_to" value="' + params.number_pages + '">',
            '</div>',
            '<div class="EBR_printing_size_options">',
            '  <div class="EBR_print_title">' + __('Paper size') + ':</div>',
            '  <label for="EBR_paper_size_a4">',
            '    <' + print_size + ' value="a4" id="EBR_paper_size_a4" checked="checked">',
            '    ' + __('A4'),
            '  </label>',
            '  <label for="EBR_paper_size_letter">',
            '    <' + print_size + ' value="letter" id="EBR_paper_size_letter">',
            '    ' + __('Letter'),
            '  </label>',
            '</div>',
            '<input type="button" id="EBR_goto_print" value="' + __('Send to print') + '">',
            '</form>'
       ];

    return print_form;
  };

  /**
   * HTML Markup for print window.
   *
   * @private
   * @method printForm_
   * @version 0.1.0
   * @param {String} page_size
   * @param {Array} images
   * @returns {Object}
   **/
  ebr_image_reader.printPage_ = function(page_size, images) {
    var print_page = [
      '<!DOCTYPE html>',
      '<html lang="en">',
        '<head>',
          '<meta charset="UTF-8">',
          '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
          '<style>',
            '@media print {',
              '@page {size:' + page_size + ';margin:20mm 15mm;}',
              '* {-webkit-print-color-adjust:exact;print-color-adjust:exact;}',
              'html {height:100%;}',
              'body {background:none;width:100%;height:100%;margin:0;padding:0;}',
              'div {margin:auto;max-width:100%;max-height:100%;}',
              'img {page-break-inside:avoid;border:0;max-width:100%;max-height:100%;display:block;margin:auto;}',
            '}',
          '</style>',
        '</head>',
        '<body onload="document.getElementById(\'loading\').style.display=\'none\'; window.print();">',
        '<span id="loading">' + __('Loading. Please wait') + '...</span>',
        '<div>',
        images.join(''),
        '</div>',
        '</body>',
      '</html>'
    ];

    return print_page;
  };

  /**
   * Create HTML markup for "print" at the toolbar.
   *
   * @private
   * @method initToolbarPrint_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarPrint_ = function() {
    this.print_wrapper = JEZ.dom('div').create({
      'className': 'EBR_print_wrapper',
      'id': 'EBR_print_wrapper'
    });

    this.print_wrapper.insertAdjacentHTML('beforeEnd', this.printForm_().join(''));

    return this;
  };

  /**
   * Open print window.
   *
   * @method sendPrint
   * @version 0.1.0
   * @param {Number} start_index
   * @param {Number} end_index
   * @param {String} paper_size
   * @returns {Object}
   **/
  ebr_image_reader.sendPrint = function(start_index, end_index, paper_size) {
    var print_window = win.open('#', '_blank'),
        print_doc = print_window.document,
        images = [],
        page_size,
        image,
        i;

    if (paper_size === 'a4') {
      page_size = '210mm 297mm';
    } else if (paper_size === 'letter') {
      page_size = '215.9mm 279.4mm';
    }

    for (i = start_index; i < end_index; i++) {
      image = this.screen_mode.getImage(i);
      if (image) {
        images.push('<img src="' + image + '">');
      }
    }

    print_doc.write(this.printPage_(page_size, images).join(''));
    print_doc.close();

    return this;
  };

  /**
   * Init print button events.
   *
   * @private
   * @method initPrintButtonEvents_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initPrintButtonEvents_ = function() {
    JEZ.dom('#EBR_goto_print')
        .find()
        .on(JEZ.click_event(), function(event, data) {
          var paper_type = JEZ.dom('input[name="EBR_paper_size"]:checked').find(false).value,
              range = JEZ.dom('input[name="EBR_print_range"]:checked').find(false).value,
              start_index,
              end_index,
              params = parameters.params;

          event.preventDefault();
          if (range === 'all') {
            start_index = 0;
            end_index = params.number_pages;
          } else if (range === 'range') {
            start_index = JEZ.dom('#EBR_print_from').find(false).value >> 0;
            end_index = JEZ.dom('#EBR_print_to').find(false).value >> 0;
          } else {
            start_index = end_index = params.current_page;
          }

          data.sendPrint(start_index, end_index, paper_type);
        }, this);

    return this;
  };

  /**
   * Create HTML element "chapters" at the toolbar.
   *
   * @private
   * @method initToolbarChapters_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initToolbarChapters_ = function() {
    var chapters_wrapper = JEZ.dom('div').create({
      'className': 'EBR_chapters_wrapper',
      'id': 'EBR_chapters_wrapper'
    });

    JEZ.dom(this.toolbar).append(chapters_wrapper);

    return this;
  };

  /**
   * Create HTML element "page view".
   *
   * @private
   * @method createPageView_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.createPageView_ = function() {
    this.page_view = JEZ.dom('main').create({
      'className': 'EBR_page_view',
      'id': 'EBR_page_view'
    });

    JEZ.dom(this.wrapper).append(this.page_view);

    return this;
  };

  /**
   * Create screen mode container.
   *
   * @private
   * @method createScreenModeContainer_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.createScreenModeContainer_ = function() {
    var single = parameters.consts.SINGLE_MODE,
        block_id = 'EBR_' + single + '_page_container',
        block_class_name = 'EBR_' + single + '_page_container EBR_page_container';

    if (parameters.params.enable_invert) {
      block_class_name += ' invert';
    }

    this.sm_container = JEZ.dom('section').create({
      'id': block_id,
      'className': block_class_name + ' no_select'
    });

    JEZ.dom(this.page_view).append(this.sm_container);

    return this;
  };

  /**
   * Render HTML.
   *
   * @private
   * @method render_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.render_ = function() {
    var class_name = JEZ.is_mobile ? 'mobile' : 'non_mobile',
        $root_el = JEZ.dom(parameters.root_element);

    $root_el
        .addClass(class_name)
        .append(this.wrapper);

    if (parameters.options.auto_height) {
      JEZ.dom(this.page_view).set('style', {
        'height': win.innerHeight - this.toolbar.offsetHeight + 'px'
      });
    }

    return this;
  };

  /**
   * Update toolbar paginator.
   *
   * @method updateToolbarPaginator
   * @version 0.1.0
   * @param {Number} page
   * @returns {Object}
   **/
  ebr_image_reader.updateToolbarPaginator = function(page) {
    this.toolbar_paginator.value = page >> 0;

    return this;
  };

  /**
   * Enable or disable full screen.
   *
   * @method fullScreen
   * @version 0.1.0
   * @param {String} status
   * @returns {Object}
   **/
  ebr_image_reader.fullScreen = function(status) {
    
    var $button = JEZ.dom('#EBR_button_fullscreen').find(),
        root_el = parameters.root_element,
        customFullScreen = function(status) {
          var $root_el = JEZ.dom(root_el),
              overlay = JEZ.dom('#EBR_overlay').find();

          if (status === 'on' && overlay.el === null) {
            overlay = JEZ.dom('div').create({
              'className': 'EBR_overlay',
              'id': 'EBR_overlay'
            });

            JEZ.dom(doc.body).append(overlay);
          }

          $root_el.toggleClass('full_screen');
        };

    if (status === 'on') {
      if (!JEZ.fullScreen.request(root_el)) {
        // if browser doesn't support HTML5 FullScreen API
        customFullScreen(status);
      }

      $button
          .addClass('icon-resize-small-alt')
          .removeClass('icon-resize-full-alt');
    } else {
      if (!JEZ.fullScreen.exit(root_el)) {
        // if browser doesn't support HTML5 FullScreen API
        customFullScreen(status);
      }

      $button
          .addClass('icon-resize-full-alt')
          .removeClass('icon-resize-small-alt');
    }
    parameters.params.enable_fullscreen = !parameters.params.enable_fullscreen;

    this.updateURLHash({
      'name': 'fullscreen',
      'value': parameters.params.enable_fullscreen >> 0
    }, parameters.consts.TYPE_PARTLYREPLACE);

    
    return this;
  };

  /**
   * Init fullscreen handler.
   *
   * @private
   * @method initFullScreenHandler_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.initFullScreenHandler_ = function() {
    var changeFullScreenHandler = function() {
          if (!JEZ.fullScreen.is()) {
            this.fullScreen('off');
          }
        }.bind(this);

    JEZ.dom(doc)
        .on('webkitfullscreenchange', changeFullScreenHandler)
        .on('mozfullscreenchange', changeFullScreenHandler)
        .on('msfullscreenchange', changeFullScreenHandler)
        .on('fullscreenchange', changeFullScreenHandler);

    return this;
  };

  /**
   * Print.
   *
   * @method print
   * @version 0.1.0
   * @param {String} status
   * @returns {Object}
   **/
  ebr_image_reader.print = function(status) {
    var $button = JEZ.dom('#EBR_button_print').find(),
        html = JEZ.dom(this.print_wrapper).html(),
        print_modal = JEZ.modal(html, __('Printout')),
        $close_button,
        print_popup = parameters.params.print_popup;

    if (status === 'on') {
      $close_button = JEZ.dom('#JEZ_modal_close').find();

      $button.addClass('active');

      $close_button.on(JEZ.click_event(), function() {
        this.print('off');
      }.bind(this));

      print_modal.show();
      this.initPrintButtonEvents_();
    } else {
      $button.removeClass('active');
      print_modal.hide();
    }

    parameters.params.print_popup = !print_popup;

    this.updateURLHash({
      'name': 'print_popup',
      'value': !print_popup ? 1 : 0
    }, parameters.consts.TYPE_PARTLYREPLACE);

    return this; 
  };

  /**
   * Change screen mode.
   *
   * @private
   * @method changeScreenMode_
   * @version 0.1.0
   * @param {String} mode
   * @throws {Error} Screen mode must be exist.
   * @returns {Object}
   **/
  ebr_image_reader.changeScreenMode_ = function(mode) {
    var consts = parameters.consts;

    if (parameters.params.current_screen_mode !== mode) {
      if (mode === consts.SINGLE_MODE) {
        this.screen_mode = new EBR.ImageReader.ScreenMode.Single(this.sm_container,
            this.page_view, this.toolbar);
      } else if (mode === consts.DUAL_MODE) {
        this.screen_mode = new EBR.ImageReader.ScreenMode.Dual(this.sm_container,
            this.page_view, this.toolbar);
      } else {
        throw new Error('Screen Mode "' + mode + '" does not exist');
      }

      this.updateURLHash({
        'name': 'mode',
        'value': mode
      }, consts.TYPE_PARTLYREPLACE);

      parameters.params.current_screen_mode = mode;
      this.changeStateScreenModeButtons_();
    }

    return this;
  };
  
  /**
   * Change state screen mode buttons.
   *
   * @private
   * @method changeStateScreenModeButtons_
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.changeStateScreenModeButtons_ = function() {
    var $single_button = JEZ.dom('#EBR_button_single_screen_mode').find(),
        $dual_button = JEZ.dom('#EBR_button_dual_screen_mode').find(),
        consts = parameters.consts,
        current_screen = parameters.params.current_screen_mode;
    
    if (current_screen === consts.SINGLE_MODE) {
      if ($single_button.el !== null && $dual_button.el !== null) {
        $dual_button.removeClass('active');
        $single_button.addClass('active');
      }
    } else if (current_screen === consts.DUAL_MODE) {
      if ($single_button.el !== null && $dual_button.el !== null) {
        $single_button.removeClass('active');
        $dual_button.addClass('active');
      }
    }

    return this;
  };

  /**
   * Remove toolbar buttons.
   *
   * @private
   * @method removeToolbarButtons_
   * @version 0.1.0
   * @param {Array} buttons
   * @returns {Object}
   **/
  ebr_image_reader.removeToolbarButtons_ = function(buttons) {
    var i = buttons.length;

    while (i--) {
      JEZ.dom('#' + buttons[i])
          .find()
          .remove();
    }

    return this;
  };

  /**
   * Add mobile features.
   *
   * @private
   * @method addMobileFeatures
   * @version 0.1.0
   * @returns {Object}
   **/
  ebr_image_reader.addMobileFeatures_ = function() {
    this.removeToolbarButtons_([
      'EBR_button_thumbnails',
      'EBR_button_zoom_out',
      'EBR_button_zoom_in',
      'EBR_button_print'
    ]);

    // Scrolling pages uses user touch.
    JEZ.touchScrolling(this.page_view);

    // Change color depending on the light.
    // @see http://www.w3.org/TR/ambient-light/
    JEZ.dom(win).on('devicelight', function(event) {
      var $el = JEZ.dom(this.wrapper),
          lux = event.value;

      if (lux < 50) {
        $el.addClass('dim');
      } else if (lux >= 50 && lux <= 300) {
        $el.addClass('normal');
      } else if (lux > 300) {
        $el.addClass('bright');
      }
    }.bind(this));
    
    /* 
// Check to make sure the browser supprots DeviceOrientationEvents
if (window.DeviceOrientationEvent) {
  // Create an event listener
  window.addEventListener('deviceorientation', function(event) {
      // Get the left-to-right tilt (in degrees).
    var tiltLR = event.gamma;

    // Get the front-to-back tilt (in degrees).
    var titleFB = event.beta;

      // Get the direction of the device (in degrees).
    var direction = event.alpha;
  });
} */

    return this;
  };

  /**
   * Enable or disable invert.
   *
   * @method invert
   * @version 0.1.0
   * @param {String} status
   * @returns {Object}
   */
  ebr_image_reader.invert = function(status) {
    
    var invert = parameters.params.enable_invert,
        $sm_container = JEZ.dom(this.sm_container);

    if (status === 'on') {
      $sm_container.addClass('invert');
    } else {
      $sm_container.removeClass('invert');
    }
    parameters.params.enable_invert = !invert;

    this.updateURLHash({
      'name': 'invert',
      'value': !invert ? 1 : 0
    }, parameters.consts.TYPE_PARTLYREPLACE);

    
    return this;
  };

  /**
   * Go to page.
   *
   * @method gotoPage
   * @version 0.1.0
   * @param {Number} page_num
   * @param {String} from
   * @throws {Error} Page must be exist.
   * @returns {Object}
   */
  ebr_image_reader.gotoPage = function(page_num, from) {
    from = from || false;
    var params = parameters.params;

    if (page_num > 0 && page_num <= params.number_pages) {
      parameters.options.onChangePage();
      parameters.params.current_page = page_num;
      this.updateToolbarPaginator(params.current_page);
      this.screen_mode.loadImage();
      if (!from) {
        this.screen_mode.updateScrollByPage(this.page_view, params.current_page);
      }

      this.updateURLHash({
        'name': 'page',
        'value': page_num
      }, parameters.consts.TYPE_PARTLYREPLACE);
    } else {
      throw new Error('Page #' + page_num + ' does not exist');
    }

    return this;
  };
}(this));

/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(win) {
  'use strict';

  var ImageLoader = win.ImageLoader,
      parameters = win.EBRParams,
      EBR = win.EBookReader,
      JEZ = win.JEZ,
      ebr_image_reader_single;

  // _ Screen Mode _____________________________________________________________

  EBR.ImageReader.ScreenMode = EBR.ImageReader.ScreenMode || {};

  // _ Single Screen Mode ______________________________________________________

  /**
   * Image reader single screen mode.
   *
   * @class
   * @version 0.1.0
   * @extends EBookReader.Reader.ScreenMode.Single
   * @param {Object} sm_container
   * @param {Object} page_view
   * @param {Object} toolbar
   **/
  EBR.ImageReader.ScreenMode.Single = function(sm_container, page_view, toolbar) {
    this.sm_container = sm_container;
    this.page_view = page_view;
    this.toolbar = toolbar;
  };

  JEZ.inherits(EBR.ImageReader.ScreenMode.Single, EBR.Reader.ScreenMode.Single);
  ebr_image_reader_single = EBR.ImageReader.ScreenMode.Single.prototype;

  /**
   * Get image.
   *
   * @method getImage
   * @version 0.1.0
   * @param {Number} img_num
   * @throws {Error} Image must be exist.
   * @returns {String}
   */
  ebr_image_reader_single.getImage = function(img_num) {
    var images = parameters.options.images,
        size_type = parameters.consts.SINGLE_MODE;

    if (!images[size_type][img_num]) {
      throw new Error('Image #' + img_num + ' with size type ' + size_type + ' does not exist');
    }

    return images[size_type][img_num];
  };

  /**
   * Update scroll by page.
   *
   * @method updateScrollByPage
   * @version 0.1.0
   * @param {Object} container
   * @param {Number} page
   * @returns {Object}
   */
  ebr_image_reader_single.updateScrollByPage = function(container, page) {
    var pos_y = ((page - 1) * parameters.params.page_height) >> 0;

    container.scrollTop = pos_y;
    JEZ.dom(container)
        .data('disable_scroll', true);

    return this;
  };

  /**
   * Zoom image.
   *
   * @method zoom
   * @version 0.1.0
   * @param {String} type
   * @returns {Object}
   */
  ebr_image_reader_single.zoom = function(type) {
    // @todo implementit
    var params = parameters.params,
        ratio = type === 'out' ? -1 : 1,
        increment = 0.2,
        min_zoom = 0.2,
        max_zoom = 2,
        current_zoom = (parseFloat(params.current_zoom) + (increment * ratio)).toFixed(2);

    if (current_zoom > min_zoom && current_zoom < max_zoom) {
      parameters.params.current_zoom = current_zoom;
      this.recalculateSizes();
    }

    JEZ.dom(parameters.root_element)
        .trigger('change:url:partly', {
          'name': 'zoom',
          'value': current_zoom.toString().replace(/\./g, '_')
        });

    return this;
  };

  /**
   * CSS scale.
   *
   * @method scale
   * @version 0.1.0
   * @param {Object} $el
   * @param {Number} zoom
   * @returns {Object}
   */
  ebr_image_reader_single.scale = function($el, zoom) {
    $el.set('style', {
      '-webkit-transform': 'scale(' + zoom + ')',
      '-moz-transform': 'scale(' + zoom + ')',
      '-ms-transform': 'scale(' + zoom + ')',
      '-o-transform': 'scale(' + zoom + ')',
      'transform': 'scale(' + zoom + ')'
    });

    return this;
  };

  /**
   * thumbnails.
   *
   * @method thumbnails
   * @version 0.1.0
   * @param {String} type
   * @returns {Object}
   */
  /* ebr_image_reader_single.thumbnails = function(type) {
    // @todo implement it

    return this;
  }; */

  /**
   * Rotate an image.
   *
   * @method turn
   * @version 0.1.0
   * @param {String} type
   * @returns {Object}
   */
  ebr_image_reader_single.turn = function(type) {
    
    var ratio = type === 'left' ? - 1 : 1,
        current_angle = parseInt(parameters.params.current_angle, 10) || 0,
        new_angle = (current_angle + 90 * ratio) % 360;

    if (new_angle < 0) {
      new_angle += 360;
    }

    parameters.params.current_angle = new_angle;

    JEZ.dom(this.sm_container)
        .removeClass('angle_' + current_angle)
        .addClass('angle_' + new_angle);

    JEZ.dom(parameters.root_element)
        .trigger('change:url:partly', {
          'name': 'angle',
          'value': new_angle
        });

    this.recalculateSizes();
    

    return this;
  };

  /**
   * Get page by scroll.
   *
   * @method getPageByScroll
   * @version 0.1.0
   * @param {Object} container
   * @returns {Number} page number
   */
  ebr_image_reader_single.getPageByScroll = function(container) {
    return ((container.scrollTop / parameters.params.page_height) >> 0) + 1;
  };

  /**
   * Create page.
   *
   * @private
   * @method createPage_
   * @version 0.1.0
   * @param {Object} img_obj
   * @param {Number} img_num
   * @returns {Object}
   */
  ebr_image_reader_single.createPage_ = function(img_obj, img_num) {
    var img_wrapper = JEZ.dom('figure').create({
          'className': 'EBR_image_wrapper'
        }),
        $sm_container = JEZ.dom(this.sm_container);

    // @todo Hide invisible images (but NOT delete their)
    this.calculateImageSize(img_obj, img_num);

    JEZ.dom(img_obj).addClass('EBR_images');
    JEZ.dom(img_wrapper).append(img_obj);
    $sm_container.append(img_wrapper);

    return this;
  };

  /**
   * Calculate image size.
   *
   * @method calculateImageSize
   * @version 0.1.0
   * @param {Object} img
   * @param {Number} img_index
   * @returns {Object}
   */
  ebr_image_reader_single.calculateImageSize = function(img, img_index) {
    var single = parameters.options.screen_mode_params.single,
        paddings = [],
        padding_name,
        posY = (parameters.params.page_height * img_index) >> 0,
        params = parameters.params,
        zoom = params.current_zoom,
        css_style = this.getSizesAutofit_(single.autofit, 'image'),
        $img = JEZ.dom(img),
        old_width = img.getBoundingClientRect().width || img.width,
        old_height = img.getBoundingClientRect().height || img.height,
        top,
        left;

    for (padding_name in single.padding) {
      if (JEZ.hop.call(single.padding, padding_name)) {
        paddings.push(single.padding[padding_name] + 'px');
      }
    }

    css_style.margin = paddings.join(' ');
    css_style.top = posY + 'px';
    $img.set('style', css_style);

    if (zoom !== 1) {
      // @todo instead of img - img_wrapper
      // imgs_wrapper = JEZ.dom('.EBR_image_wrapper', this.sm_container).find(false, 'all'),
      this.scale($img, zoom);

      // @todo top doesn't work correctly
      top = parseInt($img.get('style', 'top'), 10) || 0;
      left = parseInt($img.get('style', 'left'), 10) || 0;

      $img.set('style', {
        'top': top + ((img.getBoundingClientRect().height - old_height) / 2) + 'px',
        'left': left + ((img.getBoundingClientRect().width - old_width) / 2) + 'px'
      });
    }

    return this;
  };

  /**
   * Recalculate sizes.
   *
   * @method recalculateSizes
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_image_reader_single.recalculateSizes = function() {
    // @todo implement it
    var params = parameters.params,
        opts = parameters.options,
        consts = parameters.consts,
        containers_height = (params.page_height * params.number_pages) >> 0,
        loaded_images = params.loaded_images,
        imgs = loaded_images.img,
        pages = loaded_images.page,
        i = imgs.length,
        angle = params.current_angle,
        $sm_container = JEZ.dom(this.sm_container),
        sizes = this.getSizesAutofit_(opts.screen_mode_params[consts.SINGLE_MODE].autofit, 'wrapper');

    // @todo refactor it
    parameters.params.page_width = sizes.width;
    parameters.params.page_height = sizes.height;

    JEZ.dom(this.page_view).set('style', {
      'height': (win.innerHeight - this.toolbar.clientHeight - 1) + 'px'
    });

    $sm_container.set('style', {
      'height': containers_height + 'px'
    });

    if (angle !== 0) {
      $sm_container.addClass('angle_' + angle);
    }

    while (i--) {
      this.calculateImageSize(imgs[i], pages[i]);
    }

    return this;
  };

  /**
   * Get sizes autofit.
   *
   * @method getSizesAutofit_
   * @version 0.1.0
   * @param {String} autofit
   * @param {String} type
   * @returns {Object}
   */
  ebr_image_reader_single.getSizesAutofit_ = function(autofit, type) {
    var single = parameters.consts.SINGLE_MODE,
        opts = parameters.options,
        params = parameters.params,
        ssm_confing = opts.screen_mode_params[single],
        percent_size = ssm_confing.percent / 100,
        page_view = this.page_view,
        wrapper_height = page_view.clientHeight,
        wrapper_width = page_view.clientWidth,
        padding = ssm_confing.padding,
        padding_top_bottom = padding.bottom + padding.top,
        padding_left_right = padding.left + padding.right,
        width = params.image_sizes[single].width,
        height = params.image_sizes[single].height,
        sizes = {};

    if (autofit === 'height') {
      sizes.height = (wrapper_height * percent_size - padding_top_bottom) >> 0;
      sizes.width = (width * sizes.height / height - padding_left_right) >> 0;
    } else if (autofit === 'width') {
      sizes.width = (wrapper_width * percent_size - padding_left_right) >> 0;
      sizes.height = (height * sizes.width / width - padding_top_bottom) >> 0;
    } else if (autofit === 'none') {
      sizes.width = (width + padding_left_right - padding_left_right) >> 0;
      sizes.height = (height + padding_top_bottom - padding_top_bottom) >> 0;
    }

    if (type === 'image') {
      sizes.height = (sizes.height).toString() + 'px';
      sizes.width = (sizes.width).toString() + 'px';
    }

    return sizes;
  };

  /**
   * Load image.
   *
   * @method loadImage
   * @version 0.1.0
   * @returns {Object}
   */
  ebr_image_reader_single.loadImage = function() {
    var img_index = this.getImageIndex(),
        params = parameters.params,
        img_num,
        start,
        end,
        pos,
        onCompleteNonExists = function(el) {
          var opts = parameters.options,
              consts = parameters.consts,
              single = consts.SINGLE_MODE,
              hash = params.storage_hash + single,
              hash_width = hash + '_width',
              hash_height = hash + '_height',
              sizes;

          params.image_sizes[single] = {
            'width': el.width,
            'height': el.height
          };
          sizes = this.getSizesAutofit_(opts.screen_mode_params[single].autofit, 'wrapper');

          parameters.params.page_width = sizes.width;
          parameters.params.page_height = sizes.height;

          JEZ.storage
              .set(hash_width, sizes.width)
              .set(hash_height, sizes.height)
              .set(params.hash_images_sizes, params.image_sizes);
        }.bind(this),
        onError = function() {
          throw new Error('Error with image loading');
        },
        onProgress = JEZ.noop;

    if (img_index === 0) {
      start = 0;
      end = 2;
    } else if (img_index === params.number_pages - 1) {
      start = img_index - 1;
      end = img_index;
    } else {
      start = img_index - 1;
      end = img_index + 1;
    }

    for (img_num = start; img_num <= end; img_num++) {
      pos = params.loaded_images.page.indexOf(img_num);
      if (pos === -1) { // Image wasn't load
        
        (function(img_number) {
          var onComplete = function(event) {
            var el = event.target;

            if (params.page_width === null || params.page_height === null) {
              onCompleteNonExists(el);
            }

            this.createPage_(el, img_number);
            parameters.params.loaded_images.img.push(el);
            parameters.params.loaded_images.page.push(img_number);
            
          }.bind(this);

          (new ImageLoader(this.getImage(img_number), onComplete, onError, onProgress)).start();
        }.bind(this)(img_num));
      }
    }

    return this;
  };

  /**
   * Get image index.
   *
   * @method getImageIndex
   * @version 0.1.0
   * @param {Number} page_num
   * @returns {Number}
   */
  ebr_image_reader_single.getImageIndex = function(page_num) {
    var page = page_num || parameters.params.current_page;

    return (page - 1) >> 0;
  };
}(this));

/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(win) {
  'use strict';

  var EBR = win.EBookReader,
      JEZ = win.JEZ;

  /**
   * HTML Reader base.
   *
   * @class
   * @constructor
   * @version 0.1.0
   * @extends EBookReader.Reader
   **/
  EBR.HTMLReader = function() {
    EBR.Reader.call(this);
  };

  JEZ.inherits(EBR.HTMLReader, EBR.Reader);
}(this));
