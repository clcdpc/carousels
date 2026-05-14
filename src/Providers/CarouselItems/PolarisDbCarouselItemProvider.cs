using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using Carousels.Abstractions;
using Carousels.Domain;

namespace Carousels.Providers.CarouselItems
{
    public class PolarisDbCarouselItemProvider(SqlConnection connection) : ICarouselItemProvider
    {
        public IEnumerable<CarouselBibItem> GetItems(object carouselIdentifier)
        {
            var sql = @"
                    select top 250 rs.Name [RecordSetName]
	                      ,br.BrowseTitle [Title]
	                      ,brs.BibliographicRecordID [BibId]
	                      ,isbn.ISBNString [Isbn]
	                      ,upc.UPCNumber [Upc]
                    from Polaris.Polaris.RecordSets rs
                    join Polaris.Polaris.BibRecordSets brs
	                    on brs.RecordSetID = rs.RecordSetID
                    join Polaris.Polaris.BibliographicRecords br
	                    on br.BibliographicRecordID = brs.BibliographicRecordID
                    outer apply ( select top 1 bii.ISBNString from Polaris.Polaris.BibliographicISBNIndex bii where bii.IsValidISBN = 1 and bii.BibliographicRecordID = brs.BibliographicRecordID order by bii.BibliographicISBNIndexID desc ) isbn
                    outer apply ( select top 1 bui.UPCNumber from Polaris.Polaris.BibliographicUPCIndex bui where bui.BibliographicRecordID = brs.BibliographicRecordID order by bui.BibliographicUPCIndexID desc ) upc
                    where (isbn.ISBNString is not null or upc.UPCNumber is not null) and brs.RecordSetID = @rsid --and br.bibliographicrecordid = 2648802
                    order by newid()";

            var bibs = connection.Query<CarouselBibItem>(sql, new { rsid = carouselIdentifier });
            return bibs;
        }
    }
}
