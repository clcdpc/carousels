namespace Carousels.Models
{
    public interface ICarouselItemProvider
    {
        IEnumerable<CarouselBibItem> GetItems(object carouselIdentifier);
    }
}
