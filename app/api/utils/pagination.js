// utils/pagination.js
export const getPagination = (page = 1, limit = 10) => {
  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.min(Math.max(parseInt(limit), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  return { pageNumber, pageSize, skip };
};
