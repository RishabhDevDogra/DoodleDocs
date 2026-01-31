namespace DoodleDocs.ReadModel;

/// <summary>
/// Document Projection - the "read model"
/// Optimized for querying. Updated by event handlers.
/// This is what REST endpoints will return to clients.
/// </summary>
public class DocumentProjection
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
