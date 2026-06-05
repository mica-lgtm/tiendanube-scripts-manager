import axios from 'axios';

export const tiendanubeAPI = axios.create({
  baseURL: process.env.TIENDANUBE_API_URL || 'https://api.tiendanube.com/v1',
  headers: {
    'User-Agent': process.env.TIENDANUBE_USER_AGENT || 'ScriptsManager (mica@zasdigital.com)',
    'Content-Type': 'application/json',
  },
});

export async function deployScriptToTiendanube(
  tiendanubeStoreId: number,
  scriptId: string,
  apiToken: string
) {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error('APP_URL no configurada (NEXTAUTH_URL o NEXT_PUBLIC_APP_URL)');

  const src = `${appUrl}/api/scripts/${scriptId}/serve`;

  const response = await tiendanubeAPI.post(
    `/${tiendanubeStoreId}/scripts`,
    { src, event: 'onload', where: 'store' },
    {
      headers: {
        'Authentication': `bearer ${apiToken}`,
      },
    }
  );
  return response.data;
}
