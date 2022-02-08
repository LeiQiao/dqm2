class MonsterPair {
    parent = undefined;
    monster = undefined;
    sex = 0;

    constructor(parent, monster, sex) {
        this.parent = parent;
        this.monster = monster;
        this.sex = sex;
    }
}

function CreateSuggestPanel(monster, x, y) {
    let root = document.getElementById("monster-suggest");
    while (root.children.length > 0) root.removeChild(root.children[0]);

    if (monster == null) return;

    let parents = FindParentsBy(TargetMonster, monster.jp_name, null, null, null);
    if (parents.length == 0) parents = FindParentsBy(TargetMonster, null, null, monster.jp_name, null);
    if (parents.length == 0) {
        parents = FindParentsBy(TargetMonster, null, monster.kind_name, null, null);
        parents.concat(FindParentsBy(TargetMonster, null, null, null, monster.kind_name));
    }
    
    let panel = document.createElement("div");
    panel.classList.add("suggest-panel");
    panel.style.left = x + "px";
    panel.style.top = y + "px";
    panel.onclick = function (e) {
        e.stopPropagation();
    }

    if (parents.length == 0) {
        let noparents = document.createElement("div");
        noparents.classList.add("no-parents");
        noparents.innerText = "没有可以结合的？";
        panel.appendChild(noparents);
    }

    for (let i in parents)
    {
        let parent = parents[i];

        let pair = document.createElement("div");
        pair.classList.add("suggest-pair");
        panel.appendChild(pair);

        {
            father = parent.parent.father;

            let div = document.createElement("div");
            div.classList.add("monster");
            div.id = "monster";
            div.monster = father;
        
            let name = document.createElement("span");
            name.classList.add("title");
            name.innerText = (father.name != null ? father.name : "") + '[' + father.kind_name + ']';
            div.appendChild(name);
        
            if (father.memo != null) {
                let memo = document.createElement("span");
                memo.classList.add("title");
                memo.innerText = "(" + father.memo + ")";
                div.appendChild(memo);
            }
        
            if (father.image_name != null) {
                let image = document.createElement("img");
                image.classList.add("image");
                image.src = "/resources/images/" + father.image_name;
                div.appendChild(image);
            }

            let sex = document.createElement("span");
            sex.innerText = "♂";
            div.appendChild(sex);

            pair.appendChild(div);
        }

        let plus = document.createElement("span");
        plus.classList.add("plus");
        plus.innerText = "+";
        pair.appendChild(plus);

        {
            mother = parent.parent.mother;
    
            let div = document.createElement("div");
            div.classList.add("monster");
            div.id = "monster";
            div.monster = mother;
        
            let name = document.createElement("span");
            name.classList.add("title");
            name.innerText = (mother.name != null ? mother.name : "") + '[' + mother.kind_name + ']';
            div.appendChild(name);
        
            if (mother.memo != null) {
                let memo = document.createElement("span");
                memo.classList.add("title");
                memo.innerText = "(" + mother.memo + ")";
                div.appendChild(memo);
            }
        
            if (mother.image_name != null) {
                let image = document.createElement("img");
                image.classList.add("image");
                image.src = "/resources/images/" + mother.image_name;
                div.appendChild(image);
            }

            let sex = document.createElement("span");
            sex.innerText = "♀";
            div.appendChild(sex);
            
            pair.appendChild(div);
        }

        let equal = document.createElement("span");
        equal.classList.add("equal");
        equal.innerText = "=";
        pair.appendChild(equal);

        {
            mother = parent.monster;
    
            let div = document.createElement("div");
            div.classList.add("monster");
            div.id = "monster";
            div.monster = mother;
        
            let name = document.createElement("span");
            name.classList.add("title");
            name.innerText = (mother.name != null ? mother.name : "") + '[' + mother.kind_name + ']';
            div.appendChild(name);
        
            if (mother.memo != null) {
                let memo = document.createElement("span");
                memo.classList.add("title");
                memo.innerText = "(" + mother.memo + ")";
                div.appendChild(memo);
            }
        
            if (mother.image_name != null) {
                let image = document.createElement("img");
                image.classList.add("image");
                image.src = "/resources/images/" + mother.image_name;
                div.appendChild(image);
            }

            let sex = document.createElement("span");
            if (parent.sex == 0) sex.innerText = "♀";
            else if (parent.sex == 1) sex.innerText = "♂";
            else sex.innerText = "♂♀";
            div.appendChild(sex);

            pair.appendChild(div);
        }
    }

    root.appendChild(panel);
}

function FindParentsBy(monster, father_name, father_kind, mother_name, mother_kind, sex=2) {
    let rets = [];
    if (monster.have) return rets;
    for (let i in monster.parents) {
        let parent = monster.parents[i];
        if (parent.father != null && father_name != null && parent.father.jp_name == father_name) return [new MonsterPair(parent, monster, sex)];
        if (parent.mother != null && mother_name != null && parent.mother.jp_name == mother_name) return [new MonsterPair(parent, monster, sex)];
        if (parent.father != null && father_kind != null && parent.father.jp_name == null && parent.father.kind_name == father_kind) {
            rets.push(new MonsterPair(parent, monster, sex));
        }
        if (parent.mother != null && mother_kind != null && parent.mother.jp_name == null && parent.mother.kind_name == mother_kind) {
            rets.push(new MonsterPair(parent, monster, sex));
        }
        if (parent.father.jp_name != null) {
            let fatherParents = FindParentsBy(parent.father, father_name, father_kind, mother_name, mother_kind, 1);
            if (fatherParents.length > 0) {
                if (father_name != null || mother_name != null) return [fatherParents[0]];
                rets = rets.concat(fatherParents);
            }
        }
        if (parent.mother.jp_name != null) {
            let motherParents = FindParentsBy(parent.mother, father_name, father_kind, mother_name, mother_kind, 0);
            if (motherParents.length > 0) {
                if (father_name != null || mother_name != null) return [motherParents[0]];
                rets = rets.concat(motherParents);
            }
        }
    }
    return rets;
}