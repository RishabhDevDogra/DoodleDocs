namespace DoodleDocs;

public class DocumentService
{
    private readonly Dictionary<string, Document> _documents = new();

    public List<Document> GetAllDocuments()
    {
        return _documents.Values.OrderByDescending(d => d.UpdatedAt).ToList();
    }

    public Document? GetDocument(string id)
    {
        _documents.TryGetValue(id, out var doc);
        return doc;
    }

    public Document CreateDocument(string title = "Untitled Document")
    {
        var doc = new Document { Title = title };
        _documents[doc.Id] = doc;
        return doc;
    }

    public Document UpdateDocument(string id, string title, string content)
    {
        if (!_documents.TryGetValue(id, out var doc))
            throw new KeyNotFoundException($"Document {id} not found");

        doc.Title = title;
        doc.Content = content;
        doc.UpdatedAt = DateTime.UtcNow;
        return doc;
    }

    public bool DeleteDocument(string id)
    {
        return _documents.Remove(id);
    }
}
