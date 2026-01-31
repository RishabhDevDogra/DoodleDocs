namespace DoodleDocs.ReadModel;

/// <summary>
/// Projection Store - stores read model (denormalized query data).
/// Separate from event store. Optimized for reads.
/// </summary>
public interface IProjectionStore
{
    Task SaveProjectionAsync(DocumentProjection projection);
    Task<DocumentProjection?> GetProjectionAsync(string documentId);
    Task<List<DocumentProjection>> GetAllProjectionsAsync();
    Task DeleteProjectionAsync(string documentId);
}

public class InMemoryProjectionStore : IProjectionStore
{
    private readonly Dictionary<string, DocumentProjection> _projections = new();

    public Task SaveProjectionAsync(DocumentProjection projection)
    {
        _projections[projection.Id] = projection;
        return Task.CompletedTask;
    }

    public Task<DocumentProjection?> GetProjectionAsync(string documentId)
    {
        _projections.TryGetValue(documentId, out var projection);
        return Task.FromResult(projection);
    }

    public Task<List<DocumentProjection>> GetAllProjectionsAsync()
    {
        return Task.FromResult(
            _projections.Values.OrderByDescending(p => p.UpdatedAt).ToList()
        );
    }

    public Task DeleteProjectionAsync(string documentId)
    {
        _projections.Remove(documentId);
        return Task.CompletedTask;
    }
}
