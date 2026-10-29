import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({plugins:[react()],optimizeDeps:{exclude:['@sqlite.org/sqlite-wasm']},server:{port:5174,strictPort:true,proxy:(process.env.VITE_ENABLE_AI||loadEnv(mode,process.cwd(),'VITE_').VITE_ENABLE_AI)==='true'?{'/api':'http://127.0.0.1:3001'}:undefined},preview:{proxy:{}}}));
