using System;
using System.Collections.Generic;
using System.Linq;

namespace DoodleDocs.Domain;

/// <summary>
/// Document Aggregate Root.
/// Represents a single document and all events that have happened to it.
/// Can reconstruct its state by replaying all events from the event stream.
/// </summary>
public class DocumentAggregate
{
    public string Id { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    
    /// <summary>
    /// Events that have occurred on this aggregate (uncommitted + committed).
    /// </summary>
    private List<DomainEvent> _changes = new();

    /// <summary>
    /// Version number (total events that have been committed).
    /// Used for optimistic locking.
    /// </summary>
    public int Version { get; private set; } = 0;

    // Private constructor for use by event handlers
    private DocumentAggregate() { }

    /// <summary>
    /// Create a new document via command.
    /// </summary>
    public static DocumentAggregate Create(string documentId, string title)
    {
        var agg = new DocumentAggregate
        {
            Id = documentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var @event = new DocumentCreated(documentId, title);
        agg.Apply(@event);
        agg._changes.Add(@event);

        return agg;
    }

    /// <summary>
    /// Update document content (text or drawing).
    /// </summary>
    public void UpdateContent(string content, string contentType = "text")
    {
        var @event = new ContentUpdated(Id, content, contentType);
        Apply(@event);
        _changes.Add(@event);
    }

    /// <summary>
    /// Update document title.
    /// </summary>
    public void UpdateTitle(string newTitle)
    {
        var @event = new TitleUpdated(Id, newTitle);
        Apply(@event);
        _changes.Add(@event);
    }

    /// <summary>
    /// Mark document as deleted.
    /// </summary>
    public void Delete()
    {
        var @event = new DocumentDeleted(Id);
        Apply(@event);
        _changes.Add(@event);
    }

    /// <summary>
    /// Apply an event to the aggregate (update state).
    /// This is the "business logic" — what does this event mean to our domain?
    /// </summary>
    private void Apply(DomainEvent @event)
    {
        switch (@event)
        {
            case DocumentCreated created:
                Id = created.DocumentId;
                Title = created.Title;
                Content = string.Empty;
                CreatedAt = created.OccurredAt;
                UpdatedAt = created.OccurredAt;
                break;

            case ContentUpdated updated:
                Content = updated.Content;
                UpdatedAt = updated.OccurredAt;
                break;

            case TitleUpdated titleUpdated:
                Title = titleUpdated.NewTitle;
                UpdatedAt = titleUpdated.OccurredAt;
                break;

            case DocumentDeleted deleted:
                UpdatedAt = deleted.OccurredAt;
                // Mark as deleted or remove (depends on soft vs hard delete policy)
                break;
        }
    }

    /// <summary>
    /// Reconstruct aggregate state from a stream of events.
    /// Used when loading from event store.
    /// </summary>
    public static DocumentAggregate FromEvents(IEnumerable<DomainEvent> events)
    {
        var agg = new DocumentAggregate();
        var eventList = events.ToList();

        foreach (var @event in eventList)
        {
            agg.Apply(@event);
            agg.Version++;
        }

        return agg;
    }

    /// <summary>
    /// Get all uncommitted changes (events since last save).
    /// </summary>
    public IReadOnlyList<DomainEvent> GetUncommittedChanges() => _changes.AsReadOnly();

    /// <summary>
    /// Mark all changes as committed (saved to event store).
    /// </summary>
    public void MarkChangesAsCommitted()
    {
        _changes.Clear();
    }
}
