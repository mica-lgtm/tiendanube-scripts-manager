import axios from 'axios';

export const tiendanubeAPI = axios.create({
  baseURL: process.env.TIENDANUBE_API_URL || 'https://api.tiendanube.com/v1',
  headers: {
    'User-Agent': process.env.TIENDANUBE_USER_AGENT || 'ScriptManager',
  },
});

export async function deployScriptToTiendanube(
  storeId: number,
  scriptName: string,
  scriptContent: string,
  scriptType: 'css' | 'html' | 'js',
  apiToken: string
) {
  try {
    const response = await tiendanubeAPI.post(
      `/${storeId}/scripts`,
      {
        name: scriptName,
        code: scriptContent,
        type: scriptType,
      },
      {
        headers: {
          'Authentication': apiToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deploying to TiendaNube:', error);
    throw error;
  }
}
