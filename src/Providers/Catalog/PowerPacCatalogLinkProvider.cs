using Carousels.Abstractions;
using Carousels.Domain;
namespace Carousels.Providers.Catalog
{
    public class PowerPacCatalogLinkProvider : ICatalogLinkProvider
    {
        public string GetLink(CarouselBibItem item, int branchId) =>
            $"https://catalog.clcohio.org/polaris/view.aspx?ctx={branchId}.1033.0.0.3&{(!string.IsNullOrWhiteSpace(item.Isbn) ? $"isbn={item.Isbn}" : $"upc={item.Upc}")}";
    }
}
