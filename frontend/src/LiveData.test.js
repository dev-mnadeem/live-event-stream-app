import { render, screen, act } from '@testing-library/react';
import LiveData from './LiveData';
import { io } from 'socket.io-client';
jest.mock('socket.io-client',()=>({io:jest.fn()}));
let handlers,disconnect;
beforeEach(()=>{handlers={};disconnect=jest.fn();io.mockReturnValue({on:jest.fn((event,callback)=>{handlers[event]=callback;}),disconnect});});
test('renders connection changes and received events',()=>{
 render(<LiveData />);expect(screen.getByRole('status').textContent).toBe('Connecting');
 act(()=>handlers.connect());expect(screen.getByRole('status').textContent).toBe('Connected');
 act(()=>handlers.processedData({value:88,severity:'high',source:'fixture',processedAt:'2026-01-01T10:00:00Z'}));
 expect(screen.getByText('fixture')).toBeTruthy();
 act(()=>handlers.disconnect());expect(screen.getByRole('status').textContent).toBe('Disconnected');
});
test('caps events, rejects invalid numbers and disconnects on unmount',()=>{
 const {unmount}=render(<LiveData />);
 act(()=>{for(let n=0;n<130;n++) handlers.processedData({value:90,severity:'high',processedAt:String(n)});handlers.processedData({value:NaN});});
 expect(screen.getAllByRole('listitem')).toHaveLength(100);unmount();expect(disconnect).toHaveBeenCalledTimes(1);
});
