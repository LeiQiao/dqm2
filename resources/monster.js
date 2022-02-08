class Monster
{
    name = "";
    jp_name = "";
    kind_name = "";
    image_name = "";
    memo = "";
    parents = [];
    in_other_ped_tree = false;
    parent_count = 0;
    have = false;
    hide_parents = false;

    copy = function () {
      let nm = new Monster();
      nm.name = this.name;
      nm.jp_name = this.jp_name;
      nm.kind_name = this.kind_name;
      nm.image_name = this.image_name;
      nm.memo = this.memo;
      nm.parent_count = this.parent_count;
      nm.have = this.have;
      nm.hide_parents = this.hide_parents;
      return nm;
    }

    dumps = function () {
      let ps = [];
      if (this.parents != null && this.parents.length > 0) {
        for (let i in this.parents) {
          ps.push(this.parents[i].dumps());
        }
      }
      return {
        "name": this.name,
        "jp_name": this.jp_name,
        "kind_name": this.kind_name,
        "image_name": this.image_name,
        "memo": this.memo,
        "parent_count": this.parent_count,
        "have": this.have,
        "hide_parents": this.hide_parents,
        "parents": ps
      };
    }

    MakePedTree = function(names) {
      let n = new Monster();
      n.name = this.name;
      n.jp_name = this.jp_name;
      n.kind_name = this.kind_name;
      n.image_name = this.image_name;
      n.memo = this.memo;
      n.parent_count = this.parent_count;
      if (names.includes(this.name)) {
        return n;
      }
      if (this.in_other_ped_tree) {
        return n;
      }
      this.in_other_ped_tree = true;
      for (let i in this.parents) {
        let fns = names.slice();
        let mns = names.slice();
        fns.push(this.name);
        mns.push(this.name);

        let np = new MonsterParent();
        np.father = this.parents[i].father.MakePedTree(fns);
        if (this.parents[i] == null) {
          console.log('mother is None');
        }
        np.mother = this.parents[i].mother.MakePedTree(mns);
        n.parents.push(np);
      }
      return n;
    }
}

class MonsterParent
{
  father = null;
  mother = null;

  dumps = function () {
    return {
      "father": this.father.dumps(),
      "mother": this.mother.dumps()
    };
  }
}

Monster.loads = function (m) {
  let nm = new Monster();
  nm.name = m.name;
  nm.jp_name = m.jp_name;
  nm.kind_name = m.kind_name;
  nm.image_name = m.image_name;
  nm.memo = m.memo;
  nm.parent_count = m.parent_count;
  nm.have = m.have;
  nm.hide_parents = m.hide_parents;
  nm.parents = [];
  for (let i in m.parents) {
    nm.parents.push(MonsterParent.loads(m.parents[i]));
  }
  return nm;
}

MonsterParent.loads = function (p) {
  let np = new MonsterParent();
  np.father = Monster.loads(p.father);
  np.mother = Monster.loads(p.mother);
  return np;
}

class MonsterKind
{
  name = "";
  jp_name = "";
  monsters = [];
}

let MonsterKinds = [];
let Monsters = [];

