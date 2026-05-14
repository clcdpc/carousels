using Carousels.Domain;
﻿namespace Carousels.Abstractions
{
    public interface ICoverImageProvider
    {
        string GetImageUrl(CarouselBibItem title, CoverImageSize size);
    }
}
