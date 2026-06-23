import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';
import { assessRisk } from '../../lib/riskService';
import { detectLoop, getAdvice } from '../../lib/aiService';

jest.mock('../../lib/riskService');
jest.mock('../../lib/aiService');

const mockedAssessRisk = assessRisk as jest.Mock;
const mockedDetectLoop = detectLoop as jest.Mock;
const mockedGetAdvice = getAdvice as jest.Mock;

describe('risk escalation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows crisis resources when risk is high', async () => {
    mockedAssessRisk.mockResolvedValue({ score: 0.95 });

    render(<Home />);
    fireEvent.change(screen.getByLabelText('Work text'), { target: { value: 'test' } });
    fireEvent.click(screen.getByLabelText('Check for loop'));

    expect(await screen.findByText(/Suicide & Crisis Lifeline/i)).toBeInTheDocument();
    expect(mockedDetectLoop).not.toHaveBeenCalled();
  });

  it('continues with advice when risk is low', async () => {
    mockedAssessRisk.mockResolvedValue({ score: 0.1 });
    mockedDetectLoop.mockResolvedValue({ loopDetected: true, details: 'details' });
    mockedGetAdvice.mockResolvedValue(['step1']);

    render(<Home />);
    fireEvent.change(screen.getByLabelText('Work text'), { target: { value: 'test' } });
    fireEvent.click(screen.getByLabelText('Check for loop'));

    expect(await screen.findByText('step1')).toBeInTheDocument();
    expect(screen.queryByText(/Suicide & Crisis Lifeline/i)).toBeNull();
  });
});
