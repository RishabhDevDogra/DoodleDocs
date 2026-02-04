namespace DoodleDocs.Domain;

public class CommentAdded : DomainEvent
{
    public required string CommentId { get; init; }
    public required string Text { get; init; }
    public required string Author { get; init; }
    public required DateTime Timestamp { get; init; }
}

public class CommentDeleted : DomainEvent
{
    public required string CommentId { get; init; }
    public required DateTime Timestamp { get; init; }
}
