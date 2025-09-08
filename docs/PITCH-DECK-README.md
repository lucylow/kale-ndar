# KALE-ndar Pitch Deck Component

This document describes the horizontal slideshow component created for the KALE-ndar Prediction Market Platform pitch deck.

## Features

### HorizontalSlideshow Component
- **Horizontal scrolling**: Displays exactly 1 image at a time with smooth horizontal transitions
- **No text cropping**: Uses `objectFit: 'contain'` to ensure entire images are visible
- **Auto-play**: Configurable automatic slide advancement
- **Manual controls**: Previous/Next buttons and dot indicators
- **Responsive**: Configurable width and height
- **Accessibility**: ARIA labels and keyboard navigation support

### PitchDeck Page
- **Dynamic content**: Fetches architecture data from backend API
- **Fallback support**: Graceful degradation when backend is unavailable
- **Professional styling**: Clean, modern design suitable for presentations
- **Technical specifications**: Displays key technical details in organized cards
- **Data flow visualization**: Shows the complete data processing pipeline

## Usage

### Access the Pitch Deck
Navigate to `/pitch-deck` in your application to view the technical architecture slideshow.

### Backend API Endpoints
- `GET /api/pitchdeck/architecture` - Returns architecture data and specifications
- `GET /api/pitchdeck/slideshow` - Returns slideshow configuration and image URLs
- `GET /api/pitchdeck/assets/:filename` - Serves pitch deck assets (SVG diagrams, etc.)

### Component Props
```typescript
interface SlideshowProps {
  images: string[];           // Array of image URLs
  width?: number;             // Container width (default: 1200px)
  height?: number;            // Container height (default: 675px)
  interval?: number;         // Auto-advance interval in ms (default: 5000ms)
  autoPlay?: boolean;         // Enable auto-advance (default: true)
  showControls?: boolean;    // Show navigation controls (default: true)
  className?: string;         // Additional CSS classes
}
```

## Architecture Diagram

The slideshow displays a comprehensive technical architecture diagram showing:

1. **Client Layer**: Next.js frontend and React Native mobile SDK
2. **API Gateway Layer**: Node.js microservices and authentication
3. **Business Logic Layer**: Market, betting, oracle, wallet, and analytics services
4. **Blockchain Layer**: Stellar smart contracts and external oracle integration
5. **Data Layer**: Multi-model data infrastructure (TimescaleDB, Redis, IPFS, MongoDB)

## Technical Specifications

- **Frontend**: Next.js 14 with TypeScript, React Query, Web3.js
- **Backend**: Node.js microservices with gRPC, Redis caching
- **Blockchain**: Stellar Soroban smart contracts in Rust
- **Data**: Multi-model approach with TimescaleDB and MongoDB
- **Real-time**: WebSocket connections for live updates
- **Security**: JWT authentication, rate limiting, input validation
- **Monitoring**: Prometheus/Grafana metrics, distributed tracing

## Data Flow

Client → API Gateway → Microservices → Smart Contracts → Oracles → Storage

## Scalability Features

- Horizontal pod autoscaling
- Database read replicas
- CDN for static assets
- Blockchain RPC load balancing

## File Structure

```
src/
├── components/
│   └── HorizontalSlideshow.tsx    # Main slideshow component
├── pages/
│   └── PitchDeck.tsx             # Pitch deck page
└── App.tsx                       # Updated with pitch deck route

backend/
├── routes/
│   └── pitchdeck.js              # Backend API routes
├── assets/
│   └── pitchdeck/
│       └── architecture-overview.svg  # Architecture diagram
└── api/
    └── server.js                 # Updated with pitch deck routes
```

## Customization

### Adding More Slides
1. Add new SVG/image files to `backend/assets/pitchdeck/`
2. Update the `images` array in `backend/routes/pitchdeck.js`
3. The slideshow will automatically include the new images

### Modifying Architecture Data
Update the `architectureData` object in `backend/routes/pitchdeck.js` to change:
- Layer descriptions
- Technical specifications
- Data flow information
- Scalability features

### Styling Customization
The component uses Tailwind CSS classes and can be customized by:
- Modifying the `className` prop
- Updating the CSS classes in the component
- Changing the color scheme in the architecture diagram SVG

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- ES6+ JavaScript features
- SVG rendering support

## Performance Considerations

- Images are lazy-loaded for better performance
- Smooth CSS transitions with hardware acceleration
- Optimized SVG diagrams for fast rendering
- Efficient state management with React hooks

## Future Enhancements

- Full-screen presentation mode
- Export to PDF functionality
- Interactive architecture diagram elements
- Voice-over narration support
- Mobile-optimized touch gestures

