class Point {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Size {
    width = 0;
    height = 0;

    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
}

let TargetMonsterName = null;
let TargetMonster = null;

function ShowMonsters() {
    // history.pushState(null, null, document.URL);
    // window.addEventListener("popstate", function() {
    //     history.pushState(null, null, document.URL);
    // });

    InitializeMonster();

    CreateTargetCombo();
    CreateTargetMonster();


    document.addEventListener("click", () => {
        let root = document.getElementById("monster-kinds");
        while (root.children.length > 0) root.removeChild(root.children[0]);
    });
}

function CreateTargetCombo() {
    let root = document.getElementById("target-combo");

    // let finalMonsters = FindFinalMonsters();
    let finalMonsters = [];
    for (let i in ped_order) {
        finalMonsters.push({"jp_name": ped_order[i]});
    }
    for (let i in finalMonsters) {
        let found = false;
        for (let j in root.children) {
            if (root.children[j].innerText == finalMonsters[i].jp_name) {
                found = true;
                break;
            }
        }
        if (!found) {
            let op = document.createElement("option");
            op.innerText = finalMonsters[i].jp_name;
            root.appendChild(op);
        }
    }

    TargetMonsterName = window.localStorage.getItem("target_name");
    if (TargetMonsterName != null) {
        for (let i in root.children) {
            root.children[i].selected = (root.children[i].innerText == TargetMonsterName);
        }
    } else {
        TargetMonsterName = "欧鲁德米亚（变身后）";
    }
    TargetMonster = window.localStorage.getItem(TargetMonsterName);
    if (TargetMonster != null) {
        try {
            TargetMonster = JSON.parse(TargetMonster);
            TargetMonster = Monster.loads(TargetMonster);
        } catch (e) {
            console.error(e);
            TargetMonster = GetMonsterByName(TargetMonsterName).copy();
        }
    } else {
        TargetMonster = GetMonsterByName(TargetMonsterName).copy();
    }
    root.addEventListener('change', (event) => {
        for (let i in root.children) {
            if (root.children[i].selected) {
                console.log(root.children[i].innerText);
                TargetMonsterName = root.children[i].innerText;
                window.localStorage.setItem("target_name", root.children[i].innerText);
                TargetMonster = window.localStorage.getItem(TargetMonsterName);
                if (TargetMonster != null) {
                    try {
                        TargetMonster = JSON.parse(TargetMonster);
                        TargetMonster = Monster.loads(TargetMonster);
                    } catch (e) {
                        console.error(e);
                        TargetMonster = GetMonsterByName(TargetMonsterName).copy();
                    }
                } else {
                    TargetMonster = GetMonsterByName(TargetMonsterName).copy();
                }

                CreateTargetMonster();
            }
        }
    });
}

function CreateTargetMonster() {
    let root = document.getElementById("monsters");
    while (root.children.length > 0) root.removeChild(root.children[0]);

    CreateMonsterElements(TargetMonster, root);
    UpdateMonsterPosition();
}

function CreateMonsterElements(monster, root) {
    monster.element = document.createElement("div");
    monster.element.classList.add("monster");
    monster.element.id = "monster";
    monster.element.monster = monster;
    root.appendChild(monster.element);

    let name = document.createElement("span");
    name.classList.add("title");
    name.innerText = (monster.name != null ? monster.name : "") + '[' + monster.kind_name + ']';
    monster.element.appendChild(name);
    monster.nameElement = name;

    if (monster.memo != null) {
        let memo = document.createElement("span");
        memo.classList.add("title");
        memo.innerText = "(" + monster.memo + ")";
        monster.element.appendChild(memo);
        monster.memoElement = memo;
    }

    if (monster.image_name != null) {
        let image = document.createElement("img");
        image.classList.add("image");
        image.src = "/resources/images/" + monster.image_name;
        monster.element.appendChild(image);
        monster.imageElement = image;
    } else {
        monster.imageElement = null;
    }

    let parentCount = document.createElement("span");
    parentCount.classList.add("title");
    parentCount.innerText = monster.parent_count;
    monster.element.appendChild(parentCount);
    monster.parentCountElement = parentCount;
    
    for (let i in monster.parents) {
        CreateMonsterElements(monster.parents[i].father, root);
        CreateMonsterElements(monster.parents[i].mother, root);

        let line = document.createElement("div");
        line.classList.add("line");
        monster.parents[i].lineElement = line;
        root.appendChild(monster.parents[i].lineElement);
        
        let add = document.createElement("span");
        add.innerText = "+";
        add.classList.add("join");
        monster.parents[i].addElement = add;
        root.appendChild(monster.parents[i].addElement);

        let group = document.createElement("div");
        group.classList.add("group");
        monster.parents[i].groupElement = group;
        root.appendChild(monster.parents[i].groupElement);
    }

    if (monster.have) monster.element.classList.add("red-have");
    else monster.element.classList.remove("red-have");

    monster.element.onclick = function (e) {
        if (monster.jp_name == null) openKind(monster, e.pageX, e.pageY);
        else showHideParent(monster);
        e.stopPropagation();
    }

    monster.element.oncontextmenu = function (e) {
        if (monster.jp_name == null) openKind(monster, e.pageX, e.pageY);
        else addRemoveMonster(monster);
        return false;
    }
}

function MoveMonster(monster, point) {
    monster.element.style.visibility = null;
    monster.element.style.left = point.x + "px";
    monster.element.style.top = point.y + "px";
    monster.point = new Point(point.x, point.y);
    if (monster.parents.length == 0) {
        return new Size(200, 200);
    }
    let totalWidth = GetMonsterWidth(monster);
    let totalHeight = 0;
    let childPoint = new Point(point.x - totalWidth / 2 + 100, point.y + 100 + 200);
    for (let i in monster.parents) {
        let width = GetMonsterWidth(monster.parents[i].father);
        childPoint.x += width / 2 - 100;
        let fatherLeft = childPoint.x;
        let fatherSize = MoveMonster(monster.parents[i].father, childPoint);
        childPoint.x += 100 + width / 2 + 60;
        width = GetMonsterWidth(monster.parents[i].mother);
        childPoint.x += width / 2 - 100;
        let motherLeft = childPoint.x;
        let motherSize = MoveMonster(monster.parents[i].mother, childPoint);
        childPoint.x += 100 + width / 2;

        monster.parents[i].addElement.style.visibility = null;
        monster.parents[i].addElement.style.left = (fatherLeft + (motherLeft - fatherLeft + 200) / 2 - 10) + "px";
        monster.parents[i].addElement.style.top = (childPoint.y + 100 - 10) + "px";
        monster.parents[i].groupElement.style.visibility = null;
        monster.parents[i].groupElement.style.left = fatherLeft + "px";
        monster.parents[i].groupElement.style.top = childPoint.y + "px";
        monster.parents[i].groupElement.style.width = (motherLeft - fatherLeft + 200) + "px";
        monster.parents[i].groupElement.style.height = 200 + "px";

        let lineStartPoint = new Point(point.x + 100, point.y + 202);
        let lineEndPoint = new Point(fatherLeft + (motherLeft - fatherLeft + 200) / 2, childPoint.y);
        let lineHeight = Math.sqrt(Math.pow(lineStartPoint.x - lineEndPoint.x, 2) + Math.pow(lineStartPoint.y - lineEndPoint.y, 2));
        let degree = Math.asin(Math.abs(lineStartPoint.x - lineEndPoint.x) / lineHeight) * 180 / Math.PI;
        if (lineEndPoint.x > lineStartPoint.x) degree = 0 - degree;
        let lineElement = monster.parents[i].lineElement;
        lineElement.style.visibility = null;
        lineElement.style.left = (Math.min(lineEndPoint.x, lineStartPoint.x) + Math.abs(lineStartPoint.x - lineEndPoint.x) / 2) + "px";
        lineElement.style.top = (Math.min(lineEndPoint.y, lineStartPoint.y) + Math.abs(lineStartPoint.y - lineEndPoint.y) / 2 - lineHeight / 2) + "px";
        lineElement.style.width = 2 + "px";
        lineElement.style.height = lineHeight + "px";
        lineElement.style.transform = "rotate(" + degree + "deg)";

        childPoint.x += 40;
        totalHeight += Math.max(fatherSize.height, motherSize.height);
    }
    return new Size(totalWidth, totalHeight + 300);
}

function GetMonsterWidth(monster) {
    if (monster.hideParent || monster.parents.length == 0) return 200;
    let width = 0;
    for (let i in monster.parents) {
        width += GetMonsterWidth(monster.parents[i].father) + 20 + 20 + 20 + GetMonsterWidth(monster.parents[i].mother);
    }
    width += (monster.parents.length - 1) * 40;
    return width;
}

function UpdateMonsterPosition() {
    let top = 100;
    let pos = new Point(0, top);
    let size = MoveMonster(TargetMonster, pos);
    pos.x += size.width / 2;
    MoveMonster(TargetMonster, pos);
    pos.x += size.width / 2 + 100;
}

function showHideParent(monster) {
    if (monster.parents != null && monster.parents.length > 0) {
        if (checkHaveParent(monster) != null) {
            alert("have");
            return;
        }
        monster.parents = [];
    } else {
        monster.parents = [];
        let tm = GetMonsterByName(monster.name);
        if (tm != null) {
            for (let i in tm.parents) {
                let np = new MonsterParent();
                np.father = tm.parents[i].father.copy();
                np.mother = tm.parents[i].mother.copy();
                monster.parents.push(np);
            }
        }
    }
    window.localStorage.setItem(TargetMonsterName, JSON.stringify(TargetMonster.dumps()));
    CreateTargetMonster();
}

function addRemoveMonster(monster) {
    monster.have = !monster.have;
    let child = getChild(TargetMonster, monster);
    if (monster.have) {
        if (child != null) {
            for (let i=child.parents.length-1; i>=0; i--) {
                let h = (child.parents[i].father == monster || child.parents[i].mother == monster);
                if (!h) child.parents.splice(i, 1);
            }
        }
    } else if (child.parent_count != child.parents.length) {
        let other_pair = null;
        if (child != null) {
            for (let i in child.parents) {
                if (child.parents[i].father == monster) {
                    other_pair = child.parents[i].mother;
                    break;
                }
                if (child.parents[i].mother == monster) {
                    other_pair = child.parents[i].father;
                    break;
                }
            }
        }
        if (!other_pair.have) {
            let tm = GetMonsterByName(child.name);
            if (tm != null) {
                for (let i in tm.parents) {
                    if ((tm.parents[i].father.jp_name == monster.jp_name && tm.parents[i].mother.jp_name == other_pair.jp_name) ||
                    (tm.parents[i].mother.jp_name == monster.jp_name && tm.parents[i].father.jp_name == other_pair.jp_name)) {
                        continue;
                    }
                    let np = new MonsterParent();
                    np.father = tm.parents[i].father.copy();
                    np.mother = tm.parents[i].mother.copy();
                    child.parents.splice(i, 0, np);
                }
            }
        }
    }
    window.localStorage.setItem(TargetMonsterName, JSON.stringify(TargetMonster.dumps()));
    CreateTargetMonster();
}

function openKind(monster, x, y) {
    let root = document.getElementById("monster-kinds");
    while (root.children.length > 0) root.removeChild(root.children[0]);

    let child = getChild(TargetMonster, monster);
    let other_pair = null;
    let is_left = true;
    if (child != null) {
        for (let i in child.parents) {
            if (child.parents[i].father == monster) {
                other_pair = child.parents[i].mother;
                is_left = true;
                break;
            }
            if (child.parents[i].mother == monster) {
                other_pair = child.parents[i].father;
                is_left = false;
                break;
            }
        }
    }

    let kind_monsters = [];
    for (let i in Monsters) {
        if (Monsters[i].kind_name != monster.kind_name) continue;

        pair_to_other_monster = false;
        
        if (other_pair.jp_name != null) {
            for (let j = 0; j < Monsters.length && !pair_to_other_monster; j++) {
                let father_jp_name = (is_left ? Monsters[j].jp_name : other_pair.jp_name);
                let mother_jp_name = (is_left ? other_pair.jp_name : Monsters[j].jp_name);
                for (let k =0; k < Monsters[j].parents.length && !pair_to_other_monster; k++) {
                    let p = Monsters[j].parents[k];
                    if (p.father.jp_name == father_jp_name && p.mother.jp_name == mother_jp_name) {
                        console.log(Monsters[j]);
                        if (Monsters[j].jp_name != child.jp_name) {
                            pair_to_other_monster = true;
                            break;
                        }
                    }
                }
            }
        } else {
            for (let l = 0; l < Monsters.length && !pair_to_other_monster; l++) {
                if (Monsters[l].kind_monsters != other_pair.kind_name) continue;
                for (let j = 0; j < Monsters.length && !pair_to_other_monster; j++) {
                    let father_jp_name = (is_left ? Monsters[j].jp_name : Monsters[l].jp_name);
                    let mother_jp_name = (is_left ? Monsters[l].jp_name : Monsters[j].jp_name);
                    for (let k =0; k < Monsters[j].parents.length && !pair_to_other_monster; k++) {
                        let p = Monsters[j].parents[k];
                        if (p.father.jp_name == father_jp_name && p.mother.jp_name == mother_jp_name) {
                            console.log(Monsters[j]);
                            if (Monsters[j].jp_name != child.jp_name) {
                                pair_to_other_monster = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!pair_to_other_monster) {
            kind_monsters.push(Monsters[i].copy());
        }
    }

    let panel = document.createElement("div");
    panel.id = monster.kind_name;
    panel.classList.add("kind-panel");
    root.appendChild(panel);

    let top = 0;
    for (let i in kind_monsters) {
        let m = kind_monsters[i].copy();
        CreateMonsterElements(m, panel);
        m.element.onclick = null;
        m.element.oncontextmenu = null;
        m.element.style.left = ((i % 6) * 201) + "px";
        if (i > 0 && i % 6 == 0) top += 201;
        m.element.style.top = top + "px";
    }
    panel.style.left = x + "px";
    panel.style.top = y + "px";
    panel.style.width = ((6 * 201) + 1) + "px";
    panel.style.height = (Math.ceil(kind_monsters.length / 6.0) * 201 + 1) + "px";
    panel.onclick = function (e) {e.stopPropagation();}
}

function checkHaveParent(monster) {
    for (let i in monster.parents) {
        if (monster.parents[i].father.have) return monster.parents[i].father;
        if (monster.parents[i].mother.have) return monster.parents[i].mother;
        let haveMonster = checkHaveParent(monster.parents[i].father);
        if (haveMonster != null) return haveMonster;
        haveMonster = checkHaveParent(monster.parents[i].mother);
        if (haveMonster != null) return haveMonster;
    }
    return null;
}

function getChild(monster, parent) {
    for (let i in monster.parents) {
        if (monster.parents[i].father == parent) return monster;
        if (monster.parents[i].mother == parent) return monster;
        let childMonster = getChild(monster.parents[i].father, parent);
        if (childMonster != null) return childMonster;
        childMonster = getChild(monster.parents[i].mother, parent);
        if (childMonster != null) return childMonster;
    }
    return null;
}

