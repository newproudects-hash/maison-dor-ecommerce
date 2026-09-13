import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getPixelConfig, savePixelConfig } from '@/lib/cache/pixel';

// The middleware automatically protects routes starting with /api/[admin_path]
export async function GET() {
  try {
    const config = await getPixelConfig();
    
    // Mask the access token before sending it to the client
    const maskedConfig = config ? {
      ...config,
      accessTokenMasked: config.accessToken 
        ? `${config.accessToken.slice(0, 4)}...${config.accessToken.slice(-4)}` 
        : null,
      accessToken: undefined, // Don't send the full token
    } : null;

    return NextResponse.json({ data: maskedConfig || {} });
  } catch (error) {
    console.error('Failed to get pixel config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // If accessToken is undefined/empty but wasn't explicitly cleared, don't overwrite it
    // If it's passed as a new string, update it
    const currentConfig = await getPixelConfig();
    
    let newAccessToken = currentConfig?.accessToken;
    
    // Only update accessToken if the client provided a new one (not just relying on the mask)
    if (body.accessToken !== undefined) {
      newAccessToken = body.accessToken;
    }

    const updatedConfig = await savePixelConfig({
      ...body,
      accessToken: newAccessToken,
    });

    revalidateTag('pixel-config');

    const maskedConfig = {
      ...updatedConfig,
      accessTokenMasked: updatedConfig.accessToken 
        ? `${updatedConfig.accessToken.slice(0, 4)}...${updatedConfig.accessToken.slice(-4)}` 
        : null,
      accessToken: undefined,
    };

    return NextResponse.json({ data: maskedConfig });
  } catch (error) {
    console.error('Failed to save pixel config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
