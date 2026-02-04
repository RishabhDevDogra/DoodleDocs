using Microsoft.AspNetCore.Mvc;
using DoodleDocs.Application;
using DoodleDocs.Application.Requests;
using DoodleDocs.Domain;

namespace DoodleDocs.Controllers;

[ApiController]
[Route("api/document/{documentId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly DocumentService _documentService;

    public CommentsController(DocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(string documentId)
    {
        var events = await _documentService.GetDocumentHistory(documentId);
        var comments = events
            .OfType<CommentAdded>()
            .Where(c => !events.OfType<CommentDeleted>().Any(d => d.CommentId == c.CommentId))
            .Select(c => new
            {
                id = c.CommentId,
                text = c.Text,
                author = c.Author,
                timestamp = c.Timestamp
            })
            .OrderBy(c => c.timestamp)
            .ToList();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> AddComment(string documentId, [FromBody] AddCommentRequest request)
    {
        var commentId = Guid.NewGuid().ToString();
        var commentEvent = new CommentAdded
        {
            DocumentId = documentId,
            CommentId = commentId,
            Text = request.Text,
            Author = request.Author,
            Timestamp = DateTime.UtcNow
        };

        await _documentService.AppendEvent(documentId, commentEvent);
        return Ok(new { id = commentId });
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(string documentId, string commentId)
    {
        var deleteEvent = new CommentDeleted
        {
            DocumentId = documentId,
            CommentId = commentId,
            Timestamp = DateTime.UtcNow
        };

        await _documentService.AppendEvent(documentId, deleteEvent);
        return Ok();
    }
}
