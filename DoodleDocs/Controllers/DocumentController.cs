using Microsoft.AspNetCore.Mvc;
using DoodleDocs.ReadModel;
using DoodleDocs.Application;
using DoodleDocs.Application.Requests;

namespace DoodleDocs.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
    private readonly DocumentService _documentService;

    public DocumentController(DocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DocumentProjection>>> GetAll()
    {
        var docs = await _documentService.GetAllDocumentsAsync();
        return Ok(docs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentProjection>> GetDocument(string id)
    {
        var doc = await _documentService.GetDocumentAsync(id);
        if (doc == null)
            return NotFound();
        return Ok(doc);
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<List<EventView>>> GetEventHistory(string id)
    {
        var history = await _documentService.GetEventHistoryAsync(id);
        return Ok(history);
    }

    [HttpGet("{id}/version/{version}")]
    public async Task<ActionResult<DocumentProjection>> GetDocumentAtVersion(string id, int version)
    {
        var doc = await _documentService.GetDocumentAtVersionAsync(id, version);
        if (doc == null)
            return NotFound();
        return Ok(doc);
    }

    [HttpPost]
    public async Task<ActionResult<DocumentProjection>> CreateDocument([FromBody] CreateDocumentRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");
            
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title cannot be empty");

        var doc = await _documentService.CreateDocumentAsync(request.Title);
        return CreatedAtAction(nameof(GetDocument), new { id = doc?.Id }, doc);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DocumentProjection>> UpdateDocument(string id, [FromBody] UpdateDocumentRequest request)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Document ID is required");
            
        if (request == null)
            return BadRequest("Request body is required");

        try
        {
            var doc = await _documentService.UpdateDocumentAsync(id, request.Title, request.Content);
            return Ok(doc);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDocument(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Document ID is required");
            
        if (await _documentService.DeleteDocumentAsync(id))
            return Ok();
        return NotFound();
    }
}
