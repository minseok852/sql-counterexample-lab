export function solutionRequested(question:string){
 if(/(?:정답|완성|수정)\s*(?:SQL|쿼리)[\s\S]{0,16}(?:쓰지|주지|말고|없이|금지|대신)/i.test(question))return false;
 return /(?:정답|완성|수정)\s*(?:SQL|쿼리)[\s\S]{0,16}(?:보여|알려|작성|제시|공개|주세요|줘)/i.test(question);
}
export function answerPolicy(text:string,question:string,currentSQL=''){
 if(!text.trim())return{text:'AI가 설명을 반환하지 않았습니다. 위의 기본 해설과 힌트를 사용해 주세요.',source:'fallback' as const,reason:'empty'};
 const normalize=(value:string)=>value.replace(/\s+/g,' ').trim().replace(/;$/,'').toLowerCase();
 const candidates=[...text.matchAll(/```(?:sql)?\s*([\s\S]*?)```/gi)].map(m=>m[1]);
 for(const m of text.matchAll(/`([^`\n]+)`/g))if(/^\s*(SELECT|WITH)\b/i.test(m[1]))candidates.push(m[1]);
 for(const m of text.matchAll(/(?:^|\n)\s*((?:SELECT|WITH)\b[^\n]*)/gi))candidates.push(text.slice(m.index).trim());
 if(/(?:정답|수정된\s*쿼리)[^\n]{0,30}\bSELECT\b/i.test(text))candidates.push(text);
 const fullQuery=candidates.some(sql=>/\bSELECT\s+[\s\S]{1,500}?\bFROM\s+[a-z_"\[]/i.test(sql)&&(!currentSQL||!normalize(currentSQL).includes(normalize(sql))));
 if(fullQuery&&!solutionRequested(question))return{text:'요청하지 않은 완성 SQL이 포함되어 AI 답변을 표시하지 않았습니다. 위의 기본 해설과 단계별 힌트를 사용해 주세요.',source:'fallback' as const,reason:'unsolicited-sql'};
 return{text,source:'model' as const};
}
