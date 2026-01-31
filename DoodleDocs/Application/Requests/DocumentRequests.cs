namespace DoodleDocs.Application.Requests;

public class CreateDocumentRequest
{
    public string? Title { get; set; }
}

public class UpdateDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
