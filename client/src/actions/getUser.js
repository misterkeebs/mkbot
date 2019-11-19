export default async (getTokenSilently) => {
  const token = await getTokenSilently();
  const response = await fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};
