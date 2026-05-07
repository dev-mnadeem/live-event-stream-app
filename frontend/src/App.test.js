import { render, screen } from '@testing-library/react';
import App from './App';
jest.mock('socket.io-client',()=>({io:()=>({on:jest.fn(),disconnect:jest.fn()})}));
test('shows the stream workspace before any event arrives',()=>{
 render(<App />);
 expect(screen.getByRole('heading',{name:'Signal monitor'})).toBeInTheDocument();
 expect(screen.getByRole('status')).toHaveTextContent('Connecting');
 expect(screen.getByText(/Waiting for a qualifying event/)).toBeInTheDocument();
});
