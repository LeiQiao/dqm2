from defineM import *


def check_name_typo(kinds):
    def fmn(n):
        for kn in kinds:
            for mo in kn.monsters:
                if mo.jp_name == n:
                    return True
        return False

    wrong_names = ["史莱姆（DQM2）", "大种鸡（DQM1）", "米尔特兰斯（変身后）"]
    right_names = ["史莱姆", "大种鸡", "米尔特兰斯（变身后）"]

    changed = False

    for k in kinds:
        for m in k.monsters:
            if m.jp_name in wrong_names:
                index = wrong_names.index(m.jp_name)
                m.name = m.jp_name = right_names[index]
                changed = True
            for p in m.parents:
                if p.father.jp_name in wrong_names:
                    index = wrong_names.index(p.father.jp_name)
                    p.father.name = p.father.jp_name = right_names[index]
                    changed = True
                if p.mother.jp_name in wrong_names:
                    index = wrong_names.index(p.mother.jp_name)
                    p.mother.name = p.mother.jp_name = right_names[index]
                    changed = True
                if p.father.name == "恶魔":
                    p.father.name = p.father.jp_name = None
                    p.father.kind_name = "恶魔系"
                    changed = True
                if p.mother.name == "恶魔":
                    p.mother.name = p.mother.jp_name = None
                    p.mother.kind_name = "恶魔系"
                    changed = True
                if p.father.kind_name == "？？？？系":
                    p.father.kind_name = "恶魔系"
                    changed = True
                if p.mother.kind_name == "？？？？系":
                    p.mother.kind_name = "恶魔系"
                    changed = True

    for k in kinds:
        for m in k.monsters:
            for p in m.parents:
                if p.father.jp_name is not None and not fmn(p.father.jp_name):
                    print('{0} not found'.format(p.father.jp_name))
                if p.mother.jp_name is not None and not fmn(p.mother.jp_name):
                    print('{0} not found'.format(p.mother.jp_name))

    if changed:
        save_monster(kinds)
    return kinds


check_name_typo(load_monster())
