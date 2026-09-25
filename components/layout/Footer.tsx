import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Footer() {
    return (
        <footer
            className="
        py-12
        px-5
        md:px-10
        lg:px-20
      "
            style={{
                background:
                    "linear-gradient(93deg, #E3E5E6 33.03%, #F1EDDD 80.03%, #E3E5E6 100.03%)",
            }}
        >
            <div
                className="
          max-w-7xl
          mx-auto
          flex
          flex-col
          md:flex-row
          gap-10
          md:justify-between
        "
            >
                {/* Left */}
                <div className="max-w-sm">
                    <Image
                        src="/logotrij.svg"
                        alt="TRIJ Logo"
                        width={120}
                        height={40}
                        priority
                    />

                    <p className="mt-6 text-gray-600 leading-7">
                        Menyediakan peralatan rumah tangga yang dirancang oleh
                        desainer lokal, dengan kualitas konsisten dan pasokan
                        yang terjaga.
                    </p>
                </div>

                {/* Center */}
                <div className="flex flex-col sm:flex-row gap-10 md:gap-16">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">
                            Navigation
                        </h3>

                        <ul className="space-y-2 text-gray-700">
                            <li>
                                <Link href="/"
                                    className="transition-colors hover:text-[#774EFC]">Home</Link>
                            </li>
                            <li>
                                <Link href="/products"
                                    className="transition-colors hover:text-[#774EFC]">Products</Link>
                            </li>
                            <li>
                                <Link href="/about-us"
                                    className="transition-colors hover:text-[#774EFC]">About us</Link>
                            </li>
                            <li>
                                <Link href="/blog"
                                    className="transition-colors hover:text-[#774EFC]">Blog</Link>
                            </li>
                            <li>
                                <Link href="/contact-us"
                                    className="transition-colors hover:text-[#774EFC]">Contact us</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-semibold">
                            Products
                        </h3>

                        <ul className="space-y-2 text-gray-700">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/products?category=${encodeURIComponent(category)}`}
                                        className="transition-colors hover:text-[#774EFC]"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right */}
                <div className="max-w-xs">
                    <h3 className="mb-4 text-lg font-semibold">
                        Contact
                    </h3>

                    <div className="space-y-2 text-gray-700">
                        <p>
                            <a href="mailto:sales@tri-j.co.id" className="transition-colors hover:text-[#774EFC]">
                                sales@tri-j.co.id
                            </a>
                        </p>
                        <a
                            href="https://wa.me/628961656039"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Chat WhatsApp di 0896 1656 039"
                            className="group inline-flex items-center gap-2 transition-colors hover:text-[#25D366] block"
                        >
                            <span className="relative h-6 w-6 group-hover:scale-110">
                                <Image
                                    src="/wa.svg"
                                    alt="whatsapp"
                                    fill
                                    aria-hidden="true"
                                    className="transition-opacity group-hover:opacity-0"
                                />
                                <Image
                                    src="/wagreen.svg"
                                    alt="whatsappgreen"
                                    fill
                                    aria-hidden="true"
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </span>
                            <span>0896 1656 039</span>
                        </a>

                        {/* Official Instagram Link */}
                        <a
                            href="https://www.instagram.com/trij.official/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram Resmi TRI J @trij.official"
                            className="group flex items-center gap-2 pt-1 text-gray-800 hover:text-[#E4405F] transition-colors"
                        >
                            <span className="relative w-6 h-6 shrink-0 transition-transform group-hover:scale-110">
                                <Image
                                    src="/ig.png"
                                    alt="Instagram TRI J"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-contain"
                                />
                            </span>
                            <span>@trij.official</span>
                        </a>

                        {/* Official Facebook Link */}
                        <a
                            href="https://www.facebook.com/61592615336794"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook Resmi TRI J - Tri J"
                            className="group flex items-center gap-2 pt-1 text-gray-800 hover:text-[#1877F2] transition-colors"
                        >
                            <span className="relative w-6 h-6 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center">
                                <svg className="w-5 h-5 fill-black group-hover:fill-[#1877F2] transition-colors" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </span>
                            <span>Tri J</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar Copyright & Social Links */}
            <div className="mt-10 pt-6 border-t border-gray-300/60 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
                <p>© {new Date().getFullYear()} Toko Perabot TRI J. All rights reserved.</p>
            </div>
        </footer>
    );
}
