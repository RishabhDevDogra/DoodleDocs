using System;

namespace DoodleDocs.Domain;

/// <summary>
/// Fired when a document is created.
/// </summary>
public class DocumentCreated : DomainEvent
{
    public string Title { get; set; } = string.Empty;

    public DocumentCreated(string documentId, string title)
    {
        DocumentId = documentId;
        Title = title;
    }

    public DocumentCreated() { }
}

/// <summary>
/// Fired when document content (text or drawing) is updated.
/// </summary>
public class ContentUpdated : DomainEvent
{
    public string Content { get; set; } = string.Empty;
    public string ContentType { get; set; } = "text"; // "text" or "drawing"

    public ContentUpdated(string documentId, string content, string contentType = "text")
    {
        DocumentId = documentId;
        Content = content;
        ContentType = contentType;
    }

    public ContentUpdated() { }
}

/// <summary>
/// Fired when document title is updated.
/// </summary>
public class TitleUpdated : DomainEvent
{
    public string NewTitle { get; set; } = string.Empty;

    public TitleUpdated(string documentId, string newTitle)
    {
        DocumentId = documentId;
        NewTitle = newTitle;
    }

    public TitleUpdated() { }
}

/// <summary>
/// Fired when a document is deleted.
/// </summary>
public class DocumentDeleted : DomainEvent
{
    public DocumentDeleted(string documentId)
    {
        DocumentId = documentId;
    }

    public DocumentDeleted() { }
}
