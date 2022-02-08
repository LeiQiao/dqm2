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

function CreateTargetCombo() {
    let root = document.getElementById("target-combo");
    let target_monster = window.localStorage.getItem("target_name");
    if (target_monster != null) {
        for (let i in root.children) {
            root.children[i].selected = (root.children[i].innerText == target_monster);
        }
    }
    root.addEventListener('change', (event) => {
        for (let i in root.children) {
            if (root.children[i].selected) {
                window.localStorage.setItem("target_name", root.children[i].innerText);
                CreateTargetMonster();
                CreateHavePairLines();
                UpdateMonsterPosition();
            }
        }
    });
}

function CreateAddKinds() {
    let root = document.getElementById("add-kinds");

    for (var i in monster_kinds) {
        let kind_name = monster_kinds[i].name;
        let div = document.createElement("div");
        div.classList.add("kind");
        div.innerText = kind_name;
        root.appendChild(div);
        let onclick = function (e) {
            ShowKindPanel(null, 0, 0);

            let m = e.target;
            while (m != null && m != undefined && m.id != "monster") m = m.parentElement;
            if (m == undefined) return;
            
            let ms = window.localStorage.getItem("have_monster");
            ms = JSON.parse(ms);
            if (ms == undefined) ms = [];
            ms.push({
                'name': m.monster.name,
                'jp_name': m.monster.jp_name,
                'kind_name': m.monster.kind_name,
                'image_name': m.monster.image_name,
                'memo': m.monster.memo
            });
            ms = JSON.stringify(ms);
            window.localStorage.setItem("have_monster", ms);

            CreateHave();
            CreateHavePairLines();
            UpdateMonsterPosition();
        }
        div.oncontextmenu = function (e) {
            ShowKindPanel(kind_name, e.pageX, e.pageY, onclick);
            e.stopPropagation();
        }
    }
}

HaveMonsters = [];
function CreateHave() {
    let root = document.getElementById("have-monsters");
    while (root.children.length > 0) root.removeChild(root.children[0]);

    let ms = window.localStorage.getItem("have_monster");
    HaveMonsters = ms = JSON.parse(ms);

    let saveMonsters = function () {
        let nms = [];
        for (let i in root.children) {
            if (root.children[i] == null || root.children[i].monster == null) continue;
            
            let m = root.children[i];
            nms.push({
                'name': m.monster.name,
                'jp_name': m.monster.jp_name,
                'kind_name': m.monster.kind_name,
                'image_name': m.monster.image_name,
                'memo': m.monster.memo,
                'sex': m.monster.sex
            });
        }
        HaveMonsters = nms;
        nms = JSON.stringify(nms);
        window.localStorage.setItem("have_monster", nms);
        for (let i in HaveMonsters) {
            for (let j=0; j<root.children.length; j++) {
                if (HaveMonsters[i].jp_name == root.children[j].monster.jp_name) HaveMonsters[i].div = root.children[j];
            }
        }
        CreateTargetMonster();
        CreateHavePairLines();
        UpdateMonsterPosition();
    }

    for (let i in ms) {
        let monster = ms[i];

        let div = document.createElement("div");
        div.classList.add("monster");
        div.id = "monster";
        div.monster = monster;
        monster.div = div;

        let close = document.createElement("span");
        close.classList.add("remove-have");
        close.innerText = "X";
        div.appendChild(close);

        let name = document.createElement("span");
        name.classList.add("title");
        name.innerText = (monster.name != null ? monster.name : "") + '[' + monster.kind_name + ']';
        div.appendChild(name);

        if (monster.memo != null) {
            let memo = document.createElement("span");
            memo.classList.add("title");
            memo.innerText = "(" + monster.memo + ")";
            div.appendChild(memo);
        }
    
        if (monster.image_name != null) {
            let image = document.createElement("img");
            image.classList.add("image");
            image.src = "/resources/images/" + monster.image_name;
            div.appendChild(image);
        }

        let sex = document.createElement("div");
        sex.classList.add("have-sex");
        div.appendChild(sex);

        let male = document.createElement("span");
        male.classList.add("male");
        male.innerText = "♂";
        sex.appendChild(male);

        let female = document.createElement("span");
        female.classList.add("female");
        female.innerText = "♀";
        sex.appendChild(female);

        if (monster.sex != undefined) {
            if (monster.sex == 0) female.classList.add("selected");
            else male.classList.add("selected");
        }

        div.onclick = function (e) {
            CreateSuggestPanel(monster, e.pageX, e.pageY);
            e.stopPropagation();
        }
        
        close.onclick = function (e) {
            e.stopPropagation();
            if (!confirm("remove it?")) return;
            root.removeChild(div);
            saveMonsters();
        }

        male.onclick = function (e) {
            e.stopPropagation();
            female.classList.remove("selected");
            if (monster.sex == 1) {
                male.classList.remove("selected");
                monster.sex = undefined;
            } else {
                male.classList.add("selected");
                monster.sex = 1;
            }
            saveMonsters();
        }

        female.onclick = function (e) {
            e.stopPropagation();
            male.classList.remove("selected");
            if (monster.sex == 0) {
                female.classList.remove("selected");
                monster.sex = undefined;
            } else {
                female.classList.add("selected");
                monster.sex = 0;
            }
            saveMonsters();
        }

        root.appendChild(div);
    }
}

