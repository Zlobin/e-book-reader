/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(global) {
  'use strict';

  var ImageLoader = global.ImageLoader,
      parameters = global.EBRParams,
      EBR = global.EBookReader,
      JEZ = global.JEZ,
      ebr_image_reader_single;

  // _ Screen Mode _____________________________________________________________

  EBR.ImageReader.ScreenMode = EBR.ImageReader.ScreenMode || {};

  // _ Single Screen Mode ______________________________________________________

  /**
   * Image reader single screen mode.
   *
   * @class
   * @version 0.2.0
   * @extends EBookReader.Reader.ScreenMode.Single
   * @param {object} sm_container
   * @param {object} page_view
   * @param {object} toolbar
   **/
  EBR.ImageReader.ScreenMode.Single = function(sm_container, page_view, toolbar, thumbnails) {
    this.sm_container = sm_container;
    this.page_view = page_view;
    this.toolbar = toolbar;
    this.thumbnails = thumbnails;
  };

  JEZ.inherits(EBR.ImageReader.ScreenMode.Single, EBR.Reader.ScreenMode.Single);
  ebr_image_reader_single = EBR.ImageReader.ScreenMode.Single.prototype;

  /**
   * Get image.
   *
   * @method getImage
   * @version 0.1.0
   * @param {number} img_num
   * @throws {Error} Image must be exist.
   * @returns {string}
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
   * @param {object} container
   * @param {number} page
   * @returns {object}
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
   * @param {string} type
   * @returns {object}
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
   * @param {object} $el
   * @param {number} zoom
   * @returns {object}
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
   * Rotate an image.
   *
   * @method turn
   * @version 0.1.0
   * @param {string} type
   * @returns {object}
   */
  ebr_image_reader_single.turn = function(type) {
    console.time('EBookReader.image_reader.single.turn ' + type);
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
    console.timeEnd('EBookReader.image_reader.single.turn ' + type);

    return this;
  };

  /**
   * Get page by scroll.
   *
   * @method getPageByScroll
   * @version 0.1.0
   * @param {object} container
   * @returns {number} page number
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
   * @param {object} img_obj
   * @param {number} img_num
   * @returns {object}
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
   * @param {object} img
   * @param {number} img_index
   * @returns {object}
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
      if (Object.prototype.hasOwnProperty.call(single.padding, padding_name)) {
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
   * @returns {object}
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
      'height': (global.innerHeight - this.toolbar.clientHeight - 1) + 'px'
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
   * @param {string} autofit
   * @param {string} type
   * @returns {object}
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
   * @returns {object}
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
        console.time('EBookReader.image_reader.single.loadImage #' + img_num);
        (function(img_number) {
          var onComplete = function(event) {
            var el = event.target;

            if (params.page_width === null || params.page_height === null) {
              onCompleteNonExists(el);
            }

            this.createPage_(el, img_number);
            parameters.params.loaded_images.img.push(el);
            parameters.params.loaded_images.page.push(img_number);
            console.timeEnd('EBookReader.image_reader.single.loadImage #' + img_number);
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
   * @param {number} page_num
   * @returns {number}
   */
  ebr_image_reader_single.getImageIndex = function(page_num) {
    var page = page_num || parameters.params.current_page;

    return (page - 1) >> 0;
  };
}(this));
