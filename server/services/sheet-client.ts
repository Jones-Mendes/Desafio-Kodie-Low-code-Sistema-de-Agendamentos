import axios from "axios";

interface PostJsonOptions {
  authToken?: string;
  timeoutMs?: number;
}

export const postJson = async (
  url: string,
  payload: unknown,
  options: PostJsonOptions = {},
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  await axios.post(url, payload, {
    headers,
    timeout: options.timeoutMs ?? 8000,
  });
};
