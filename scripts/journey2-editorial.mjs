// Pure parser of the approved document. No editorial rewriting or inferred dialogue.
export function parseJourney2Editorial(markdown) {
  const text = markdown.replaceAll('\r\n', '\n');
  const plain = value => value.replaceAll('**', '').trim();
  const missions = [...text.matchAll(/^## Missão (\d) — (.+)\n([\s\S]*?)(?=\n---)/gm)].map(([, number, title, body]) => {
    const scene = body.split('### Alternativas e respostas')[0];
    const actions = [...body.matchAll(/^\*\*([ABCD])\. (.+)\*\*\n\n- \*\*Consequência:\*\* (.+)\n- \*\*Reflexão:\*\* (.+)/gm)]
      .map(([, letter, title, consequence, reflection]) => ({ letter, title, consequence, reflection }));
    if (actions.length !== 4) throw Error('Expected four approved alternatives: ' + title);
    return { number: Number(number), title, theme: body.match(/\*\*Tema:\*\* (.+)/)[1],
      context: scene.match(/\*\*Contexto:\*\* (.+)/)[1],
      dialogue: [...scene.matchAll(/^\*\*([^*]+):\*\* (.+)$/gm)]
        .filter(([, speaker]) => !['Tema', 'Contexto', 'Pergunta ao jogador'].includes(speaker))
        .map(([, speaker, text]) => ({ speaker, text })),
      prompt: scene.match(/\*\*Pergunta ao jogador:\*\* (.+)/)[1], actions,
      finalReflection: plain(body.match(/\*\*Reflexão final da missão:\*\* (.+)/)[1]),
    };
  });
  if (missions.length !== 4) throw Error('Expected four approved missions');
  const opening = text.split('## Abertura\n')[1].split('\n---')[0].trim().split('\n\n');
  const closing = text.split('## Encerramento\n')[1].split('\n---')[0].trim().split('\n\n');
  return { opening: { title: plain(opening[0]), paragraphs: opening.slice(1).filter(p => !p.startsWith('**Ação:')).map(plain) },
    missions,
    closing: { title: closing[0].replace(/^### /, ''), paragraphs: closing.slice(1)
      .filter(p => !p.startsWith('**Ação opcional:') && !p.startsWith('**Endereço:')).map(plain),
      url: closing.find(p => p.startsWith('**Endereço:')).replace('**Endereço:** ', '') },
  };
}
