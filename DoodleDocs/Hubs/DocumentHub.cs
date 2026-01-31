using Microsoft.AspNetCore.SignalR;

namespace DoodleDocs.Hubs;

/// <summary>
/// SignalR Hub for real-time document updates.
/// Broadcasts events to all connected clients when documents change.
/// </summary>
public class DocumentHub : Hub
{
    /// <summary>
    /// Broadcast that a document was created.
    /// </summary>
    public async Task NotifyDocumentCreated(string documentId, string title)
    {
        await Clients.All.SendAsync("DocumentCreated", documentId, title);
    }

    /// <summary>
    /// Broadcast that a document was updated.
    /// </summary>
    public async Task NotifyDocumentUpdated(string documentId)
    {
        await Clients.All.SendAsync("DocumentUpdated", documentId);
    }

    /// <summary>
    /// Broadcast that a document was deleted.
    /// </summary>
    public async Task NotifyDocumentDeleted(string documentId)
    {
        await Clients.All.SendAsync("DocumentDeleted", documentId);
    }

    /// <summary>
    /// Broadcast a new event to the version history.
    /// </summary>
    public async Task NotifyEventAdded(string documentId, string eventType, string description)
    {
        await Clients.All.SendAsync("EventAdded", documentId, eventType, description);
    }
}
