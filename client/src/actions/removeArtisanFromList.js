export default async (token, listType, artisan_id) => {
  const response = await fetch(`/api/lists/${listType}/${artisan_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