function CreateHavePairLines() {
    let root = document.getElementById("have-pairs");

    while (root.children.length > 0) root.removeChild(root.children[0]);

    let height = 200;
    for (let i in HaveMonsters) {
        for (let j in HaveMonsters) {
            if (i == j) continue;
            
            let father = HaveMonsters[i];
            let mother = HaveMonsters[j];

            if (father.sex != null && mother.sex != null && father.sex == mother.sex) continue;
            
            let foundMonster = FindMonster(TargetMonster, father.jp_name, null, mother.jp_name, null);

            let father_kind_name = father.kind_name;
            let mother_kind_name = mother.kind_name;

            if (foundMonster == null) foundMonster = FindMonster(TargetMonster, father.jp_name, null, null, mother_kind_name);
            if (foundMonster == null) foundMonster = FindMonster(TargetMonster, null, father_kind_name, mother.jp_name, null);
            if (foundMonster == null) foundMonster = FindMonster(TargetMonster, null, father_kind_name, null, mother_kind_name);

            if (foundMonster == null) continue;

            let left = father.div.offsetLeft;
            let top = father.div.offsetTop + 180;
            let right = mother.div.offsetLeft;
            let bottom = top + height;
            let direction = "->";
            if (right < left) {
                let tmp = right;
                right = left;
                left = tmp;
                direction = "<-";
            }
            if (foundMonster.sex == 1) {
                direction += " ♂";
            } else if (foundMonster.sex == 0) {
                direction += " ♀";
            }

            left += father.div.offsetWidth / 2;
            right += mother.div.offsetWidth / 2;

            let div = document.createElement("div");
            div.classList.add("have-pair");
            div.style.left = left + "px";
            div.style.top = top + "px";
            div.style.width = (right - left) + "px";
            div.style.height = (bottom - top) + "px";

            let div2 = document.createElement("div");
            div2.classList.add("monster");
            div.appendChild(div2);

            let name = document.createElement("span");
            name.classList.add("title");
            name.innerText = (foundMonster.monster.name != null ? foundMonster.monster.name : "") + '[' + foundMonster.monster.kind_name + ']';
            div2.appendChild(name);

            if (foundMonster.monster.memo != null) {
                let memo = document.createElement("span");
                memo.classList.add("title");
                memo.innerText = "(" + foundMonster.monster.memo + ")";
                div2.appendChild(memo);
            }
        
            if (foundMonster.monster.image_name != null) {
                let image = document.createElement("img");
                image.classList.add("image");
                image.src = "/resources/images/" + foundMonster.monster.image_name;
                div2.appendChild(image);
            }

            let direct = document.createElement("span");
            direct.innerText = direction;
            div2.appendChild(direct);

            root.appendChild(div);

            div2.onclick = function (e) {
                for (let k=0; k<root.children.length; k++) {
                    if (root.children[k] != div) root.children[k].classList.remove("selected");
                    else {
                        if (div.classList.contains("selected")) div.classList.remove("selected");
                        else div.classList.add("selected");
                    }
                }
            }

            height += 200;
        }
    }
}

let TargetMonster = null;
function CreateTargetMonster() {
    let root = document.getElementById("monsters");
    while (root.children.length > 0) root.removeChild(root.children[0]);
    
    let combo = document.getElementById("target-combo");
    TargetMonster = MakePedTree(combo.value);

    haveMonsterNames = [];
    for (let i in HaveMonsters) {
        haveMonsterNames.push(HaveMonsters[i].jp_name);
    }

    CreateMonsterElements(TargetMonster, root, haveMonsterNames);
    UpdateMonsterPosition();
}

