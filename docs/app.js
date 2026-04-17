// ==========================
// 🔥 IMAGE GALLERY (STABLE)
// ==========================

const gallery = document.getElementById("gallery");

const images = [
  "../Assets/Images/200px-Tricycle_cargo_bike.png",
  "../Assets/Images/200px-Wl_tcb_1.0_Assembly1-tricycle_cargo_bike_B_001.jpg",
  "../Assets/Images/200px-Wl_tcb_2.0_Assembly2-0-tricycle_cargo_bike_B_001.jpg",
  "../Assets/Images/200px-Wl_tcb_3.0_-tricycle_cargo_bike_B_001.jpg"
];

images.forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.style.width = "220px";
  img.style.margin = "10px";
  img.style.borderRadius = "12px";
  gallery.appendChild(img);
});


// ==========================
// 📦 BOM CSV LOADER
// ==========================

fetch("data/bom.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n");
    const table = document.getElementById("bomTable");

    rows.forEach((row, i) => {
      const tr = document.createElement("tr");

      row.split(",").forEach(cell => {
        const el = document.createElement(i === 0 ? "th" : "td");
        el.innerText = cell;
        tr.appendChild(el);
      });

      table.appendChild(tr);
    });
  });


// ==========================
// 🧩 ASSEMBLY STEPS
// ==========================

const steps = [
  "Cut steel tubes",
  "Weld frame base",
  "Install front wheel mounts",
  "Attach steering system",
  "Final assembly"
];

const assembly = document.getElementById("assembly");

steps.forEach((step, i) => {
  const div = document.createElement("div");
  div.style.margin = "10px";
  div.innerHTML = `<strong>Step ${i + 1}:</strong> ${step}`;
  assembly.appendChild(div);
});
