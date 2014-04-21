/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

// Asynchronous loading of images
var ImageLoader = (function(win, JEZ, undef) {
  'use strict';

  return function(img_src, onComplete, onError, onProgress) {
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
}(this, this.JEZ));
