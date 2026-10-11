
import apiClient from "./apiClient";

export async function getItems() {
  const response = await apiClient.get("/items");
  return response.data;
}

export async function getItemById(id) {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
}

export async function createItemWithImage(formData) {
  const response = await apiClient.post("/items/with-image", formData);
  return response.data;
}
export const getPublicItems = async () => {
  const response = await apiClient.get("/items/public");
  return response.data;
};