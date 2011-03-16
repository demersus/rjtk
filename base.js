/**
 * RJTK = (Rails,jQuery,Tool,Kit)
 *
 */

// Setup namespace and base functions (may be overridden)

var RJTK = (function(self,$) {

  self.util = {
    getCsrfToken: function() {
      $('meta[name="csrf-token"]').attr('content');
    },
    getCsrfParam: function() {
     $('meta[name=csrf-param]').attr('content')
    },
    fillSelect: function(sel,data, opts) {
      if (typeof opts == undefined) {
          opts = {};
      }
      var options = $.extend({
          include_blank: true,
          blank_text: ''
      }, opts);
      var html = '';
      if (options['include_blank']) {
          html += '<option value="">' + options['blank_text'] + '</option>';
      }
      $.each(data, function(){
          html += '<option value="' + this[1]+ '">' + this[0] + '</option>';
      });
      $(sel).html(html);
      return sel;
    },
    fillSelectAjax: function(sel,url,params,callback) {
      $(sel).html('');
      if (typeof params == 'undefined') {
          params = {};
      }
      $.getJSON(url, params, function(data){
          self.util.fillSelect(sel,data);
          if (typeof callback != 'undefined') {
            callback(data);
          }
      });
    }
  };


  $.ajaxSetup({
    dataFilter: function(data, type){
    if (type == 'json') {
        return (!data || ($.trim(data) == '')) ? '{}' : data;
      } else {
        return data
      }
    }
  });
      
  return self;
}(RJTK || {}, jQuery));