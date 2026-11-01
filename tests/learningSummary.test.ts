import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningScoreSummary } from '../src/components/summary/LearningScoreSummary';
import { learningPoints } from '../src/services/learningScore';

test('compact summary displays existing educational totals and keeps fortune effects separate', () => {
  const points = {...learningPoints(null), consultation:0,consultationMax:0,knowledge:60,knowledgeMax:60,cardPoints:20,cardMax:20,channelPoints:20,channelMax:20,total:100,maximum:100,fortune:-3};
  const original = structuredClone(points);
  const html = renderToStaticMarkup(createElement(LearningScoreSummary,{points,rulesVersion:4}));
  assert(html.replace(/<[^>]+>/g,'').includes('100 de 100 pontos disponíveis'));
  assert(html.includes('Guardiões da Integridade'));assert(html.includes('60 de 60'));
  assert.equal(html.split('20 de 20').length-1,2);
  assert(html.includes('fora da aprendizagem'));assert(html.includes('-3'));
  assert(!html.includes('Regra anterior'));assert(!html.includes('máximo considera'));
  assert.deepEqual(points,original);
});

test('compact labels preserve historical consultation and channel credits without recalculation', () => {
  const points = {...learningPoints(null),consultation:20,consultationMax:20,knowledge:65,knowledgeMax:65,channelCorrect:['missao-1'],cardPoints:5,cardMax:5,channelPoints:0,channelMax:0,total:90,maximum:90};
  const html = renderToStaticMarkup(createElement(LearningScoreSummary,{points,rulesVersion:undefined}));
  assert(html.replace(/<[^>]+>/g,'').includes('90 de 90 pontos disponíveis'));
  assert(html.includes('60 de 60'));assert(html.includes('20 de 20'));
  assert.equal(html.split('5 de 5').length-1,2);
});
