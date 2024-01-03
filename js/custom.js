/*  Theme Name: Oflox - Responsive Multipurpose Business Template
    Author: Saptavarana
    Version: 1.0.0
    Created:September 2018
    File Description:Main Js file of the template
*/

$(window).on("scroll",function(){$(window).scrollTop()>=50?$(".sticky").addClass("stickyadd"):$(".sticky").removeClass("stickyadd")}),$(".navbar-nav a, .scroll_down a").on("click",function(t){var a=$(this);$("html, body").stop().animate({scrollTop:$(a.attr("href")).offset().top-0},1500,"easeInOutExpo"),t.preventDefault()}),$("#navbarCollapse").scrollspy({offset:20}),$("#testi").owlCarousel({autoPlay:28e3,items:1,itemsDesktop:[1199,1],itemsDesktopSmall:[979,3]}),$(".img-zoom").magnificPopup({type:"image",closeOnContentClick:!0,mainClass:"mfp-fade",gallery:{enabled:!0,navigateByImgClick:!0,preload:[0,1]}}),$(".features_video").magnificPopup({disableOn:700,type:"iframe",mainClass:"mfp-fade",removalDelay:160,preloader:!1,fixedContentPos:!1}),$(window).on("load",function(){var t=$(".work-filter"),a=$("#menu-filter");t.isotope({filter:"*",layoutMode:"masonry",animationOptions:{duration:750,easing:"linear"}}),a.find("a").on("click",function(){var o=$(this).attr("data-filter");return a.find("a").removeClass("active"),$(this).addClass("active"),t.isotope({filter:o,animationOptions:{animationDuration:750,easing:"linear",queue:!1}}),!1})});var a=0;$(window).on("scroll",function(){
    var t=$("#counter").offset().top-window.innerHeight;
    0==a&&$(window).scrollTop()>t&&($(".counter_value").each(function(){var t=$(this),a=t.attr("data-count");
    $({countNum:t.text()}).animate({countNum:a},{duration:2e3,easing:"swing",step:function(){t.text(Math.floor(this.countNum))},complete:function(){t.text(this.countNum)}})}),a=1)});