# OHO Morocco 🇲🇦 — مرصد الأجهزة المفتوحة

<div align="center">

**[🔍 ابحث عن حالتك](https://boucettaabdelkhalek2.github.io/OHO-Morocco/)** · 
**[📋 أرسل حالة إصلاح](https://github.com/boucettaabdelkhalek2/OHO-Morocco/issues/new?template=repair-case.yml)** · 
**[📖 الشروحات](./Tutorials/)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cases](https://img.shields.io/badge/Repair%20Cases-6-orange.svg)](cases/)
[![Lang](https://img.shields.io/badge/Languages-AR%20·%20FR%20·%20EN-blue.svg)](#)

</div>

---

## 🇲🇦 العربية

**OHO Morocco** قاعدة بيانات مفتوحة لحالات إصلاح السكوترات الكهربائية — بنيت من المغرب للعالم.

### ماذا ستجد هنا؟

| المجلد | المحتوى |
|--------|---------|
| [`cases/`](./cases/) | حالات إصلاح حقيقية موثقة بالقياسات والصور |
| [`intelligence/`](./intelligence/) | قاعدة معرفة منظمة: أعراض ← تشخيص ← حل |
| [`blueprints/`](./blueprints/) | خطوات إصلاح موحدة قابلة لإعادة الاستخدام |
| [`Scooter-Repairs/`](./Scooter-Repairs/) | ملفات الإصلاح التفصيلية |
| [`Tutorials/`](./Tutorials/) | شروحات مفصلة للمبتدئين |

### كيف تستخدم المشروع؟

**إذا عندك عطل:**
1. افتح [صفحة البحث](https://boucettaabdelkhalek2.github.io/OHO-Morocco/)
2. اكتب الأعراض بالعربية أو الفرنسية أو الإنجليزية
3. اتبع خطوات التشخيص والحل

**إذا أصلحت جهازاً:**
1. [افتح issue جديد](https://github.com/boucettaabdelkhalek2/OHO-Morocco/issues/new?template=repair-case.yml)
2. أكمل النموذج — 5 دقائق فقط
3. سنضيف حالتك للقاعدة وسيستفيد منها الآخرون

### الأسعار بالدرهم المغربي 🇲🇦

جميع الأسعار في قاعدة البيانات بالدرهم المغربي بناءً على أسواق: درب عمر الدارالبيضاء، مراكش، الرباط.

---

## 🇫🇷 Français

**OHO Morocco** est une base de données open source de réparations de scooters électriques — construite au Maroc pour le monde.

### Structure du projet

| Dossier | Contenu |
|---------|---------|
| [`cases/`](./cases/) | Cas réels documentés avec mesures et photos |
| [`intelligence/`](./intelligence/) | Base de connaissance: symptômes ← diagnostic ← solution |
| [`blueprints/`](./blueprints/) | Procédures de réparation standardisées |

### Comment contribuer ?

1. [Ouvrir une issue](https://github.com/boucettaabdelkhalek2/OHO-Morocco/issues/new?template=repair-case.yml) avec le formulaire prévu
2. Remplir les champs: symptômes, mesures, solution, coût
3. Joindre des photos si possible

---

## 🇬🇧 English

**OHO Morocco** is an open-source database of real electric scooter repair cases — built in Morocco, useful worldwide.

### Why this project?

Most repair knowledge lives in scattered forum posts or expensive manuals. This project builds a **structured, searchable database** of real-world repairs with actual measurements, costs in local currency, and step-by-step diagnostics.

### Covered failures

- **BMS** — overcurrent, thermal shutdown, balancing failures
- **MOSFET** — burned gate, controller failures  
- **Battery** — dead cells, swollen packs, capacity loss
- **Wiring** — connector failures, short circuits

### Contributing a case

Fill in the [repair case template](cases/TEMPLATE-repair-case.json) and submit via [GitHub Issues](https://github.com/boucettaabdelkhalek2/OHO-Morocco/issues/new?template=repair-case.yml).

A case needs: symptoms, measurements, root cause, solution, cost (DH), time (minutes).

---

## 🏗️ Architecture

```
OHO-Morocco/
├── docs/                    ← GitHub Pages site (search interface)
│   └── index.html
├── intelligence/
│   ├── failures/            ← Known failure types (JSON)
│   ├── diagnostics/         ← Diagnostic flowcharts (JSON)
│   └── components/          ← Component knowledge (JSON)
├── cases/
│   ├── TEMPLATE-repair-case.json  ← Template for new cases
│   └── BMS-001/             ← One folder per case
│       ├── case.json
│       └── images/
├── blueprints/              ← Reusable repair procedures
├── Scooter-Repairs/         ← Detailed repair files
├── Tutorials/               ← Step-by-step guides
└── .github/
    └── ISSUE_TEMPLATE/
        └── repair-case.yml  ← Contribution form
```

---

## 📄 License

MIT — Use freely, contribute back.

## 📩 Contact

Available for freelance & consulting — open an issue or find contact in profile.

---

<div align="center">
بني في المغرب 🇲🇦 · Construit au Maroc · Built in Morocco<br>
<strong>اجعل الإصلاح متاحاً للجميع · Rendre la réparation accessible · Repair knowledge for everyone</strong>
</div>
