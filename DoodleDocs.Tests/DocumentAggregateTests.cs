using DoodleDocs.Domain;
using Xunit;

namespace DoodleDocs.Tests;

public class DocumentAggregateTests
{
    [Fact]
    public void Create_ShouldGenerateDocumentCreatedEvent()
    {
        // Arrange
        var id = "test-doc-1";
        var title = "Test Document";

        // Act
        var aggregate = DocumentAggregate.Create(id, title);
        var events = aggregate.GetUncommittedChanges();

        // Assert
        Assert.Single(events);
        var createdEvent = Assert.IsType<DocumentCreated>(events.First());
        Assert.Equal(id, createdEvent.DocumentId);
        Assert.Equal(title, createdEvent.Title);
    }

    [Fact]
    public void UpdateTitle_ShouldGenerateTitleUpdatedEvent()
    {
        // Arrange
        var aggregate = DocumentAggregate.Create("test-doc-2", "Original Title");
        aggregate.MarkChangesAsCommitted();

        // Act
        aggregate.UpdateTitle("New Title");
        var events = aggregate.GetUncommittedChanges();

        // Assert
        Assert.Single(events);
        var titleEvent = Assert.IsType<TitleUpdated>(events.First());
        Assert.Equal("New Title", titleEvent.NewTitle);
    }

    [Fact]
    public void UpdateContent_ShouldGenerateContentUpdatedEvent()
    {
        // Arrange
        var aggregate = DocumentAggregate.Create("test-doc-3", "Test");
        aggregate.MarkChangesAsCommitted();

        // Act
        aggregate.UpdateContent("New content here");
        var events = aggregate.GetUncommittedChanges();

        // Assert
        Assert.Single(events);
        var contentEvent = Assert.IsType<ContentUpdated>(events.First());
        Assert.Equal("New content here", contentEvent.Content);
    }

    [Fact]
    public void Delete_ShouldGenerateDocumentDeletedEvent()
    {
        // Arrange
        var aggregate = DocumentAggregate.Create("test-doc-4", "To Delete");
        aggregate.MarkChangesAsCommitted();

        // Act
        aggregate.Delete();
        var events = aggregate.GetUncommittedChanges();

        // Assert
        Assert.Single(events);
        Assert.IsType<DocumentDeleted>(events.First());
    }

    [Fact]
    public void FromEvents_ShouldReconstructAggregateState()
    {
        // Arrange
        var id = "test-doc-5";
        var events = new List<DomainEvent>
        {
            new DocumentCreated(id, "Initial Title") { Version = 1 },
            new ContentUpdated(id, "First content") { Version = 2 },
            new TitleUpdated(id, "Updated Title") { Version = 3 },
            new ContentUpdated(id, "Second content") { Version = 4 }
        };

        // Act
        var aggregate = DocumentAggregate.FromEvents(events);

        // Assert
        Assert.Equal(id, aggregate.Id);
        Assert.Equal("Updated Title", aggregate.Title);
        Assert.Equal("Second content", aggregate.Content);
        Assert.Equal(4, aggregate.Version);
    }

    [Fact]
    public void FromEvents_WithPartialHistory_ShouldReconstructToThatPoint()
    {
        // Arrange - Replay only first 2 events (for undo/redo scenarios)
        var id = "test-doc-6";
        var events = new List<DomainEvent>
        {
            new DocumentCreated(id, "Title") { Version = 1 },
            new ContentUpdated(id, "Content v2") { Version = 2 }
        };

        // Act
        var aggregate = DocumentAggregate.FromEvents(events);

        // Assert
        Assert.Equal("Title", aggregate.Title);
        Assert.Equal("Content v2", aggregate.Content);
        Assert.Equal(2, aggregate.Version);
    }

    [Fact]
    public void MultipleOperations_ShouldGenerateMultipleEvents()
    {
        // Arrange & Act
        var aggregate = DocumentAggregate.Create("test-doc-9", "Title");
        aggregate.UpdateTitle("New Title");
        aggregate.UpdateContent("Content");
        var events = aggregate.GetUncommittedChanges().ToList();

        // Assert
        Assert.Equal(3, events.Count);
        Assert.IsType<DocumentCreated>(events[0]);
        Assert.IsType<TitleUpdated>(events[1]);
        Assert.IsType<ContentUpdated>(events[2]);
    }

    [Fact]
    public void AggregateState_ShouldReflectAppliedEvents()
    {
        // Arrange
        var aggregate = DocumentAggregate.Create("test-doc-10", "My Title");
        
        // Act
        aggregate.UpdateContent("My content");
        
        // Assert
        Assert.Equal("My Title", aggregate.Title);
        Assert.Equal("My content", aggregate.Content);
    }
}
