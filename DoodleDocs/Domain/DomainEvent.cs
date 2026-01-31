using System;

namespace DoodleDocs.Domain;

/// <summary>
/// Base class for all domain events.
/// Immutable, timestamped record of something that happened in the domain.
/// </summary>
public abstract class DomainEvent
{
    public string EventId { get; } = Guid.NewGuid().ToString();
    public string DocumentId { get; protected set; } = string.Empty;
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
    public int Version { get; set; } // Event sequence number in document timeline
}
