export default (getTokenSilently, path) => async _ => {
  const token = await getTokenSilently();
  const response = await fetch(`/api/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.json();
};
