import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as express from 'express';
async function bootstrap() {
 const app=await NestFactory.create(AppModule);
 app.enableShutdownHooks();
 app.enableCors({origin:process.env.CORS_ORIGIN || 'http://localhost:3000'});
 const adapter=app.getHttpAdapter().getInstance();
 adapter.get('/health',(_request:express.Request,response:express.Response)=>response.json({status:'ok'}));
 const publicPath=join(__dirname,'..','public');
 if(existsSync(join(publicPath,'index.html'))) {
  adapter.use(express.static(publicPath));
  adapter.get(/.*/,(_request:express.Request,response:express.Response)=>response.sendFile(join(publicPath,'index.html')));
 }
 await app.listen(Number(process.env.PORT || 3001),'0.0.0.0');
}
void bootstrap();
