(function () {
  "use strict";

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeGender(value) {
    return value === "male" || value === "female" ? value : "";
  }

  function normalizeIntelligence(value) {
    var n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 50;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function intelligenceLabel(value) {
    var n = normalizeIntelligence(value);
    if (n >= 100) return "SUPER GENIO";
    if (n > 75) return "genio";
    if (n > 50) return "inteligente";
    if (n > 25) return "normal";
    return "tonto";
  }

  function normalizePack(pack, index) {
    var marbles = Array.isArray(pack && pack.marbles)
      ? pack.marbles.filter(function (marble) { return marble && marble.name; }).map(function (marble) {
        return {
          id: marble.id || makeId("pm"),
          name: String(marble.name).slice(0, 100),
          color: marble.color || "#55d6ff",
          gender: normalizeGender(marble.gender),
          intelligence: normalizeIntelligence(marble.intelligence),
          partnerId: typeof marble.partnerId === "string" ? marble.partnerId : "",
          friendGroup: typeof marble.friendGroup === "string" ? marble.friendGroup.trim().slice(0, 24) : ""
        };
      })
      : [];
    var groups = Array.isArray(pack && pack.groups)
      ? normalizeFriendGroups(pack.groups, marbles)
      : groupsFromFriendField(marbles);
    stampFriendField(marbles, groups);
    var friendships = normalizeBonds(pack && pack.friendships, marbles);
    var enemies = normalizeBonds(pack && pack.enemies, marbles);
    friendships = dropSharedBonds(friendships, enemies);
    return {
      id: (pack && pack.id) || makeId("pack"),
      name: String((pack && pack.name) || ("Pack " + (index + 1))).slice(0, 24),
      updatedAt: Number(pack && pack.updatedAt) || 0,
      groupsRev: Math.max(0, Number(pack && pack.groupsRev) || 0),
      marbles: marbles,
      groups: groups,
      families: normalizeExclusiveNamed(pack && pack.families, marbles, "fam"),
      friendships: friendships,
      enemies: enemies
    };
  }

  function groupsFromFriendField(marbles) {
    var byName = {};
    (marbles || []).forEach(function (marble) {
      var name = String(marble && marble.friendGroup || "").trim();
      if (!name || !marble.id) return;
      if (!byName[name]) byName[name] = [];
      byName[name].push(marble.id);
    });
    return Object.keys(byName).map(function (name) {
      var memberIds = byName[name];
      if (memberIds.length < 2) return null;
      return { id: "fg-" + name.toLowerCase().replace(/\s+/g, "-").slice(0, 18), name: name, memberIds: memberIds };
    }).filter(Boolean);
  }

  function stampFriendField(marbles, groups) {
    var byId = {};
    (groups || []).forEach(function (group) {
      group.memberIds.forEach(function (id) { byId[id] = group.name; });
    });
    (marbles || []).forEach(function (marble) {
      marble.friendGroup = byId[marble.id] || "";
    });
  }

  function sameFriendGroups(a, b) {
    function sig(list) {
      return (list || []).map(function (group) {
        return group.name + ":" + group.memberIds.slice().sort().join(",");
      }).sort().join("|");
    }
    return sig(a) === sig(b);
  }

  function normalizeExclusiveNamed(groups, marbles, prefix) {
    var ids = {};
    (marbles || []).forEach(function (marble) { if (marble && marble.id) ids[marble.id] = true; });
    var used = {};
    return (Array.isArray(groups) ? groups : []).map(function (group) {
      var name = String((group && group.name) || "").trim().slice(0, 24);
      var memberIds = [];
      (Array.isArray(group && group.memberIds) ? group.memberIds : []).forEach(function (id) {
        if (typeof id !== "string" || !ids[id] || used[id] || memberIds.indexOf(id) >= 0) return;
        used[id] = true;
        memberIds.push(id);
      });
      if (!name || memberIds.length < 2) return null;
      return { id: (group && group.id) || makeId(prefix || "fg"), name: name, memberIds: memberIds };
    }).filter(Boolean);
  }

  function normalizeFriendGroups(groups, marbles) {
    return normalizeExclusiveNamed(groups, marbles, "fg");
  }

  function bondKey(memberIds) {
    return memberIds.slice().sort().join("|");
  }

  function normalizeBonds(list, marbles) {
    var ids = {};
    (marbles || []).forEach(function (marble) { if (marble && marble.id) ids[marble.id] = true; });
    var seen = {};
    return (Array.isArray(list) ? list : []).map(function (bond) {
      var memberIds = [];
      (Array.isArray(bond && bond.memberIds) ? bond.memberIds : []).forEach(function (id) {
        if (typeof id !== "string" || !ids[id] || memberIds.indexOf(id) >= 0) return;
        memberIds.push(id);
      });
      if (memberIds.length < 2) return null;
      var key = bondKey(memberIds);
      if (seen[key]) return null;
      seen[key] = true;
      return { id: (bond && bond.id) || makeId("bond"), memberIds: memberIds };
    }).filter(Boolean);
  }

  function dropSharedBonds(keep, remove) {
    var blocked = {};
    (remove || []).forEach(function (bond) {
      blocked[bondKey(bond.memberIds)] = true;
    });
    return (keep || []).filter(function (bond) {
      return !blocked[bondKey(bond.memberIds)];
    });
  }

  function bondNames(list, marbleId) {
    var names = [];
    (list || []).forEach(function (bond) {
      if (bond.memberIds.indexOf(marbleId) < 0) return;
      bond.memberIds.forEach(function (id) {
        if (id === marbleId) return;
        var other = findMarble(draft, id);
        if (other && names.indexOf(other.name) < 0) names.push(other.name);
      });
    });
    return names;
  }

  function friendGroupName(groups, marbleId) {
    var group = (groups || []).find(function (item) { return item.memberIds.indexOf(marbleId) >= 0; });
    return group ? group.name : "";
  }

  function findMarble(list, id) {
    return (list || []).find(function (item) { return item && item.id === id; }) || null;
  }

  function pairCompatible(a, b) {
    if (!a || !b || a.id === b.id) return false;
    var ga = normalizeGender(a.gender);
    var gb = normalizeGender(b.gender);
    return (ga === "male" && gb === "female") || (ga === "female" && gb === "male");
  }

  function clearPartner(list, marbleId) {
    var marble = findMarble(list, marbleId);
    if (!marble) return;
    var other = findMarble(list, marble.partnerId);
    marble.partnerId = "";
    if (other && other.partnerId === marble.id) other.partnerId = "";
  }

  function sanitizePartners(list) {
    (list || []).forEach(function (marble) {
      var other = findMarble(list, marble.partnerId);
      if (!other || other.partnerId !== marble.id || !pairCompatible(marble, other)) marble.partnerId = "";
    });
    return list;
  }

  function setPartner(list, idA, idB) {
    var a = findMarble(list, idA);
    var b = findMarble(list, idB);
    if (!pairCompatible(a, b)) return false;
    clearPartner(list, a.id);
    clearPartner(list, b.id);
    a.partnerId = b.id;
    b.partnerId = a.id;
    return true;
  }

  function partnerName(list, marble) {
    var other = findMarble(list, marble && marble.partnerId);
    return other ? other.name : "";
  }

  function loadAll() {
    return (window.SharedPacks ? SharedPacks.load() : []).map(normalizePack);
  }

  function saveAll(list) {
    if (!window.SharedPacks) return list;
    return SharedPacks.save(list.map(normalizePack)).map(normalizePack);
  }

  var packs = loadAll();
  var editingId = null;
  var draft = [];
  var draftGroups = [];
  var draftFamilies = [];
  var draftFriendships = [];
  var draftEnemies = [];
  var genderOpen = false;
  var intelOpen = false;

  var ui = {
    list: document.getElementById("packsScreen"),
    editor: document.getElementById("packEditorScreen"),
    packList: document.getElementById("packList"),
    empty: document.getElementById("emptyPacks"),
    title: document.getElementById("packEditorTitle"),
    name: document.getElementById("packName"),
    form: document.getElementById("packMarbleForm"),
    marbleName: document.getElementById("packMarbleName"),
    marbleColor: document.getElementById("packMarbleColor"),
    draftList: document.getElementById("packDraftList"),
    emptyDraft: document.getElementById("emptyPackDraft"),
    genderNeed: document.getElementById("packGenderNeed"),
    genderPanel: document.getElementById("packGenderPanel"),
    genderList: document.getElementById("packGenderList"),
    intelPanel: document.getElementById("packIntelPanel"),
    intelList: document.getElementById("packIntelList"),
    friendList: document.getElementById("packFriendList"),
    friendForm: document.getElementById("packFriendForm"),
    familyList: document.getElementById("packFamilyList"),
    familyForm: document.getElementById("packFamilyForm"),
    pairList: document.getElementById("packPairList"),
    pairForm: document.getElementById("packPairForm"),
    buddyList: document.getElementById("packBuddyList"),
    buddyForm: document.getElementById("packBuddyForm"),
    enemyList: document.getElementById("packEnemyList"),
    enemyForm: document.getElementById("packEnemyForm")
  };

  function show(which) {
    ui.list.classList.toggle("active", which === "list");
    ui.editor.classList.toggle("active", which === "editor");
  }

  function renderList() {
    packs = loadAll();
    ui.packList.innerHTML = "";
    ui.empty.hidden = packs.length > 0;
    packs.forEach(function (pack) {
      var row = document.createElement("div");
      row.className = "pack-row";
      row.innerHTML = "<div><strong></strong><span></span></div>";
      row.querySelector("strong").textContent = pack.name;
      row.querySelector("span").textContent = pack.marbles.length + " pelota(s)";
      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button secondary compact";
      edit.textContent = "Editar";
      edit.addEventListener("click", function () { openEditor(pack.id); });
      row.appendChild(edit);
      ui.packList.appendChild(row);
    });
  }

  function missingGender() {
    return draft.filter(function (marble) { return !normalizeGender(marble.gender); });
  }

  function renderDraft() {
    ui.draftList.innerHTML = "";
    ui.emptyDraft.hidden = draft.length > 0;
    draft.forEach(function (marble) {
      var row = document.createElement("div");
      row.className = "pack-draft-row";
      var g = normalizeGender(marble.gender);
      row.innerHTML = '<i class="mini-marble" style="background:' + marble.color + '"></i><div class="pack-draft-meta"><strong></strong><span class="pack-draft-gender' + (g ? "" : " missing") + '"></span></div>';
      row.querySelector("strong").textContent = marble.name;
      var iq = normalizeIntelligence(marble.intelligence);
      row.querySelector("span").textContent =
        (g === "male" ? "Masculino" : g === "female" ? "Femenino" : "Sin género") +
        " · 🧠 " + iq + " (" + intelligenceLabel(iq) + ")";
      var groupName = friendGroupName(draftGroups, marble.id);
      var familyName = friendGroupName(draftFamilies, marble.id);
      var mate = partnerName(draft, marble);
      if (mate) row.querySelector("span").textContent += " · ♥ " + mate;
      if (groupName) row.querySelector("span").textContent += " · 👥 " + groupName;
      if (familyName) row.querySelector("span").textContent += " · 👪 " + familyName;
      var buddies = bondNames(draftFriendships, marble.id);
      var rivals = bondNames(draftEnemies, marble.id);
      if (buddies.length) row.querySelector("span").textContent += " · 🤝 " + buddies.join(", ");
      if (rivals.length) row.querySelector("span").textContent += " · 💢 " + rivals.join(", ");
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pack-remove-marble";
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        clearPartner(draft, marble.id);
        draft = draft.filter(function (item) { return item.id !== marble.id; });
        draftGroups = normalizeFriendGroups(draftGroups, draft);
        draftFamilies = normalizeExclusiveNamed(draftFamilies, draft, "fam");
        draftFriendships = normalizeBonds(draftFriendships, draft);
        draftEnemies = normalizeBonds(draftEnemies, draft);
        renderDraft();
        renderGender();
        renderIntel();
        renderPairs();
        renderFriends();
        renderFamilies();
        renderBonds();
      });
      row.appendChild(remove);
      ui.draftList.appendChild(row);
    });
  }

  function renderGender() {
    ui.genderPanel.hidden = !genderOpen || !draft.length;
    ui.genderList.innerHTML = "";
    if (ui.genderPanel.hidden) return;
    draft.forEach(function (marble) {
      var row = document.createElement("div");
      row.className = "pack-gender-row";
      var chosen = normalizeGender(marble.gender);
      row.innerHTML = '<i class="mini-marble" style="background:' + marble.color + '"></i><strong></strong>';
      row.querySelector("strong").textContent = marble.name;
      ["male", "female"].forEach(function (value) {
        var pick = document.createElement("button");
        pick.type = "button";
        pick.className = "pack-gender-pick" + (chosen === value ? " on" : "");
        pick.textContent = value === "male" ? "♂ Masculino" : "♀ Femenino";
        pick.addEventListener("click", function () {
          if (marble.gender !== value) {
            marble.gender = value;
            clearPartner(draft, marble.id);
            sanitizePartners(draft);
          }
          if (ui.genderNeed) ui.genderNeed.hidden = true;
          renderDraft();
          renderGender();
          renderIntel();
          renderPairs();
          renderFriends();
          renderFamilies();
          renderBonds();
        });
        row.appendChild(pick);
      });
      ui.genderList.appendChild(row);
    });
  }

  function renderIntel() {
    if (!ui.intelPanel || !ui.intelList) return;
    ui.intelPanel.hidden = !intelOpen || !draft.length;
    ui.intelList.innerHTML = "";
    if (ui.intelPanel.hidden) return;
    draft.forEach(function (marble) {
      var row = document.createElement("div");
      row.className = "pack-intel-row";
      var iq = normalizeIntelligence(marble.intelligence);
      marble.intelligence = iq;
      row.innerHTML = '<i class="mini-marble" style="background:' + marble.color + '"></i><strong></strong>';
      row.querySelector("strong").textContent = marble.name;
      var input = document.createElement("input");
      input.type = "number";
      input.className = "pack-intel-input";
      input.min = "0";
      input.max = "100";
      input.step = "1";
      input.value = String(iq);
      input.title = "0 tonto · 100 SUPER GENIO";
      var label = document.createElement("span");
      label.className = "pack-intel-label";
      label.textContent = intelligenceLabel(iq);
      function applyIntel() {
        marble.intelligence = normalizeIntelligence(input.value);
        input.value = String(marble.intelligence);
        label.textContent = intelligenceLabel(marble.intelligence);
        renderDraft();
      }
      input.addEventListener("change", applyIntel);
      input.addEventListener("input", function () {
        label.textContent = intelligenceLabel(normalizeIntelligence(input.value));
      });
      row.appendChild(input);
      row.appendChild(label);
      ui.intelList.appendChild(row);
    });
  }

  function renderPairs() {
    if (!ui.pairList || !ui.pairForm) return;
    sanitizePartners(draft);
    ui.pairList.innerHTML = "";
    ui.pairForm.innerHTML = "";
    var seen = {};
    var pairs = [];
    draft.forEach(function (marble) {
      if (!marble.partnerId || seen[marble.id]) return;
      var other = findMarble(draft, marble.partnerId);
      if (!other) return;
      seen[marble.id] = true;
      seen[other.id] = true;
      pairs.push({
        boy: marble.gender === "male" ? marble : other,
        girl: marble.gender === "female" ? marble : other
      });
    });
    if (!pairs.length) {
      var empty = document.createElement("p");
      empty.className = "pair-empty";
      empty.textContent = "Todavía no hay parejas.";
      ui.pairList.appendChild(empty);
    }
    pairs.forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "pair-row";
      row.innerHTML = '<i class="mini-marble"></i><strong></strong><span class="pair-heart">♥</span><i class="mini-marble"></i><strong></strong>';
      var dots = row.querySelectorAll(".mini-marble");
      var names = row.querySelectorAll("strong");
      dots[0].style.background = pair.boy.color;
      dots[1].style.background = pair.girl.color;
      names[0].textContent = pair.boy.name;
      names[1].textContent = pair.girl.name;
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button ghost compact";
      remove.textContent = "Quitar";
      remove.addEventListener("click", function () {
        clearPartner(draft, pair.boy.id);
        renderDraft();
        renderPairs();
      });
      row.appendChild(remove);
      ui.pairList.appendChild(row);
    });
    var boys = draft.filter(function (item) { return normalizeGender(item.gender) === "male" && !findMarble(draft, item.partnerId); });
    var girls = draft.filter(function (item) { return normalizeGender(item.gender) === "female" && !findMarble(draft, item.partnerId); });
    if (!boys.length || !girls.length) {
      var need = document.createElement("p");
      need.className = "pair-empty";
      need.textContent = "Necesitás un chico y una chica libres. El género se elige con el botón ⚧ Género.";
      ui.pairForm.appendChild(need);
      return;
    }
    function fill(select, items, label) {
      var blank = document.createElement("option");
      blank.value = "";
      blank.textContent = label;
      select.appendChild(blank);
      items.forEach(function (item) {
        var option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
      });
    }
    var boySel = document.createElement("select");
    var girlSel = document.createElement("select");
    fill(boySel, boys, "Chico…");
    fill(girlSel, girls, "Chica…");
    var join = document.createElement("button");
    join.type = "button";
    join.className = "button secondary compact";
    join.textContent = "Juntar pareja";
    join.addEventListener("click", function () {
      if (!setPartner(draft, boySel.value, girlSel.value)) return;
      renderDraft();
      renderPairs();
    });
    ui.pairForm.appendChild(boySel);
    ui.pairForm.appendChild(girlSel);
    ui.pairForm.appendChild(join);
  }

  function renderFriends() {
    if (!ui.friendList || !ui.friendForm) return;
    draftGroups = normalizeFriendGroups(draftGroups, draft);
    ui.friendList.innerHTML = "";
    ui.friendForm.innerHTML = "";
    if (!draftGroups.length) {
      var empty = document.createElement("p");
      empty.className = "pair-empty";
      empty.textContent = "Todavía no hay grupos.";
      ui.friendList.appendChild(empty);
    }
    draftGroups.forEach(function (group) {
      var row = document.createElement("div");
      row.className = "friend-row";
      var names = group.memberIds.map(function (id) {
        var marble = draft.find(function (item) { return item.id === id; });
        return marble ? marble.name : "";
      }).filter(Boolean).join(", ");
      row.innerHTML = "<strong></strong><span></span>";
      row.querySelector("strong").textContent = group.name;
      row.querySelector("span").textContent = names;
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button ghost compact";
      remove.textContent = "Quitar";
      remove.addEventListener("click", function () {
        draftGroups = draftGroups.filter(function (item) { return item.id !== group.id; });
        renderDraft();
        renderFriends();
      });
      row.appendChild(remove);
      ui.friendList.appendChild(row);
    });
    var free = draft.filter(function (marble) {
      return !draftGroups.some(function (group) { return group.memberIds.indexOf(marble.id) >= 0; });
    });
    if (free.length < 2) {
      var need = document.createElement("p");
      need.className = "pair-empty";
      need.textContent = "Hacen falta al menos 2 pelotas libres para armar un grupo.";
      ui.friendForm.appendChild(need);
      return;
    }
    var nameInput = document.createElement("input");
    nameInput.className = "friend-name";
    nameInput.maxLength = 24;
    nameInput.placeholder = "Nombre del grupo";
    var picks = document.createElement("div");
    picks.className = "friend-picks";
    var selected = {};
    free.forEach(function (marble) {
      var label = document.createElement("label");
      label.className = "friend-pick";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("data-id", marble.id);
      box.addEventListener("change", function () {
        if (box.checked) selected[marble.id] = true;
        else delete selected[marble.id];
      });
      var dot = document.createElement("i");
      dot.className = "mini-marble";
      dot.style.background = marble.color;
      var text = document.createElement("span");
      text.textContent = marble.name;
      label.appendChild(box);
      label.appendChild(dot);
      label.appendChild(text);
      picks.appendChild(label);
    });
    var join = document.createElement("button");
    join.type = "button";
    join.className = "button secondary compact";
    join.textContent = "Crear grupo";
    join.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var memberIds = Object.keys(selected);
      if (!name || memberIds.length < 2) return;
      draftGroups.push({ id: makeId("fg"), name: name.slice(0, 24), memberIds: memberIds });
      renderDraft();
      renderFriends();
    });
    ui.friendForm.appendChild(nameInput);
    ui.friendForm.appendChild(picks);
    ui.friendForm.appendChild(join);
  }

  function renderFamilies() {
    if (!ui.familyList || !ui.familyForm) return;
    draftFamilies = normalizeExclusiveNamed(draftFamilies, draft, "fam");
    ui.familyList.innerHTML = "";
    ui.familyForm.innerHTML = "";
    if (!draftFamilies.length) {
      var empty = document.createElement("p");
      empty.className = "pair-empty";
      empty.textContent = "Todavía no hay familias.";
      ui.familyList.appendChild(empty);
    }
    draftFamilies.forEach(function (family) {
      var row = document.createElement("div");
      row.className = "friend-row";
      var names = family.memberIds.map(function (id) {
        var marble = draft.find(function (item) { return item.id === id; });
        return marble ? marble.name : "";
      }).filter(Boolean).join(", ");
      row.innerHTML = "<strong></strong><span></span>";
      row.querySelector("strong").textContent = family.name;
      row.querySelector("span").textContent = names;
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button ghost compact";
      remove.textContent = "Quitar";
      remove.addEventListener("click", function () {
        draftFamilies = draftFamilies.filter(function (item) { return item.id !== family.id; });
        renderDraft();
        renderFamilies();
      });
      row.appendChild(remove);
      ui.familyList.appendChild(row);
    });
    var free = draft.filter(function (marble) {
      return !draftFamilies.some(function (family) { return family.memberIds.indexOf(marble.id) >= 0; });
    });
    if (free.length < 2) {
      var need = document.createElement("p");
      need.className = "pair-empty";
      need.textContent = "Hacen falta al menos 2 pelotas libres para armar una familia.";
      ui.familyForm.appendChild(need);
      return;
    }
    var nameInput = document.createElement("input");
    nameInput.className = "friend-name";
    nameInput.maxLength = 24;
    nameInput.placeholder = "Nombre de la familia";
    var picks = document.createElement("div");
    picks.className = "friend-picks";
    var selected = {};
    free.forEach(function (marble) {
      var label = document.createElement("label");
      label.className = "friend-pick";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("data-id", marble.id);
      box.addEventListener("change", function () {
        if (box.checked) selected[marble.id] = true;
        else delete selected[marble.id];
      });
      var dot = document.createElement("i");
      dot.className = "mini-marble";
      dot.style.background = marble.color;
      var text = document.createElement("span");
      text.textContent = marble.name;
      label.appendChild(box);
      label.appendChild(dot);
      label.appendChild(text);
      picks.appendChild(label);
    });
    var join = document.createElement("button");
    join.type = "button";
    join.className = "button secondary compact";
    join.textContent = "Crear familia";
    join.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var memberIds = Object.keys(selected);
      if (!name || memberIds.length < 2) return;
      draftFamilies.push({ id: makeId("fam"), name: name.slice(0, 24), memberIds: memberIds });
      renderDraft();
      renderFamilies();
    });
    ui.familyForm.appendChild(nameInput);
    ui.familyForm.appendChild(picks);
    ui.familyForm.appendChild(join);
  }

  function addBond(target, other, memberIds, prefix) {
    var clean = [];
    (memberIds || []).forEach(function (id) {
      if (!id || clean.indexOf(id) >= 0 || !findMarble(draft, id)) return;
      clean.push(id);
    });
    if (clean.length < 2) return false;
    var key = bondKey(clean);
    if (target.some(function (bond) { return bondKey(bond.memberIds) === key; })) return false;
    var nextOther = other.filter(function (bond) { return bondKey(bond.memberIds) !== key; });
    other.splice(0, other.length);
    nextOther.forEach(function (bond) { other.push(bond); });
    target.push({ id: makeId(prefix), memberIds: clean });
    return true;
  }

  function renderBondList(listEl, formEl, bonds, other, options) {
    if (!listEl || !formEl) return;
    listEl.innerHTML = "";
    formEl.innerHTML = "";
    if (!bonds.length) {
      var empty = document.createElement("p");
      empty.className = "pair-empty";
      empty.textContent = options.empty;
      listEl.appendChild(empty);
    }
    bonds.forEach(function (bond) {
      var people = bond.memberIds.map(function (id) { return findMarble(draft, id); }).filter(Boolean);
      if (people.length < 2) return;
      var row = document.createElement("div");
      row.className = "friend-row";
      row.innerHTML = "<strong></strong><span></span>";
      row.querySelector("strong").textContent = options.mark;
      row.querySelector("span").textContent = people.map(function (marble) { return marble.name; }).join(", ");
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button ghost compact";
      remove.textContent = "Quitar";
      remove.addEventListener("click", function () {
        var index = bonds.findIndex(function (item) { return item.id === bond.id; });
        if (index >= 0) bonds.splice(index, 1);
        renderDraft();
        renderBonds();
      });
      row.appendChild(remove);
      listEl.appendChild(row);
    });
    if (draft.length < 2) {
      var need = document.createElement("p");
      need.className = "pair-empty";
      need.textContent = "Hacen falta al menos 2 pelotas.";
      formEl.appendChild(need);
      return;
    }
    var picks = document.createElement("div");
    picks.className = "friend-picks";
    var selected = {};
    draft.forEach(function (marble) {
      var label = document.createElement("label");
      label.className = "friend-pick";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("data-id", marble.id);
      box.addEventListener("change", function () {
        if (box.checked) selected[marble.id] = true;
        else delete selected[marble.id];
      });
      var dot = document.createElement("i");
      dot.className = "mini-marble";
      dot.style.background = marble.color;
      var text = document.createElement("span");
      text.textContent = marble.name;
      label.appendChild(box);
      label.appendChild(dot);
      label.appendChild(text);
      picks.appendChild(label);
    });
    var join = document.createElement("button");
    join.type = "button";
    join.className = "button secondary compact";
    join.textContent = options.join;
    join.addEventListener("click", function () {
      if (!addBond(bonds, other, Object.keys(selected), options.prefix)) return;
      renderDraft();
      renderBonds();
    });
    formEl.appendChild(picks);
    formEl.appendChild(join);
  }

  function renderBonds() {
    draftFriendships = normalizeBonds(draftFriendships, draft);
    draftEnemies = normalizeBonds(draftEnemies, draft);
    draftFriendships = dropSharedBonds(draftFriendships, draftEnemies);
    renderBondList(ui.buddyList, ui.buddyForm, draftFriendships, draftEnemies, {
      empty: "Todavía no hay amistades.",
      mark: "🤝",
      join: "Crear amistad",
      prefix: "bf"
    });
    renderBondList(ui.enemyList, ui.enemyForm, draftEnemies, draftFriendships, {
      empty: "Todavía no hay enemigos.",
      mark: "💢",
      join: "Crear enemistad",
      prefix: "be"
    });
  }

  function openEditor(packId) {
    var pack = packs.find(function (item) { return item.id === packId; }) || null;
    editingId = pack ? pack.id : null;
    draft = pack ? pack.marbles.map(function (marble) {
      var copy = Object.assign({}, marble);
      copy.intelligence = normalizeIntelligence(copy.intelligence);
      return copy;
    }) : [];
    sanitizePartners(draft);
    draftGroups = normalizeFriendGroups(pack && pack.groups, draft);
    draftFamilies = normalizeExclusiveNamed(pack && pack.families, draft, "fam");
    draftFriendships = normalizeBonds(pack && pack.friendships, draft);
    draftEnemies = normalizeBonds(pack && pack.enemies, draft);
    draftFriendships = dropSharedBonds(draftFriendships, draftEnemies);
    ui.name.value = pack ? pack.name : "";
    ui.title.textContent = pack ? "Editar Pack" : "Crear Pack";
    genderOpen = draft.some(function (marble) { return !normalizeGender(marble.gender); });
    intelOpen = draft.length > 0;
    if (ui.genderNeed) ui.genderNeed.hidden = true;
    renderDraft();
    renderGender();
    renderIntel();
    renderPairs();
    renderFriends();
    renderFamilies();
    renderBonds();
    show("editor");
  }

  function commitNamedForm(form, target, prefix) {
    if (!form || !Array.isArray(target)) return;
    var pendingName = form.querySelector(".friend-name");
    if (!pendingName) return;
    var chosen = [].slice.call(form.querySelectorAll(".friend-pick input:checked")).map(function (box) {
      return box.getAttribute("data-id");
    }).filter(Boolean);
    var groupName = pendingName.value.trim().slice(0, 24);
    if (!groupName || chosen.length < 2) return;
    target.push({ id: makeId(prefix), name: groupName, memberIds: chosen });
  }

  function commitOpenBond(form, target, other, prefix) {
    if (!form) return;
    var memberIds = [].slice.call(form.querySelectorAll(".friend-pick input:checked")).map(function (box) {
      return box.getAttribute("data-id");
    }).filter(Boolean);
    addBond(target, other, memberIds, prefix);
  }

  function savePack() {
    var name = ui.name.value.trim();
    if (!name) {
      ui.name.focus();
      return;
    }
    var missing = missingGender();
    if (missing.length) {
      genderOpen = true;
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Asigná el género de las " + missing.length + " pelota(s) antes de guardar.";
      renderGender();
      return;
    }
    commitNamedForm(ui.friendForm, draftGroups, "fg");
    commitNamedForm(ui.familyForm, draftFamilies, "fam");
    commitOpenBond(ui.buddyForm, draftFriendships, draftEnemies, "bf");
    commitOpenBond(ui.enemyForm, draftEnemies, draftFriendships, "be");
    if (ui.intelList) {
      [].slice.call(ui.intelList.querySelectorAll(".pack-intel-row")).forEach(function (row, index) {
        if (!draft[index]) return;
        var input = row.querySelector(".pack-intel-input");
        if (input) draft[index].intelligence = normalizeIntelligence(input.value);
      });
    }
    draft.forEach(function (marble) {
      marble.intelligence = normalizeIntelligence(marble.intelligence);
    });
    sanitizePartners(draft);
    var next = loadAll();
    var prev = next.find(function (pack) { return pack.id === (editingId || ""); });
    var payload = normalizePack({
      id: editingId || makeId("pack"),
      name: name,
      updatedAt: Date.now(),
      groupsRev: (prev ? (Number(prev.groupsRev) || 0) : 0) + (prev && sameFriendGroups(prev.groups, draftGroups) ? 0 : 1),
      marbles: draft,
      groups: draftGroups,
      families: draftFamilies,
      friendships: draftFriendships,
      enemies: draftEnemies
    }, next.length);
    var existing = next.find(function (pack) { return pack.id === payload.id; });
    if (existing) {
      existing.name = payload.name;
      existing.updatedAt = payload.updatedAt;
      existing.groupsRev = payload.groupsRev;
      existing.marbles = payload.marbles;
      existing.groups = payload.groups;
      existing.families = payload.families;
      existing.friendships = payload.friendships;
      existing.enemies = payload.enemies;
    } else {
      next.push(payload);
    }
    packs = saveAll(next);
    var stored = loadAll().some(function (pack) { return pack.id === payload.id; });
    if (!stored) {
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "No se pudo guardar. Abrí esta página desde http://localhost:8090 y volvé a tocar Guardar.";
      return;
    }
    renderList();
    show("list");
  }

  document.getElementById("newPackButton").addEventListener("click", function () { openEditor(null); });
  document.getElementById("cancelPackEditor").addEventListener("click", function () {
    if (missingGender().length && draft.length) {
      genderOpen = true;
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Asigná el género antes de salir. Es obligatorio.";
      renderGender();
      return;
    }
    show("list");
  });
  document.getElementById("packGenderButton").addEventListener("click", function () {
    if (!draft.length) {
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Primero agregá pelotas al pack.";
      return;
    }
    genderOpen = true;
    ui.genderNeed.hidden = true;
    renderGender();
  });
  document.getElementById("packIntelButton").addEventListener("click", function () {
    if (!draft.length) {
      ui.genderNeed.hidden = false;
      ui.genderNeed.textContent = "Primero agregá pelotas al pack.";
      return;
    }
    intelOpen = true;
    ui.genderNeed.hidden = true;
    renderIntel();
    if (ui.intelPanel) ui.intelPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  document.getElementById("savePackButton").addEventListener("click", savePack);
  ui.form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = ui.marbleName.value.trim();
    if (!name) return;
    draft.push({
      id: makeId("pm"),
      name: name.slice(0, 100),
      color: ui.marbleColor.value,
      gender: "",
      intelligence: 50,
      partnerId: ""
    });
    ui.marbleName.value = "";
    intelOpen = true;
    renderDraft();
    renderGender();
    renderIntel();
    renderPairs();
    renderFriends();
    renderFamilies();
    renderBonds();
    ui.marbleName.focus();
  });

  renderList();
})();
