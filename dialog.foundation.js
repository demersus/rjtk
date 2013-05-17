

var RJTK = (function(self,$){
	'use strict';
	self.dialog = {
		newDialog: function(options) {
			var $dlg = $("<div/>",{'class': 'reveal-modal'}).appendTo('body');
			$dlg.html('<a class="close-reveal-modal">&#215;</a><div class="reveal-modal-inner"></div>');

			$dlg.on('rjtk:dialog:open',function(e){
				$dlg.foundation('reveal','open');
			});

			$dlg.on('rjtk:dialog:close',function(e){
				$dlg.trigger('reveal:close');
			});

			$dlg.on('reveal:closed.rjtk_dialog',function(e){
				$dlg.trigger('rjtk:dialog:closed');
			});

			$dlg.on('reveal:opened.rjtk_dialog', function(e) {
				$dlg.trigger('rjtk:dialog:opened');
			});

			$dlg.setContent = function(content) {
				$dlg.find('.reveal-modal-inner').html(content);
			};

			return $dlg;
		}
	};

	return self;
}(RJTK || {},jQuery));
