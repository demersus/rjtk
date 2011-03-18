/**
 * RJTK.ujs
 * Much of this code has been almost directly copied from
 * the jquery-ujs library. (https://github.com/rails/jquery-ujs)
 *
 * Author: Nik Petersen (Demersus)
 */
var RJTK = (function(core,$){
  var self = core.ujs = {};
  // Make sure that every Ajax request sends the CSRF token
  self.CSRFProtection = function(xhr) {
    var token = core.util.getCsrfToken();
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  };
  // Triggers an event on an element and returns the event result
  self.fire = function(obj, name, data) {
    var event = new $.Event(name);
    obj.trigger(event, data);
    return event.result !== false;
  };
  // Submits "remote" forms and links with ajax
  self.handleRemote = function(element) {
    var method, url, data,
    dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

    if (self.fire(element, 'ajax:before')) {
      if (element.is('form')) {
        method = element.attr('method');
        url = element.attr('action');
        self.fire(element,'ajax:beforeSerialize');
        data = element.serializeArray();
        // memoized value from clicked submit button
        var button = element.data('ujs:submit-button');
        if (button) {
          data.push(button);
          element.data('ujs:submit-button', null);
        }
      } else {
        method = element.data('method');
        url = element.attr('href');
        data = null;
      }
      $.ajax({
        url: url, type: method || 'GET', data: data, dataType: dataType,
        // stopping the "ajax:beforeSend" event will cancel the ajax request
        beforeSend: function(xhr, settings) {
          if (settings.dataType === undefined) {
            xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
          }
          return self.fire(element, 'ajax:beforeSend', [xhr, settings]);
        },
        success: function(data, status, xhr) {
          element.trigger('ajax:success', [data, status, xhr]);
        },
        complete: function(xhr, status) {
          element.trigger('ajax:complete', [xhr, status]);
        },
        error: function(xhr, status, error) {
          element.trigger('ajax:error', [xhr, status, error]);
        }
      });
    }
  };
  // Handles "data-method" on links such as:
  // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
  self.handleMethod = function(link) {
    var href = link.attr('href'),
    method = link.data('method'),
    csrf_token = core.util.getCsrfToken(),
    csrf_param = core.util.getCsrfParam(),
    form = $('<form method="post" action="' + href + '"></form>'),
    metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';

    if (csrf_param !== undefined && csrf_token !== undefined) {
      metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
    }

    form.hide().append(metadata_input).appendTo('body');
    form.submit();
  };

  self.disableFormElements = function(form) {
    form.find('input[data-disable-with], button[data-disable-with]').each(function() {
      var element = $(this), method = element.is('button') ? 'html' : 'val';
      element.data('ujs:enable-with', element[method]());
      element[method](element.data('disable-with'));
      element.attr('disabled', 'disabled');
    });
  };

  self.enableFormElements = function(form) {
    form.find('input[data-disable-with]:disabled, button[data-disable-with]:disabled').each(function() {
      var element = $(this), method = element.is('button') ? 'html' : 'val';
      if (element.data('ujs:enable-with')) element[method](element.data('ujs:enable-with'));
      element.removeAttr('disabled');
    });
  };

  self.allowAction = function(element) {
    var message = element.data('confirm');
    return !message || (self.fire(element, 'confirm') && confirm(message));
  };

  self.requiredValuesMissing = function(form) {
    var missing = false;
    form.find('input[name][required]').each(function() {
      if (!$(this).val()) missing = true;
    });
    return missing;
  };

  if ('ajaxPrefilter' in $) $.ajaxPrefilter(function(options, originalOptions, xhr){ self.CSRFProtection(xhr) });
  else $(document).ajaxSend(function(e, xhr){ self.CSRFProtection(xhr) });


  $('a[data-confirm], a[data-method], a[data-remote]').live('click.rails', function(e) {
    var link = $(this);
    if (!self.allowAction(link)) return false;

    if (link.attr('data-remote') != undefined) {
      self.handleRemote(link);
      return false;
    } else if (link.attr('data-method')) {
      self.handleMethod(link);
      return false;
    }
  });

  $('form').live('submit.rjtk_ujs', function(e) {
    var form = $(this), remote = form.attr('data-remote') != undefined;
    if (!self.allowAction(form)) return false;

    // skip other logic when required values are missing
    if (self.requiredValuesMissing(form)) return !remote;

    if (remote) {
      self.handleRemote(form);
      return false;
    } else {
      // slight timeout so that the submit button gets properly serialized
      setTimeout(function(){ self.disableFormElements(form) }, 13);
    }
  });

  $('form input[type=submit], form button[type=submit], form button:not([type])').live('click.rails', function() {
    var button = $(this);
    if (!self.allowAction(button)) return false;
    // register the pressed submit button
    var name = button.attr('name'), data = name ? {name:name, value:button.val()} : null;
    button.closest('form').data('ujs:submit-button', data);
  });

  $('form').live('ajax:beforeSend.rjtk_ujs', function(event) {
    if (this == event.target) self.disableFormElements($(this));
  });

  $('form').live('ajax:complete.rjtk_ujs', function(event) {
    if (this == event.target) self.enableFormElements($(this));
  });
  
  // Many wysiwyg editors with a jquery interface will listen to this
  // event to save the generated html back to the textarea.
  $('form').live('ajax:beforeSerialize.form-plugin-compat',function(e){
    $(this).trigger('form-pre-serialize',[this]);
  });

  return core;

})(RJTK || {},jQuery);
