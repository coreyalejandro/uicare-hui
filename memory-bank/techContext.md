# UICare System Technical Context

## Technologies Used

### Frontend
- **Next.js 14**: React framework with App Router for server and client components
- **React 18+**: For building user interfaces with functional components and hooks
- **TypeScript**: For type-safe development
- **Tailwind CSS**: For utility-based styling
- **Framer Motion**: For smooth, accessible animations
- **Inter Font**: Default font family through Next.js font optimization

### State Management
- **React Context API**: For global state management
- **LocalStorage**: For client-side persistence of settings

### Planned AI Integration
- **Azure AI Agents**: For emotion detection and generating suggestions
- **Azure Identity**: For authentication with Azure services

### VSCode Extension (Planned)
- **Node.js**: Runtime for the extension
- **VSCode Extension API**: For integrating with the editor
- **WebView API**: For custom UI panels in VSCode

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Visual Studio Code
- Git

### Local Development
1. Clone the repository
2. Install dependencies with `npm install` or `yarn`
3. Run the development server with `npm run dev` or `yarn dev`
4. Access the application at http://localhost:3000

### Project Structure
```
uicare-system/
├── docs/              # Project documentation
├── memory-bank/       # Project context and memory files
├── web/               # Web application code
│   ├── public/        # Static assets
│   ├── src/           # Source code
│   │   ├── app/       # Next.js App Router
│   │   │   ├── components/  # React components
│   │   │   ├── globals.css  # Global styles
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── page.tsx     # Home page
│   │   └── index.ts   # Module exports
│   ├── styles/        # Additional style files
│   ├── package.json   # Dependencies and scripts
│   └── tsconfig.json  # TypeScript configuration
└── README.md          # Project overview
```

## Technical Constraints

### Browser Compatibility
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile browser support for responsive design

### Performance
- Target First Contentful Paint: < 1.5s
- Target Time to Interactive: < 3s
- Target Lighthouse score: > 90

### Accessibility
- WCAG 2.1 AA compliance
- Support for keyboard navigation
- Screen reader compatibility
- Support for reduced motion preferences

### Progressive Enhancement
- Core functionality should work without JavaScript
- Enhanced experience with JavaScript enabled

## Dependencies

### Primary Dependencies
- **next**: React framework
- **react/react-dom**: UI library
- **typescript**: Type checking
- **tailwindcss**: Utility CSS framework
- **framer-motion**: Animation library

### Development Dependencies
- **eslint**: Code linting
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixing

## Build and Deployment

### Build Process
- Build command: `npm run build` or `yarn build`
- Output: Static HTML, JS, and CSS files in `.next` directory

### Deployment Targets
- Vercel (preferred for Next.js applications)
- Azure Static Web Apps
- Any static hosting that supports Next.js export

## Future Technical Considerations

### Scalability
- Consider server components for data-heavy operations
- Implement code splitting for better performance

### Security
- Implement Content Security Policy
- Regular dependency audits
- User data protection measures

### Monitoring
- Error tracking
- Performance monitoring
- User behavior analytics (with privacy considerations)
