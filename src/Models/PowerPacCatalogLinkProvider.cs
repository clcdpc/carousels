namespace Carousels.Models
{
    public class PowerPacCatalogLinkProvider(int branchId) : ICatalogLinkProvider
    {
        public string GetLink(CarouselBibItem item) =>
             $"https://catalog.clcohio.org/polaris/view.aspx?ctx={branchId}.1033.0.0.3&{(!string.IsNullOrWhiteSpace(item.Isbn) ? $"isbn={item.Isbn}" : $"upc={item.Upc}")}";
    }
}
