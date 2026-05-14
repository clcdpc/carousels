namespace Carousels.Models
{
    public interface ICatalogLinkProvider
    {
        string GetLink(CarouselBibItem item);
    }
}
