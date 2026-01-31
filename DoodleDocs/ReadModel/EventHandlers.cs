using DoodleDocs.Domain;

namespace DoodleDocs.ReadModel;

/// <summary>
/// Event handlers that update the read model when events occur.
/// These project events into the DocumentProjection.
/// </summary>
public interface IEventHandler
{
    Task HandleAsync(DomainEvent @event);
}

public class DocumentEventHandler : IEventHandler
{
    private readonly IProjectionStore _projectionStore;

    public DocumentEventHandler(IProjectionStore projectionStore)
    {
        _projectionStore = projectionStore;
    }

    public async Task HandleAsync(DomainEvent @event)
    {
        switch (@event)
        {
            case DocumentCreated created:
                await HandleDocumentCreatedAsync(created);
                break;
            case ContentUpdated updated:
                await HandleContentUpdatedAsync(updated);
                break;
            case TitleUpdated titleUpdated:
                await HandleTitleUpdatedAsync(titleUpdated);
                break;
            case DocumentDeleted deleted:
                await HandleDocumentDeletedAsync(deleted);
                break;
        }
    }

    private async Task HandleDocumentCreatedAsync(DocumentCreated created)
    {
        var projection = new DocumentProjection
        {
            Id = created.DocumentId,
            Title = created.Title,
            Content = string.Empty,
            CreatedAt = created.OccurredAt,
            UpdatedAt = created.OccurredAt
        };
        
        await _projectionStore.SaveProjectionAsync(projection);
    }

    private async Task HandleContentUpdatedAsync(ContentUpdated updated)
    {
        var projection = await _projectionStore.GetProjectionAsync(updated.DocumentId);
        if (projection != null)
        {
            projection.Content = updated.Content;
            projection.UpdatedAt = updated.OccurredAt;
            await _projectionStore.SaveProjectionAsync(projection);
        }
    }

    private async Task HandleTitleUpdatedAsync(TitleUpdated titleUpdated)
    {
        var projection = await _projectionStore.GetProjectionAsync(titleUpdated.DocumentId);
        if (projection != null)
        {
            projection.Title = titleUpdated.NewTitle;
            projection.UpdatedAt = titleUpdated.OccurredAt;
            await _projectionStore.SaveProjectionAsync(projection);
        }
    }

    private async Task HandleDocumentDeletedAsync(DocumentDeleted deleted)
    {
        await _projectionStore.DeleteProjectionAsync(deleted.DocumentId);
    }
}