function ShowMonsters() {
    // history.pushState(null, null, document.URL);
    // window.addEventListener("popstate", function() {
    //     history.pushState(null, null, document.URL);
    // });

    InitializeMonster();

    
    CreateTargetCombo();
    CreateAddKinds();
    CreateHave();
    CreateTargetMonster();
    CreateHavePairLines();
    UpdateMonsterPosition();

    CreateKindPanel();

    document.addEventListener("click", () => {
        ShowKindPanel(null, 0, 0);
        CreateSuggestPanel(null, 0, 0);
    });
}

let FocusedMonster = null;

function OnCombo() {
    let father = document.getElementById("father").value;
    let mother = document.getElementById("mother").value;
    
    if (father.length == 0 || mother.length == 0) return;
    
    let monster = null;
    for (let i in PedTreeMonsters) {
        if (monster != null) break;
        monster= FindMonster(PedTreeMonsters[i], father, null, mother, null);
    }

    let father_kind_name = GetMonsterKindName(father);
    let mother_kind_name = GetMonsterKindName(mother);

    for (let i in PedTreeMonsters) {
        if (monster != null) break;
        monster = FindMonster(PedTreeMonsters[i], father, null, null, mother_kind_name);
    }

    for (let i in PedTreeMonsters) {
        if (monster != null) break;
        monster = FindMonster(PedTreeMonsters[i], null, father_kind_name, mother, null);
    }

    for (let i in PedTreeMonsters) {
        if (monster != null) break;
        monster = FindMonster(PedTreeMonsters[i], null, father_kind_name, null, mother_kind_name);
    }

    if (FocusedMonster != null) {
        FocusedMonster.element.classList.remove("focus-monster");
        FocusedMonster = null;
    }

    if (monster == null) {
        alert("not found");
        return;
    }

    let left = monster.point.x + 100 - window.innerWidth / 2;
    let top = monster.point.y + 100 - window.innerHeight / 2;
    window.scrollTo((left >= 0) ? left : 0, (top >= 0) ? top : 0);

    monster.element.classList.add("focus-monster");
    FocusedMonster = monster;
}

class FoundMonster {
    monster = null;
    sex = null;
    constructor(monster, sex) {
        this.monster = monster;
        this.sex = sex;
    }
}

function FindMonster(monster, father, father_kind_name, mother, mother_kind_name, sex=null) {
    if (monster.have) return null;
    for (let i in monster.parents) {
        if (father != null && mother != null) {
            if (monster.parents[i].father.name == father && monster.parents[i].mother.name == mother) {
                return new FoundMonster(monster, sex);
            }
        } else if (father != null && mother_kind_name != null) {
            if (monster.parents[i].father.name == father && monster.parents[i].mother.jp_name == null && monster.parents[i].mother.kind_name == mother_kind_name) {
                return new FoundMonster(monster, sex);
            }
        } else if (father_kind_name != null && mother != null) {
            if (monster.parents[i].father.jp_name == null && monster.parents[i].father.kind_name == father_kind_name && monster.parents[i].mother.name == mother) {
                return new FoundMonster(monster, sex);
            }
        } else if (father_kind_name != null && mother_kind_name != null) {
            if (monster.parents[i].father.jp_name == null && monster.parents[i].father.kind_name == father_kind_name && monster.parents[i].mother.jp_name == null && monster.parents[i].mother.kind_name == mother_kind_name) {
                return new FoundMonster(monster, sex);
            }
        }
        if (monster.parents[i].father.name != null) {
            let fm = FindMonster(monster.parents[i].father, father, father_kind_name, mother, mother_kind_name, 1);
            if (fm != null) return fm;
        }
        if (monster.parents[i].mother.name != null) {
            let fm = FindMonster(monster.parents[i].mother, father, father_kind_name, mother, mother_kind_name, 0);
            if (fm != null) return fm;
        }
    }
    return null;
}

function SetMonsterParentVisibility(monster) {
    let monster_names = window.localStorage.getItem("hiddenMonsters");
    if (monster_names == undefined) monster_names = [];
    else monster_names = JSON.parse(monster_names);
    if (monster.hideParent && !monster_names.includes(monster.name)) {
        monster_names.push(monster.name);
        window.localStorage.setItem("hiddenMonsters", JSON.stringify(monster_names));
    }
    if (!monster.hideParent && monster_names.includes(monster.name)) {
        let index = monster_names.indexOf(monster.name);
        monster_names.splice(index, 1);
        window.localStorage.setItem("hiddenMonsters", JSON.stringify(monster_names));
    }
}

function GetMonsterParentVisibility(monster) {
    let monster_names = window.localStorage.getItem("hiddenMonsters");
    if (monster_names == undefined) return true;
    monster_names = JSON.parse(monster_names);
    return !monster_names.includes(monster.name);
}