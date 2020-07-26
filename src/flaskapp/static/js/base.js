$('#convertHud').click(function(){
    window.location.href='/hud';
});

$('#convertMain').click(function(){
    window.location.href='/main';
});

(function($) {
	"use strict";
	let fullHeight = function() {
		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});
	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});
})(jQuery);
