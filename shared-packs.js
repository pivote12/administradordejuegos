(function (global) {
  "use strict";

  var SHARED_KEY = "administrador-packs-v1";
  var SHARED_BAK = "administrador-packs-v1-bak";
  var ME_KEY = "marble-escape-saves-v2";
  var ME_BAK = "marble-escape-saves-v2-bak";

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_err) {
      return null;
    }
  }

  function packsFromMe(store) {
    if (!store || typeof store !== "object" || !Array.isArray(store.packs)) return [];
    return store.packs.filter(function (pack) {
      return pack && pack.id;
    });
  }

  function packWeight(list) {
    return (list || []).reduce(function (total, pack) {
      return total + 1 + ((pack.marbles && pack.marbles.length) || 0);
    }, 0);
  }

  function groupList(pack) {
    return Array.isArray(pack && pack.groups) ? pack.groups : [];
  }

  function groupsStillInPack(groups, pack) {
    var ids = {};
    ((pack && pack.marbles) || []).forEach(function (marble) {
      if (marble && marble.id) ids[marble.id] = true;
    });
    return groupList({ groups: groups }).map(function (group) {
      var memberIds = (group.memberIds || []).filter(function (id) { return ids[id]; });
      if (!group || !group.name || memberIds.length < 2) return null;
      return { id: group.id, name: group.name, memberIds: memberIds };
    }).filter(Boolean);
  }

  function withGroups(pack, groups, groupsRev) {
    var copy = {};
    Object.keys(pack || {}).forEach(function (key) { copy[key] = pack[key]; });
    copy.groups = groups;
    copy.groupsRev = groupsRev;
    return copy;
  }

  function mergePacks(a, b) {
    var byId = {};
    var order = [];
    function add(pack) {
      if (!pack || !pack.id) return;
      if (!byId[pack.id]) {
        byId[pack.id] = pack;
        order.push(pack.id);
        return;
      }
      var prev = byId[pack.id];
      var prevN = (prev.marbles && prev.marbles.length) || 0;
      var nextN = (pack.marbles && pack.marbles.length) || 0;
      var prevT = Number(prev.updatedAt) || 0;
      var nextT = Number(pack.updatedAt) || 0;
      var winner = (nextT > prevT || (nextT === prevT && nextN >= prevN)) ? pack : prev;
      var loser = winner === pack ? prev : pack;
      var winRev = Number(winner.groupsRev) || 0;
      var loseRev = Number(loser.groupsRev) || 0;
      var winGroups = groupsStillInPack(groupList(winner), winner);
      var loseGroups = groupsStillInPack(groupList(loser), winner);
      var groups = winGroups;
      var rev = winRev;
      if (loseRev > winRev) {
        groups = loseGroups;
        rev = loseRev;
      } else if (loseRev === winRev && !winGroups.length && loseGroups.length) {
        groups = loseGroups;
      }
      byId[pack.id] = withGroups(winner, groups, rev);
    }
    (a || []).forEach(add);
    (b || []).forEach(add);
    return order.map(function (id) {
      return byId[id];
    });
  }

  function loadPacks() {
    var shared = Array.isArray(readJson(SHARED_KEY)) ? readJson(SHARED_KEY) : [];
    var sharedBak = Array.isArray(readJson(SHARED_BAK)) ? readJson(SHARED_BAK) : [];
    var me = packsFromMe(readJson(ME_KEY));
    var meBak = packsFromMe(readJson(ME_BAK));
    var merged = mergePacks(mergePacks(shared, sharedBak), mergePacks(me, meBak));
    if (packWeight(merged) > packWeight(shared) && merged.length) {
      try {
        var json = JSON.stringify(merged);
        localStorage.setItem(SHARED_KEY, json);
        localStorage.setItem(SHARED_BAK, json);
      } catch (_err) {
        /* keep memory copy */
      }
    }
    return merged;
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function freeDuplicateSpace() {
    try { localStorage.removeItem(SHARED_BAK); } catch (_err) { /* copia */ }
    try {
      if (localStorage.getItem(ME_KEY)) localStorage.removeItem(ME_BAK);
    } catch (_err) { /* la partida principal sigue en su clave */ }
  }

  function savePacks(incoming) {
    var current = loadPacks();
    var next = Array.isArray(incoming) ? incoming.filter(function (pack) {
      return pack && pack.id;
    }) : [];
    if (!next.length && current.length) return current;
    var json = JSON.stringify(next);
    var ok = writeStorage(SHARED_KEY, json);
    if (!ok) {
      freeDuplicateSpace();
      ok = writeStorage(SHARED_KEY, json);
    }
    if (ok) writeStorage(SHARED_BAK, json);
    return next;
  }

  global.SharedPacks = {
    load: loadPacks,
    save: savePacks,
    merge: mergePacks
  };
})(window);
