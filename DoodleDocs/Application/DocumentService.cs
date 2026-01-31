using DoodleDocs.Domain;
using DoodleDocs.Infrastructure;
using DoodleDocs.ReadModel;
using DoodleDocs.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace DoodleDocs.Application;

/// <summary>
/// Event-sourced Document Service with CQRS and real-time SignalR broadcasts.
/// Commands mutate aggregates, which generate events.
/// Events are persisted to the event store AND projected into read model.
/// State is reconstructed by replaying events or reading from projections.
/// </summary>
public class DocumentService
{
    private readonly IEventStore _eventStore;
    private readonly IProjectionStore _projectionStore;
    private readonly IEventHandler _eventHandler;
    private readonly IHubContext<DocumentHub> _hubContext;

    public DocumentService(
        IEventStore eventStore, 
        IProjectionStore projectionStore, 
        IEventHandler eventHandler,
        IHubContext<DocumentHub> hubContext)
    {
        _eventStore = eventStore;
        _projectionStore = projectionStore;
        _eventHandler = eventHandler;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Get all documents from projection store (fast read model).
    /// </summary>
    public async Task<List<DocumentProjection>> GetAllDocumentsAsync()
    {
        return await _projectionStore.GetAllProjectionsAsync();
    }

    /// <summary>
    /// Get single document from projection store.
    /// </summary>
    public async Task<DocumentProjection?> GetDocumentAsync(string id)
    {
        return await _projectionStore.GetProjectionAsync(id);
    }

    /// <summary>
    /// Get event history for a document (for undo/redo and version history).
    /// </summary>
    public async Task<List<EventView>> GetEventHistoryAsync(string id)
    {
        var events = await _eventStore.GetEventsAsync(id);
        return events.Select(e => new EventView
        {
            Version = e.Version,
            EventType = e.GetType().Name,
            Description = GetEventDescription(e),
            OccurredAt = e.OccurredAt
        }).ToList();
    }

    /// <summary>
    /// Get document state at a specific version by replaying events up to that version.
    /// This enables undo/redo functionality.
    /// </summary>
    public async Task<DocumentProjection?> GetDocumentAtVersionAsync(string id, int version)
    {
        var events = await _eventStore.GetEventsAsync(id);
        if (events.Count == 0)
            return null;

        // Replay events up to the specified version
        var eventsToReplay = events.Where(e => e.Version <= version).ToList();
        if (eventsToReplay.Count == 0)
            return null;

        var aggregate = DocumentAggregate.FromEvents(eventsToReplay);

        // Convert aggregate state to projection
        return new DocumentProjection
        {
            Id = aggregate.Id,
            Title = aggregate.Title,
            Content = aggregate.Content,
            CreatedAt = aggregate.CreatedAt,
            UpdatedAt = aggregate.UpdatedAt
        };
    }

    private string GetEventDescription(Domain.DomainEvent @event)
    {
        return @event switch
        {
            Domain.DocumentCreated created => $"Document created: \"{created.Title}\"",
            Domain.ContentUpdated updated => $"Content {(updated.Content.Length > 0 ? "updated" : "cleared")}",
            Domain.TitleUpdated titleUpdated => $"Title changed to \"{titleUpdated.NewTitle}\"",
            Domain.DocumentDeleted => "Document deleted",
            _ => "Unknown event"
        };
    }

    /// <summary>
    /// Create a new document.
    /// </summary>
    public async Task<DocumentProjection?> CreateDocumentAsync(string title = "Untitled Document")
    {
        var documentId = Guid.NewGuid().ToString();
        var aggregate = DocumentAggregate.Create(documentId, title);

        var events = aggregate.GetUncommittedChanges().ToList();
        await _eventStore.SaveEventsAsync(documentId, events);
        
        // Project events into read model
        foreach (var @event in events)
        {
            await _eventHandler.HandleAsync(@event);
        }

        // Broadcast to all clients via SignalR
        await _hubContext.Clients.All.SendAsync("DocumentCreated", documentId, title);

        return await _projectionStore.GetProjectionAsync(documentId);
    }

    /// <summary>
    /// Update document (title and/or content).
    /// Generates events that are persisted and projected.
    /// </summary>
    public async Task<DocumentProjection?> UpdateDocumentAsync(string id, string title, string content)
    {
        var events = await _eventStore.GetEventsAsync(id);
        if (events.Count == 0)
            throw new KeyNotFoundException($"Document {id} not found");

        var aggregate = DocumentAggregate.FromEvents(events);

        // Commands that generate events
        if (aggregate.Title != title)
            aggregate.UpdateTitle(title);
        
        if (aggregate.Content != content)
            aggregate.UpdateContent(content);

        var newEvents = aggregate.GetUncommittedChanges().ToList();
        if (newEvents.Count > 0)
        {
            await _eventStore.SaveEventsAsync(id, newEvents);
            
            // Project new events into read model
            foreach (var @event in newEvents)
            {
                await _eventHandler.HandleAsync(@event);
            }

            // Broadcast to all clients via SignalR
            await _hubContext.Clients.All.SendAsync("DocumentUpdated", id);
        }

        return await _projectionStore.GetProjectionAsync(id);
    }

    /// <summary>
    /// Delete a document.
    /// Generates a DocumentDeleted event and removes projection.
    /// </summary>
    public async Task<bool> DeleteDocumentAsync(string id)
    {
        var events = await _eventStore.GetEventsAsync(id);
        if (events.Count == 0)
            return false;

        var aggregate = DocumentAggregate.FromEvents(events);
        aggregate.Delete();

        var deleteEvent = aggregate.GetUncommittedChanges().ToList();
        await _eventStore.SaveEventsAsync(id, deleteEvent);
        
        // Handle delete event in projection
        foreach (var @event in deleteEvent)
        {
            await _eventHandler.HandleAsync(@event);
        }

        // Broadcast to all clients via SignalR
        await _hubContext.Clients.All.SendAsync("DocumentDeleted", id);

        return true;
    }
}
