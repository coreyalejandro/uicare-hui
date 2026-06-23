'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RealityFilter } from '../components/RealityFilter';
import SettingsPanel from '../components/SettingsPanel';

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed header with controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-foreground/20 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-foreground hover:text-foreground/80 transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-xl font-bold">UICare Documentation</h1>
        </div>
        <div className="flex items-center space-x-4">
          <RealityFilter />
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            aria-label="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50">
          <SettingsPanel />
        </div>
      )}

      {/* Main content with padding for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 documentation-content mt-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Documentation</h2>
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-foreground text-background' 
                      : 'hover:bg-foreground/10'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('reality-filters')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'reality-filters' 
                      ? 'bg-foreground text-background' 
                      : 'hover:bg-foreground/10'
                  }`}
                >
                  Reality Filters
                </button>
                <button 
                  onClick={() => setActiveTab('ninja-presence')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'ninja-presence' 
                      ? 'bg-foreground text-background' 
                      : 'hover:bg-foreground/10'
                  }`}
                >
                  Ninja Presence
                </button>
                <button 
                  onClick={() => setActiveTab('trauma-informed')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'trauma-informed' 
                      ? 'bg-foreground text-background' 
                      : 'hover:bg-foreground/10'
                  }`}
                >
                  Trauma-Informed Design
                </button>
                <button 
                  onClick={() => setActiveTab('customization')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'customization' 
                      ? 'bg-foreground text-background' 
                      : 'hover:bg-foreground/10'
                  }`}
                >
                  Customization
                </button>
                <div className="pt-4 mt-4 border-t border-foreground/20">
                  <Link 
                    href="/"
                    className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">UICare: Enhancing User Interfaces with Wellness in Mind</h1>
                
                <p className="text-lg mb-6">
                  UICare is a collection of React components designed to make web applications more accessible, 
                  intuitive, and supportive of users' mental well-being. It focuses on creating interfaces 
                  that are comfortable for neurodivergent users while enhancing the experience for everyone.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">What is UICare?</h2>
                <p>
                  UICare is a project dedicated to integrating neurodivergent-friendly features into web applications. 
                  By incorporating features like customizable reality filters and trauma-informed interactions, 
                  UICare aims to support users with different sensory preferences and cognitive styles.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Key Features</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Reality Filters:</strong> Allow users to switch between different visual modes to suit their preferences.</li>
                  <li><strong>Ninja Presence:</strong> A subtle, animated indicator that provides gentle visual feedback without causing distractions.</li>
                  <li><strong>Trauma-Informed Interactions:</strong> Components designed with sensitivity to potential triggers, ensuring a safe user experience.</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Getting Started</h2>
                <p>
                  To use UICare in your project, you need to wrap your application with the RealityProvider 
                  component and then use the individual components as needed. Each feature can be customized 
                  to fit your specific requirements.
                </p>
                
                <div className="bg-foreground/5 p-4 rounded-md mt-4">
                  <h3 className="text-xl font-semibold mb-2">Basic Implementation</h3>
                  <pre className="bg-foreground/10 p-4 rounded-md overflow-x-auto">
                    <code>{`import { RealityProvider } from './components/RealityProvider';
import { RealityFilter } from './components/RealityFilter';
import { NinjaPresence } from './components/NinjaPresence';

function App() {
  return (
    <RealityProvider>
      <RealityFilter />
      <NinjaPresence />
      {/* Your application components */}
    </RealityProvider>
  );
}`}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'reality-filters' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">Understanding UICare's Reality Filters</h1>
                
                <p className="text-lg mb-6">
                  UICare's reality filters are designed to help users customize their visual experience based on their preferences and needs. 
                  Each filter has specific effects that can make content more accessible, comfortable, or focused.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Standard Mode</h2>
                <div className="bg-foreground/5 p-4 rounded-md mb-6">
                  <h3 className="text-xl font-semibold mb-2">What it does:</h3>
                  <p>Provides the default visual experience with no filters applied.</p>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">Benefits for users:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Maintains the original design intent of websites and applications</li>
                    <li>Works well for users who don't experience visual sensitivities</li>
                    <li>Preserves color accuracy and contrast as designed by content creators</li>
                  </ul>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Ninja Vision Mode</h2>
                <div className="bg-foreground/5 p-4 rounded-md mb-6">
                  <h3 className="text-xl font-semibold mb-2">What it does:</h3>
                  <p>Enhances visual focus by adjusting contrast, brightness, and saturation.</p>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">Specific changes:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Increased contrast (1.3×):</strong> Makes text and UI elements stand out more clearly from backgrounds</li>
                    <li><strong>Reduced brightness (0.7×):</strong> Creates a more comfortable viewing experience in bright environments</li>
                    <li><strong>Increased saturation (1.4×):</strong> Makes colors more vibrant and distinct</li>
                    <li><strong>Subtle dark overlay:</strong> Adds a slight darkening effect to reduce eye strain</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">Benefits for users:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Helps users with visual processing differences focus on content</li>
                    <li>Reduces eye strain during extended viewing sessions</li>
                    <li>Makes text more readable for users with visual impairments</li>
                    <li>Creates a more immersive experience for content that requires attention to detail</li>
                    <li>Particularly helpful for users with ADHD or visual processing disorders</li>
                  </ul>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Protocol Mode</h2>
                <div className="bg-foreground/5 p-4 rounded-md mb-6">
                  <h3 className="text-xl font-semibold mb-2">What it does:</h3>
                  <p>Applies a red-tinted filter with subtle audio feedback.</p>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">Specific changes:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Sepia effect (1×):</strong> Adds a warm, paper-like quality to the screen</li>
                    <li><strong>Hue rotation (320°):</strong> Shifts colors toward the red spectrum</li>
                    <li><strong>Increased saturation (2.5×):</strong> Makes colors more intense</li>
                    <li><strong>Subtle red gradient overlay:</strong> Adds a slight red tint to the entire interface</li>
                    <li><strong>Audio feedback:</strong> Plays a subtle sound when activated (customizable)</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">Benefits for users:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Creates a distinct visual environment that can help with focus</li>
                    <li>The red tint can reduce eye strain in low-light conditions</li>
                    <li>The audio feedback provides confirmation of mode changes for users who benefit from multi-sensory input</li>
                    <li>Can help users with light sensitivity or migraines by reducing blue light</li>
                    <li>The warm color temperature can create a more calming environment</li>
                    <li>Particularly helpful for users who experience sensory overload in standard viewing modes</li>
                  </ul>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Customization Options</h2>
                <p>
                  All filters can be adjusted through the settings panel:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Filter Intensity:</strong> Adjust how strong each filter's effects are (0.5× to 2×)</li>
                  <li><strong>Audio Settings:</strong> Control whether audio feedback plays and at what volume/frequency</li>
                  <li><strong>Personal Preferences:</strong> Save your preferred settings for future sessions</li>
                </ul>
                <p className="mt-4">
                  These customizable filters allow users to create a visual environment that works best for their specific needs, 
                  whether they're neurodivergent, have visual sensitivities, or simply prefer a different viewing experience.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
                <p>
                  The RealityFilter component provides a set of buttons that users can click to switch between different 
                  visual modes. Each mode applies different CSS filters to the entire application, creating a distinct 
                  visual experience.
                </p>
                
                <div className="bg-foreground/5 p-4 rounded-md mt-4">
                  <h3 className="text-xl font-semibold mb-2">CSS Customization</h3>
                  <pre className="bg-foreground/10 p-4 rounded-md overflow-x-auto">
                    <code>{`.reality-layer.ninja {
  filter: contrast(1.3) brightness(0.7) saturate(1.4);
  background: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
}

