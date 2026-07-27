// ProductGrid.tsx
import ProductCard from "@/components/home/ProductCard";
import { Product } from "@/data/Products";

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({
    products,
}: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
}