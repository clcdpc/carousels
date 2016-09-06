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


function callback(data) {
    data = $.parseJSON(data);
    $.each(data.Items, function (i, item) {
        $(".jcarousel ul").append($("<li>", { class: "carousel-item", role: "option" }).append($("<a>", { href: item.CatalogLink, target: "_blank", class: "carousel-link" }).append($("<img>", { src: item.ImageUrl, class: "carousel-image" }))));
    });
}