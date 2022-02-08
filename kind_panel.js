function CreateKindPanel() {
    let root = document.getElementById("monster-kinds");

    for (let i in MonsterKinds) {
        let panel = document.createElement("div");
        panel.id = MonsterKinds[i].name;
        panel.classList.add("kind-panel");
        root.appendChild(panel);

        let top = 0;
        for (let j in MonsterKinds[i].monsters) {
            let m = new Monster();
            m.name = MonsterKinds[i].monsters[j].name;
            m.jp_name = MonsterKinds[i].monsters[j].jp_name;
            m.kind_name = MonsterKinds[i].monsters[j].kind_name;
            m.image_name = MonsterKinds[i].monsters[j].image_name;
            m.memo = MonsterKinds[i].monsters[j].memo;
            CreateMonsterElements(m, panel, []);
            m.element.style.left = ((j % 6) * 201) + "px";
            if (j > 0 && j % 6 == 0) top += 201;
            m.element.style.top = top + "px";
        }
        panel.style.width = ((6 * 201) + 1) + "px";
        panel.style.height = (Math.ceil(MonsterKinds[i].monsters.length / 6.0) * 201 + 1) + "px";
        panel.style.visibility = "hidden";
        panel.onclick = function (e) {e.stopPropagation();}
    }
}

function ShowKindPanel(kind_name, x, y, onclick) {
    for (let i in MonsterKinds) {
        let panel = document.getElementById(MonsterKinds[i].name);
        if (panel == null) continue;
        if (kind_name == MonsterKinds[i].name) {
            panel.style.visibility = null;
            panel.style.left = x + "px";
            panel.style.top = y + "px";
            for (let j in panel.children)
            {
                panel.children[j].onclick = onclick;
            }
        } else panel.style.visibility = "hidden";
    }
}
