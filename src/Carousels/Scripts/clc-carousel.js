(function ($) {
    $(function () {

        $('.jcarousel').jcarousel({
            wrap: 'circular'
        });

        $('.jcarousel-control-prev').click(function () {
            $('.jcarousel').jcarousel('scroll', '-=6');
        });

        $('.jcarousel-control-next').click(function () {
            $('.jcarousel').jcarousel('scroll', '+=6');
        });
    });
})(jQuery);

//(function ($) {
//    $(function () {
//        $('.jcarousel').jcarousel();

//        $('.jcarousel-control-prev')
//            .on('jcarouselcontrol:active', function () {
//                $(this).removeClass('inactive');
//            })
//            .on('jcarouselcontrol:inactive', function () {
//                $(this).addClass('inactive');
//            })
//            .jcarouselControl({
//                target: '-=6'
//            });

//        $('.jcarousel-control-next')
//            .on('jcarouselcontrol:active', function () {
//                $(this).removeClass('inactive');
//            })
//            .on('jcarouselcontrol:inactive', function () {
//                $(this).addClass('inactive');
//            })
//            .jcarouselControl({
//                target: '+=6'
//            });

//        $('.jcarousel-pagination')
//            .on('jcarouselpagination:active', 'a', function () {
//                $(this).addClass('active');
//            })
//            .on('jcarouselpagination:inactive', 'a', function () {
//                $(this).removeClass('active');
//            })
//            .jcarouselPagination();
//    });
//})(jQuery);


function callback(data) {
    data = $.parseJSON(data);
    $.each(data.Items, function (i, item) {
        $(".jcarousel ul").append($("<li>", { class: "carousel-item", role: "option" }).append($("<a>", { href: item.CatalogLink, target: "_blank", class: "carousel-link" }).append($("<img>", { src: item.ImageUrl, class: "carousel-image" }))));
    });
}