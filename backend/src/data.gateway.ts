import { OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type IncomingEvent = { value: number; source?: string };
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }, maxHttpBufferSize: 16384 })
export class DataGateway implements OnGatewayInit, OnModuleDestroy {
  @WebSocketServer() server: Server;
  private timer?: ReturnType<typeof setInterval>;
  afterInit() { if(process.env.SIMULATE_DATA !== 'false') this.startSimulatedData(); }
  onModuleDestroy() { if(this.timer) clearInterval(this.timer); }
  @SubscribeMessage('newData')
  handleNewData(_client: Socket, payload: unknown) {
    const processed=this.processData(payload);
    if(processed) this.server.emit('processedData',processed);
    return { status: processed ? 'emitted' : 'filtered' };
  }
  processData(payload: unknown) {
    if(!payload || typeof payload !== 'object') return null;
    const {value,source}=payload as IncomingEvent;
    if(typeof value !== 'number' || !Number.isFinite(value) || value<=50 || value>100) return null;
    return { value, source: typeof source === 'string' ? source.slice(0,80) : 'client',
      processedAt:new Date().toISOString(),severity:value>80?'high':'normal' };
  }
  startSimulatedData() {
    if(this.timer) return;
    this.timer=setInterval(()=>{
      const processed=this.processData({value:Math.floor(Math.random()*100),source:'simulator'});
      if(processed) this.server.emit('processedData',processed);
    },2000);
  }
}