function InitializeMonster() {
  for (let i in monster_kinds) {
    let mk = new MonsterKind();
    mk.name = monster_kinds[i].name;
    mk.jp_name = monster_kinds[i].jp_name;
    for (let j in monster_kinds[i].monsters) {
      let m = new Monster();
      m.name = monster_kinds[i].monsters[j].name;
      m.jp_name = monster_kinds[i].monsters[j].jp_name;
      m.kind_name = monster_kinds[i].monsters[j].kind_name;
      m.image_name = monster_kinds[i].monsters[j].image_name;
      m.memo = monster_kinds[i].monsters[j].memo;
      for (let k in monster_kinds[i].monsters[j].parents) {
        let p = new MonsterParent();
        p.father = new Monster();
        p.father.name = monster_kinds[i].monsters[j].parents[k].father.name;
        p.father.jp_name = monster_kinds[i].monsters[j].parents[k].father.jp_name;
        p.father.kind_name = monster_kinds[i].monsters[j].parents[k].father.kind_name;
        p.father.image_name = monster_kinds[i].monsters[j].parents[k].father.image_name;
        p.father.memo = monster_kinds[i].monsters[j].parents[k].father.memo;
        p.mother = new Monster();
        p.mother.name = monster_kinds[i].monsters[j].parents[k].mother.name;
        p.mother.jp_name = monster_kinds[i].monsters[j].parents[k].mother.jp_name;
        p.mother.kind_name = monster_kinds[i].monsters[j].parents[k].mother.kind_name;
        p.mother.image_name = monster_kinds[i].monsters[j].parents[k].mother.image_name;
        p.mother.memo = monster_kinds[i].monsters[j].parents[k].mother.memo;
        m.parents.push(p);
      }
      m.parent_count = m.parents.length;
      mk.monsters.push(m);
      Monsters.push(m);
    }
    MonsterKinds.push(mk);
  }
  
  for (let i in MonsterKinds) {
    let ms = MonsterKinds[i].monsters;
    for (let j in ms) {
      let m = ms[j];
      for (let k in m.parents) {
        let p = m.parents[k];
        if (p.father.name != null) p.father = GetMonsterByName(p.father.name);
        if (p.mother.name != null) p.mother = GetMonsterByName(p.mother.name);
      }
    }
  }
}

function FindRecurse() {
  for (let i in Monsters) {
    let m = Monsters[i];
    for (let j in m.parents) {
      let p = m.parents[j];
      if (p.father.name != null) IsRecurse(p.father, [m.name]);
      if (p.mother.name != null) IsRecurse(p.mother, [m.name]);
    }
  }
}

function IsRecurse(monster, names) {
  if (names.includes(monster.name)) {
    s = "";
    for (let i in names) s += names[i] + " -> ";
    s += monster.name;
    console.error("错误: 递归引用", s);
    return false;
  }

  for (let j in monster.parents) {
    let p = monster.parents[j];
    let fns = names.slice();
    let mns = names.slice();
    fns.push(monster.name);
    mns.push(monster.name);
    if (p.father.name != null) {
      if (!IsRecurse(p.father, fns)) return false;
    }
    if (p.mother.name != null) {
      if (!IsRecurse(p.mother, mns)) return false;
    }
  }
  return true;
}

function GetMonsterByName(name) {
  for (let i in Monsters) {
    if (Monsters[i].name == name) return Monsters[i];
  }
  return null;
}

function GetMonsterKindName(name) {
  for (let i in MonsterKinds) {
    for (let j in MonsterKinds[i].monsters) {
      if (MonsterKinds[i].monsters[j].name == name) return MonsterKinds[i].name;
    }
  }
  return null;
}

function MakePedTree(monsterName) {
  for (let i in Monsters) {
    Monsters[i].in_other_ped_tree = false;
  }
  let rootMonsters = [];
  for (let i in Monsters) {
    let monster = Monsters[i];
    if (FindMonsterChildren(monster).length == 0 && monster.jp_name == monsterName) {
      return monster.MakePedTree([]);
    }
  }
  return [];
}

function FindMonsterChildren(monster) {
  let children = [];
  for (let i in Monsters) {
    for (let j in Monsters[i].parents) {
      if (monster == Monsters[i].parents[j].father || monster == Monsters[i].parents[j].mother) children.push(Monsters[i]);
    }
  }
  return children;
}


function FindFinalMonsters() {
  let finalMonsters = [];
  for (let i in Monsters) {
    let name = Monsters[i].jp_name;
    let found = false;
    for (let j in Monsters) {
      for (let k in Monsters[j].parents) {
        if (Monsters[j].parents[k].father.jp_name == name || Monsters[j].parents[k].mother.jp_name == name) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) finalMonsters.push(Monsters[i]);
  }
  return finalMonsters;
}
