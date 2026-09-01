import { EbookData } from '../types';

export const SAMPLE_EBOOKS: EbookData[] = [
  {
    id: 'rahasia-ngonten-tanpa-wajah',
    title: 'RAHASIA NGONTEN TANPA WAJAH',
    tag: 'PANDUAN RESMI ZIYANCORP',
    subtitle: 'Panduan Lengkap & Praktis Membuat Karakter AI Realistis Menggunakan Wajah Asli, Video Bergerak Omni Flash, dan Otomasi Konten Google Labs Flow untuk Kaum Pemalu & Introvert.',
    difficulty: 'Pemula (No-Code)',
    platform: 'Google Labs + Omni',
    monetization: 'Shopee / Lynk.id',
    format: 'Responsive & Print PDF',
    edition: 'Edisi 2026 • Lynk.id Ready',
    author: 'ZiyanCorp',
    modules: [
      {
        id: 'modul-1',
        moduleNumber: 1,
        badge: 'Modul 1',
        title: 'Mindset & Fondasi Faceless Creator',
        description: 'Mengapa era tampil di depan kamera sudah tergantikan oleh Avatar AI.',
        introCard: {
          icon: '🎭',
          title: 'Malu Tampil di Depan Kamera Bukan Lagi Hambatan',
          subtitle: '90% orang gagal ngonten karena malu, tidak percaya diri, atau tidak punya studio bagus.',
          body: 'Di era AI tahun 2026, penonton media sosial tidak lagi peduli apakah seorang kreator itu manusia asli yang merekam dirinya sendiri atau Karakter AI Virtual (AI Influencer). Yang penonton pedulikan adalah:',
          checklist: [
            'Estetika Visual: Gambar dan videonya tajam, bersih, pencahayaan sinematik, dan memanjakan mata.',
            'Relevansi Konten: Informasi produk Shopee/TikTok yang ditawarkan jelas dan bermanfaat.',
            'Konsistensi Posting: Akun selalu aktif mengunggah 3–4 kali sehari tanpa pernah lelah atau mengeluh sakit.'
          ]
        },
        steps: [
          {
            number: 1,
            title: 'Pilih Niche Spesifik',
            text: 'Fokus pada 1 bidang yang tinggi daya belinya: Fashion Wanita, Outfit Pria, Gadget/Meja Kerja, atau Skincare.'
          },
          {
            number: 2,
            title: 'Rancang Persona AI',
            text: 'Tentukan nama, gaya berpakaian, rentang usia, dan ciri khas visual karakter AI Anda agar mudah dikenali penonton.'
          },
          {
            number: 3,
            title: 'Bangun Pabrik Konten',
            text: 'Gunakan Google Labs Flow & Gemini Omni Flash untuk memproduksi 30 konten dalam 1 hari!'
          }
        ]
      },
      {
        id: 'modul-2',
        moduleNumber: 2,
        badge: 'Modul 2',
        title: 'Menguasai Google Labs Flow & Ekosistem FX',
        description: 'Mekanisme kerja node visual Google Labs Flow untuk produksi foto & video kilat.',
        introCard: {
          icon: '🌐',
          title: 'Apa Itu Google Labs Flow (Flow Workspace)?',
          badge: 'labs.google/fx/tools/flow',
          body: 'Google Labs Flow adalah kanvas kerja visual berbasis blok (Node-based pipeline) buatan Google. Di sini Anda bisa menghubungkan berbagai mesin kecerdasan buatan Google secara visual tanpa perlu menulis koding rumit.'
        },
        table: {
          title: 'Perbandingan Node Mesin AI Google Labs Flow',
          headers: ['Nama Node / Fitur', 'Mesin di Balik Layar', 'Fungsi Praktis untuk Kreator'],
          rows: [
            {
              cols: ['Image Generator', 'Imagen 3', 'Menghasilkan foto karakter fotorealistis kualitas 4K dalam hitungan detik.'],
              badgeCols: [{ index: 1, text: 'Imagen 3', colorClass: 'badge-blue' }]
            },
            {
              cols: ['Video Generator', 'Veo 2 / Fast', 'Mengubah foto diam menjadi klip video gerak 1080p yang natural.'],
              badgeCols: [{ index: 1, text: 'Veo 2 / Fast', colorClass: 'badge-success' }]
            },
            {
              cols: ['Reference Anchor', 'Style & Face Lock', 'Mengunci wajah asli agar tidak berubah saat dipindahkan ke pakaian/latar baru.'],
              badgeCols: [{ index: 1, text: 'Style & Face Lock', colorClass: 'badge-warning' }]
            },
            {
              cols: ['Text / Caption Assistant', 'Gemini 2.5 Flash', 'Menyusun deskripsi prompt dan naskah copywriting produk secara otomatis.'],
              badgeCols: [{ index: 1, text: 'Gemini 2.5 Flash', colorClass: 'badge-purple' }]
            }
          ]
        },
        callouts: [
          {
            type: 'info',
            icon: '💡',
            title: 'Rahasia Alur Kerja (Flow) Tercepat:',
            body: 'Hubungkan [Foto Referensi Wajah] ➡️ [Node Image Generator + Prompt Baju Shopee] ➡️ [Node Video Generator Veo]. Anda akan mendapatkan 1 video promosi produk utuh hanya dengan 1 kali klik!'
          }
        ]
      },
      {
        id: 'modul-3',
        moduleNumber: 3,
        badge: 'Modul 3',
        title: 'Formula Prompting Realistis (Anti-Plastik)',
        description: 'Struktur kalimat wajib agar hasil AI terlihat 100% seperti foto kamera sungguhan.',
        introCard: {
          icon: '📸',
          title: 'Rumus 5 Elemen Prompting Fotografi Nyata',
          subtitle: 'Jangan cuma tulis "beautiful girl", gunakan formula ini:',
          body: 'Formula ini memaksa AI merender tekstur pori-pori mikro, pencahayaan alami, dan depth of field lensa optik asli.'
        },
        steps: [
          {
            number: '1',
            badge: 'Elemen 1',
            title: 'Subject & Ethnicity',
            text: 'Definisikan usia, postur, etnis (misal: Indonesian young woman/man), dan gaya rambut spesifik.'
          },
          {
            number: '2',
            badge: 'Elemen 2',
            title: 'Camera & Lens Realism',
            text: 'Sebutkan tipe kamera nyata: Sony A7IV, 85mm f/1.8 lens, shallow depth of field.'
          },
          {
            number: '3',
            badge: 'Elemen 3',
            title: 'Lighting Setup',
            text: 'Gunakan pencahayaan natural: Golden hour sunlight, soft natural window light, subtle rim light.'
          },
          {
            number: '4',
            badge: 'Elemen 4',
            title: 'Skin Texture Detail',
            text: 'Kunci anti-plastik: Realistic micro skin pores, natural skin texture, subtle freckles, no airbrushing.'
          }
        ],
        prompts: [
          {
            tag: 'Master Prompt: Persona Wanita Indonesia (OOTD Cafe)',
            content: 'A candid street portrait of a 22-year-old Indonesian woman sitting at a modern minimalist cafe outdoor terrace. She is wearing an oversized beige knit sweater and high-waisted linen trousers, holding an iced matcha latte. Natural relaxed expression, genuine soft smile, authentic skin texture with visible micro-pores and delicate facial hair, no airbrushing, no plastic sheen. Shot on Sony A7 IV with 85mm f/1.4 lens, natural morning sunlight filtering through trees creating soft dappled shadows, creamy bokeh background, 8k resolution, photorealistic, cinematic color grading.'
          },
          {
            tag: 'Master Prompt: Persona Pria Indonesia (Streetwear Casual)',
            content: 'Authentic cinematic photo of a 24-year-old Indonesian man wearing a heavyweight 330gsm black streetwear hoodie and relaxed cargo pants, standing in an urban loft setting near a large glass window. Confident warm smile, clean short textured fade haircut, natural skin imperfections and authentic texture, sharp focused eyes. Shot on Fujifilm GFX 100S, 50mm lens at f/2.0, soft directional side lighting, hyper-realistic, rich contrast, filmic look.'
          }
        ],
        callouts: [
          {
            type: 'warning',
            icon: '⚠️',
            title: 'Negative Prompt Wajib (Anti-Gagal):',
            body: 'Masukkan kata-kata ini ke kolom Negative Prompt: plastic skin, 3d render, cartoon, doll, drawing, anime, smooth skin, wax figure, extra fingers, deformed eyes, over-saturated, blurry.'
          }
        ]
      },
      {
        id: 'modul-4',
        moduleNumber: 4,
        badge: 'Modul 4',
        title: 'Konsistensi Karakter Menggunakan Wajah Asli',
        description: 'Teknik mengunci struktur wajah agar tetap identik di 100 foto berbeda.',
        introCard: {
          icon: '🔒',
          title: 'Metode Reference Anchoring (Kloning Wajah Asli)',
          subtitle: 'Cara mengubah foto selfie Anda menjadi avatar AI yang konsisten.',
          body: 'Dengan reference anchoring, Anda tidak perlu khawatir wajah karakter berubah-ubah antar postingan.'
        },
        steps: [
          {
            number: 1,
            title: 'Siapkan 3 Foto Wajah',
            text: 'Ambil 3 foto selfie pencahayaan terang: 1 lurus menghadap kamera, 1 sudut 45 derajat kiri, 1 sudut 45 derajat kanan dengan ekspresi netral.'
          },
          {
            number: 2,
            title: 'Upload ke Reference Node',
            text: 'Di Google Labs Flow / Omni Flash, masukkan foto ini ke dalam slot Reference Image atau IP-Adapter.'
          },
          {
            number: 3,
            title: 'Ganti Latar & Baju Bebas',
            text: 'Ketik prompt baju Shopee baru. AI akan mempertahankan struktur mata, hidung, dan rahang asli Anda, tetapi mengganti outfit & lokasinya!'
          }
        ]
      },
      {
        id: 'modul-5',
        moduleNumber: 5,
        badge: 'Modul 5',
        title: 'Membuat Video Bergerak dengan Gemini Omni Flash',
        description: 'Mengubah foto diam menjadi video gerak hidup, transisi estetik, dan editing instan.',
        introCard: {
          icon: '🎥',
          title: 'Kekuatan Gemini Omni Flash (gemini-omni-flash)',
          badge: 'Google GenAI Interactions API',
          body: 'Gemini Omni Flash adalah teknologi terbaru yang menggabungkan kemampuan pemahaman gambar dan pembuatan video generatif dalam satu tarikan napas.'
        },
        steps: [
          {
            number: '1',
            title: 'First-Frame to Video',
            text: 'Masukkan foto karakter AI hasil Modul 3, lalu beri instruksi: "The character slowly turns to camera, smiles warmly, and takes a sip of coffee". Video 5–10 detik langsung jadi!'
          },
          {
            number: '2',
            title: 'Video Interpolation',
            text: 'Berikan 2 foto (Foto A: Baju Biasa ➡️ Foto B: Baju Shopee Mewah). AI akan membuatkan video transisi pergantian pakaian yang sangat halus!'
          },
          {
            number: '3',
            title: 'Add Editing Elements',
            text: 'Ubah latar belakang video, tambahkan pencahayaan estetik, atau sesuaikan filter warna video tanpa merusak wajah karakter.'
          }
        ]
      },
      {
        id: 'modul-6',
        moduleNumber: 6,
        badge: 'Modul 6',
        title: 'Monetisasi Otomatis di Lynk.id',
        description: 'Cara menjual panduan, preset prompt, dan hasil karya AI ke rekening bank lokal.',
        introCard: {
          icon: '💳',
          title: 'Setup Toko Digital Lynk.id dalam 5 Menit',
          badge: 'QRIS & Auto-Delivery',
          body: 'Otomatisasi bisnis digital Anda dengan pembayaran instan QRIS dan pengiriman file otomatis 24 jam non-stop.'
        },
        steps: [
          {
            number: 1,
            title: 'Daftar di Lynk.id',
            text: 'Buka lynk.id dan daftar gratis. Pasang foto profil dan bio yang menarik.'
          },
          {
            number: 2,
            title: 'Upload File E-Book / PDF',
            text: 'Pilih menu Add Block ➡️ Digital Product. Unggah file PDF ini dan pasang harga (contoh: Rp 49.000).'
          },
          {
            number: 3,
            title: 'Pembeli Bayar via QRIS',
            text: 'Pembeli scan QRIS dari HP mereka ➡️ Lynk.id otomatis mengirimkan file PDF ➡️ Uang masuk ke saldo Anda!'
          }
        ]
      },
      {
        id: 'modul-7',
        moduleNumber: 7,
        badge: 'Modul 7',
        title: 'Katalog 25 Master Prompt Siap Pakai',
        description: 'Koleksi 25 formula prompt fotorealistis lengkap dengan pengaturan kamera, lensa, tekstur kulit mikro, dan pencahayaan sinematik.',
        introCard: {
          icon: '📚',
          title: 'Koleksi Terlengkap 5 Kategori Konten Viral',
          subtitle: 'Tinggal ketuk tombol "Salin Prompt" dan tempelkan ke Google Labs Flow / ImageFX / Midjourney.',
          body: 'Terdiri dari kategori Fashion & OOTD, Gadget & Tech, Beauty & Skincare, Kuliner & Cafe, serta Storytelling & Edukasi.'
        },
        prompts: [
          {
            tag: '1. Fashion OOTD Hijab Modern & Syar\'i (Pastel Gallery)',
            category: 'Fashion & OOTD',
            content: 'Full body portrait of a 23-year-old Indonesian Muslim woman wearing an elegant pastel sage green premium abaya with modern draped silk hijab. Standing inside a bright sunlit art gallery with marble floors and large architectural archways. Graceful poise, gentle confident smile, authentic smooth skin texture with realistic lighting, soft natural shadows. Shot on Leica SL2, 50mm lens at f/2.0, natural daylight, soft cinematic lighting, Vogue editorial style, 8k resolution.'
          },
          {
            tag: '2. Streetwear Casual Pria (Urban Loft Setting)',
            category: 'Fashion & OOTD',
            content: 'Authentic cinematic photo of a 24-year-old Indonesian man wearing a heavyweight 330gsm black streetwear oversized hoodie and relaxed cargo pants, standing in an urban loft setting near a large glass window. Confident warm smile, clean short textured fade haircut, natural skin imperfections and authentic texture, sharp focused eyes. Shot on Fujifilm GFX 100S, 50mm lens at f/2.0, soft directional side lighting, hyper-realistic, rich contrast, filmic look.'
          },
          {
            tag: '3. Old Money / Quiet Luxury (Summer Linen Aesthetic)',
            category: 'Fashion & OOTD',
            content: 'Medium shot of a 25-year-old Indonesian woman wearing an Italian cream linen tailored vest with matching trousers and delicate gold jewelry. Sitting at an outdoor European-style marble cafe table holding a vintage leather handbag. Soft golden hour sunlight casting warm glow, natural windswept hair, genuine relaxed laugh, realistic skin pores, subtle freckles. Shot on Hasselblad X2D 100C with 80mm f/1.9 lens, creamy bokeh, magazine editorial photography, 8k.'
          },
          {
            tag: '4. Casual Korean Minimalist (Boyfriend Look)',
            category: 'Fashion & OOTD',
            content: 'Candid street photo of a 22-year-old Indonesian young man wearing an oversized striped poplin shirt over a clean white t-shirt and wide-leg denim jeans, carrying a canvas tote bag. Walking down a clean sunlit pedestrian street lined with trees. Casual mid-stride pose, friendly approachable expression, natural daylight with dappled tree shadows, realistic skin texture. Shot on Sony A7 IV, 35mm f/1.8 lens, commercial lifestyle photography, 8k.'
          },
          {
            tag: '5. Batik Modern Kontemporer (Smart Casual Event)',
            category: 'Fashion & OOTD',
            content: 'Three-quarter portrait of an Indonesian professional woman wearing a modern slim-fit navy and terracotta silk batik blouse paired with tailored trousers. Standing in a sunlit modern atrium with lush indoor plants. Poised confident posture, warm pleasant smile, authentic skin tones and micro-pores. Shot on Canon EOS R5 with 85mm f/1.4 lens, soft diffused studio light, high-end corporate lifestyle, 8k.'
          },
          {
            tag: '6. Tech Reviewer Unboxing Wireless Headphone',
            category: 'Gadget & Tech',
            content: 'Close-up shot of a 25-year-old Indonesian tech reviewer holding a sleek matte-black wireless headphone in hands, showing build quality to the camera. Warm studio desk setup with neon accent lights in background, soft key light illuminating the product, ultra sharp details on fingertips and product texture. Shot on Canon EOS R5 with 50mm f/1.8 lens, natural skin tones, professional commercial photography, 8k resolution.'
          },
          {
            tag: '7. Minimalist Workspace & Mechanical Keyboard',
            category: 'Gadget & Tech',
            content: 'Over-the-shoulder POV shot of an Indonesian creator typing on a custom wooden mechanical keyboard at a clean walnut wood desk setup. Dual monitors with coding editor in background, ambient amber lightbar glowing over desk, warm cozy evening aesthetic. High detail on keycaps and hands with authentic skin texture. Shot on Sony FX3 with 35mm f/1.4 lens, cinematic moody lighting, 8k.'
          },
          {
            tag: '8. Smartwatch & Active Lifestyle Review',
            category: 'Gadget & Tech',
            content: 'Close-up wrist shot of a 26-year-old athletic Indonesian man wearing a titanium smartwatch with neon orange sports strap while holding a metal water bottle after a run. Outdoor running track background at sunrise, morning dew on skin, realistic arm hair and skin pores, sharp screen graphics on smartwatch. Shot on Nikon Z8, 50mm f/1.8, vibrant natural sunrise lighting, commercial sports ad quality.'
          },
          {
            tag: '9. Smartphone Camera Hands-on Test',
            category: 'Gadget & Tech',
            content: 'Medium close-up of a 23-year-old Indonesian content creator holding a premium titanium smartphone vertically as if vlogging, showing the camera lenses. Modern urban rooftop background during sunset, warm rim lighting highlighting the phone edges and hair, natural expressive smile, realistic skin detail. Shot on Leica Q3, 28mm f/1.7 lens, crisp sharp focus, 8k.'
          },
          {
            tag: '10. Wireless Earbuds Aesthetic Showcase',
            category: 'Gadget & Tech',
            content: 'Macro beauty shot of a young Indonesian woman wearing a minimalist ceramic white wireless earbud in her ear. Clean profile angle, tucked hair behind ear, natural skin glow with visible micro-texture, soft pastel studio backdrop, gentle softbox illumination. Shot on 100mm Macro lens f/2.8 on Canon R5, commercial product lifestyle, ultra clean 8k.'
          },
          {
            tag: '11. Skincare Serum Droplet Macro Glass Skin',
            category: 'Beauty & Skincare',
            content: 'Extreme close-up macro beauty portrait of an Indonesian woman applying a drop of clear facial serum onto her cheekbone with a glass dropper. Dewy glass skin, authentic visible pores, natural hydration glow, glossy lips, soft catchlight in dark brown eyes. Clean pastel backdrop, soft diffused beauty dish lighting, macro 100mm lens shot, hyper-detailed skin texture, non-greasy natural glow, commercial skincare advertisement quality.'
          },
          {
            tag: '12. Lip Tint Natural Everyday Swatch',
            category: 'Beauty & Skincare',
            content: 'Close-up shot of an Indonesian woman with plump dewy lips smiling gently, showing a subtle coral-red lip tint finish. Soft morning window light, authentic lip texture without artificial blurring, glowing healthy cheeks, natural dark brown eyes. Shot on Sony A7R V with 90mm Macro f/2.8 lens, high-end cosmetics editorial, hyper-realistic 8k.'
          },
          {
            tag: '13. Sunscreen Application Outdoor Sunlight',
            category: 'Beauty & Skincare',
            content: 'Candid sunny portrait of a 24-year-old Indonesian woman lightly dabbing a white sunscreen lotion onto her cheek while smiling outdoor at a tropical garden terrace. Bright natural sunlight creating sun flare, dewy non-whitecast skin finish, genuine relaxed expression, realistic sun-kissed skin texture. Shot on 50mm f/1.4 lens, vibrant authentic colors, 8k.'
          },
          {
            tag: '14. Morning Wellness & Matcha Drink',
            category: 'Beauty & Skincare',
            content: 'Intimate lifestyle photo of an Indonesian young woman in an oversized ribbed cream lounge set sitting cross-legged on a sofa, holding a warm ceramic bowl of bright green whisked matcha. Morning sunlight pouring in from sheer curtains, calm mindful expression, messy topknot hair, authentic morning skin texture. Shot on Kodak Portra 400 film style, 35mm f/2.0, cozy aesthetic, 8k.'
          },
          {
            tag: '15. Haircare Shiny Hair Studio Treatment',
            category: 'Beauty & Skincare',
            content: 'Back-three-quarter portrait of an Indonesian woman running her fingers through her silky, glossy, waist-length black hair. Soft studio backlight illuminating hair strands with brilliant shine, clean minimalist studio background, elegant posture. Shot on Hasselblad H6D-100c with 120mm lens, luxury haircare commercial look, 8k.'
          },
          {
            tag: '16. Artisan Bakery & Iced Latte Pour',
            category: 'Kuliner & Cafe',
            content: 'Candid lifestyle photo of an Indonesian young woman in an oversized white cotton shirt and denim shorts, leaning against a clean kitchen island pouring oat milk into an iced coffee glass. Warm morning sunlight pouring through a window, tiny dust particles in light rays, natural un-staged pose, messy bun hair, micro skin texture, shot on 35mm film camera, Kodak Portra 400 aesthetic, hyper-realistic, intimate lifestyle vibe.'
          },
          {
            tag: '17. Indonesian Culinary Street Food Reviewer',
            category: 'Kuliner & Cafe',
            content: 'Candid medium shot of a 25-year-old Indonesian food enthusiast sitting at a vibrant night culinary market, smiling while holding a ceramic bowl of steaming hot noodles with chopsticks. Colorful neon street lights in background, authentic steam rising from food, genuine mouthwatering expression, realistic skin lighting. Shot on Sony A7S III, 50mm f/1.4, rich atmospheric street lighting, 8k.'
          },
          {
            tag: '18. Home Cooking Aesthetic Meal Prep',
            category: 'Kuliner & Cafe',
            content: 'POV overhead medium shot of an Indonesian man in a dark grey linen apron chopping fresh herbs on a rustic wooden cutting board in a sunlit modern kitchen. Natural focused expression, hands showing authentic skin texture and movement, beautiful fresh vegetables on counter, morning side lighting. Shot on Canon R6, 35mm f/2.0, warm culinary lifestyle, 8k.'
          },
          {
            tag: '19. Co-Working Coffee Shop Laptop Routine',
            category: 'Kuliner & Cafe',
            content: 'Medium shot of an Indonesian female digital nomad working on a sleek aluminum laptop at a wooden cafe table with a glass of cold brew coffee beside her. Large glass windows overlooking a bustling city street, natural daylight, stylish casual blazer over graphic tee, friendly focused gaze. Shot on Nikon Z6 II, 50mm f/1.8, modern remote work lifestyle, 8k.'
          },
          {
            tag: '20. Sunset Rooftop Dining Golden Hour',
            category: 'Kuliner & Cafe',
            content: 'Portrait of a young Indonesian couple dressed in elegant smart-casual attire laughing together at a rooftop restaurant table during vibrant purple-orange sunset. City skyline glowing in background, warm candlelight on table, natural glowing skin tones, authentic happy emotion. Shot on Leica M11 with 50mm f/1.4 Summilux lens, cinematic movie still quality, 8k.'
          },
          {
            tag: '21. Podcast / Talkshow Studio Professional',
            category: 'Storytelling & Edukasi',
            content: 'Medium shot of a 26-year-old Indonesian male speaker in a black turtleneck sitting in front of a professional Shure SM7B podcast microphone on an arm boom. Dark moody studio acoustic backdrop with subtle blue and orange rim lighting, confident storytelling expression, sharp focused eyes. Shot on Sony FX6, 50mm f/1.4, YouTube podcast studio quality, 8k.'
          },
          {
            tag: '22. Cozy Book Reader in Warm Library Nook',
            category: 'Storytelling & Edukasi',
            content: 'Warm candid portrait of an Indonesian woman tucked in a deep velvet armchair reading an open hardcover book in a cozy corner library. Warm reading lamp illumination, wooden bookshelves filled with books in background, gentle contemplative smile, delicate facial details. Shot on Fujifilm X-T5, 35mm f/1.4, warm vintage literary atmosphere, 8k.'
          },
          {
            tag: '23. Solo Traveler Mountain Sunrise Panorama',
            category: 'Storytelling & Edukasi',
            content: 'Wide-angle dynamic photo of a 24-year-old Indonesian backpacker wearing a weatherproof mustard yellow jacket, standing on a mountain ridge looking at the golden sunrise over a sea of clouds. Morning mist, golden sun flare, awe-inspiring adventurous expression, hyper-detailed clothing textures and outdoor lighting. Shot on Sony A7 IV, 24mm f/2.8, National Geographic travel photography style, 8k.'
          },
          {
            tag: '24. Moody Night City Street Cinematic Walk',
            category: 'Storytelling & Edukasi',
            content: 'Cinematic night shot of an Indonesian man walking down a wet asphalt city street after rain, with colorful neon reflections on the ground. Wearing a dark trench coat, looking thoughtfully off-camera, dramatic contrast lighting from street lamps, sharp raindrops in air. Shot on ARRI Alexa Mini style, 50mm f/1.2, Blade Runner neo-noir aesthetic, 8k.'
          },
          {
            tag: '25. Studio Portrait Intense Eyes & Catchlight',
            category: 'Storytelling & Edukasi',
            content: 'Close-up dramatic studio portrait of a 23-year-old Indonesian model looking directly into camera with intense captivating brown eyes with bright catchlights. Clean black background, strong Rembrandt lighting with soft shadows defining facial cheekbones, visible micro skin texture without artificial smoothing. Shot on Hasselblad H6D-100c with 100mm lens, iconic magazine cover portrait, hyper-realistic, 8k.'
          }
        ],
        callouts: [
          {
            type: 'success',
            icon: '🎁',
            title: 'Selamat Berkarya & Bangun Aset Digital Anda!',
            body: 'Gunakan seluruh 25 formula dan prompt di dalam E-Book ini untuk membangun akun tanpa wajah Anda. Konsistensi mengunggah konten setiap hari adalah kunci utama kesuksesan affiliate dan penjualan produk digital!'
          }
        ]
      }
    ]
  },
  {
    id: 'claude-code-kimi-ebook',
    title: 'PANDUAN LENGKAP RUN CLAUDE CODE GRATIS',
    tag: 'TUTORIAL TECH VIRAL',
    subtitle: 'Cara Menjalankan Agent Terminal Claude Code dengan Biaya Termurah Menggunakan Kimi K2.6 API & Model Routing.',
    difficulty: 'Menengah (CLI & Terminal)',
    platform: 'Claude Code CLI + Moonshot Kimi',
    monetization: 'Produktivitas Coding',
    format: 'Responsive & Print PDF',
    edition: 'Edisi 2026',
    author: 'Ali Niaz Pervaiz',
    modules: [
      {
        id: 'cc-modul-1',
        moduleNumber: 1,
        badge: 'Modul 1',
        title: 'Arsitektur Claude Code + Kimi K2.6',
        description: 'Bagaimana Anthropic Compatible API memungkinkan Claude Code berjalan di atas provider lain.',
        introCard: {
          icon: '💻',
          title: 'Kekuatan Terminal Agent Mandiri',
          subtitle: 'Membangun aplikasi fullstack otomatis langsung dari CLI tanpa biaya mahal.',
          body: 'Claude Code CLI memiliki kemampuan membaca seluruh codebase, mengeksekusi bash command, dan memperbaiki bug secara otonom.',
          checklist: [
            'Hemat biaya hingga 90% dibanding Anthropic resmi.',
            'Kapasitas context window Kimi K2.6 yang sangat besar.',
            'Dukungan penuh multi-file editing dan testing otomatis.'
          ]
        },
        steps: [
          {
            number: 1,
            title: 'Install Node.js 18+',
            text: 'Pastikan lingkungan komputermu sudah memiliki Node.js v18 atau v20 LTS.'
          },
          {
            number: 2,
            title: 'Dapatkan Kimi API Key',
            text: 'Daftar di platform.moonshot.ai dan buat API Key baru dengan awalan sk-.'
          },
          {
            number: 3,
            title: 'Export Environment Variables',
            text: 'Arahkan ANTHROPIC_BASE_URL ke endpoint Moonshot dan set ANTHROPIC_MODEL ke kimi-k2.6.'
          }
        ]
      }
    ]
  }
];
