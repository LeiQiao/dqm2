import requests
import re
import json
import os
from defineM import *


def request_web():
    rsp = requests.get('http://dqm2.ffsky.cn/allc.htm')
    if rsp.status_code != 200:
        return None
    text = rsp.content.decode('utf-8')
    return text


def parse_m(text):
    matches = re.findall('<table[\\w\\W]*?</table>', text)
    kinds = []
    for table in matches:
        kinds.append(parse_kind(table))
    return kinds


def parse_kind(kind_table):
    match = re.search('<td>苍白之主\\s\\+\\s龙王</td>', kind_table)
    if match is not None:
        kind_table = re.sub('(<td>苍白之主\\s\\+\\s龙王</td>)', '\g<1></tr>', kind_table)
    trs = re.findall('<tr[\\w\\W]*?</tr>', kind_table)
    name = re.search('<font[\\w\\W]*?>([\\w\\W]*)</font>', trs[0]).group(1)
    names = name.split('（')
    kind = MKind()
    kind.jp_name = names[0].strip()
    kind.name = names[1].strip()[:-1]
    for m in trs[2:]:
        kind.monsters.append(parse_monster(m, kind.name))
    return kind


def parse_monster(mtr, kind_name):
    tds = re.findall('<td[\\w\\W]*?</td>', mtr)
    index = re.search('<div[\\w\\W]*?>(\d*)', tds[0]).group(1)
    monster = Monster()
    monster.kind_name = kind_name
    monster.image_name = 'library/0{0}.gif'.format(index)
    monster.name = monster.jp_name = re.search('<font[\\w\\W]*?>([\\w\\W]*?)</font>', tds[1]).group(1)
    tds[2] = tds[2].replace('<p>', '').replace('</p>', '').replace('<br />', '<br>')
    parents = re.search('<td>([\\w\\W]*)</td>', tds[2]).group(1).split('<br>')
    for parent in parents:
        parent = parent.strip()
        ps = parent.split(']+ ')
        if len(ps) == 2:
            ps[0] = ps[0] + ']'
        else:
            ps = parent.split(' + ')
        if len(ps) != 2:
            if monster.memo is None:
                monster.memo = ''
            monster.memo += parent + ' '
            continue
        f = ps[0].strip()
        m = ps[1].strip()
        father = Monster()
        mother = Monster()
        if f[-1] == '系':
            father.kind_name = f
        else:
            names = f.split('（+')
            if len(names) > 1:
                father.memo = '+' + names[1].strip()[:-1]
                f = names[0]
            names = f.split('[')
            if len(names) > 1:
                father.kind_name = names[1].strip()[:-1]
                f = names[0]
            else:
                father.kind_name = kind_name
            father.name = father.jp_name = f.strip()
        if m[-1] == '系':
            mother.kind_name = m
        else:
            names = m.split('（+')
            if len(names) > 1:
                mother.memo = '+' + names[1].strip()[:-1]
                m = names[0]
            names = m.split('[')
            if len(names) > 1:
                mother.kind_name = names[1].strip()[:-1]
                m = names[0]
            else:
                mother.kind_name = kind_name
            mother.name = mother.jp_name = m.strip()
        monster.parents.append(MParent(father, mother))

    return monster


def parse_parent_kind(kinds):
    kind_names = []

    def s2ln(ks, sn):
        for kn in ks:
            if sn == kn[0]:
                return kn
        for kn in ks:
            if sn == kn[1]:
                return kn
        print('unable found kind {0}'.format(sn))
        return None

    for k in kinds:
        kind_names.append(k.name)
    for k in kinds:
        for m in k.monsters:
            for p in m.parents:
                if p.father.name is not None and p.father.kind_name is not None:
                    if p.father.kind_name not in kind_names:
                        p.father.kind_name = s2ln(kind_names, p.father.kind_name)
                if p.mother.name is not None and p.mother.kind_name is not None:
                    if p.mother.kind_name not in kind_names:
                        p.mother.kind_name = s2ln(kind_names, p.mother.kind_name)

    return kinds


def save(kinds):
    saved_count = 1
    for k in kinds:
        for m in k.monsters:
            if m.image_name is None:
                continue
            image_name = os.path.basename(m.image_name)
            file_name = '../resources/images/'+image_name
            if os.path.exists(file_name):
                m.image_name = image_name
                continue
            rsp = requests.get('http://dqm2.ffsky.cn/'+m.image_name)
            if rsp.status_code != 200:
                m.image_name = None
                continue
            with open(file_name, 'wb') as f:
                f.write(rsp.content)
            m.image_name = image_name
            print('image saved {0} ({1})'.format(image_name, saved_count))
            saved_count += 1
    save_monster(kinds)
    print('monster saved')


save(parse_parent_kind(parse_m(request_web())))
