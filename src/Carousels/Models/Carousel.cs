using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Carousels.Models
{
    public class Carousel
    {
        public string Name { get; set; }
        public List<CarouselItem> Items { get; set; }
    }
}