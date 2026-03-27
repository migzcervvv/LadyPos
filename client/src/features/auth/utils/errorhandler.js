// src/features/auth/utils/errorHandler.js
export const parseError = (error) => {
  // Axios error
  if (error.response && error.response.data) {
    // Backend sends { message: "..." }
    return error.response.data.message || "Something went wrong";
  }

  // Network error
  if (error.request) {
    return "Network error. Please check your connection.";
  }

  // Other JS errors
  return error.error || "An unexpected error occurred";
};
