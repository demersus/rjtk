/*
 * Jquery UI driver for RJTK internals
 *
 */


var RJTK = (function(self,$){
	self.dialog = {
		new: function(options){
			var $dlg = $('<div/>').appendTo('body').hide();
			$dlg.dialog($.extend({
				autoOpen: false,
				modal: true},options || {});

			$dlg.on('rjtk:dialog:open',function(e) {
				$dlg.dialog("open");
			});

			$dlg.on('rjtk:dialog:close',function(e) {
				$dlg.dialog("close");
			});

			$dlg.on('dialogopen.rjtk_dialog',function(e) {
				$dlg.trigger('rjtk:dialog:opened');
			});

			$dlg.on('dialogclose.rjtk_dialog',function(e) {
				$dlg.trigger('rjtk:dialog:closed');
			});

			$dlg.setContent = function(content) {
				$dlg.html(content);
			}
			return $dlg;
		}
	};

	return self;

})(RJTK || {},jQuery);
