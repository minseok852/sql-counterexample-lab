export function trackAIWait(onSlow:()=>void,onTimeout:()=>void,options:{now?:()=>number,slowMs?:number,timeoutMs?:number}={}){
 const now=options.now??(()=>performance.now()),started=now(),slowMs=options.slowMs??10000;let active=true,timedOut=false;
 let slowTimer:ReturnType<typeof setTimeout>;
 const check=()=>{if(!active)return;const elapsed=now()-started;if(elapsed>=slowMs)onSlow();else slowTimer=setTimeout(check,Math.ceil(slowMs-elapsed));};
 slowTimer=setTimeout(check,slowMs);const timeoutTimer=setTimeout(()=>{if(active){timedOut=true;onTimeout()}},options.timeoutMs??65000);
 return{stop(){active=false;clearTimeout(slowTimer);clearTimeout(timeoutTimer)},get timedOut(){return timedOut},get elapsedMs(){return Math.max(0,now()-started)}};
}
