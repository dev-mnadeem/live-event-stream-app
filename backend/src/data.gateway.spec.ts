import { DataGateway } from './data.gateway';
describe('stream filtering',()=>{
 const gateway=new DataGateway();
 it('rejects malformed, nonfinite and out-of-range values',()=>{
  for(const payload of [null,{}, {value:'90'},{value:NaN},{value:Infinity},{value:50},{value:101}]) expect(gateway.processData(payload)).toBeNull();
 });
 it('classifies boundaries and limits transmitted fields',()=>{
  expect(gateway.processData({value:80,source:'fixture',secret:'hidden'})).toEqual({value:80,source:'fixture',severity:'normal',processedAt:expect.any(String)});
  expect(gateway.processData({value:81})?.severity).toBe('high');
 });
 it('stops the simulator on application shutdown',()=>{
  jest.useFakeTimers();gateway.server={emit:jest.fn()} as any;gateway.startSimulatedData();expect(jest.getTimerCount()).toBe(1);gateway.startSimulatedData();expect(jest.getTimerCount()).toBe(1);gateway.onModuleDestroy();expect(jest.getTimerCount()).toBe(0);jest.useRealTimers();
 });
});
