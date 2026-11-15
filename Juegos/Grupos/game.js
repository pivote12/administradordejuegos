(function () {
  "use strict";

  const TEAM_COLORS = ["#facc15", "#38bdf8", "#fb7185", "#86efac", "#c084fc", "#fdba74", "#a5b4fc", "#f9a8d4"];

  let selectedPack = null;
  let lastNote = "";

  function show(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
  }

  function packs() {
    return window.SharedPacks ? SharedPacks.load() : [];
  }

  function marblesOf(pack) {
    return Array.isArray(pack && pack.marbles)
      ? pack.marbles.filter((marble) => marble && marble.id && marble.name)
      : [];
  }

  function divisorsOf(n) {
    const list = [];
    for (let i = 1; i <= n; i += 1) {
      if (n % i === 0) list.push(i);
    }
    return list;
  }

  function bondKey(memberIds) {
    return memberIds.slice().sort().join("|");
  }

  function cleanBonds(list, ids) {
    const seen = {};
    return (Array.isArray(list) ? list : []).map((bond) => {
      const memberIds = [];
      (Array.isArray(bond && bond.memberIds) ? bond.memberIds : []).forEach((id) => {
        if (!ids[id] || memberIds.indexOf(id) >= 0) return;
        memberIds.push(id);
      });
      if (memberIds.length < 2) return null;
      const key = bondKey(memberIds);
      if (seen[key]) return null;
      seen[key] = true;
      return memberIds;
    }).filter(Boolean);
  }

  function cleanNamed(list, ids) {
    const used = {};
    return (Array.isArray(list) ? list : []).map((group) => {
      const name = String((group && group.name) || "").trim();
      const memberIds = [];
      (Array.isArray(group && group.memberIds) ? group.memberIds : []).forEach((id) => {
        if (!ids[id] || used[id] || memberIds.indexOf(id) >= 0) return;
        used[id] = true;
        memberIds.push(id);
      });
      if (!name || memberIds.length < 2) return null;
      return { name: name, memberIds: memberIds };
    }).filter(Boolean);
  }

  function parentOf(parents, id) {
    if (parents[id] !== id) parents[id] = parentOf(parents, parents[id]);
    return parents[id];
  }

  function unite(parents, a, b) {
    const pa = parentOf(parents, a);
    const pb = parentOf(parents, b);
    if (pa !== pb) parents[pb] = pa;
  }

  function buildClusters(pack) {
    const marbles = marblesOf(pack);
    const ids = {};
    marbles.forEach((marble) => { ids[marble.id] = true; });
    const parents = {};
    marbles.forEach((marble) => { parents[marble.id] = marble.id; });

    const families = cleanNamed(pack.families, ids);
    const groups = cleanNamed(pack.groups, ids);
    families.concat(groups).forEach((unit) => {
      for (let i = 1; i < unit.memberIds.length; i += 1) {
        unite(parents, unit.memberIds[0], unit.memberIds[i]);
      }
    });

    const byRoot = {};
    marbles.forEach((marble) => {
      const root = parentOf(parents, marble.id);
      if (!byRoot[root]) byRoot[root] = [];
      byRoot[root].push(marble);
    });

    const clusters = Object.keys(byRoot).map((root) => {
      const members = byRoot[root];
      const labels = [];
      families.forEach((family) => {
        if (family.memberIds.some((id) => parentOf(parents, id) === root)) {
          labels.push("👪 " + family.name);
        }
      });
      groups.forEach((group) => {
        if (group.memberIds.some((id) => parentOf(parents, id) === root)) {
          labels.push("👥 " + group.name);
        }
      });
      return {
        id: root,
        members: members,
        size: members.length,
        labels: labels
      };
    });

    return {
      marbles: marbles,
      clusters: clusters,
      friendships: cleanBonds(pack.friendships, ids),
      enemies: cleanBonds(pack.enemies, ids),
      parents: parents
    };
  }

  function sameTeamScore(teamIds, bonds, parents) {
    let score = 0;
    bonds.forEach((memberIds) => {
      const roots = memberIds.map((id) => parentOf(parents, id));
      const present = roots.filter((root) => teamIds.indexOf(root) >= 0);
      if (present.length >= 2) score += 1;
    });
    return score;
  }

  function enemyPenalty(teamIds, enemies, parents) {
    let score = 0;
    enemies.forEach((memberIds) => {
      const roots = memberIds.map((id) => parentOf(parents, id));
      const unique = [];
      roots.forEach((root) => {
        if (teamIds.indexOf(root) >= 0 && unique.indexOf(root) < 0) unique.push(root);
      });
      if (unique.length >= 2) score += 1;
    });
    return score;
  }

  function formTeams(pack, teamSize) {
    const built = buildClusters(pack);
    const n = built.marbles.length;
    if (!n || n % teamSize !== 0) {
      return { ok: false, reason: "Ese divisor no reparte todas las pelotitas." };
    }
    const teamCount = n / teamSize;
    const oversized = built.clusters.filter((cluster) => cluster.size > teamSize);
    if (oversized.length) {
      const names = oversized.map((cluster) => {
        return cluster.labels[0] || cluster.members.map((marble) => marble.name).join(", ");
      }).join(" · ");
      return {
        ok: false,
        reason: "Hay un grupo o familia más grande que el equipo (" + teamSize + "): " + names + "."
      };
    }

    const ordered = built.clusters.slice().sort((a, b) => b.size - a.size || a.members[0].name.localeCompare(b.members[0].name));
    const teams = Array.from({ length: teamCount }, () => ({ clusters: [], size: 0 }));

    for (let i = 0; i < ordered.length; i += 1) {
      const cluster = ordered[i];
      let best = -1;
      let bestScore = -Infinity;
      for (let t = 0; t < teams.length; t += 1) {
        if (teams[t].size + cluster.size > teamSize) continue;
        const roots = teams[t].clusters.map((item) => item.id).concat(cluster.id);
        const friends = sameTeamScore(roots, built.friendships, built.parents);
        const foes = enemyPenalty(roots, built.enemies, built.parents);
        const room = teamSize - (teams[t].size + cluster.size);
        const score = friends * 10 - foes * 12 - teams[t].size * 0.01 + room * 0.001;
        if (score > bestScore) {
          bestScore = score;
          best = t;
        }
      }
      if (best < 0) {
        return { ok: false, reason: "No se pudieron armar equipos de " + teamSize + " respetando grupos y familias." };
      }
      teams[best].clusters.push(cluster);
      teams[best].size += cluster.size;
    }

    if (teams.some((team) => team.size !== teamSize)) {
      return { ok: false, reason: "No se pudieron llenar todos los equipos de " + teamSize + "." };
    }

    let keptFriends = 0;
    let splitEnemies = 0;
    built.friendships.forEach((memberIds) => {
      const teamIndex = memberIds.map((id) => {
        const root = parentOf(built.parents, id);
        return teams.findIndex((team) => team.clusters.some((cluster) => cluster.id === root));
      });
      if (teamIndex.every((value) => value === teamIndex[0] && value >= 0)) keptFriends += 1;
    });
    built.enemies.forEach((memberIds) => {
      const teamIndex = memberIds.map((id) => {
        const root = parentOf(built.parents, id);
        return teams.findIndex((team) => team.clusters.some((cluster) => cluster.id === root));
      });
      const unique = [];
      teamIndex.forEach((value) => {
        if (value >= 0 && unique.indexOf(value) < 0) unique.push(value);
      });
      if (unique.length > 1) splitEnemies += 1;
    });

    const notes = [];
    if (built.friendships.length) notes.push("Amistades juntas: " + keptFriends + "/" + built.friendships.length);
    if (built.enemies.length) notes.push("Enemistades separadas: " + splitEnemies + "/" + built.enemies.length);

    return {
      ok: true,
      teamSize: teamSize,
      teamCount: teamCount,
      teams: teams.map((team, index) => ({
        index: index + 1,
        color: TEAM_COLORS[index % TEAM_COLORS.length],
        members: team.clusters.reduce((list, cluster) => list.concat(cluster.members), []),
        labels: team.clusters.reduce((list, cluster) => list.concat(cluster.labels), [])
      })),
      note: notes.join(" · ")
    };
  }

  function renderPacks() {
    const list = document.getElementById("packList");
    list.innerHTML = "";
    const found = packs();
    if (!found.length) {
      list.textContent = "No hay packs. Creá uno en Packs y volvé.";
      return;
    }
    found.forEach((pack) => {
      const count = marblesOf(pack).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pack-btn";
      btn.textContent = (pack.name || "Pack") + " · " + count + " pelotita" + (count === 1 ? "" : "s");
      btn.disabled = count < 1;
      btn.addEventListener("click", () => openDivide(pack));
      list.appendChild(btn);
    });
  }

  function openDivide(pack) {
    selectedPack = pack;
    const marbles = marblesOf(pack);
    const count = marbles.length;
    document.getElementById("divideTitle").textContent = pack.name || "Pack";
    document.getElementById("divideHint").textContent =
      "Hay " + count + " pelotita" + (count === 1 ? "" : "s") +
      ". Tocá un divisor para armar equipos de ese tamaño.";
    document.getElementById("divideStatus").textContent = "";
    const list = document.getElementById("divisorList");
    list.innerHTML = "";
    divisorsOf(count).forEach((size) => {
      const teams = count / size;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "divisor-btn";
      btn.innerHTML = "Equipos de " + size + "<span>" + teams + " equipo" + (teams === 1 ? "" : "s") + " · " + size + " pelotita" + (size === 1 ? "" : "s") + " cada uno</span>";
      const probe = formTeams(pack, size);
      if (!probe.ok) {
        btn.disabled = true;
        btn.title = probe.reason;
        btn.innerHTML += "<span>" + probe.reason + "</span>";
      }
      btn.addEventListener("click", () => {
        const result = formTeams(pack, size);
        if (!result.ok) {
          document.getElementById("divideStatus").textContent = result.reason;
          return;
        }
        renderTeams(result);
      });
      list.appendChild(btn);
    });
    show("screenDivide");
  }

  function renderTeams(result) {
    lastNote = result.note || "";
    document.getElementById("teamsTitle").textContent =
      result.teamCount + " equipo" + (result.teamCount === 1 ? "" : "s") + " de " + result.teamSize;
    document.getElementById("teamsHint").textContent =
      (selectedPack && selectedPack.name ? selectedPack.name + " · " : "") +
      "Respetando familias, grupos, amistades y enemistades.";
    const list = document.getElementById("teamList");
    list.innerHTML = "";
    result.teams.forEach((team) => {
      const card = document.createElement("article");
      card.className = "team";
      const title = document.createElement("h3");
      title.innerHTML = '<i class="team-dot"></i>Equipo ' + team.index;
      title.querySelector(".team-dot").style.background = team.color;
      card.appendChild(title);
      const members = document.createElement("div");
      members.className = "members";
      team.members.forEach((marble) => {
        const chip = document.createElement("span");
        chip.className = "member";
        chip.innerHTML = '<i class="mini"></i><span></span>';
        chip.querySelector(".mini").style.background = marble.color || "#55d6ff";
        chip.querySelector("span").textContent = marble.name;
        members.appendChild(chip);
      });
      card.appendChild(members);
      if (team.labels.length) {
        const note = document.createElement("p");
        note.className = "note";
        note.textContent = team.labels.join(" · ");
        card.appendChild(note);
      }
      list.appendChild(card);
    });
    if (lastNote) {
      const summary = document.createElement("p");
      summary.className = "note";
      summary.textContent = lastNote;
      list.appendChild(summary);
    }
    show("screenTeams");
  }

  document.getElementById("btnStart").addEventListener("click", () => {
    renderPacks();
    show("screenPacks");
  });
  document.getElementById("btnBackTitle").addEventListener("click", () => show("screenTitle"));
  document.getElementById("btnBackPacks").addEventListener("click", () => {
    selectedPack = null;
    renderPacks();
    show("screenPacks");
  });
  document.getElementById("btnBackDivide").addEventListener("click", () => {
    if (selectedPack) openDivide(selectedPack);
    else show("screenPacks");
  });
  document.getElementById("btnAgain").addEventListener("click", () => {
    if (selectedPack) openDivide(selectedPack);
  });
  document.getElementById("btnChangePack").addEventListener("click", () => {
    selectedPack = null;
    renderPacks();
    show("screenPacks");
  });
})();
