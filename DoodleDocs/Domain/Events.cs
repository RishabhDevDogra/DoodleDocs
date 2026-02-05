using System;

namespace DoodleDocs.Domain;

/// <summary>
/// Fired when a document is created.
/// </summary>
public class DocumentCreated : DomainEvent
{
    public string Title { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    public DocumentCreated(string documentId, string title, string userId = "", string userName = "")
    {
        DocumentId = documentId;
        Title = title;
        UserId = userId;
        UserName = userName;
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
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    public ContentUpdated(string documentId, string content, string contentType = "text", string userId = "", string userName = "")
    {
        DocumentId = documentId;
        Content = content;
        ContentType = contentType;
        UserId = userId;
        UserName = userName;
    }

    public ContentUpdated() { }
}

/// <summary>
/// Fired when document title is updated.
/// </summary>
public class TitleUpdated : DomainEvent
{
    public string NewTitle { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    public TitleUpdated(string documentId, string newTitle, string userId = "", string userName = "")
    {
        DocumentId = documentId;
        NewTitle = newTitle;
        UserId = userId;
        UserName = userName;
    }

    public TitleUpdated() { }
}

/// <summary>
/// Fired when a document is deleted.
/// </summary>
public class DocumentDeleted : DomainEvent
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    public DocumentDeleted(string documentId, string userId = "", string userName = "")
    {
        DocumentId = documentId;
        UserId = userId;
        UserName = userName;
    }

    public DocumentDeleted() { }
}
