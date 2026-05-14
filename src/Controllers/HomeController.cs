using System.Diagnostics;
using Carousels.Abstractions;
using Carousels.Domain;
using Carousels.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Carousels.Controllers
{
    public partial class HomeController(ILogger<HomeController> logger, ICarouselItemProvider carouselItemProvider, ICatalogLinkProvider catalogLinkProvider, ICoverImageProvider coverImageProvider) : Controller
    {
        private readonly ILogger<HomeController> _logger = logger;

        public IActionResult jsonp(string callback, int rsid, string size = "S")
        {
            var items = carouselItemProvider.GetItems(rsid).ToList();
            var imageSize = Enum.TryParse<CoverImageSize>(size, true, out var parsedSize) ? parsedSize : CoverImageSize.S;
            var carousel = new Carousel
            {
                Name = items.FirstOrDefault()?.RecordSetName ?? string.Empty,
                Items = items.Select(b => b.ToCarouselItem(coverImageProvider, catalogLinkProvider, imageSize))
            };
            var json = JsonConvert.SerializeObject(carousel, new JsonSerializerSettings { StringEscapeHandling = StringEscapeHandling.EscapeNonAscii });

            if (callback == "callback")
            {
                var jsonpPayload = string.Format("callback('{0}')", json.Replace(@"\\'", @"\'"));
                return Content(jsonpPayload, "application/javascript; charset=utf-8");
            }

            return Content(json, "application/json; charset=utf-8");
        }

        public IActionResult jsonp2(string callback, int rsid, string size = "S") => jsonp(callback, rsid, size);

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
