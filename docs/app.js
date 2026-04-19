// 🔥 BASE PATH (IMPORTANT)
const BASE = "/OHO-Morocco/Assets/Images/";

// 📷 Gallery
const gallery = document.getElementById("gallery");

const images = [
  "Render/200px-Tricycle_cargo_bike.png",
  "Assembly/200px-Wl_tcb_1.0_Assembly1-tricycle_cargo_bike_B_001.jpg",
  "Parts/200px-Wl_tcb_B1_parts-tricycle_cargo_bike_B_001.jpg"
];

images.forEach(img => {
  const el = document.createElement("img");
  el.src = BASE + img;
  el.style.width = "220px";
  el.style.margin = "10px";
  gallery.appendChild(el);
});


// 📦 BOM
fetch("data/bom.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n");
    const table = document.getElementById("bomTable");

    rows.forEach((row, i) => {
      const tr = document.createElement("tr");

      row.split(",").forEach(cell => {
        const el = document.createElement(i === 0 ? "th" : "td");
        el.textContent = cell;
        tr.appendChild(el);
      });

      table.appendChild(tr);
    });
  });


// 🧩 Assembly
const steps = [
  "Cut steel tubes",
  "Weld base frame",
  "Install front wheels",
  "Setup steering",
  "Final assembly"
];

const assembly = document.getElementById("assembly");

steps.forEach((s, i) => {
  const div = document.createElement("div");
  div.innerHTML = `Step ${i + 1}: ${s}`;
  assembly.appendChild(div);
});
