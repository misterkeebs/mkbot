export default async (getTokenSilently, user) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  return response.json();
};
