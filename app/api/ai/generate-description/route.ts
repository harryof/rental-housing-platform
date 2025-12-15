import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { title, city, bedrooms, pricePerDay } = body;

    if (!title || !city || bedrooms === undefined || pricePerDay === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, city, bedrooms, pricePerDay' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;

    let description: string;

    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a professional real estate copywriter. Write compelling apartment descriptions.',
              },
              {
                role: 'user',
                content: `Write a short, appealing description (2-3 sentences) for a rental apartment with the following details:
- Title: ${title}
- City: ${city}
- Bedrooms: ${bedrooms}
- Price per day: $${pricePerDay}`,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        description = data.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI API error:', error);
        description = generateMockDescription(title, city, bedrooms, pricePerDay);
      }
    } else {
      description = generateMockDescription(title, city, bedrooms, pricePerDay);
    }

    return NextResponse.json({ description });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockDescription(title: string, city: string, bedrooms: number, pricePerDay: number): string {
  const bedroomText = bedrooms === 1 ? '1 bedroom' : `${bedrooms} bedrooms`;
  return `Discover ${title} in the heart of ${city}. This charming ${bedroomText} apartment offers comfortable living spaces and modern amenities. Perfect for travelers seeking an authentic local experience at just $${pricePerDay} per day.`;
}
