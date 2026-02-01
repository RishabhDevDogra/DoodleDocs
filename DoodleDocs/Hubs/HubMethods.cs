namespace DoodleDocs.Hubs;

/// <summary>
/// Constants for SignalR hub method names.
/// Prevents typos and makes refactoring easier.
/// </summary>
public static class HubMethods
{
    public const string DocumentCreated = nameof(DocumentCreated);
    public const string DocumentUpdated = nameof(DocumentUpdated);
    public const string DocumentDeleted = nameof(DocumentDeleted);
    public const string EventAdded = nameof(EventAdded);
}
