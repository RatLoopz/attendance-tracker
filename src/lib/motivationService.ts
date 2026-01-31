/**
 * AI Motivation Service
 * Generates hard roasted Hinglish motivational messages using Gemini API
 * Uses both attendance stats and Gemini's user behavior data for personalization
 */

export interface MotivationData {
  message: string;
  timestamp: number;
  isAIGenerated: boolean;
}

// Hard roasted static fallback motivations (Hinglish, no sugar coating)
const FALLBACK_ROASTS = [
  'Arre bhai, itni kam attendance? College fees ka paisa barbaad kar rahe ho ya investment samajh ke? 💸',
  'Bhai sahab, class bunk maar ke Netflix dekh rahe ho kya? Degree nahi milegi, reality check zaroor milega! 📺',
  "Beta ye attendance dekh ke lagta hai tumhara course 'How to Fail' hai. Kuch padhai bhi kar lo! 📚",
  'Kis confidence se ye attendance maintain ki hai? Backlog lene ka plan hai kya? 🤡',
  'Tumhari attendance dekh ke professor bhi sochte honge - ye student hai ya ghost? 👻',
  "Class me aana hai ya WhatsApp pe 'Notes bhej do bhai' ka plan hai? Grow up! 📱",
  'Bhai kam se kam Sunday ko bhi college khul jaaye to tumse na ho payega attendance maintain karna! 🙄',
  'Aise to placement me bhi bunk maar doge kya? Thoda serious ho jao yaar! 💼',
  'Tumhari attendance se to TikTok influencer ban jao, at least waha consistency hogi! 🎭',
  'Beta marks kam honge to papa ke paas explanation ready hai ya phir attendance ka randi rona chalega? 😤',
  'Ye attendance nahi hai bro, ye to cry for help hai! Wake up! ⏰',
  'College me ghusne se darr lagta hai kya? Hostel room me hi degree mil jaayegi? 🏠',
  'Bhai ye course complete karna hai ya next generation ko continue karna hai? 🦖',
  'Itna kam attendance to freshers ko bhi sharam aa jaaye! Step up the game! 🎮',
  'Tumse to online classes me bhi attendance nahi hoti hogi, camera off rakhe beth te ho? 📷',
];

// Cache for motivations (one per day)
let cachedMotivation: MotivationData | null = null;

/**
 * Get the start of current day timestamp
 */
function getTodayTimestamp(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

/**
 * Check if cached motivation is still valid (same day)
 */
function isCacheValid(): boolean {
  if (!cachedMotivation) return false;

  const cachedDay = new Date(cachedMotivation.timestamp);
  cachedDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cachedDay.getTime() === today.getTime();
}

/**
 * Get a random fallback roast
 */
function getRandomFallbackRoast(): MotivationData {
  const randomIndex = Math.floor(Math.random() * FALLBACK_ROASTS.length);
  return {
    message: FALLBACK_ROASTS[randomIndex],
    timestamp: getTodayTimestamp(),
    isAIGenerated: false,
  };
}

/**
 * Generate motivation using Gemini API
 */
async function generateAIMotivation(
  attendancePercentage: number,
  totalClasses: number,
  attendedClasses: number
): Promise<MotivationData> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured, using fallback roast');
    return getRandomFallbackRoast();
  }

  try {
    // Determine roast intensity based on attendance
    let roastLevel = 'light';
    if (attendancePercentage < 50) {
      roastLevel = 'brutal';
    } else if (attendancePercentage < 65) {
      roastLevel = 'heavy';
    } else if (attendancePercentage < 75) {
      roastLevel = 'medium';
    }

    // Create prompt for Gemini
    const prompt = `You are a roasting master who gives hard-hitting motivational messages in Hinglish (Hindi + English mix). 

Current Student Stats:
- Attendance: ${attendancePercentage.toFixed(1)}%
- Total Classes: ${totalClasses}
- Attended: ${attendedClasses}
- Missed: ${totalClasses - attendedClasses}

Task: Generate ONE short, ${roastLevel} roasted motivational message in Hinglish that:
1. ROASTS the student based on their attendance (lower attendance = harder roast)
2. Uses natural mix of Hindi and English (Hinglish)
3. Is NOT sugar-coated - be direct and harsh but still motivating
4. Includes relevant emojis
5. Max 2 sentences
6. Use student behavior insights if available from my history

Roast Level Guide:
- Light (75%+): Gentle teasing, encouraging
- Medium (65-75%): Sarcastic, questioning their commitment  
- Heavy (50-65%): Direct criticism, wake-up call
- Brutal (<50%): Savage roasting, reality check

IMPORTANT: 
- NO sugar coating
- NO generic motivational quotes
- Be culturally relevant to Indian students
- Mix Hindi/English naturally (not word-by-word translation)

Generate ONLY the roast message, nothing else:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text.trim();

    return {
      message: generatedText,
      timestamp: getTodayTimestamp(),
      isAIGenerated: true,
    };
  } catch (error) {
    console.error('Error generating AI motivation:', error);
    // Return fallback on error
    return getRandomFallbackRoast();
  }
}

/**
 * Get today's motivation (cached or fresh)
 * @param forceRefresh - Force generate new motivation even if cached
 */
export async function getTodayMotivation(
  attendancePercentage: number,
  totalClasses: number,
  attendedClasses: number,
  forceRefresh: boolean = false
): Promise<MotivationData> {
  // Return cached if valid and not forcing refresh
  if (!forceRefresh && isCacheValid() && cachedMotivation) {
    return cachedMotivation;
  }

  // Generate new motivation
  const motivation = await generateAIMotivation(
    attendancePercentage,
    totalClasses,
    attendedClasses
  );

  // Cache it
  cachedMotivation = motivation;

  return motivation;
}

/**
 * Clear cached motivation (useful for testing or manual refresh)
 */
export function clearMotivationCache(): void {
  cachedMotivation = null;
}
