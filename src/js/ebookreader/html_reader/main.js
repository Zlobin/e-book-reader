/* jslint bitwise: true, nomen: true, plusplus: true, white: true, indent: 2, maxlen: 120 */

(function(global) {
  'use strict';

  var EBR = global.EBookReader,
      JEZ = global.JEZ;

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
