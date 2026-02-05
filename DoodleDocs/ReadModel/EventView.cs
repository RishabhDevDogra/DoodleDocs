namespace DoodleDocs.ReadModel;

/// <summary>
/// Event view model for exposing to frontend.
/// Shows what happened and when.
/// </summary>
public class EventView
{
    public int Version { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}
