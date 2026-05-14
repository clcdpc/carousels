using System.Collections.Generic;
﻿namespace Carousels.Domain
{
    public class Carousel
    {
        public string Name { get; set; }
        public IEnumerable<CarouselItem> Items { get; set; }
    }
}
