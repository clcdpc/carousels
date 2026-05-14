namespace Carousels.Models
{
    public class Carousel
    {
        public string Name { get; set; }
        public IEnumerable<CarouselItem> Items { get; set; }
    }
}
