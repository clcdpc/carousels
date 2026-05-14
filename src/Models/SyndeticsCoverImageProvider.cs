namespace Carousels.Models
{
    public class SyndeticsCoverImageProvider : ICoverImageProvider
    {
        public string GetImageUrl(CarouselBibItem title, CoverImageSize size) 
            => $"https://secure.syndetics.com/index.aspx?isbn={title.Isbn}/{(size == CoverImageSize.S ? "SC" : "LC")}.GIF&client=clcpolaris&upc={title.Upc}";        
    }
}
