import { render, screen, fireEvent } from '@testing-library/react';
import GuidedTutorial, { Tutorial } from '../GuidedTutorial';

describe('GuidedTutorial', () => {
  const tutorial: Tutorial = {
    title: 'Test Tutorial',
    steps: [
      {
        text: 'Step 1',
        image: '/img1.png',
        audio: '/audio1.mp3',
        warnings: ['Be careful']
      },
      {
        text: 'Step 2',
        image: '/img2.png'
      }
    ]
  };

  it('navigates through steps and loads media', () => {
    render(<GuidedTutorial tutorial={tutorial} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    const audio = screen.getByTestId('audio') as HTMLAudioElement;
    expect(audio).toHaveAttribute('src', '/audio1.mp3');

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.queryByTestId('audio')).toBeNull();
  });
});
