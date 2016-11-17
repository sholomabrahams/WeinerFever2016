var winHeight, winWidth, topHeight, bottomHeight, wrapHeight;
function size() {
	winHeight = $(window).height();
	winWidth = $(window).width();
	if (winWidth > 991) {
		topHeight = 98;
	} else if (winWidth > 767) {
		topHeight = 90;
	} else {
		topHeight = 65;
	}
	bottomHeight = 71;
	//console.log(topHeight + "   " + bottomHeight);
	wrapHeight = winHeight - topHeight - bottomHeight;
	$("#outer-wrap").css('minHeight', wrapHeight);
	//$("#set-games aside.roster").css('maxHeight', (wrapHeight));
	$(".script-style").remove();
	if (!(window.location.pathname.substr(1, 5) != "admin")) {
		$("<style type='text/css' class='script-style'>#set-games section#center { max-height: " + wrapHeight + "px; } #set-time { min-height: " + wrapHeight + "px; }</style>").appendTo('head');
		wrapHeight-= 55;
		$("<style type='text/css' class='script-style'>#set-games aside.roster #table-wrap { max-height: " + wrapHeight + "px }</style>").appendTo('head');
	};
}

$(window).resize(size);
$("#page-foot").prepend('<iframe src="https://www.spreaker.com/embed/player/mini?show_id=1294893&autoplay=false" style="padding: 0; height: 71px;" frameborder="0" scrolling="no" class="col-xs-12 col-sm-12 col-md-12 col-lg-8"></iframe>');
