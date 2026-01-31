using DoodleDocs.Domain;
using DoodleDocs.Infrastructure;
using DoodleDocs.ReadModel;

namespace DoodleDocs;

/// <summary>
/// Event-sourced Document Service with CQRS.
/// Commands mutate aggregates, which generate events.
/// Events are persisted to the event store AND projected into read model.
/// State is reconstructed by replaying events or reading from projections.
/// </summary>
public class DocumentService
{
    private readonly IEventStore _eventStore;
    private readonly IProjectionStore _projectionStore;
    private readonly IEventHandler _eventHandler;

    public DocumentService(IEventStore eventStore, IProjectionStore projectionStore, IEventHandler eventHandler)
    {
        _eventStore = eventStore;
        _projectionStore = projectionStore;
        _eventHandler = eventHandler;
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

        return true;
    }
}
