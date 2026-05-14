namespace Carousels.Models
{
    public class ContentCafeCoverImageProvider : ICoverImageProvider
    {
        private string _userId { get; set; }
        private string _password { get; set; }

        public ContentCafeCoverImageProvider(string userId, string password)
        {
            _userId = userId;
            _password = password;
        }

        public string GetImageUrl(CarouselBibItem title, CoverImageSize size)
            => $"https://contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=1&Type={size}&Value={(string.IsNullOrWhiteSpace(title.Isbn) ? title.Upc : title.Isbn)}&userID={_userId}&password={_password}";
    }
}
