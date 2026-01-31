// src/lib/backend-config.ts
// src/lib/backend-config.ts

import { NextRequest, NextResponse } from 'next/server';

// ===============================================
// 1. ENVIRONMENT CONFIGURATION
// ===============================================

/**
 * CRITICAL: Consistent backend URL resolution
 * Used by API routes to communicate with backend
 */
export const getBackendUrl = (): string => {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.RENDER === 'true';
  
  const backendUrl = isProduction
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dailyvaibe.com')
    : (process.env.BACKEND_URL || 'http://localhost:5000');
  
  const cleanUrl = backendUrl.replace(/\/$/, '');
  
  console.log(`🔧 [${isProduction ? 'PROD' : 'DEV'}] Backend URL: ${cleanUrl}`);
  return cleanUrl;
};

// ===============================================
// 2. HEADER UTILITIES
// ===============================================

/**
 * CRITICAL: Build headers for backend requests
 * Safely forwards cookies and user-agent
 */
export const buildHeadersFromRequest = (
  request: NextRequest, 
  additionalHeaders: HeadersInit = {}
): HeadersInit => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward cookie
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    
    // Forward user agent
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }
    
    // Merge additional headers
    const mergedHeaders = new Headers(headers);
    
    if (additionalHeaders) {
      const additionalHeadersObj = new Headers(additionalHeaders);
      additionalHeadersObj.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }

    return mergedHeaders;
  } catch (error) {
    console.error('❌ Error building headers:', error);
    return { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
};

// ===============================================
// 3. COOKIE FORWARDING - BULLETPROOF
// ===============================================

/**
 * CRITICAL: Forward Set-Cookie headers from backend to client
 * Handles all edge cases without throwing errors
 */
export const forwardCookies = (
  backendResponse: Response, 
  nextResponse: NextResponse
): void => {
  if (!backendResponse || !nextResponse) {
    console.warn('⚠️ Invalid response objects for cookie forwarding');
    return;
  }

  try {
    if (!backendResponse.headers) {
      return;
    }

    // METHOD 1: Try getSetCookie() (modern browsers/Node 20+)
    if (typeof backendResponse.headers.getSetCookie === 'function') {
      try {
        const cookieArray = backendResponse.headers.getSetCookie();
        
        if (Array.isArray(cookieArray) && cookieArray.length > 0) {
          let forwardedCount = 0;
          cookieArray.forEach(cookie => {
            if (cookie && typeof cookie === 'string' && cookie.trim()) {
              nextResponse.headers.append('Set-Cookie', cookie);
              forwardedCount++;
            }
          });
          
          if (forwardedCount > 0) {
            console.log(`✅ Forwarded ${forwardedCount} cookie(s) via getSetCookie()`);
            return;
          }
        }
      } catch (err) {
        // Silent fallback to next method
      }
    }
    
    // METHOD 2: Fallback to get('set-cookie')
    try {
      const setCookieHeader = backendResponse.headers.get('set-cookie');
      
      if (setCookieHeader && typeof setCookieHeader === 'string') {
        // Split cookies carefully (don't split within cookie values)
        const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);
        
        let forwardedCount = 0;
        cookies.forEach(cookie => {
          const trimmedCookie = cookie.trim();
          if (trimmedCookie) {
            nextResponse.headers.append('Set-Cookie', trimmedCookie);
            forwardedCount++;
          }
        });
        
        if (forwardedCount > 0) {
          console.log(`✅ Forwarded ${forwardedCount} cookie(s) via get()`);
          return;
        }
      }
    } catch (err) {
      // Silent - no cookies is normal
    }
    
  } catch (error) {
    console.warn('⚠️ Cookie forwarding encountered error (non-critical):', error);
  }
};

// ===============================================
// 4. ENHANCED FETCH WITH RETRY
// ===============================================

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 25000;
const DEFAULT_RETRIES = 2;

/**
 * CRITICAL: Fetch with timeout, retry, and exponential backoff
 */
export async function safeFetch(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { 
    timeout = DEFAULT_TIMEOUT, 
    retries = DEFAULT_RETRIES,
    headers, 
    ...rest 
  } = options;

  const finalHeaders: HeadersInit = headers || {};

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`📡 [Attempt ${attempt + 1}/${retries + 1}] ${rest.method || 'GET'} ${url.substring(0, 100)}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        ...rest,
        signal: controller.signal,
        headers: finalHeaders,
      });
      
      clearTimeout(timeoutId);
      
      // Success
      if (response.ok) {
        console.log(`✅ ${response.status} from ${url.substring(0, 100)}...`);
        return response;
      }
      
      // Server error - retry
      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`⚠️ Server error ${response.status}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 404 or client error - don't retry
      console.warn(`⚠️ ${response.status} from ${url.substring(0, 100)}...`);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`⏱️ Request timeout after ${timeout}ms`);
        } else {
          console.error(`❌ Fetch error: ${error.message}`);
        }
      }
      
      // Retry on error
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Final attempt failed
      throw error;
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
}

// ===============================================
// 5. STANDARDIZED RESPONSES
// ===============================================

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  additionalData: Record<string, any> = {}
): NextResponse {
  console.error(`🔴 Error Response [${statusCode}]: ${message}`);
  
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
      timestamp: new Date().toISOString(),
      ...additionalData,
    },
    { status: statusCode }
  );
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse(
  data: any,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    }, 
    { status: statusCode }
  );
}

// ===============================================
// 6. ROUTE HANDLER WRAPPER
// ===============================================

/**
 * CRITICAL: Wrap API route handlers with error handling
 * Eliminates repetitive try-catch blocks
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('💥 Unhandled error in route:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      return createErrorResponse(
        errorMessage,
        500,
        {
          path: request.nextUrl.pathname,
          method: request.method,
        }
      );
    }
  };
}

// ===============================================
// 7. CATEGORY SLUG UTILITIES
// ===============================================

/**
 * CRITICAL: Normalize category slugs
 * Handles "Life & Style" -> "lifestyle", etc.
 */
export function normalizeCategorySlug(input: string): string {
  const nameToSlug: Record<string, string> = {
    'Home': 'home',
    'Live & World': 'live-world',
    'Counties': 'counties',
    'Politics': 'politics',
    'Business': 'business',
    'Opinion': 'opinion',
    'Sports': 'sports',
    'Life & Style': 'lifestyle',
    'Lifestyle': 'lifestyle',
    'Entertainment': 'entertainment',
    'Technology': 'tech',
    'Tech': 'tech'
  };
  
  if (nameToSlug[input]) {
    return nameToSlug[input];
  }
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Check if slug is a main category group
 */
export function isMainCategoryGroup(slug: string): boolean {
  const mainGroups = [
    'live-world',
    'counties',
    'politics',
    'business',
    'opinion',
    'sports',
    'lifestyle',
    'entertainment',
    'tech'
  ];
  return mainGroups.includes(slug);
}