using System.Collections.Generic;
using Carousels.Domain;
namespace Carousels.Abstractions
{
    public interface ICarouselItemProvider
    {
        IEnumerable<CarouselBibItem> GetItems(object carouselIdentifier);
    }
}
