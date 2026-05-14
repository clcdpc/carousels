using Carousels.Domain;
namespace Carousels.Abstractions
{
    public interface ICatalogLinkProvider
    {
        string GetLink(CarouselBibItem item);
    }
}
