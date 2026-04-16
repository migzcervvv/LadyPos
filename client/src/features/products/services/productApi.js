import { useApi } from "../../../shared/utils/useApi";

export function useProductApi() {
  const api = useApi();
  const getProducts = async () => {
    const res = await api.get("/products");
    return res;
  };

  const createProduct = async (data) => {
    const res = await api.post("/products", data);
    return res;
  };

  const getProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res;
  };

  const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res;
  };

  const setActiveProducts = async (productIds) => {
    const res = await api.post("/products/set-active", { productIds });
    return res;
  };

  return {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    setActiveProducts,
  };
}
