using DoodleDocs.Application;
using DoodleDocs.Infrastructure;
using DoodleDocs.ReadModel;
using DoodleDocs.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://127.0.0.1:3000", 
                "http://localhost:3001", 
                "http://127.0.0.1:3001",
                "http://localhost:80",
                "http://frontend:80",
                "https://doodledocs.onrender.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Register Event Sourcing (write side)
builder.Services.AddSingleton<IEventStore, InMemoryEventStore>();

// Register CQRS (read side)
builder.Services.AddSingleton<IProjectionStore, InMemoryProjectionStore>();
builder.Services.AddSingleton<IEventHandler, DocumentEventHandler>();

// Register application service
builder.Services.AddSingleton<DocumentService>();

// Add SignalR for real-time updates
builder.Services.AddSignalR();

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowReact");
app.MapControllers();
app.MapHub<DocumentHub>("/hubs/document");

app.Run();
