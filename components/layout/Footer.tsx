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
                        <p>Surabaya, Indonesia</p>
                        <p>
                            <a href="mailto:sales@tri-j.co.id" className="transition-colors hover:text-[#774EFC]">
                                sales@tri-j.co.id
                            </a>
                        </p>
                        <a
                            href="https://wa.me/628113300223"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Chat WhatsApp di +62 811-3300-223"
                            className="group inline-flex items-center gap-2 transition-colors hover:text-[#25D366]"
                        >
                            <span className="relative h-6 w-6">
                                <Image
                                    src="/wa.svg"
                                    alt=""
                                    fill
                                    aria-hidden="true"
                                    className="transition-opacity group-hover:opacity-0"
                                />
                                <Image
                                    src="/wagreen.svg"
                                    alt=""
                                    fill
                                    aria-hidden="true"
                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </span>
                            0811 3300 223
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
