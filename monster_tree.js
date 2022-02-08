function CreateMonsterElements(monster, root, haveMonsterNames) {
    monster.element = document.createElement("div");
    monster.element.classList.add("monster");
    monster.element.id = "monster";
    monster.element.monster = monster;
    if (monster.parents.length > 0) {
        monster.element.onclick = function () {
            if (monster.parents.length == 0) return;
            monster.hideParent = !monster.hideParent;
            if (monster.hideParent) monster.haveElement.classList.add("red-have");
            else monster.haveElement.classList.remove("red-have");
            UpdateMonsterPosition();
            SetMonsterParentVisibility(monster);
        }
    }
    if (monster.name == null && monster.kind_name != null) {
        monster.element.onclick = function (e) {
            ShowKindPanel(monster.kind_name, e.pageX, e.pageY);
            e.stopPropagation();
        }
    }
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

    if (haveMonsterNames.includes(monster.jp_name)) {
        monster.element.classList.add("have");
        monster.have = true;
        monster.hideParent = true;
        monster.haveElement = null;
        haveMonsterNames.splice(haveMonsterNames.indexOf(monster.jp_name), 1);
    } else {
        let have = document.createElement("span");
        have.classList.add("title");
        have.innerText = monster.parent_count;
        monster.element.appendChild(have);
        monster.haveElement = have;
    
        monster.have = false;
        monster.hideParent = !GetMonsterParentVisibility(monster);
        if (monster.hideParent && monster.parents.length > 0) monster.haveElement.classList.add("red-have");
        else monster.haveElement.classList.remove("red-have");
    }
    for (let i in monster.parents) {
        CreateMonsterElements(monster.parents[i].father, root, haveMonsterNames);
        CreateMonsterElements(monster.parents[i].mother, root, haveMonsterNames);

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
}

function MoveMonster(monster, point) {
    monster.element.style.visibility = null;
    monster.element.style.left = point.x + "px";
    monster.element.style.top = point.y + "px";
    monster.point = new Point(point.x, point.y);
    if (monster.hideParent || monster.parents.length == 0) {
        HideParentMonster(monster);
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

function HideParentMonster(monster) {
    for (let i in monster.parents) {
        monster.parents[i].lineElement.style.visibility = "hidden";
        monster.parents[i].addElement.style.visibility = "hidden";
        monster.parents[i].groupElement.style.visibility = "hidden";
        monster.parents[i].father.element.style.visibility = "hidden";
        monster.parents[i].mother.element.style.visibility = "hidden";
        HideParentMonster(monster.parents[i].father);
        HideParentMonster(monster.parents[i].mother);
    }
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
    let pairs = document.getElementById("have-pairs");
    let height = 0;
    for (let i=0; i<pairs.children.length; i++) {
        if (pairs.children[i].offsetHeight > height) height = pairs.children[i].offsetHeight;
    }
    height += document.getElementById("have-panel").offsetHeight + 300;

    let root = document.getElementById("target-monster");
    root.style.left = "20px";
    root.style.top = height + "px";

    let top = height + root.offsetHeight;
    console.log(root.offsetTop, top);
    let pos = new Point(0, top);
    let size = MoveMonster(TargetMonster, pos);
    pos.x += size.width / 2;
    MoveMonster(TargetMonster, pos);
    pos.x += size.width / 2 + 100;
}