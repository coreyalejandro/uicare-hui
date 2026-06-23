import { render, screen } from '@testing-library/react';
import MemoryViewer from '../MemoryViewer';

describe('MemoryViewer', () => {
  it('sanitizes script tags while preserving safe HTML', async () => {
    const content = 'Hello <script>alert("xss")</script> <b>bold</b>';
    render(<MemoryViewer content={content} fileName="test.md" />);

    // Safe HTML should remain
    const bold = await screen.findByText('bold');
    expect(bold.tagName.toLowerCase()).toBe('b');

    // Script tags should be removed
    expect(document.querySelector('script')).toBeNull();
  });
});
