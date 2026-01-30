import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from the request
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '10';
    const sort_by = searchParams.get('sort_by') || 'name';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const search_name = searchParams.get('search_name') || '';
    const search_address = searchParams.get('search_address') || '';
    const filter_speciality = searchParams.get('filter_speciality') || '';

    // Construct the query parameters for the backend API
    const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/doctors`);
    backendUrl.searchParams.set('skip', skip);
    backendUrl.searchParams.set('limit', limit);
    backendUrl.searchParams.set('sort_by', sort_by);
    backendUrl.searchParams.set('sort_order', sort_order);

    if (search_name) backendUrl.searchParams.set('search_name', search_name);
    if (search_address) backendUrl.searchParams.set('search_address', search_address);
    if (filter_speciality) backendUrl.searchParams.set('filter_speciality', filter_speciality);

    // Make request to the backend API
    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${request.cookies.get('access_token')?.value || ''}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errorData.detail || 'Failed to fetch doctors' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const doctors = await response.json();
    return new Response(JSON.stringify(doctors), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}