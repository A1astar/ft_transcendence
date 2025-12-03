# ft_transcendence

A full-stack web application implementing a modern Pong game with multiplayer capabilities, tournaments, and real-time gameplay. This project demonstrates microservices architecture, containerization, and modern web development practices.

## 🎮 Features

### Game Modes
- **Local Multiplayer**: Classic 2-player Pong on the same device
- **Remote 2-Player**: Online multiplayer with real-time synchronization
- **Remote 4-Player**: Extended multiplayer experience with 4 concurrent players
- **Tournament System**: Organized tournaments for 4 or 8 players with bracket progression

### Authentication & User Management
- User registration and login system
- OAuth integration with Google
- Profile management with game statistics
- Guest mode for quick play

### Real-time Features
- WebSocket-based real-time gameplay
- Live game state synchronization
- Queue system for matchmaking
- Tournament bracket updates

## 🏗️ Architecture

The application follows a microservices architecture with the following services:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Reverse Proxy  │    │   Gateway       │
│   (TypeScript)  │◄──►│   (Nginx)        │◄──►│   (Node.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │Authentication│ │Game Engine  │ │Game Orchestr│
        │  Service     │ │  Service    │ │   ation     │
        │ (Node.js)    │ │ (Node.js)   │ │ (Node.js)   │
        └──────────────┘ └─────────────┘ └────────────┘
```

### Service Details

- **Frontend**: TypeScript/JavaScript SPA with 3D graphics and responsive UI
- **Reverse Proxy**: Nginx handling SSL/TLS, static files
- **Gateway**: API gateway for request routing and service orchestration
- **Authentication Service**: User management, OAuth, session handling
- **Game Engine**: Real-time game logic, physics, and WebSocket connections
- **Game Orchestration**: Matchmaking, tournaments, and game state management

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Make
- Node.js (for local development)

### Running the Application

1. **Clone the repository**
   ```bash
   git clone https://github.com/A1astar/ft_transcendence.git
   cd ft_transcendence/app
   ```

2. **Set up environment variables**
   ```bash
   cp build/.env.example build/.env
   # Edit build/.env with your configuration
   ```

3. **Build and start services**
   ```bash
   make up
   ```

4. **Access the application**
   - HTTPS: https://localhost:8443
   - HTTP: http://localhost:8080 (redirects to HTTPS)

### Development Commands

```bash
# Build and start all services
make up

# Stop all services
make down

# Clean rebuild
make re

# Build frontend only
make frontend-build

# Run local development (without Docker)
make local-watch

# View logs
docker compose -f build/docker-compose.yml logs -f [service-name]
```

## 🛠️ Technology Stack

### Frontend
- **TypeScript/JavaScript**: Modern ES6+ syntax
- **Three.js**: 3D graphics and animations
- **WebSocket**: Real-time game communication
- **Tailwind CSS**: Utility-first styling

### Backend Services
- **Node.js**: Runtime environment
- **Fastify**: High-performance web framework
- **WebSocket**: Real-time communication
- **SQLite**: Lightweight database for user data

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Service orchestration
- **Nginx**: Reverse proxy and static file serving
- **SSL/TLS**: Self-signed certificates for HTTPS

## 🎯 Game Features

### Pong Mechanics
- Realistic ball physics with collision detection
- Responsive paddle controls
- Score tracking and win conditions
- Customizable game settings

### Tournament System
- Single-elimination brackets
- Automatic progression
- Real-time bracket updates
- Winner announcements

### Multiplayer
- WebSocket-based real-time sync
- Disconnection handling

## 📁 Project Structure

```
ft_transcendence/
├── app/
│   ├── build/                  # Docker Compose and build scripts
│   ├── frontend/               # TypeScript frontend application
│   ├── services/               # Microservices
│   │   ├── authentication/     # User auth and OAuth
│   │   ├── gateway/            # API gateway
│   │   ├── game-engine/        # Real-time game logic
│   │   └── game-orchestration/ # Matchmaking and tournaments
│   └── infrastructure/         # Nginx, monitoring, etc.
└── docs/                       # Project documentation
```

## 🔧 Configuration

### Environment Variables
Create `build/.env` with:
```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GOOGLE_CALLBACK_URL=https://localhost:8443/api/auth/oauth/google/callback
```

### SSL Certificates
Self-signed certificates are automatically generated. For production, replace:
- `frontend/certs/self.crt`
- `frontend/certs/self.key`

## 🧪 Testing

### API Testing
```bash
# Game engine CLI tests
cd app/services/game-engine
./cli-game.sh

# Service-specific HTTP requests
# Check *.http files in each service directory
```

### Manual Testing
1. Register/login users
2. Test different game modes
3. Create tournaments
4. Verify real-time sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is part of 42 School curriculum.

## 🎨 Theme: Lord of the Rings

The application features a Lord of the Rings theme with:
- Middle-earth inspired UI design
- Themed backgrounds and assets
- LOTR-style naming conventions
- Immersive visual experience

---

*Built with ❤️ for 42 School*