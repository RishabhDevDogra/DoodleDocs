using Microsoft.AspNetCore.Mvc;

namespace DoodleDocs;

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
    public ActionResult<List<Document>> GetAll()
    {
        return Ok(_documentService.GetAllDocuments());
    }

    [HttpGet("{id}")]
    public ActionResult<Document> GetDocument(string id)
    {
        var doc = _documentService.GetDocument(id);
        if (doc == null)
            return NotFound();
        return Ok(doc);
    }

    [HttpPost]
    public ActionResult<Document> CreateDocument([FromBody] CreateDocumentRequest request)
    {
        var doc = _documentService.CreateDocument(request.Title ?? "Untitled Document");
        return CreatedAtAction(nameof(GetDocument), new { id = doc.Id }, doc);
    }

    [HttpPut("{id}")]
    public ActionResult<Document> UpdateDocument(string id, [FromBody] UpdateDocumentRequest request)
    {
        try
        {
            var doc = _documentService.UpdateDocument(id, request.Title, request.Content);
            return Ok(doc);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteDocument(string id)
    {
        if (_documentService.DeleteDocument(id))
            return Ok();
        return NotFound();
    }
}

public class CreateDocumentRequest
{
    public string? Title { get; set; }
}

public class UpdateDocumentRequest
{
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
}
