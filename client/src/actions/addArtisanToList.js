export default async (token, listType, artisan_id) => {
  const response = await fetch(`/api/lists/${listType}/${artisan_id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
