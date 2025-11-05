import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-mode',
})

interface Scene {
  sceneNumber: number
  duration: number
  visualDescription: string
  narration: string
  textOverlay: string
}

interface ShortContent {
  title: string
  description: string
  scenes: Scene[]
  totalDuration: number
}

export async function POST(request: NextRequest) {
  try {
    const { theme, duration } = await request.json()

    if (!theme || !duration) {
      return NextResponse.json(
        { error: 'Theme and duration are required' },
        { status: 400 }
      )
    }

    // If no API key, return demo content
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(generateDemoContent(theme, duration))
    }

    const prompt = `Create a YouTube Shorts script for kids about "${theme}".

Requirements:
- Total duration: ${duration} seconds
- Target audience: Kids ages 3-8
- Educational and entertaining
- Bright, colorful, engaging content
- 3-5 scenes
- Each scene should have clear visual descriptions, narration, and text overlays
- Keep language simple and fun

Return a JSON object with this exact structure:
{
  "title": "Catchy title for the short",
  "description": "YouTube video description with relevant hashtags",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 10,
      "visualDescription": "Detailed description of what appears on screen",
      "narration": "What the narrator says",
      "textOverlay": "Large text that appears on screen"
    }
  ],
  "totalDuration": ${duration}
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating engaging, educational YouTube Shorts content for children. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const content = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function generateDemoContent(theme: string, duration: number): ShortContent {
  const sceneDuration = Math.floor(duration / 3)

  const themeContent: Record<string, any> = {
    animals: {
      title: '🐘 Amazing Animal Facts!',
      description: 'Learn fun facts about animals! Perfect for kids. #KidsEducation #Animals #LearnWithFun #YouTubeShorts',
      scenes: [
        {
          sceneNumber: 1,
          duration: sceneDuration,
          visualDescription: 'Animated elephant with big eyes in a colorful jungle setting',
          narration: 'Did you know elephants are the biggest land animals?',
          textOverlay: '🐘 ELEPHANTS!',
        },
        {
          sceneNumber: 2,
          duration: sceneDuration,
          visualDescription: 'Close-up of elephant trunk picking up a peanut, sparkles around',
          narration: 'They can pick up tiny things with their long trunk!',
          textOverlay: 'SUPER TRUNK! 💪',
        },
        {
          sceneNumber: 3,
          duration: duration - (sceneDuration * 2),
          visualDescription: 'Happy elephant spraying water, rainbow in background',
          narration: 'And they love to play in water! So cool!',
          textOverlay: 'SPLASH! 💦',
        },
      ],
    },
    space: {
      title: '🚀 Journey to Space!',
      description: 'Blast off to space and learn amazing facts! #Space #KidsLearning #Science #Education',
      scenes: [
        {
          sceneNumber: 1,
          duration: sceneDuration,
          visualDescription: 'Cartoon rocket launching with colorful flames and stars',
          narration: '5, 4, 3, 2, 1... Blast off to space!',
          textOverlay: '🚀 BLAST OFF!',
        },
        {
          sceneNumber: 2,
          duration: sceneDuration,
          visualDescription: 'Planets spinning around the sun with happy faces',
          narration: 'There are 8 planets that go around the sun!',
          textOverlay: '8 PLANETS! ☀️',
        },
        {
          sceneNumber: 3,
          duration: duration - (sceneDuration * 2),
          visualDescription: 'Smiling moon and twinkling stars',
          narration: 'The moon lights up our night sky!',
          textOverlay: '✨ GOODNIGHT! 🌙',
        },
      ],
    },
  }

  const defaultContent = {
    title: `🎉 Fun Facts About ${theme}!`,
    description: `Learn amazing things about ${theme}! Educational and fun for kids. #KidsEducation #Learning #Fun #YouTubeShorts`,
    scenes: [
      {
        sceneNumber: 1,
        duration: sceneDuration,
        visualDescription: `Bright, colorful introduction scene with fun animations about ${theme}`,
        narration: `Let's learn something amazing about ${theme}!`,
        textOverlay: `${theme.toUpperCase()}!`,
      },
      {
        sceneNumber: 2,
        duration: sceneDuration,
        visualDescription: `Detailed visual showing interesting aspects of ${theme} with vibrant colors`,
        narration: `Here's a fun fact that will surprise you!`,
        textOverlay: 'WOW! 🤩',
      },
      {
        sceneNumber: 3,
        duration: duration - (sceneDuration * 2),
        visualDescription: `Exciting conclusion scene with celebration animations`,
        narration: 'Now you know something new! See you next time!',
        textOverlay: 'BYE! 👋',
      },
    ],
  }

  const content = themeContent[theme] || defaultContent
  content.totalDuration = duration

  return content
}