.reality-layer.red {
  filter: sepia(1) hue-rotate(320deg) saturate(2.5);
  background: linear-gradient(rgba(255, 0, 0, 0.05), rgba(255, 0, 0, 0.05));
}`}</code>
                  </pre>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Adding Custom Filters</h2>
                <p>
                  To add a custom filter, you need to:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Add a new option to the filter array in the RealityFilter component</li>
                  <li>Define the corresponding CSS class in globals.css</li>
                  <li>Update the RealityFilter type in the RealityProvider component</li>
                </ol>
              </div>
            )}

            {activeTab === 'ninja-presence' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">Ninja Presence</h1>
                
                <p className="text-lg mb-6">
                  Ninja Presence is a subtle, animated indicator that provides gentle visual feedback without causing distractions. 
                  It's designed to be unobtrusive while still being noticeable when needed.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
                <p>
                  The NinjaPresence component displays a small, circular indicator in the bottom-right corner of the screen. 
                  When clicked, it toggles between active and inactive states, with visual feedback to indicate the current state.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Subtle Design:</strong> Semi-transparent background with a backdrop blur effect</li>
                  <li><strong>Visual Feedback:</strong> Scales up slightly when active</li>
                  <li><strong>Accessibility:</strong> Provides clear visual indication of state</li>
                  <li><strong>Customizable:</strong> Can be styled to match your application's design</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Customization</h2>
                <p>
                  You can customize the NinjaPresence component by modifying its CSS classes or extending its functionality.
                </p>
                
                <div className="bg-foreground/5 p-4 rounded-md mt-4">
                  <h3 className="text-xl font-semibold mb-2">CSS Customization</h3>
                  <pre className="bg-foreground/10 p-4 rounded-md overflow-x-auto">
                    <code>{`<div 
  className={\`fixed bottom-4 right-4 w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-sm cursor-pointer transition-all duration-300 flex items-center justify-center \${
    isActive ? 'scale-110 bg-foreground/20' : 'hover:bg-foreground/15'
  }\`}
  onClick={() => {
    setIsActive(!isActive);
    alert('👁 Ninja Mode ' + (isActive ? 'Deactivated' : 'Activated'));
  }}
>
  <span className={\`text-2xl transition-transform duration-300 \${isActive ? 'scale-110' : ''}\`}>
    👁
  </span>
</div>`}</code>
                  </pre>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Extending Functionality</h2>
                <p>
                  You can extend the NinjaPresence component to perform additional actions when activated, 
                  such as enabling specific features or changing the application's behavior.
                </p>
              </div>
            )}

            {activeTab === 'trauma-informed' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">Trauma-Informed Design</h1>
                
                <p className="text-lg mb-6">
                  Trauma-Informed Design is an approach to creating interfaces that are sensitive to potential triggers 
                  and provide a safe, comfortable experience for all users, especially those who may have experienced trauma.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Principles</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Safety:</strong> Creating an environment where users feel secure</li>
                  <li><strong>Trustworthiness:</strong> Being transparent and consistent</li>
                  <li><strong>Choice:</strong> Giving users control over their experience</li>
                  <li><strong>Collaboration:</strong> Working with users to meet their needs</li>
                  <li><strong>Empowerment:</strong> Supporting users in making their own decisions</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Implementation in UICare</h2>
                <p>
                  UICare implements trauma-informed design principles through:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Reality Filters:</strong> Allowing users to adjust the visual environment to their comfort</li>
                  <li><strong>Ninja Presence:</strong> Providing subtle, non-threatening visual feedback</li>
                  <li><strong>Consistent Design:</strong> Maintaining predictable patterns and behaviors</li>
                  <li><strong>User Control:</strong> Giving users the ability to customize their experience</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Best Practices</h2>
                <p>
                  When implementing trauma-informed design in your application:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Avoid sudden, unexpected changes or animations</li>
                  <li>Provide clear warnings before potentially triggering content</li>
                  <li>Allow users to skip or modify content that may be distressing</li>
                  <li>Use calming colors and visual elements</li>
                  <li>Ensure all interactions are predictable and controllable</li>
                </ol>
              </div>
            )}

            {activeTab === 'customization' && (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">Customization</h1>
                
                <p className="text-lg mb-6">
                  UICare is designed to be highly customizable, allowing you to adapt it to your specific needs and preferences. 
                  This section provides guidance on how to customize various aspects of UICare.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Theme Customization</h2>
                <p>
                  UICare uses CSS variables for theming, which can be customized in the globals.css file:
                </p>
                
                <div className="bg-foreground/5 p-4 rounded-md mt-4">
                  <pre className="bg-foreground/10 p-4 rounded-md overflow-x-auto">
                    <code>{`:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}`}</code>
                  </pre>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Component Customization</h2>
                <p>
                  Each component can be customized by modifying its CSS classes or extending its functionality:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">RealityFilter</h3>
                <p>
                  Customize the appearance and behavior of the RealityFilter component:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify the button styles in the RealityFilter component</li>
                  <li>Add or remove filter options</li>
                  <li>Change the filter effects in globals.css</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">NinjaPresence</h3>
                <p>
                  Customize the appearance and behavior of the NinjaPresence component:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Change the position, size, and appearance</li>
                  <li>Modify the animation effects</li>
                  <li>Add additional functionality when activated</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Advanced Customization</h2>
                <p>
                  For more advanced customization, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create custom components that extend UICare's functionality</li>
                  <li>Modify the RealityProvider to add new features</li>
                  <li>Integrate UICare with other accessibility tools and libraries</li>
                </ul>
                
                <div className="bg-foreground/5 p-4 rounded-md mt-4">
                  <h3 className="text-xl font-semibold mb-2">Example: Custom Filter</h3>
                  <pre className="bg-foreground/10 p-4 rounded-md overflow-x-auto">
                    <code>{`// In RealityProvider.tsx
type RealityFilter = 'default' | 'ninja' | 'red' | 'custom';

// In RealityFilter.tsx
{ id: 'custom' as const, label: 'Custom', icon: '🎨' }

// In globals.css
.reality-layer.custom {
  filter: brightness(1.2) contrast(0.9) saturate(1.1);
  background: linear-gradient(rgba(0, 128, 255, 0.05), rgba(0, 128, 255, 0.05));
}`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 