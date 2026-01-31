using System;
using System.Collections.Generic;
using System.Linq;

namespace DoodleDocs.Infrastructure;

/// <summary>
/// In-memory Event Store.
/// Stores all events keyed by document ID.
/// This is the "source of truth" — all state is derived from these events.
/// Later, replace with SQL/NoSQL database.
/// </summary>
public interface IEventStore
{
    /// <summary>
    /// Save a batch of events for a document.
    /// </summary>
    Task SaveEventsAsync(string documentId, List<Domain.DomainEvent> events);

    /// <summary>
    /// Retrieve all events for a document (complete history).
    /// </summary>
    Task<List<Domain.DomainEvent>> GetEventsAsync(string documentId);

    /// <summary>
    /// Get all document IDs (all events that exist).
    /// </summary>
    Task<List<string>> GetAllDocumentIdsAsync();
}

public class InMemoryEventStore : IEventStore
{
    private readonly Dictionary<string, List<Domain.DomainEvent>> _events = new();

    public Task SaveEventsAsync(string documentId, List<Domain.DomainEvent> events)
    {
        if (!_events.ContainsKey(documentId))
        {
            _events[documentId] = new List<Domain.DomainEvent>();
        }

        // Add version to each event (sequence number in the stream)
        var currentVersion = _events[documentId].Count;
        foreach (var @event in events)
        {
            @event.Version = ++currentVersion;
            _events[documentId].Add(@event);
        }

        return Task.CompletedTask;
    }

    public Task<List<Domain.DomainEvent>> GetEventsAsync(string documentId)
    {
        if (_events.TryGetValue(documentId, out var events))
        {
            return Task.FromResult(new List<Domain.DomainEvent>(events));
        }

        return Task.FromResult(new List<Domain.DomainEvent>());
    }

    public Task<List<string>> GetAllDocumentIdsAsync()
    {
        return Task.FromResult(_events.Keys.ToList());
    }
}
