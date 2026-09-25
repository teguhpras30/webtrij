export interface ProductVariantData {
    id?: number;
    name: string;
    price: number;
    stock?: number;
    image?: string;
}

export interface ColorOption {
    name: string;
    hex: string;
}

export interface Product {
    id: number;
    category: string;
    name: string;
    description: string;
    sold: string;
    image: string;
    images: string[];
    retailPrice?: number;
    moq?: number;
    weightGram?: number;
    colors?: ColorOption[];
    variants?: ProductVariantData[];
}

export const defaultColors: ColorOption[] = [
    { name: "Cream Warm", hex: "#fef3c7" },
    { name: "Mint Green", hex: "#a7f3d0" },
    { name: "Pastel Blue", hex: "#bae6fd" },
    { name: "Lilac Purple", hex: "#e9d5ff" },
    { name: "Sakura Pink", hex: "#fbcfe8" }
];

export const allProducts: Product[] = [
    // Rak Baju & Lemari
    {
        id: 1,
        category: "Rak & Lemari",
        name: "Everhome Lemari Lipat Bow-Bow Series",
        description: "Lemari lipat susun premium berbahan PP tebal anti jamur dan anti rayap. Dilengkapi pintu magnetic lock dan roda 360 derajat.",
        sold: "0",
        retailPrice: 165000,
        moq: 1,
        weightGram: 3500,
        colors: [
            { name: "Mint Green", hex: "#a7f3d0" },
            { name: "Cream Warm", hex: "#fef3c7" },
            { name: "Pastel Blue", hex: "#bae6fd" },
            { name: "Lilac Purple", hex: "#e9d5ff" }
        ],
        variants: [
            { name: "2 Susun", price: 165000, stock: 50 },
            { name: "3 Susun", price: 225000, stock: 45 },
            { name: "4 Susun", price: 285000, stock: 60 },
            { name: "5 Susun", price: 345000, stock: 30 }
        ],
        image: "/images/products/bowbow4/Artboard1.jpg",
        images: [
            "/images/products/bowbow4/Artboard2.jpg",
            "/images/products/bowbow4/Artboard3.jpg",
            "/images/products/bowbow4/Artboard4.jpg",
            "/images/products/bowbow4/Artboard5.jpg",
        ],
    },
    {
        id: 2,
        category: "Rak & Lemari",
        name: "Everhome Rak Baju Magnolia Series",
        description: "Rak baju estetik minimalis dengan rangka ekstra kokoh. Mampu menahan beban hingga 40 kg per susun.",
        sold: "0",
        retailPrice: 175000,
        moq: 1,
        weightGram: 2800,
        colors: [
            { name: "Nordic White", hex: "#ffffff" },
            { name: "Charcoal Gray", hex: "#475569" },
            { name: "Warm Cream", hex: "#fef3c7" }
        ],
        variants: [
            { name: "3 Susun Standard", price: 175000, stock: 40 },
            { name: "4 Susun Standard", price: 225000, stock: 55 },
            { name: "4 Susun + Safety Mirror", price: 295000, stock: 25 }
        ],
        image: "/images/products/RakBajuMagnolia/Artboard1.jpg",
        images: [
            "/images/products/RakBajuMagnolia/Artboard2.jpg",
            "/images/products/RakBajuMagnolia/Artboard3.jpg",
        ],
    },
    {
        id: 5,
        category: "Rak & Lemari",
        name: "Everhome Lemari Lipat Character Motif",
        description: "Lemari pakaian anak lipat susun dengan karakter lucu. Praktis dipasang dalam 3 menit tanpa alat pertukangan.",
        sold: "0",
        retailPrice: 195000,
        moq: 1,
        weightGram: 3100,
        colors: [
            { name: "Jerapah Yellow", hex: "#fef08a" },
            { name: "Mirella Pink", hex: "#fbcfe8" },
            { name: "Diamond White", hex: "#f8fafc" }
        ],
        variants: [
            { name: "3 Susun Character", price: 195000, stock: 35 },
            { name: "4 Susun Character", price: 245000, stock: 40 },
            { name: "4 Susun Diamond", price: 275000, stock: 30 }
        ],
        image: "/images/products/LemariLipatJerapah/Artboard1.jpg",
        images: [
            "/images/products/LemariLipatJerapah/Artboard2.jpg",
        ],
    },

    // Perlengkapan Dapur
    {
        id: 14,
        category: "Perlengkapan Dapur",
        name: "Everhome Food Cabinet London Series",
        description: "Lemari makanan penutup tudung saji transparan susun. Menjaga kehangatan makanan dan higienitas dari lalat & debu.",
        sold: "0",
        retailPrice: 145000,
        moq: 1,
        weightGram: 2400,
        colors: [
            { name: "Transparent Emerald", hex: "#6ee7b7" },
            { name: "Transparent Diamond", hex: "#e0f2fe" },
            { name: "Deluxe Gold Trim", hex: "#fde047" }
        ],
        variants: [
            { name: "3 Tier Cabinet", price: 145000, stock: 65 },
            { name: "4 Tier Cabinet", price: 185000, stock: 70 },
            { name: "5 Tier Cabinet", price: 225000, stock: 40 }
        ],
        image: "/images/products/FoodCabinet/Artboard1.jpg",
        images: [
            "/images/products/FoodCabinet/Artboard2.jpg",
        ],
    },
    {
        id: 15,
        category: "Perlengkapan Dapur",
        name: "Everhome Rak Piring Dapur Minimalis",
        description: "Rak pengering piring & mangkok dilengkapi penampung tetesan air. Menjaga meja dapur tetap kering dan bersih.",
        sold: "0",
        retailPrice: 125000,
        moq: 1,
        weightGram: 1800,
        colors: [
            { name: "Cream White", hex: "#fffbeb" },
            { name: "Mint Sage", hex: "#d1fae5" }
        ],
        variants: [
            { name: "Single Deck (Tanpa Tutup)", price: 125000, stock: 50 },
            { name: "Double Deck + Cover Transparan", price: 175000, stock: 45 }
        ],
        image: "/images/products/RakPiring/RakPiring1.jpg",
        images: [
            "/images/products/RakPiring/RakPiring2.jpg",
        ],
    },
    {
        id: 17,
        category: "Perlengkapan Dapur",
        name: "Everhome Tudung Saji Slide Glass",
        description: "Tudung saji susun dengan pintu slide transparan. Hemat tempat dan mudah dibersihkan.",
        sold: "0",
        retailPrice: 115000,
        moq: 1,
        weightGram: 1700,
        colors: [
            { name: "Peri Pink", hex: "#fbcfe8" },
            { name: "Koi Blue", hex: "#bae6fd" }
        ],
        variants: [
            { name: "Peri Series - 3 Susun", price: 115000, stock: 55 },
            { name: "Koi Series - 4 Susun", price: 145000, stock: 60 }
        ],
        image: "/images/products/TudungSajiPeri/Artboard1.jpg",
        images: [
            "/images/products/TudungSajiPeri/Artboard2.jpg",
        ],
    },

    // Dispenser Beras & Air
    {
        id: 23,
        category: "Dispenser Beras & Air",
        name: "Everhome Smart Rice Dispenser 3D",
        description: "Dispenser beras otomatis dengan tombol takar presisi dan wadah pencuci beras terpadu.",
        sold: "0",
        retailPrice: 165000,
        moq: 1,
        weightGram: 2500,
        colors: [
            { name: "Nordic Blue", hex: "#38bdf8" },
            { name: "Creamy White", hex: "#fef3c7" },
            { name: "Orchid Purple", hex: "#c084fc" }
        ],
        variants: [
            { name: "Kapasitas 10KG", price: 165000, stock: 80 },
            { name: "Kapasitas 12KG", price: 195000, stock: 95 },
            { name: "Le'Orchid Deluxe 10KG", price: 175000, stock: 40 }
        ],
        image: "/images/products/DispenserBeras/Artboard1.jpg",
        images: [
            "/images/products/DispenserBeras/Artboard2.jpg",
        ],
    },

    // Rice Bucket & Thermos
    {
        id: 28,
        category: "Rice Bucket",
        name: "Everhome Termos Nasi & Es Batu Heavy Duty",
        description: "Termos nasi & es dengan insulasi foam khusus. Menjaga kehangatan nasi hingga 14 jam.",
        sold: "0",
        retailPrice: 135000,
        moq: 1,
        weightGram: 2300,
        colors: [
            { name: "Ocean Blue", hex: "#0284c7" },
            { name: "Fresh Green", hex: "#16a34a" },
            { name: "Cherry Pink", hex: "#ec4899" }
        ],
        variants: [
            { name: "Kapasitas 14 Liters", price: 135000, stock: 50 },
            { name: "Kapasitas 17 Liters", price: 165000, stock: 60 },
            { name: "Mini Diamond 10 Liters", price: 115000, stock: 35 }
        ],
        image: "/images/products/TermosNasi/Artboard0.jpg",
        images: [
            "/images/products/TermosNasi/Artboard1.jpg",
        ],
    },

    // Lunch Box
    {
        id: 29,
        category: "Lunch Box",
        name: "Everhome Bento Lunch Box Series",
        description: "Kotak makan bento sekat dilengkapi sendok garpu & wadah sup anti bocor Leak Proof.",
        sold: "0",
        retailPrice: 55000,
        moq: 1,
        weightGram: 450,
        colors: [
            { name: "Mint Green", hex: "#a7f3d0" },
            { name: "Pastel Pink", hex: "#fbcfe8" },
            { name: "Sky Blue", hex: "#bae6fd" }
        ],
        variants: [
            { name: "Garuda Edition 2 Sekat", price: 55000, stock: 120 },
            { name: "Kids Bento 3 Sekat + Soup Cup", price: 68000, stock: 110 },
            { name: "Nusantara Set + Tas Beber", price: 85000, stock: 75 }
        ],
        image: "/images/products/LuchboxBento/Artboard2.jpg",
        images: [
            "/images/products/LuchboxBento/Artboard1.jpg",
        ],
    }
];