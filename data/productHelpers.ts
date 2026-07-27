import { allProducts } from "./Products";

export const productMap = Object.fromEntries(
    allProducts.map((product) => [product.id, product])
);

export const getProductsByIds = (ids: number[]) =>
    ids
        .map((id) => productMap[id])
        .filter(Boolean);