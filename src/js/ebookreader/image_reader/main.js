/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(global, undef) {
  'use strict';

  var parameters = global.EBRParams,
      EBR = global.EBookReader,
      JEZ = global.JEZ,
      doc = global.document,
      ebr_image_reader,
      __; // Localization

  /**
   * Image Reader base.
   *
   * @class
   * @constructor
   * @version 0.1.1
   * @extends EBookReader.Reader
   **/
  EBR.ImageReader = function() {
    EBR.Reader.call(this);
    var params = parameters.params,
        storage = JEZ.storage,
        opts = parameters.options;

    this.IMAGE_TYPE_PRINT_LETTER = 'print_letter';
    this.IMAGE_TYPE_PRINT_A4 = 'print_a4';
    this.IMAGE_TYPE_SINGLE = 'single';
    this.IMAGE_TYPE_DUAL = 'dual';

    this.toolbar_paginator = {};
    this.print_wrapper = {};
    this.sm_container = {};
    this.screen_mode = {};
    this.page_view = {};
    this.thumbnails = {};
    this.wrapper = {};
    this.toolbar = {};

    __ = JEZ.__(opts.locale);

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

    console.time('EBookReader setup and render');
    this.initFullScreenHandler_()
        .createWrapper_()
        .createToolbar_()
        .initToolbarPagination_()
        .createThumbnails_()
        .createPageView_()
        .createScreenModeContainer_()
        .changeScreenMode_(params.set_screen_mode)
        .initEvents_()
        .setupResizeEvent_()
        .setupKeyListener_()
        .render_();
    console.timeEnd('EBookReader setup and render');

    parameters.params.page_height = storage.get(this.getHash_() + '_height', null);
    parameters.params.page_width = storage.get(this.getHash_() + '_width', null);
    this.changeStateScreenModeButtons_()
        .gotoPage(params.current_page);

    if (JEZ.is_mobile) {
      this.addMobileFeatures_();
    }
    
    if (params.enable_thumbnails) {
      this.showThumbnails_();
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
   * @returns {object}
   **/
  ebr_image_reader.initEvents_ = function() {
    var opts = parameters.options;

    this.initToolbarPaginationEvents_()
        .initToolbarButtons_()
        .initToolbarVisibility_()
        .initScrollEvent_()
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
   * @returns {object}
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
   * @returns {object}
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
   * Get hash.
   *
   * @private
   * @method getHash_
   * @version 0.1.0
   * @returns {object}
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
   * Create div wrapper.
   *
   * @private
   * @method createWrapper_
   * @version 0.1.0
   * @returns {object}
   **/
  ebr_image_reader.createWrapper_ = function() {
    this.wrapper = JEZ.dom('div').create({
      'className': 'EBR_wrapper',
      'id': 'EBR_wrapper'
    });

    return this;
  };

  /**
   * Create toolbar's div element and append into wrapper.
   *
   * @private
   * @method createToolbar_
   * @version 0.1.0
   * @returns {object}
   **/
  ebr_image_reader.createToolbar_ = function() {
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
   * @returns {object}
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
   * @returns {object}
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
            'enable': false,
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
            'enable': false,
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

                data.thumbnailsBlock(type);
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
      if (Object.prototype.hasOwnProperty.call(buttons, button)) {
        if (buttons[button].enable !== false) {
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
    }

    for (toolbar_button in toolbar_buttons) {
      if (Object.prototype.hasOwnProperty.call(toolbar_buttons, toolbar_button)) {
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
   * @param {object} button
   * @param {object} events
   * @returns {object}
   **/
  ebr_image_reader.initToolbarButtonEvents_ = function(button, events) {
    var event_name,
        $button = JEZ.dom(button);

    for (event_name in events) {
      if (Object.prototype.hasOwnProperty.call(events, event_name)) {
        $button.on(event_name, events[event_name], this);
      }
    }

    return this;
  };

  /**
   * ThumbnailsBlock.
   *
   * @private
   * @method thumbnailsBlock
   * @version 0.1.0
   * @param {string} status
   * @returns {object}
   **/
  ebr_image_reader.thumbnailsBlock = function(status) {
    var method = status === 'on' ? 'show' : 'hide';

    this[method + 'Thumbnails_']();
    parameters.params.enable_thumbnails = !parameters.params.enable_thumbnails;
    this.updateURLHash({
      'name': 'thumbnails',
      'value': parameters.params.enable_thumbnails ? 1 : 0
    }, parameters.consts.TYPE_PARTLYREPLACE);

    return this;
  };

  /**
   * Create thumbnails.
   *
   * @private
   * @method createThumbnails_
   * @version 0.1.0
   * @returns {object}
   **/
  ebr_image_reader.createThumbnails_ = function() {
    this.thumbnails = JEZ.dom('div').create({
      'className': 'EBR_thumbnails',
      'id': 'EBR_thumbnails'
    });

    JEZ.dom(this.wrapper).append(this.thumbnails);

    return this;
  };

  /**
   * Show thumbnails.
   *
   * @private
   * @method showThumbnails_
   * @version 0.1.0
   * @returns {object}
   **/
  ebr_image_reader.showThumbnails_ = function() {
    var opts = parameters.options,
        thumbnails = opts.thumbnails_images,
        len = thumbnails.length,
        i,
        thumbnail;

     JEZ.dom(this.thumbnails).set('style', {
      'display': 'block',
      'width': opts.thumbnails_width + 30 + 'px',
      'height': JEZ.dom(this.page_view).get('style', 'height')
    });

    for (i = 0; i < len; i++) {
      thumbnail = this.addThumbnail_(thumbnails[i], i);
      JEZ.dom(this.thumbnails).append(thumbnail);
    }

    return this;
  };

  /**
   * Add thumbnail.
   *
   * @private
   * @method addThumbnail_
   * @version 0.1.0
   * @param {string} img
   * @param {number} num
   * @returns {object}
   **/
  ebr_image_reader.addThumbnail_ = function(img, num) {
    var thumbnail_wrapper = JEZ.dom('div').create({
          'className': 'EBR_thumbnails_wrapper'
        }),
        thumbnail = JEZ.dom('img').create({
          'id': 'EBRthumbnail_' + num,
          'className': 'EBR_thumbnail_img',
          'src': img
        });

    JEZ.dom(thumbnail)
      .set('style', {
        'width': parameters.options.thumbnails_width + 'px'
      })
      .on('click', function(event, data) {
        event.preventDefault();
        var $active = JEZ.dom('.EBR_thumbnail_img.active').find();

        if ($active.el !== null) {
          $active.removeClass('active');
        }

        JEZ.dom(event.target).addClass('active');

        data.gotoPage(num + 1);
      }, this);

    JEZ.dom(thumbnail_wrapper).append(thumbnail);

    return thumbnail_wrapper;
  };

  /**
   * Hide thumbnails.
   *
   * @private
   * @method hideThumbnails_
   * @version 0.1.0
   * @returns {object}
   **/
  ebr_image_reader.hideThumbnails_ = function() {
    JEZ.dom(this.thumbnails).set('style', {
      'display': 'none'
    });

    return this;
  };

  /**
   * Setup resize event. Recalculate image sizes after resizing browser's window.
   *
   * @private
   * @method setupResizeEvent_
   * @version 0.1.0
   * @returns {object}
   */
  ebr_image_reader.setupResizeEvent_ = function() {
    global.onresize = function() {
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
   * @returns {object}
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
          var key = JEZ.keys;

          switch (event.keyCode) {
            case key.LEFT:
              data.previousPage();
              break;
            case key.RIGHT:
              data.nextPage();
              break;
            case key.HOME:
              data.firstPage();
              break;
            case key.END:
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
   * @returns {object}
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
   * @returns {object}
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
   * @returns {object}
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
   * @returns {object}
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
            '    ' + __('Pages from') + ' ',
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
   * @param {string} page_size
   * @param {array} images
   * @returns {object}
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
   * @returns {object}
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
   * @param {number} start_index
   * @param {number} end_index
   * @param {string} paper_size
   * @returns {object}
   **/
  ebr_image_reader.sendPrint = function(start_index, end_index, paper_size) {
    var print_window = global.open('#', '_blank'),
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
   * @returns {object}
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
   * @returns {object}
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
   * @returns {object}
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
   * @returns {object}
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
   * @returns {object}
   **/
  ebr_image_reader.render_ = function() {
    var class_name = JEZ.is_mobile ? 'mobile' : 'non_mobile',
        $root_el = JEZ.dom(parameters.root_element);

    $root_el
        .addClass(class_name)
        .append(this.wrapper);

    if (parameters.options.auto_height) {
      JEZ.dom(this.page_view).set('style', {
        'height': global.innerHeight - this.toolbar.offsetHeight + 'px'
      });
    }

    return this;
  };

  /**
   * Update toolbar paginator.
   *
   * @method updateToolbarPaginator
   * @version 0.1.0
   * @param {number} page
   * @returns {object}
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
   * @param {string} status
   * @returns {object}
   **/
  ebr_image_reader.fullScreen = function(status) {
    console.time('EBookReader.image_reader.fullscreen ' + status);
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

    console.timeEnd('EBookReader.image_reader.fullscreen ' + status);
    return this;
  };

  /**
   * Init fullscreen handler.
   *
   * @private
   * @method initFullScreenHandler_
   * @version 0.1.0
   * @returns {object}
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
   * @param {string} status
   * @returns {object}
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
   * @version 0.2.0
   * @param {string} mode
   * @throws {Error} Screen mode must be exist.
   * @returns {object}
   **/
  ebr_image_reader.changeScreenMode_ = function(mode) {
    var consts = parameters.consts;

    if (parameters.params.current_screen_mode !== mode) {
      if (mode === consts.SINGLE_MODE) {
        this.screen_mode = new EBR.ImageReader.ScreenMode.Single(this.sm_container,
            this.page_view, this.toolbar, this.thumbnails);
      } else if (mode === consts.DUAL_MODE) {
        this.screen_mode = new EBR.ImageReader.ScreenMode.Dual(this.sm_container,
            this.page_view, this.toolbar, this.thumbnails);
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
   * @returns {object}
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
   * @param {array} buttons
   * @returns {object}
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
   * @version 0.1.1
   * @returns {object}
   **/
  ebr_image_reader.addMobileFeatures_ = function() {
    this.removeToolbarButtons_([
      'EBR_button_thumbnails',
      'EBR_button_zoom_out',
      'EBR_button_zoom_in',
      'EBR_button_fullscreen'
    ]);

    // Touch scroll.
    JEZ.touchScrolling(this.page_view);

    // Change color depending on the light.
    // @see {@link http://www.w3.org/TR/ambient-light/|W3.org}
    JEZ.dom(global).on('devicelight', function(event) {
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

    return this;
  };

  /**
   * Enable or disable invert.
   *
   * @method invert
   * @version 0.1.0
   * @param {string} status
   * @returns {object}
   */
  ebr_image_reader.invert = function(status) {
    console.time('EBookReader.image_reader.single.invert ' + status);
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

    console.timeEnd('EBookReader.image_reader.single.invert ' + status);
    return this;
  };

  /**
   * Go to page.
   *
   * @method gotoPage
   * @version 0.1.0
   * @param {number} page_num
   * @param {string} from
   * @throws {Error} Page must be exist.
   * @returns {object}
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
