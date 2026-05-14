using System;
using System.Linq;
using Carousels.Abstractions;
namespace Carousels.Domain
{
    public class CarouselBibItem
    {
        public string RecordSetName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int BibId { get; set; }
        public string Isbn { get; set; } = string.Empty;
        public string Upc { get; set; } = string.Empty;

        public CarouselItem ToCarouselItem(ICoverImageProvider coverImageProvider, ICatalogLinkProvider catalogLinkProvider, CoverImageSize size, int branchId)
        {
            return new CarouselItem { Title = new string(Title.Replace(@"\'", @"'").Replace(@"\""", @"""").Take(50).ToArray()).Replace("'", @"\'").Replace("\"", @"\""") + (Title.Length > 50 ? "..." : ""), CatalogLink = catalogLinkProvider.GetLink(this, branchId), ImageUrl = coverImageProvider.GetImageUrl(this, size) };
        }
    }
}
