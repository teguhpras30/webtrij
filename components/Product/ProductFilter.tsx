"use client";

interface ProductFilterProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
}

const filters = ["Populer", "Terbaru", "Terlaris"];

export default function ProductFilter({
    activeFilter,
    setActiveFilter,
}: ProductFilterProps) {
    return (
        <div className="flex flex-col gap-4 rounded-lg bg-[#F4F4F4] p-4
lg:flex-row
lg:items-center
lg:justify-between
">

            {/* Left */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-[#555]">
                    Urutkan
                </span>

                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`rounded-[10px] px-5 py-2 text-sm font-medium transition ${activeFilter === filter
                            ? "bg-[#774EFC] text-white"
                            : "bg-white text-[#333] hover:bg-gray-100"
                            }`}
                    >
                        {filter}
                    </button>
                ))}

                <select
                    className="rounded-[10px] border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
                >
                    <option>Harga</option>
                    <option>Termurah</option>
                    <option>Termahal</option>
                </select>
            </div>

            {/* Right */}
            {/* <div className="flex items-center gap-5">
                <span className="text-sm text-[#FF5A2C]">
                    1/1
                </span>

                <div className="flex overflow-hidden rounded-md border">
                    <button className="flex h-10 w-10 items-center justify-center hover:bg-gray-100">
                        ←
                    </button>

                    <button className="flex h-10 w-10 items-center justify-center hover:bg-gray-100">
                        →
                    </button>
                </div>
            </div>*/}

        </div>
    );
}