

var RJTK = (function(self,$){
	self.dialog = {
		new: function(options) {
			var $dlg = $("<div/>",{'class': 'reveal-modal'}).appendTo('body');
			$dlg.append('<div class="reveal-modal-inner"></div>');
			$dlg.append('<a class="close-reveal-modal">&#215;</a>');

			$dlg.on('rjtk:dialog:open',function(e){
				$dlg.reveal();
			});

			$dlg.on('rjtk:dialog:close',function(e){
				$dlg.trigger('reveal:close');
			});

			$dlg.setContent = function(content) {
				$dlg.find('.reveal-modal-inner').html(content);
			}

			return $dlg;
		}
	};

	return self;
})(RJTK || {},jQuery);
