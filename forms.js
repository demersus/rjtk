/**
 * rjtk.forms
 * Tools for working with remote forms and such
 *
 * Author: Nik Petersen (Demersus)
 *
 * The remoteDialog depends on jqueryui, and the bundled ujs driver - or similar ujs API.
 * Some of these functions assume use of formtastic too,
 *  please override if your setup does not.
 */

var RJTK = (function(self,$){
  self.forms = {
    remoteDialog: function(url,params,context){
      var dlg = $('<div/>').appendTo('body').hide();
      if (context == undefined) {
        context = dlg;
      }
      var options = $.extend({
        success: function(){
          dlg.dialog('close');
        },
        error: function(){},
        beforeSend: function(){},
        title: '',
        width: 600,
        modal: true
      },params || {});
      $.get(url, function(data){
        dlg.html(data);
        var form = dlg.find('form');
        // Use our nice jquery ujs extensions
        form.attr({'data-remote': true, 'data-type': 'json'});
        form.bind('ajax:beforeSend',function(event,xhr,settings){
          form.hide();
          form.after('<h2 class="loading">Saving...</h2>');
          options.beforeSend.call(context,event,xhr,settings,dlg)
        }).bind('ajax:success',function(event,data, status, xhr){
          options.success.call(context,data,dlg);
        }).bind('ajax:error',function(xhr, event, status, error){
          form.show();
          form.next('h2.loading').remove();
          options.error.call(context,xhr,dlg);
        });
        dlg.dialog(options);
      });
      return dlg;
    },
    injectAjaxErrors: function(form,xhr) {
        self.forms.injectValidationErrors(form,
                self.forms.groupValidationErrors(
                        self.forms.extractAjaxErrors(xhr)));
    },
    extractAjaxErrors: function(xhr){
      if(xhr.responseText) {
        return $.parseJSON(xhr.responseText) || [];
      } else {
        return [];
      }
    },
    injectValidationErrors: function(form,errors) {
      var ctx = $(form);
      $.each(errors, function(field,msg){
          var fld = $('[name$="' + self.forms.attributeNameToFieldName(field) + '"]', ctx);
          var parent = fld.closest('li');
          var errorP = $('p.inline-errors',parent);
          if (errorP.length == 0){
              errorP = $('<p/>').addClass('inline-errors');
              errorP.appendTo(parent);
          }
          if(typeof msg == "object") msg = msg.join(', ');
          errorP.append(msg);
      });
    },
    attributeNameToFieldName: function(n){
	return "[" + n.replace('.',"_attributes][") + "]";
    },
    removeValidationErrors: function(form) {
      var ctx = $(form);
      $('.inline-errors',ctx).each(function(){
        // Assuming default formtastic layout
        $(this).closest('li').removeClass('error');
        $(this).remove();
      });
    },
    groupValidationErrors: function(errors) {
      /**
       * This method exists for rails 2.3 compatibility.
       * Override this function with the code below to use
       * with rails version < 3.0
       *
       *    var field_errors = {};
       *    jQuery.each(errors, function(field,message){
       *        if (typeof field_errors[field] != Array) {
       *            field_errors[field] = [];
       *         }
       *        field_errors[field].push(message);
       *     });
       *     return field_errors
       *
       */
      return errors;
    }
  };

  $('form').live('ajax:error.rjtk_forms',function(event,xhr, status, error){
    var contentType = xhr.getResponseHeader('Content-Type');
    if(contentType && contentType.indexOf('json') > -1){
      self.forms.injectAjaxErrors(this,xhr);
    }
  });
  $('form').live('ajax:success.rjtk_forms', function(){
	$(this).resetForm();
  });
  $('form').live('ajax:beforeSend.rjtk_forms', function(event,xhr, settings){
    self.forms.removeValidationErrors(this);
  });

  return self;
})(RJTK || {},jQuery);
