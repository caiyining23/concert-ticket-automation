import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_CONFIG, normalizeConfig, selectCandidates, compactStatus} from '../src/core.js';
test('defaults have click mode disabled', () => {assert.equal(DEFAULT_CONFIG.autoSelect, false);assert.equal(DEFAULT_CONFIG.notify, true);});
test('selector is validated', () => {assert.throws(() => normalizeConfig({selector:'a'.repeat(501)}));assert.equal(normalizeConfig({selector:'.available'}).selector, '.available');});
test('ticket count is bounded', () => {assert.equal(normalizeConfig({maxSelections:200}).maxSelections,4);assert.equal(normalizeConfig({maxSelections:-5}).maxSelections,1);});
test('interval is bounded', () => assert.equal(normalizeConfig({minimumIntervalMs:10}).minimumIntervalMs,2000));
test('click mode must be explicitly enabled', () => {assert.equal(normalizeConfig({autoSelect:'true'}).autoSelect,false);assert.equal(normalizeConfig({autoSelect:true}).autoSelect,true);});
test('candidate matching excludes disabled/hidden', () => {
  const fake = (disabled=false, visible=true) => ({getAttribute: (x) => x==='aria-disabled'&&disabled?'true':null,matches:()=>false,getClientRects:()=>visible?[1]:[]});
  assert.equal(selectCandidates([fake(),fake(true),fake(false,false),fake()],3).length,2);
});
test('status string distinguishes available seats',()=>{assert.match(compactStatus(2,'notify only'),/2 available/);assert.match(compactStatus(0,'notify only'),/No matching/);});
