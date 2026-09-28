document.addEventListener('DOMContentLoaded', async () => {
  const guildList = document.getElementById('guild-list');
  if (!guildList) return;

  try {
    const res = await fetch('/api/guilds');
    if (!res.ok) throw new Error('Failed to load guilds');
    const guilds = await res.json();

    guildList.innerHTML = guilds.map((guild) => `
      <button class="guild-item" data-guild-id="${guild.id}">
        <strong>${guild.name}</strong>
      </button>
    `).join('');

    guildList.querySelectorAll('.guild-item').forEach((button) => {
      button.addEventListener('click', () => {
        const guildId = button.dataset.guildId;
        fetch(`/api/config/${guildId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guildId }) })
          .then((res) => res.json())
          .then((data) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<h3>Configuration saved</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
            guildList.parentNode.appendChild(card);
          })
          .catch(() => { alert('Unable to save guild config'); });
      });
    });
  } catch (error) {
    guildList.innerHTML = '<p>Unable to load managed servers.</p>';
  }
});
