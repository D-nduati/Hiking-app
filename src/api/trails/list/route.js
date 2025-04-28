async function handler({ fitnessLevel }) {
  const trails = await sql`
    SELECT * FROM trails
    ORDER BY difficulty ASC`;

  const messages = [
    {
      role: "system",
      content:
        "You are a hiking expert who helps recommend trails based on fitness levels.",
    },
    {
      role: "user",
      content: `Given a user's fitness level of ${fitnessLevel} (scale 1-5), rank and explain which of these trails would be most suitable. Trails: ${JSON.stringify(
        trails
      )}`,
    },
  ];

  const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      json_schema: {
        name: "trail_recommendations",
        schema: {
          type: "object",
          properties: {
            trails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  explanation: { type: "string" },
                },
                required: ["id", "explanation"],
                additionalProperties: false,
              },
            },
          },
          required: ["trails"],
          additionalProperties: false,
        },
      },
    }),
  });

  const gptResponse = await response.json();
  const recommendations = JSON.parse(gptResponse.choices[0].message.content);

  const orderedTrails = recommendations.trails.map((rec) => {
    const trail = trails.find((t) => t.id === rec.id);
    return { ...trail, explanation: rec.explanation };
  });

  return { trails: orderedTrails };
}
export async function POST(request) {
  return handler(await request.json());
}