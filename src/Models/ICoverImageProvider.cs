namespace Carousels.Models
{
    public interface ICoverImageProvider
    {
        string GetImageUrl(CarouselBibItem title, CoverImageSize size);
    }
}
