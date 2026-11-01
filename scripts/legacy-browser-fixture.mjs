/** Used only by isolated browser tests to represent saves from the previous release. */
export async function restoreLegacyBrowserFixture(client) {
  await client.evaluate(`(()=>{
    for (const key of Object.keys(localStorage)) {
      if (key !== 'entre-nos-solo' && !key.startsWith('entre-nos-journeys-v1-attempt-')) continue;
      const data = JSON.parse(localStorage.getItem(key));
      const rooms = data?.rooms || data?.snapshot?.rooms;
      if (!Array.isArray(rooms)) continue;
      for (const [, room] of rooms) {
        delete room.missionFlowVersion; delete room.cardStageVersion; delete room.cardChallenges;
        if (room.journeyDefinitionId !== 'entre-escolhas-e-cuidados') delete room.missionChannelActivity;
      }
      localStorage.setItem(key, JSON.stringify(data));
    }
  })()`);
  await client.call('Page.reload');
  await client.wait(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Retomar')`, 'legacy saved attempt');
  await client.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Retomar').click()`);
}
