/**
 * rjtk.forms
 * Tools for working with remote forms and such
 *
 * Author: Nik Petersen (Demersus)
 *
 * The remoteDialog depends on a dialog/modal handler. (dialog.jqui, dialog.foundation).
 */

var RJTK = (function(self,$){
  self.forms = {
    remoteDialog: function(url,params,context){
      var dlg = RJTK.dialog.new(params);

      if (context == undefined) {
        context = dlg;
      }
      var options = $.extend({
        onSuccess: function(data,dlg){
          dlg.trigger('rjtk:dialog:close');
        }				
      },params || {});
     	
			if(dlg != context) $(context).trigger('loading');

			$.get(url, function(data){
        dlg.setContent(data);
        
				var form = dlg.find('form');
        
				// Use our nice jquery ujs extensions
        form.attr({'data-remote': true, 'data-type': 'json'});
        
				form.bind('ajax:beforeSend',function(event,xhr,settings){

          form.trigger('loading');
          if(typeof options['beforeSend'] == 'function') options.beforeSend.call(context,event,xhr,settings,dlg);
					if(dlg != context) $(context).trigger('rjtk:remoteForm:beforeSend', [xhr,settings,dlg]);

        }).bind('ajax:success',function(event,data, status, xhr){

					if(typeof options['onSuccess'] == 'function') options.onSuccess.call(context,data,dlg);
					if(dlg != context) $(context).trigger("rjtk:remoteForm:success",[data,dlg]);

        }).bind('ajax:error',function(xhr, event, status, error){

          form.trigger('loaded');
					if(typeof options['onError'] == 'function') options.onError.call(context,xhr,dlg);
					if(dlg != context) $(context).trigger("rjtk:remoteForm:error",[xhr,dlg]);

				});
        
				if(dlg != context) $(context).trigger('loaded');
				dlg.trigger('rjtk:dialog:open');

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
        var err = $.parseJSON(xhr.responseText) || [];
        if (err['errors']) err = err['errors'];
       	return err;
      } else {
        return [];
      }
    },
    injectValidationErrors: function(form,errors) {
      var ctx = $(form);
      $.each(errors, function(field,msg){
          var fld = $('[name$="' + self.forms.attributeNameToFieldName(field) + '"]', ctx);
	  if (!(fld.length > 0)) {
	    // This is for attributes with 'relation_id' and errors on 'relation'
	    fld = $('[name$="' + self.forms.attributeNameToFieldName(field).replace(/\[(\w+)(?=\])(?!\]\[)/,"[$1_id") + '"]', ctx); 
	  }
          self.forms.addErrors(fld,msg);
      });
    },
    attributeNameToFieldName: function(n){
	return "[" + n.replace('.',"_attributes][") + "]";
    },
    removeValidationErrors: function(form) {
      var ctx = $(form);
      self.forms.findErrors(ctx).each(function(){
        self.forms.removeErrors($(this));
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
    },
    // add errors to field (Overridable)
    addErrors: function(fld,errors){
      if(typeof errors == "object") errors = errors.join(', ');
      fld.after('<p class="inline-errors">' + errors + '</p>');
      fld.parent().addClass('error');
    },
    // This is passed each error object found in 'fetchErrors' as a jQuery object
    removeErrors: function(context) {
      context.parent().removeClass('error');
      context.remove();
    },
    // find error group (Overridable jquery object)
    // context is either form, or field wrapper.
    findErrors: function(context) {
      return context.find('p.inline-errors'); 
    },
    
  };

	/**
	 * These events will inject returned validation errors on remote forms (dialog or not)
	 */
  $(document).on('ajax:error.rjtk_forms','form',function(event,xhr,status,error){
    var contentType = xhr.getResponseHeader('Content-Type');
    if(contentType && contentType.indexOf('json') > -1){
      self.forms.injectAjaxErrors(this,xhr);
    }
  });
  $(document).on('ajax:beforeSend.rjtk_forms','form', function(event,xhr, settings){
    self.forms.removeValidationErrors(this);
  });

  return self;
})(RJTK || {},jQuery);
