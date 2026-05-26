import { useApi } from "../../../shared/utils/useApi";

export function useProductApi() {
  const api = useApi();
  const unwrap = (res) => ({ ...res, data: res.data?.data ?? res.data });
  const getProducts = async (params = {}) => {
    const res = await api.get("/products", { params });
    return unwrap(res);
  };

  const createProduct = async (data) => {
    const res = await api.post("/products", data);
    return unwrap(res);
  };

  const getProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return unwrap(res);
  };

  const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return unwrap(res);
  };

  const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return unwrap(res);
  };

  const setActiveProducts = async (productIds) => {
    const res = await api.post("/products/set-active", { productIds });
    return unwrap(res);
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
