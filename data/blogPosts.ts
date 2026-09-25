export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  isHighlight?: boolean;
}

export const DEFAULT_BLOG_COVER = "/Images/home/Showcase Image.jpg";

export function getBlogCoverImage(post?: Partial<BlogPost> | null): string {
  if (post?.coverImage && typeof post.coverImage === "string" && post.coverImage.trim() !== "") {
    return post.coverImage;
  }
  if (post?.category) {
    if (post.category === "Tips Perabotan") return "/Images/home/hero/bowbow4susundeDesktop.jpg";
    if (post.category === "Peluang Usaha") return "/Images/aboutus/gudang.png";
    if (post.category === "Review Produk") return "/Images/products/DispenserBeras/Artboard1.jpg";
    if (post.category === "Kemitraan") return "/Images/aboutus/pabrik.png";
  }
  return DEFAULT_BLOG_COVER;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "7-tips-memilih-lemari-plastik-awet",
    title: "7 Tips Memilih Lemari Plastik yang Awet dan Tahan Lama untuk Rumah Anda",
    excerpt: "Panduan lengkap memilih lemari plastik berkualitas tinggi agar tidak mudah pecah, anti rayap, dan kokoh untuk penyimpanan pakaian keluarga.",
    coverImage: "/Images/home/hero/bowbow4susundeDesktop.jpg",
    date: "03 Agustus 2026",
    readTime: "5 min baca",
    author: "Tim Spesialis TRI J",
    category: "Tips Perabotan",
    tags: ["Lemari Plastik", "Tips Rumah", "Peralatan Rumah Tangga", "TRI J"],
    isHighlight: true,
    content: `
      <h2>Mengapa Lemari Plastik Menjadi Pilihan Favorit Keluarga Modern?</h2>
      <p>Lemari berbahan dasar plastik semakin digemari oleh masyarakat Indonesia karena berbagai keunggulannya dibanding lemari kayu konvensional. Selain bobotnya yang ringan dan mudah dipindahkan, lemari plastik juga 100% bebas dari ancaman rayap serta tahan terhadap kelembapan udara tropis.</p>
      
      <p>Namun, tidak semua lemari plastik dijual dengan standar kualitas yang sama. Agar tidak salah pilih, berikut 7 hal penting yang wajib Anda perhatikan sebelum membeli lemari plastik:</p>

      <h3>1. Perhatikan Kualitas Bahan Baku Plastik (Polypropylene / PP)</h3>
      <p>Pastikan lemari terbuat dari biji plastik murni tipe Polypropylene (PP) berkualitas prima. Plastik murni lebih elastis, tidak gampang retak saat beban berat, dan tidak menimbulkan bau kimia menyengat.</p>

      <h3>2. Cek Ketebalan dan Struktur Frame Dinding</h3>
      <p>Lemari berkualitas dari produsen terpercaya seperti <strong>TRI J</strong> dirancang dengan dinding berstruktur tebal serta tulang penyangga presisi di setiap susunnya agar tidak melengkung saat diisi pakaian penuh.</p>

      <h3>3. Fitur Bongkar Pasang (Knock-down System) yang Presisi</h3>
      <p>Pilihlah lemari yang menerapkan sistem rakit lipat/bongkar-pasang praktis. Desain rakitan yang presisi membuat lemari kokoh setelah dipasang tanpa perlu baut berlebih.</p>

      <h3>4. Pastikan Anti Air dan Bebas Jamur</h3>
      <p>Salah satu keunggulan utama produk perabotan plastik adalah ketahanannya terhadap cipratan air. Lemari plastik sangat cocok diletakkan di area kamar ber-AC atau daerah bersuhu lembap tanpa risiko lapuk.</p>

      <h3>5. Desain & Kunci Pengaman</h3>
      <p>Pilihlah model yang menyertakan kunci pengaman pada laci atau pintu utama untuk menyimpan barang berharga atau pakaian kesayangan keluarga secara aman.</p>

      <h3>6. Pilih Ukuran Susun yang Sesuai Ruangan</h3>
      <p>TRI J menyediakan pilihan varian susun mulai dari 2 susun, 4 susun, hingga tipe dengan cermin bawaan (seperti Lemari Magnolia Cermin) yang pas untuk estetika kamar tidur.</p>

      <h3>7. Beli Langsung dari Produsen & Supplier Terpercaya</h3>
      <p>Membeli lemari dari produsen tangan pertama memberi jaminan kualitas konsisten dan harga grosir bersahabat. Produk lemari TRI J diproduksi dengan standar kontrol kualitas tinggi untuk penggunaan jangka panjang.</p>
    `,
  },
  {
    id: "2",
    slug: "peluang-usaha-perabotan-rumah-tangga",
    title: "Peluang Usaha Perabotan Rumah Tangga Plastik di Indonesia: Masih Menjanjikan di Tahun 2026?",
    excerpt: "Memulai bisnis dengan produk perabotan rumah tangga plastik memiliki permintaan stabil. Simak analisis peluang, tren konsumen, dan tips suksesnya di tahun 2026.",
    coverImage: "/Images/aboutus/gudang.png",
    date: "02 Agustus 2026",
    readTime: "6 min baca",
    author: "Tim Riset Bisnis TRI J",
    category: "Peluang Usaha",
    tags: ["Bisnis Perabot", "Grosir Perabotan", "Reseller TRI J", "Peluang Usaha", "Perabotan Plastik"],
    isHighlight: false,
    content: `
      <p>Memulai bisnis dengan produk yang memiliki permintaan stabil merupakan langkah yang lebih aman dibanding mengikuti tren sesaat. Salah satu sektor yang terus bertahan bahkan berkembang adalah <strong>perabotan rumah tangga plastik</strong>.</p>
      <p>Mulai dari ember, baskom, tempat penyimpanan, rak serbaguna, hingga perlengkapan dapur, hampir setiap rumah di Indonesia menggunakannya setiap hari.</p>
    `,
  },
  {
    id: "3",
    slug: "keunggulan-dispenser-beras-3d",
    title: "Keunggulan Dispenser Beras 3D Dibanding Tempat Beras Plastik Biasa",
    excerpt: "Inovasi tempat penyimpanan beras modern yang praktis, anti kutu, higienis, dan dilengkapi takaran otomatis untuk dapur harian.",
    coverImage: "/Images/products/DispenserBeras/Artboard1.jpg",
    date: "01 Agustus 2026",
    readTime: "4 min baca",
    author: "Tim Inovasi Produk",
    category: "Review Produk",
    tags: ["Dispenser Beras", "Peralatan Dapur", "Dapur Modern", "TRI J"],
    isHighlight: false,
    content: `
      <h2>Menjaga Kualitas Nasi Dimulai dari Cara Menyimpan Beras</h2>
      <p>Beras yang disimpan di dalam karung terbuka atau wadah plastik biasa rawan terkena kutu beras, kelembapan berlebih, dan debu.</p>
    `,
  },
  {
    id: "4",
    slug: "cara-menjadi-agen-reseller-perabot-tangan-pertama",
    title: "Cara Menjadi Agen & Reseller Perabot Rumah Tangga Tangan Pertama",
    excerpt: "Panduan cara bergabung menjadi mitra distributor resmi produk perabotan rumah tangga TRI J dengan jaminan retur barang dan pengiriman cepat.",
    coverImage: "/Images/aboutus/pabrik.png",
    date: "30 Juli 2026",
    readTime: "5 min baca",
    author: "Tim Kemitraan B2B",
    category: "Kemitraan",
    tags: ["Kemitraan B2B", "Supplier Tangan Pertama", "Distributor TRI J"],
    isHighlight: false,
    content: `
      <h2>Bergabung Bersama Jaringan Distribusi Peralatan Rumah Tangga TRI J</h2>
      <p>PT TRI J merupakan produsen dan supplier peralatan rumah tangga plastik yang berpengalaman melayani toko retail, grosir, dan agen distributor.</p>
    `,
  },
];
