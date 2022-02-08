import json


class Monster:
    def __init__(self):
        self.name = None
        self.jp_name = None
        self.kind_name = None
        self.image_name = None
        self.memo = None

        self.parents = []

    def dump(self):
        j_parents = []
        for p in self.parents:
            j_parents.append(p.dump())
        return {
            'name': self.name,
            'jp_name': self.jp_name,
            'kind_name': self.kind_name,
            'image_name': self.image_name,
            'memo': self.memo,
            'parents': j_parents
        }

    @staticmethod
    def loads(o):
        m = Monster()
        m.name = o['name']
        m.jp_name = o['jp_name']
        m.kind_name = o['kind_name']
        m.image_name = o['image_name']
        m.memo = o['memo']
        m.parents = []
        for p in o['parents']:
            m.parents.append(MParent.loads(p))
        return m


class MParent:
    def __init__(self, father, mother):
        self.father = father
        self.mother = mother

    def dump(self):
        return {
            'father': self.father.dump(),
            'mother': self.mother.dump()
        }

    @staticmethod
    def loads(o):
        p = MParent(Monster.loads(o['father']), Monster.loads(o['mother']))
        return p


class MKind:
    def __init__(self):
        self.name = None
        self.jp_name = None
        self.monsters = []

    def dump(self):
        j_monsters = []
        for m in self.monsters:
            j_monsters.append(m.dump())
        return {
            'name': self.name,
            'jp_name': self.jp_name,
            'monsters': j_monsters
        }

    @staticmethod
    def loads(o):
        k = MKind()
        k.name = o['name']
        k.jp_name = o['jp_name']
        k.monsters = []
        for m in o['monsters']:
            k.monsters.append(Monster.loads(m))
        return k


def save_monster(kinds):
    j_kinds = []
    for k in kinds:
        j_kinds.append(k.dump())

    with open('../resources/monster.json', 'w') as f:
        f.write(json.dumps(j_kinds, ensure_ascii=False, indent=2))


def load_monster():
    with open('../resources/monster.json', 'r') as f:
        s = f.read()
        j_kinds = json.loads(s)

    kinds = []
    for k in j_kinds:
        kinds.append(MKind.loads(k))
    return kinds
