import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
// import { adminOnlyRoutes, normalUserRoutes, powerUserRestrictedRoutes, publicRoutes } from './lib/routes';

// import { loadSensors } from './actions/sensor.action';


export async function middleware(request: NextRequest) {
    // return NextResponse.next();

    const pathname = request.nextUrl.pathname;
   
    
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        // Ensure this matches the name of the secure cookie used in production
        
        salt: process.env.AUTH_SALT || 'authjs.session-token',
        
        });
        // const { pathname } = req.nextUrl;
        const isPublicRoute = ['/login', '/signup',"/register","/home"].includes(pathname);
        const isPrivateRoute = !isPublicRoute;
        if (isPrivateRoute && !token) {
            // If requested a private route and no token, redirect to /login
            // const url = req.nextUrl.clone();
            // url.pathname = '/login';
            return NextResponse.redirect(new URL('/home', request.url));
          }
          if (isPublicRoute && token) {
            // If requested a public route and token exists, redirect to /dashboard
            // const url = req.nextUrl.clone();
            // url.pathname = '/dashboard';
            return NextResponse.redirect(new URL('/', request.url));
          }
        
    // if (publicRoutes.includes(pathname)) {
    //     if(token && pathname === '/login'){
    //         return NextResponse.redirect(new URL('/', request.url));
    //     }
    //     return NextResponse.next();
    // }

    // if (!token) {
    //     return NextResponse.redirect(new URL('/login', request.url));
    // }
    // if(token && pathname === '/login'){
    //     return NextResponse.redirect(new URL('/', request.url));
    // }

    

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    ],
};