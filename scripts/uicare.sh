#!/bin/bash

# Variables
PROJECT_NAME="uicare"
GITHUB_USERNAME="coreyalejandro"
REPO_URL="https://github.com/coreyalejandro/uicare.git"

# Error handling function
handle_error() {
    local exit_code=$1
    local msg="$2"
    echo "Error: $msg (exit code: $exit_code)"
    # Decide whether to exit or continue based on the error
    # exit $exit_code  # Uncomment to exit on critical errors
}

# Step 1: Create Next.js App
echo "Creating Next.js application..."
npx create-next-app@latest $PROJECT_NAME --typescript --eslint --use-npm
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create Next.js application"
    # exit $?  # Uncomment to exit on critical errors
fi
cd $PROJECT_NAME || { handle_error $? "Failed to navigate to project directory"; exit $?; }

# Step 2: Install Additional Dependencies (if any)
# echo "Installing additional dependencies..."
# npm install [package-name]
# if [ $? -ne 0 ]; then
#     handle_error $? "Failed to install additional dependencies"
#     # exit $?  # Uncomment to exit on critical errors
# fi

# Step 3: Set Up Project Structure
echo "Setting up project structure..."
mkdir -p components pages styles public
if [ $? -ne 0 ]; then
    handle_error $? "Failed to set up project structure"
    # exit $?  # Uncomment to exit on critical errors
fi

# Step 4: Create Components
echo "Creating components..."

# RealityProvider.tsx
cat <<EOL > components/RealityProvider.tsx
import { createContext, useState, useContext, useEffect } from 'react';

type RealityFilter = 'default' | 'ninja' | 'red';

const RealityContext = createContext({
  filter: 'default' as RealityFilter,
  setFilter: (f: RealityFilter) => {},
});

export const useReality = () => useContext(RealityContext);

export const RealityProvider = ({ children }) => {
  const [filter, setFilter] = useState<RealityFilter>('default');

  useEffect(() => {
    if (filter === 'red') {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const play = () => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(54.7, context.currentTime);
        gain.gain.setValueAtTime(0.3, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.5);
        osc.connect(gain).connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + 1.6);
      };
      const interval = setInterval(play, 13000);
      return () => clearInterval(interval);
    }
  }, [filter]);

  return (
    <RealityContext.Provider value={{ filter, setFilter }}>
      <div className={\`reality-layer \${filter}\`}>{children}</div>
    </RealityContext.Provider>
  );
};
EOL
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create RealityProvider.tsx"
    # exit $?  # Uncomment to exit on critical errors
fi

# RealityFilter.tsx
cat <<EOL > components/RealityFilter.tsx
import { useReality } from './RealityProvider';

export const RealityFilter = () => {
  const { filter, setFilter } = useReality();
  return (
    <div>
      {['default', 'ninja', 'red'].map((f) => (
        <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}>
          {f === 'ninja' ? '👁 Ninja Vision' : f === 'red' ? '🔴 Protocol' : 'Standard'}
        </button>
      ))}
    </div>
  );
};
EOL
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create RealityFilter.tsx"
    # exit $?  # Uncomment to exit on critical errors
fi

# NinjaPresence.tsx
cat <<EOL > components/NinjaPresence.tsx
export const NinjaPresence = () => (
  <div className="ninja-presence" onClick={() => alert('👁 Activated')}>
    {/* SVG or background image */}
  </div>
);
EOL
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create NinjaPresence.tsx"
    # exit $?  # Uncomment to exit on critical errors
fi

# Step 5: Configure Pages
echo "Configuring pages..."

# _app.tsx
cat <<EOL > pages/_app.tsx
import { RealityProvider } from '../components/RealityProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <RealityProvider>
      <Component {...pageProps} />
    </RealityProvider>
  );
}
EOL
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create _app.tsx"
    # exit $?  # Uncomment to exit on critical errors
fi

# index.tsx
cat <<EOL > pages/index.tsx
import { RealityFilter } from '../components/RealityFilter';
import { NinjaPresence } from '../components/NinjaPresence';

export default function Home() {
  return (
    <main>
      <RealityFilter />
      <NinjaPresence />
    </main>
  );
}
EOL
if [ $? -ne 0 ]; then
    handle_error $? "Failed to create index.tsx"
    # exit $?  # Uncomment to exit on critical errors
fi

# Step 6: Add Global Styles
echo "Adding global styles..."

cat <<EOL > styles/globals.css
@keyframes ninja-blink {
  0%, 100% { transform: scaleY(1); opacity: 0.8; }
  50% { transform: scaleY(0. 