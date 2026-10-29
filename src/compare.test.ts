import {describe,it,expect} from 'vitest';import{diff}from'./compare';
const r=(rows:any[][],columns=['id'])=>({rows,columns});
describe('multiset comparison',()=>{
it('ignores order and aliases',()=>expect(diff(r([[2],[1]],['alias']),r([[1],[2]])).equal).toBe(true));
it('preserves duplicate multiplicity',()=>expect(diff(r([[1],[1]]),r([[1]])).extra).toEqual([[1]]));
it('distinguishes null zero empty and string NULL',()=>{for(const x of [0,'','NULL'])expect(diff(r([[x]]),r([[null]])).equal).toBe(false)});
it('checks column count even for empty output',()=>expect(diff(r([],['a','b']),r([])).equal).toBe(false));
});
