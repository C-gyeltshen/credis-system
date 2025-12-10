import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // For now, we'll handle authentication on the client side
  // This middleware can be enhanced later for server-side auth protection
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
