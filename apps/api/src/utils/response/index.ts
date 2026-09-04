export function formatApiResponse<T>(data: T, message = "Success") {
  return {
    success: true,
    message,
    data,
  };
}
