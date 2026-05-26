export function respond(res, status, message, data = null, pagination = null) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  res.status(status).json(body);
}

export function respondError(res, status, message) {
  res.status(status).json({ success: false, message, data: null });
}
