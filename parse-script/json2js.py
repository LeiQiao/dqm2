import json

with open('../resources/monster.json', 'r') as f:
    content = f.read()

with open('../resources/monster-define.js', 'w') as f:
    f.write('let monster_kinds = ')
    f.write(content)
    f.write(';\n\n')
    f.write('let ped_order = ')
    f.write(json.dumps(['欧鲁德米亚（变身后）', '暗黑多雷安', '阿修罗佐玛', '西多进化型', '真龙王', '波塞东'], ensure_ascii=False, indent=2))
    f.write(';\n\n')
