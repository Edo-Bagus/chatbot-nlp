# chatbot‑nlp

## Deskripsi
Chatbot berbasis Regex dengan integrasi WhatsApp menggunakan webjs.

---

## Struktur Direktori

```
chatbot-nlp/
├── core/                   # Logika inti chatbot: NLP, pipeline, intent handling
    |__ bot.js              # Logika chatbot
│   └── wa-client.js        # Client WhatsApp utama
├── data/                   # Dataset, scraping, dan preprocess data
├── logs/                   # Log aktivitas dan debugging
├── services/               # Service fungsi untuk mengambil data
├── tests/                  # Unit tests (Jest)
├── utils/                  # Helper untuk logging
├── package.json            # Metadata & dependency project
├── package-lock.json       # Lockfile npm
└── README.md               # File ini
```

---

## Setup & Jalankan

### Prasyarat
- Node.js (versi terbaru direkomendasikan)
- npm

### Instalasi

```bash
git clone https://github.com/Edo-Bagus/chatbot-nlp.git
cd chatbot-nlp
npm install
```

---

### Menjalankan Integrasi WhatsApp

Integrasi WhatsApp dijalankan lewat script `wa-client.js`.

```bash
npm run whatsapp
```

Saat dijalankan, akan tampil QR code di terminal.  
Scan QR tersebut menggunakan aplikasi WhatsApp di ponsel Anda untuk memulai sesi.

## Demo (Contoh Alur)

[![Tonton Video](https://img.youtube.com/vi/LlrnkzaA_rk/0.jpg)](https://www.youtube.com/watch?v=LlrnkzaA_rk)


## Testing

Untuk menjalankan test suite menggunakan **Jest**:

```bash
npm test
```

## Source Data
- Data prodi universitas: https://sidatagrun-public-1076756628210.asia-southeast2.run.app/ptn_sb.php
- Data ranking universitas: https://www.kaggle.com/datasets/khotijahs1/2020-indonesian-university-ranking