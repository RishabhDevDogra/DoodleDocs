# 🎨 DoodleDocs

> A modern, real-time collaborative drawing application demonstrating **Event Sourcing** and **CQRS** architecture patterns in action.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![SignalR](https://img.shields.io/badge/SignalR-Real--time-green)](https://learn.microsoft.com/en-us/aspnet/core/signalr)

## 🎯 Overview

DoodleDocs is a full-stack web application that lets teams collaborate on drawings in real-time. Behind the scenes, it showcases professional software architecture patterns—every brush stroke is an immutable event, every collaboration update flows through a CQRS pipeline, and your entire drawing history is preserved and replayable.

This is a **production-ready reference implementation** for developers learning Event Sourcing and CQRS.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Real-time Drawing** | Freehand canvas with color and brush size control |
| 👥 **Live Collaboration** | Multiple users draw simultaneously via WebSocket (SignalR) |
| 📜 **Version History** | Complete event log showing who did what and when |
| ⏮️ **Time Travel** | Replay drawing to any previous version instantly |
| 🔄 **Undo/Redo** | Full event replay for complete undo/redo support |
| 📋 **Document Management** | Create, update, delete, and organize multiple drawings |
| 🔐 **Share Documents** | Share read-only links with collaborators |
| 💾 **Persistent History** | All events stored for future analysis |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Event Sourcing & CQRS                    │
├─────────────────┬───────────────────────┬──────────────────┤
│   Frontend      │      Backend          │   Storage        │
│   (React)       │   (.NET 8 / CQRS)    │  (In-Memory)     │
├─────────────────┼───────────────────────┼──────────────────┤
│ • Components    │ • Commands            │ • Event Store    │
│ • Canvas        │ • Domain Events       │ • Projections    │
│ • Real-time UI  │ • Event Handlers      │ • Read Models    │
│ • SignalR Hub   │ • Aggregates          │                  │
└─────────────────┴───────────────────────┴──────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Canvas API, SignalR Client | Interactive drawing interface |
| **Backend** | .NET 8, C#, SignalR, xUnit | Business logic & event processing |
| **Real-time** | SignalR WebSocket | Bi-directional communication |
| **Storage** | In-memory Event Store | Event immutability & replay |
| **Deployment** | Docker Compose, Nginx | Containerized orchestration |

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (easiest), OR
- **.NET 8.0 SDK** + **Node.js 18+** (local development)

### Option 1: Docker (Recommended) 🐳

```bash
# Clone and navigate to project
cd DoodleDocs

# Start all services
docker-compose up --build

# Open browser
open http://localhost:3000
```

**What's running:**
- Backend API: `http://localhost:5116`
- Frontend: `http://localhost:3000`
- Database: In-memory (no external DB needed)

### Option 2: Local Development 💻

**Start the Backend:**
```bash
cd DoodleDocs
dotnet restore
dotnet run

# Backend listens on http://localhost:5116
# SignalR hub available at ws://localhost:5116/hubs/document
```

**Start the Frontend (new terminal):**
```bash
cd DoodleDocs.Web
npm install
npm start

# Frontend opens at http://localhost:3000
```

**Or build for production:**
```bash
cd DoodleDocs.Web
npm run build
# Output in build/ directory
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd DoodleDocs.Tests
dotnet test

# Expected output:
# Passed: 8
# Failed: 0
```

### Test Coverage

Tests validate:
- ✅ Event sourcing aggregate behavior
- ✅ Domain event creation and handling
- ✅ Version history reconstruction
- ✅ Undo/redo functionality

---

## 📁 Project Structure

```
DoodleDocs/
├── 📄 docker-compose.yml           # Service orchestration
├── 📄 DoodleDocs.sln               # Solution file
├── 📄 README.md                    # This file
│
├── 📁 DoodleDocs/                  # Backend (.NET)
│   ├── 📁 Domain/                  # Core business logic
│   │   ├── DocumentAggregate.cs    # Main event aggregate
│   │   ├── CommentEvents.cs        # Comment events
│   │   ├── DomainEvent.cs          # Base event class
│   │   └── Events.cs               # Event definitions
│   │
│   ├── 📁 Application/             # Use cases & handlers
│   │   ├── DocumentService.cs      # Command execution
│   │   └── Requests/               # DTO request models
│   │
│   ├── 📁 Infrastructure/          # Event storage
│   │   └── IEventStore.cs          # Event store interface
│   │
│   ├── 📁 ReadModel/               # CQRS read projections
│   │   ├── DocumentProjection.cs   # Query model
│   │   ├── EventHandlers.cs        # Projection updates
│   │   └── IProjectionStore.cs     # Projection storage
│   │
│   ├── 📁 Controllers/             # REST API endpoints
│   │   ├── DocumentController.cs
│   │   └── CommentsController.cs
│   │
│   ├── 📁 Hubs/                    # SignalR real-time
│   │   ├── DocumentHub.cs          # Hub configuration
│   │   └── HubMethods.cs           # Type-safe method names
│   │
│   ├── 📄 Program.cs               # Dependency injection
│   ├── 📄 Dockerfile               # Container config
│   └── 📄 appsettings.json         # Configuration
│
├── 📁 DoodleDocs.Web/              # Frontend (React)
│   ├── 📁 src/
│   │   ├── 📁 components/          # React components
│   │   │   ├── DocumentEditor.js   # Main canvas
│   │   │   ├── DocumentList.js     # File browser
│   │   │   ├── Comments.js         # Comments widget
│   │   │   ├── VersionHistory.js   # Event timeline
│   │   │   ├── ShareModal.js       # Sharing dialog
│   │   │   ├── TopNavbar.js        # Navigation
│   │   │   ├── Toast.js            # Notifications
│   │   │   └── ErrorBoundary.js    # Error handling
│   │   │
│   │   ├── 📁 pages/
│   │   │   └── ShareView.js        # Shared doc view
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── userSession.js      # Session management
│   │   │
│   │   ├── 📄 App.js               # Root component
│   │   ├── 📄 App.css              # Global styles
│   │   ├── 📄 index.js             # React entry point
│   │   └── 📄 config.js            # API configuration
│   │
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   └── 📄 nginx.conf
│
└── 📁 DoodleDocs.Tests/            # Unit tests
    ├── 📄 DocumentAggregateTests.cs
    └── 📄 DoodleDocs.Tests.csproj
```

---

## ⚙️ How It Works (No Auth, No Database)

This is a **reference implementation** for learning Event Sourcing. It intentionally keeps things simple:

### User Session
- **No authentication** - Everyone gets a random username (e.g., "Artist#4832")
- **Local storage** - Your session ID is stored in browser localStorage
- **Shared namespace** - All documents are visible to all users in the session

### Data Storage
- **In-memory Event Store** - Events live in RAM (lost on server restart)
- **No SQL database** - Perfect for learning, not production
- **All documents are public** - Anyone on the network can see them

### Testing Real-time Collaboration

To see real-time updates in action:

1. **Open the app normally:**
   ```
   http://localhost:3000
   ```

2. **Open an incognito/private window (same URL):**
   ```
   Ctrl+Shift+N (or Cmd+Shift+N on Mac)
   http://localhost:3000
   ```
   Or open on a **different device** 

3. **Get a shared link:**
   - Click "Share" button → Copy the link
   - Paste in the other window/device
   - Both clients now see **live updates** as either user draws

**Example Scenario:**
- Window A: You as A
- Window B: You as B (different random name)
- Draw in A → Instantly appears in B via SignalR ✨

### When to Upgrade This

For production use, replace:
- **Event Store** → PostgreSQL/SQL Server with event persistence
- **In-Memory Projections** → Dedicated read database (MongoDB, Elasticsearch)
- **Session** → JWT authentication with user identity
- **Deployment** → Azure/AWS with load balancers

---

## 🎓 Architecture Deep Dive

### Event Sourcing Pattern

Instead of storing current state, we store **all events that led to it**:

```
Timeline:
DocumentCreated (v1) 
    → TitleUpdated (v2) 
    → ContentUpdated (v3) 
    → ContentUpdated (v4) 
    → DocumentDeleted (v5)

Current State = Replay all events from start
Past State    = Replay events[0..version]
```

**Benefits:**
- Complete audit trail of all changes
- Time travel to any point in history
- Replay events to debug issues
- Independent read model scaling

### CQRS Pattern

Separates **write operations** (Commands) from **read operations** (Queries):

```
Commands (Write Side):
┌──────────────────┐
│ CreateDocument   │ ─→ Generate Events ─→ Event Store
│ UpdateDocument   │
│ DeleteDocument   │
└──────────────────┘

Queries (Read Side):
┌──────────────────┐
│ GetDocuments     │ ←── Event Handlers ←── Event Store
│ SearchDocuments  │     (Build Projections)
└──────────────────┘
```

**Benefits:**
- Optimized read/write models
- Easier scaling for read-heavy workloads
- Better separation of concerns
- Different databases possible for reads vs writes

---

## 📊 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/document` | List all documents |
| `GET` | `/api/document/{id}` | Get document details |
| `GET` | `/api/document/{id}/history` | Get all events |
| `GET` | `/api/document/{id}/version/{n}` | Restore to version N |
| `POST` | `/api/document` | Create new document |
| `PUT` | `/api/document/{id}` | Update document |
| `DELETE` | `/api/document/{id}` | Delete document |
| `POST` | `/api/comment/{docId}` | Add comment |

### Request/Response Examples

**Create Document:**
```bash
curl -X POST http://localhost:5116/api/document \
  -H "Content-Type: application/json" \
  -d '{"title": "My Drawing"}'
```

**Get Document History:**
```bash
curl http://localhost:5116/api/document/{id}/history
```

**Restore to Previous Version:**
```bash
curl http://localhost:5116/api/document/{id}/version/3
```

### SignalR Real-time Events

The frontend maintains a WebSocket connection to receive live updates:

```javascript
// Events broadcast to all connected clients

// When document is created
DocumentCreated(documentId, title, authorName)

// When document is updated
DocumentUpdated(documentId)

// When document is deleted
DocumentDeleted(documentId)

// When event is added to history
EventAdded(documentId, eventType, description, timestamp)

// Connection status
Connected()
Disconnected()
```

---

## 🔧 Configuration

### Backend Configuration

Edit [DoodleDocs/appsettings.json](DoodleDocs/appsettings.json):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

### Frontend Configuration

Edit [DoodleDocs.Web/src/config.js](DoodleDocs.Web/src/config.js):

```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5116';
export const HUB_URL = `${API_BASE_URL}/hubs/document`;
export const REQUEST_TIMEOUT = 30000; // milliseconds
```

---

## 🚀 Deployment

### Docker Compose

```bash
docker-compose up --build
```

**Services:**
- `backend`: .NET API (port 5116)
- `frontend`: React + Nginx (port 3000)
- Network: Automatic bridge network for service-to-service communication

### Production Checklist

- [ ] Set appropriate environment variables
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS (nginx reverse proxy with SSL)
- [ ] Set up persistent event storage (SQL Server, PostgreSQL, etc.)
- [ ] Configure proper logging and monitoring
- [ ] Set resource limits in docker-compose
- [ ] Use production-optimized frontend build

---

## 💡 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Event Sourcing** | Provides complete audit trail and time-travel capabilities |
| **CQRS** | Allows independent optimization of read and write paths |
| **In-Memory Store** | Fast for demo; easily swappable for SQL/NoSQL backends |
| **SignalR** | Robust, battle-tested real-time communication |
| **React** | Component-driven UI, large ecosystem, developer experience |
| **Type-Safe Hubs** | `HubMethods.DocumentCreated` instead of magic strings |
| **No Magic Numbers** | All configuration centralized and documented |

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

```
Error: Failed to establish WebSocket connection
```

**Solution:**
1. Ensure backend is running: `dotnet run` in `DoodleDocs/`
2. Check `config.js` points to correct backend URL
3. Verify CORS is enabled in `Program.cs`
4. Check network tab in browser DevTools for actual error

### Docker services not communicating

```
Error: Unable to resolve service backend
```

**Solution:**
1. Ensure `docker-compose.yml` has correct service names
2. Verify all services are running: `docker-compose ps`
3. Check logs: `docker-compose logs backend`
4. Restart services: `docker-compose down && docker-compose up`

### Port already in use

```
Error: Address already in use :::5116
```

**Solution:**
```bash
# Find process using port
lsof -i :5116

# Kill the process
kill -9 <PID>

# Or use different port
dotnet run -- --urls="http://localhost:5117"
```

---

## 📚 Learning Resources

### Understanding Event Sourcing
- [Microsoft: Event Sourcing Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- [Greg Young: Event Sourcing](https://www.youtube.com/watch?v=8JKLvHGSVsI)

### Understanding CQRS
- [Microsoft: CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Martin Fowler: CQRS](https://martinfowler.com/bliki/CQRS.html)

### ASP.NET & SignalR
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr)
- [.NET Best Practices](https://learn.microsoft.com/en-us/dotnet/fundamentals/)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Standards:**
- Follow C# coding conventions for backend
- Follow JavaScript/React best practices for frontend
- Write tests for new features
- Document complex logic

---

## 📄 License

MIT License © 2026 - See [LICENSE](LICENSE) file for details.

This project is built as a reference implementation for learning Event Sourcing and CQRS patterns.

---

## 📧 Contact & Support

- 📌 Found a bug? Open an [Issue](https://github.com/yourusername/DoodleDocs/issues)
- 💬 Questions? Start a [Discussion](https://github.com/yourusername/DoodleDocs/discussions)
- 🌟 Like it? Give it a star!

---

**Built with ❤️ using Event Sourcing, CQRS, and real-time collaboration**
