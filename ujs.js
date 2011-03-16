/**
 * RJTK.ujs
 * Much of this code has been almost directly copied from
 * the jquery-ujs library. (https://github.com/rails/jquery-ujs)
 *
 * Author: Nik Petersen (Demersus)
 */
var RJTK = (function(self,$){
  self.ujs = {
    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(fn) {
      var token = self.util.getCsrfToken();
      if (token) fn(function(xhr) { xhr.setRequestHeader('X-CSRF-Token', token) });
    },
    // Triggers an event on an element and returns the event result
    fire: function(obj, name, data) {
      var event = new $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },
    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data,
        dataType = element.attr('data-type') || ($.ajaxSettings && $.ajaxSettings.dataType);

      if (element.is('form')) {
        method = element.attr('method');
        url = element.attr('action');
        data = element.serializeArray();
        // memoized value from clicked submit button
        var button = element.data('ujs:submit-button');
        if (button) {
          data.push(button);
          element.data('ujs:submit-button', null);
        }
      } else {
        method = element.attr('data-method');
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
          return self.ujs.fire(element, 'ajax:beforeSend', [xhr, settings]);
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
    },
    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = link.attr('href'),
        method = link.attr('data-method'),
        csrf_token = self.util.getCsrfToken(),
        csrf_param = self.util.getCsrfToken(),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrf_param !== undefined && csrf_token !== undefined) {
        metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
      }

      form.hide().append(metadata_input).appendTo('body');
      form.submit();
    },
    disableFormElements: function(form) {
      form.find('input[data-disable-with]').each(function() {
        var input = $(this);
        input.data('ujs:enable-with', input.val())
          .val(input.attr('data-disable-with'))
          .attr('disabled', 'disabled');
      });
    },
    enableFormElements: function(form) {
      form.find('input[data-disable-with]').each(function() {
        var input = $(this);
        input.val(input.data('ujs:enable-with')).removeAttr('disabled');
      });
    },
    allowAction:  function(element) {
      var message = element.attr('data-confirm');
      return !message || (self.ujs.fire(element, 'confirm') && self.confirm(message));
    },
    requiredValuesMissing: function(form) {
      var missing = false;
      form.find('input[name][required]').each(function() {
        if (!$(this).val()) missing = true;
      });
      return missing;
    }
  };


  if ($().jquery == '1.5') { // gruesome hack
    var factory = $.ajaxSettings.xhr;
    $.ajaxSettings.xhr = function() {
      var xhr = factory();
      self.ujs.CSRFProtection(function(setHeader) {
        var open = xhr.open;
        xhr.open = function() { open.apply(this, arguments); setHeader(this) };
      });
      return xhr;
    };
  }
  else $(document).ajaxSend(function(e, xhr) {
    self.ujs.CSRFProtection(function(setHeader) { setHeader(xhr) });
  });
  
  $('a[data-confirm], a[data-method], a[data-remote]').live('click.rails', function(e) {
    var link = $(this);
    if (!self.allowAction(link)) return false;

    if (link.attr('data-remote') != undefined) {
      self.ujs.handleRemote(link);
      return false;
    } else if (link.attr('data-method')) {
      self.ujs.handleMethod(link);
      return false;
    }
  });

  $('form').live('submit.rjtk_ujs', function(e) {
    var form = $(this), remote = form.attr('data-remote') != undefined;
    if (!self.ujs.allowAction(form)) return false;

    // skip other logic when required values are missing
    if (self.ujs.requiredValuesMissing(form)) return !remote;

    if (remote) {
      self.ujs.handleRemote(form);
      return false;
    } else {
      // slight timeout so that the submit button gets properly serialized
      setTimeout(function(){ self.ujs.disableFormElements(form) }, 13);
    }
  });

  $('form input[type=submit], form button[type=submit], form button:not([type])').live('click.rails', function() {
    var button = $(this);
    if (!self.ujs.allowAction(button)) return false;
    // register the pressed submit button
    var name = button.attr('name'), data = name ? {name:name, value:button.val()} : null;
    button.closest('form').data('ujs:submit-button', data);
  });

  $('form').live('ajax:beforeSend.rjtk_ujs', function(event) {
    if (this == event.target) self.ujs.disableFormElements($(this));
  });

  $('form').live('ajax:complete.rjtk_ujs', function(event) {
    if (this == event.target) self.ujs.enableFormElements($(this));
  });

  return self;

})(RJTK || {},jQuery);
