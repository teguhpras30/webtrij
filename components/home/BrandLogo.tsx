import Image from "next/image";

const brands = [
    "/images/brands/amazon.svg",
    "/images/brands/google.svg",
    "/images/brands/tokopedia.svg",
    "/images/brands/shopee.svg",
    "/images/brands/lazada.svg",
];

export default function BrandLogo() {
    return (
        <section
            className="
        w-full
        bg-white
        py-8
        px-5
        md:px-10
        lg:px-20
      "
        >
            <div
                className="
          max-w-7xl
          mx-auto
          flex
          flex-wrap
          justify-center
          items-center
          gap-6
          md:gap-10
          lg:gap-14
        "
            >
                {brands.map((brand, index) => (
                    <div
                        key={index}
                        className="
              opacity-70
              transition-all
              duration-300
              hover:opacity-100
              hover:scale-105
            "
                    >
                        <Image
                            src={brand}
                            alt={`Brand ${index + 1}`}
                            width={120}
                            height={40}
                            className="
                w-20
                sm:w-24
                md:w-28
                lg:w-[120px]
                h-auto
                object-contain
              "
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}