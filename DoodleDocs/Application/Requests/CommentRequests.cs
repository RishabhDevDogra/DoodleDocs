namespace DoodleDocs.Application.Requests;

public class AddCommentRequest
{
    public required string Text { get; set; }
    public required string Author { get; set; }
}
