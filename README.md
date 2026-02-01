# 🎨 DoodleDocs

A real-time collaborative doodle application built with **Event Sourcing** and **CQRS** architecture.

## 🏗️ Architecture

- **Backend**: C# .NET 10.0 with Event Sourcing & CQRS
- **Frontend**: React with SignalR real-time updates
- **Storage**: In-memory event store (event replay for state reconstruction)
- **Real-time**: SignalR WebSocket connections

## ✨ Features

- ✅ **Event Sourcing** - Every action is stored as an immutable event
- ✅ **CQRS** - Separate write (commands) and read (projections) models
- ✅ **Version History** - See all events for any document
- ✅ **Undo/Redo** - Replay events to reconstruct any previous state
- ✅ **Real-time Collaboration** - SignalR broadcasts updates to all clients
- ✅ **Canvas Drawing** - Freehand doodles with color/size options

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run everything
docker-compose up --build

# Access the app
open http://localhost:3000
```

### Option 2: Local Development

**Prerequisites:**
- .NET 10.0 SDK
- Node.js 18+

**Backend:**
```bash
cd DoodleDocs
dotnet run
# Runs on http://localhost:5116
```

**Frontend:**
```bash
cd DoodleDocs.Web
npm install
npm start
# Runs on http://localhost:3000
```

## 🧪 Running Tests

```bash
cd DoodleDocs.Tests
dotnet test
# 8/8 tests passing
```

## 📁 Project Structure

```
DoodleDocs/
├── DoodleDocs/              # Backend (Event Sourcing + CQRS)
│   ├── Domain/              # Aggregates & Domain Events
│   ├── Application/         # Commands & Event Handlers
│   ├── Infrastructure/      # Event Store implementation
│   ├── ReadModel/           # CQRS Projections
│   ├── Controllers/         # REST API endpoints
│   └── Hubs/                # SignalR real-time hubs
├── DoodleDocs.Web/          # Frontend (React)
│   └── src/
│       ├── components/      # React components
│       └── config.js        # API URLs & constants
├── DoodleDocs.Tests/        # Unit tests (xUnit)
└── docker-compose.yml       # Docker orchestration
```

## 🎯 Key Concepts

### Event Sourcing
All state changes are stored as events:
```csharp
DocumentCreated → TitleUpdated → ContentUpdated → DocumentDeleted
```
Current state = replay all events from the beginning.

### CQRS (Command Query Responsibility Segregation)
- **Commands** modify state (generate events)
- **Queries** read from projections (fast, denormalized views)

### Version History & Undo/Redo
Reconstruct document at any version by replaying events up to that point:
```csharp
GetDocumentAtVersionAsync(id, version) 
  → Replay events[0..version]
  → Return reconstructed state
```

## 🔧 Technical Highlights

- **No Magic Strings**: `HubMethods.DocumentCreated` instead of `"DocumentCreated"`
- **Input Validation**: All endpoints validate request bodies
- **PropTypes**: Runtime type checking for React components
- **Centralized Config**: No hardcoded URLs or timeouts
- **Proper Naming**: PascalCase for .NET, camelCase for JavaScript

## 📊 API Endpoints

```
GET    /api/document              # Get all documents
GET    /api/document/{id}         # Get specific document
GET    /api/document/{id}/history # Get event history
GET    /api/document/{id}/version/{n} # Get document at version N
POST   /api/document              # Create new document
PUT    /api/document/{id}         # Update document
DELETE /api/document/{id}         # Delete document
```

## 🔌 SignalR Events

```javascript
DocumentCreated(documentId, title)
DocumentUpdated(documentId)
DocumentDeleted(documentId)
EventAdded(documentId, eventType, description)
```

## 🎓 Why This Architecture?

**Audit Trail**: Every action is logged as an immutable event  
**Time Travel**: Reconstruct state at any point in time  
**Scalability**: Read model can be cached/replicated independently  
**Debugging**: Replay events to reproduce bugs  
**Event-Driven**: Easy to add new projections or event handlers

## 🚢 Docker Details

**Services:**
- `backend`: .NET app on port 5116
- `frontend`: React app served by nginx on port 3000

**Networking:**
Nginx proxies `/api/` and `/hubs/` to backend container.

## 📝 License

MIT - Built as a portfolio project demonstrating Event Sourcing & CQRS

---

**Author**: Built with Event Sourcing, CQRS, and real-time collaboration in mind 🚀
