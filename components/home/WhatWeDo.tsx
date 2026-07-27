import Image from "next/image";

export default function WhatWeDo() {
    return (
        <section className="bg-[#F2F4F5] py-24">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-20 px-5">

                {/* Image */}
                <div className="relative h-[520px] w-[620px] overflow-hidden rounded-[36px]">

                    <Image
                        src="/images/about/warehouse.jpg"
                        alt="Warehouse"
                        fill
                        className="object-cover"
                        priority
                    />

                </div>

                {/* Content */}
                <div className="max-w-[520px]">

                    <h2 className="font-['MADE_Sunflower'] text-[56px] leading-tight text-[#1D1D1F]">
                        What We Do
                    </h2>

                    <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4A4A4A]">

                        <p>
                            Kami menyediakan berbagai produk home appliance
                            berbahan plastik yang dirancang untuk memenuhi
                            kebutuhan rumah tangga modern dengan kualitas,
                            kekuatan, dan desain yang fungsional.
                        </p>

                        <p>
                            Seluruh produk kami diproduksi menggunakan material
                            berkualitas tinggi dengan proses manufaktur yang
                            terkontrol sehingga menghasilkan produk yang tahan
                            lama, ringan, dan nyaman digunakan.
                        </p>

                        <p>
                            Selain melayani kebutuhan pasar retail, kami juga
                            menjadi partner bagi distributor, reseller, hingga
                            pelaku usaha yang membutuhkan pasokan produk secara
                            berkelanjutan.
                        </p>

                        <p>
                            Dengan pengalaman di bidang manufaktur dan distribusi,
                            kami berkomitmen memberikan pelayanan terbaik,
                            kualitas yang konsisten, serta pengiriman tepat waktu
                            untuk mendukung pertumbuhan bisnis mitra kami.
                        </p>

                    </div>

                </div>

            </div>
        </section>
    );
}