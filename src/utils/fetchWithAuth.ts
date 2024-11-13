export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem("auth-token");

  if (!token) {
    const tokenData = localStorage.getItem(
      "sb-meyuyiynhsbnidepvcdr-auth-token"
    );

    if (!tokenData) {
      throw new Error("No auth token found");
    }
    try {
      const parsedData = JSON.parse(tokenData);
      token = parsedData.access_token;
    } catch (error) {
      throw new Error("Error parsing auth token data");
    }

    if (!token) {
      throw new Error("No access_token found in the auth token data");
    }
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });
  return response;
};
