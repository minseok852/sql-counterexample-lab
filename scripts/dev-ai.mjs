import {createServer} from 'vite';
process.env.VITE_ENABLE_AI='true';
const server=await createServer({server:{host:'127.0.0.1',port:Number(process.env.SQL_LAB_DEV_PORT||5174)}});
await server.listen();server.printUrls();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0)});
