/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

/**
 * eBookReader
 * Updated: @@DATE
 * @author Eugene Zlobin http://zlobin.pro/
 * @version @@VERSION
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
   * @version @@VERSION
   * @param {Object} user_options
   */
  EBookReader = function(user_options) {
    console.time('EBookReader full init');
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
    this.VERSION = '@@VERSION';

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

    console.timeEnd('EBookReader full init');
    return;
  };

  win.EBookReader = EBookReader;
  win.EBRParams = parameters;
}(this));
