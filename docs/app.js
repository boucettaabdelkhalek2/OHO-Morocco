// 🔥 AUTO IMAGE LOADER FROM Assets/Images

const images = [
  "../Assets/Images/200px-Tricycle_cargo_bike.png",
  "../Assets/Images/200px-Wl_tcb_1.0_Assembly1-tricycle_cargo_bike_B_001.jpg",
  "../Assets/Images/200px-Wl_tcb_2.0_Assembly2-0-tricycle_cargo_bike_B_001.jpg",
  "../Assets/Images/200px-Wl_tcb_3.0_-tricycle_cargo_bike_B_001.jpg"
];

const gallery = document.getElementById("gallery");

images.forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.style.width = "200px";
  img.style.margin = "5px";
  gallery.appendChild(img);
});


// 📦 BOM CSV LOADER
fetch("data/bom.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n");
    const table = document.getElementById("bomTable");

    rows.forEach(r => {
      const tr = document.createElement("tr");
      r.split(",").forEach(c => {
        const td = document.createElement("td");
        td.innerText = c;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  });


// 🧩 Assembly Steps (static structure)
const steps = [
  "Cut steel tubes",
  "Weld frame base",
  "Install front wheel mounts",
  "Attach steering system",
  "Final assembly"
];

const assembly = document.getElementById("assembly");

steps.forEach((s, i) => {
  const div = document.createElement("div");
  div.innerHTML = `Step ${i+1}: ${s}`;
  assembly.appendChild(div);const base = "../Assets/Images/";

const folders = ["Render", "Assembly", "Parts"];

const gallery = document.getElementById("gallery");

folders.forEach(folder => {
  fetch(base + folder)
    .then(() => {
// GitHub Pages لا يسمح list dir → workaround:
      const images = [
        "200px-Tricycle_cargo_bike.png"
      ];

      images.forEach(img => {
        const el = document.createElement("img");
        el.src = base + folder + "/" + img;
        gallery.appendChild(el);
      });
    });
});
});

