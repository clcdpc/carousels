using Carousels.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace Carousels.Controllers
{
    public class HomeController : Controller
    {
        PolarisEntities db = new PolarisEntities();

        public string jsonp(string callback, int rsid, string ctx = "0", string size = "S", string userId = null, string password = null)
        {
            password = string.IsNullOrWhiteSpace(password) ? ConfigurationManager.AppSettings["contentcafe_password"] : password;
            userId = string.IsNullOrWhiteSpace(userId) ? ConfigurationManager.AppSettings["contentcafe_userid"] : userId;

            var items = new List<CarouselItem>();
            foreach (var bib in db.BibliographicRecords.Where(br => br.RecordSets.Any(rs => rs.RecordSetID == rsid)))
            {
                var isbn = GetISBN(bib);
                items.Add(new CarouselItem
                {
                    CatalogLink = "https://" + $"catalog.clcohio.org/polaris/view.aspx?ctx={ctx}.1033.0.0.3&isbn={isbn}",
                    ImageUrl = "https://" + $"contentcafe2.btol.com/ContentCafe/Jacket.aspx?Return=1&Type={size}&Value={isbn}&userID={userId}&password={password}"
                });
            }

            var js = new JavaScriptSerializer();
            if (callback == "callback")
            {
                return string.Format("callback('{0}')", js.Serialize(new Carousel { Name = db.RecordSets.Single(rs => rs.RecordSetID == rsid).Name, Items = items }));
            }

            if (callback == "json")
            {
                return js.Serialize(new Carousel { Name = db.RecordSets.Single(rs => rs.RecordSetID == rsid).Name, Items = items });
            }

            return "";
        }

        string GetISBN(BibliographicRecord br)
        {
            return db.BibliographicISBNIndexes.FirstOrDefault(i => i.BibliographicRecordID == br.BibliographicRecordID).ISBNString;
        }
    }
}
