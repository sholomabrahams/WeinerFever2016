var winHeight, topHeight, bottomHeight, wrapHeight;
function size() {
	winHeight = $(window).height();
	topHeight = $("nav.navbar").height() + 15;
	bottomHeight = $("footer#page-foot").height();
	//console.log(topHeight + "   " + bottomHeight);
	wrapHeight = winHeight - topHeight - bottomHeight;
	$("#outer-wrap").css('minHeight', wrapHeight);
	//$("#set-games aside.roster").css('maxHeight', (wrapHeight));
	$("<style type='text/css'>#set-games aside.roster { max-height: " + wrapHeight + "px }</style>").appendTo('body');
}

$(window).resize(size);
$("#page-foot").prepend('<iframe src="https://www.spreaker.com/embed/player/mini?show_id=1294893&autoplay=false" style="width: 100%; height: 71px;" frameborder="0" scrolling="no"></iframe>');
