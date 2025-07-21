import express from 'express';
import { generateJSON } from './geminiClient.js';
import { parseAIResult } from '../util/validate.js';

const router = express.Router();

router.post('/plan', async (req, res) => {
  try {
    const { userMessage, existingEvents = [] } = req.body;
    if (!userMessage) return res.status(400).json({ error: 'userMessage required' });

    const instruction = `
You are a highly intelligent and meticulous calendar and task assistant.
Your primary goal is to interpret user requests and translate them into a precise JSON structure.
Return ONLY JSON matching the specified schema.

# Schema (Informal - Strict Adherence Required):
\`\`\`json
{
  "operations": [
    {
      "action": "create" | "update" | "delete",
      "id"?: string,          // Required for 'update'/'delete'. MUST be an 'id' from 'Existing events'. NEVER invent IDs.
      "type": "event" | "task", // NEW: Specifies if the operation is for an 'event' or a 'task'.

      // Fields common to both events and tasks:
      "title"?: string,       // Required for 'create' operations. Optional for 'update'.
      "notes"?: string,       // Optional: additional details.

      // Fields specifically for 'event' type (if type is 'event'):
      "date"?: "YYYY-MM-DD",     // For single-day events (e.g., "today's meeting").
      "startDate"?: "YYYY-MM-DD", // NEW: For multi-day events (e.g., "vacation starts tomorrow").
      "endDate"?: "YYYY-MM-DD",   // NEW: For multi-day events. If only startDate, assume 1 day.
      "startTime"?: "HH:MM",     // For events with a specific start time.
      "endTime"?: "HH:MM",       // For events with a specific end time.
      "recurrence"?: "daily" | "weekly" | "monthly" | "yearly", // NEW: For recurring events.
      "recurrenceEndDate"?: "YYYY-MM-DD", // NEW: The specific date when a recurring event stops. Required if 'recurrence' is set.

      // Fields specifically for 'task' type (if type is 'task'):
      "dueDate"?: "YYYY-MM-DD",   // NEW: The date a task should be completed by.
      "priority"?: "high" | "medium" | "low", // NEW: Task priority.
      "status"?: "todo" | "doing" | "done" // NEW: Task status.
    }
  ],
  "naturalLanguageSummary"?: string, // Brief summary of the operations planned, OR an availability suggestion.
  "ambiguities"?: string[]           // List of any ambiguities, missing details, or issues found in the request.
}
\`\`\`

# Rules for Operation Extraction:
- **Strict JSON**: ALWAYS return valid JSON matching the schema. DO NOT include any other text or formatting outside the JSON block.
- **Action Types**: Use 'create' for new entries, 'update' for modifying existing entries, and 'delete' for removing entries.
- **IDs**: Crucial: NEVER invent 'id' values. An 'id' field is only used for 'update' and 'delete' actions, and it MUST be one of the 'id's from the provided 'Existing events'. If an 'id' is required but not found in 'Existing events', add it as an 'ambiguity'.
- **Type Differentiation (\`type: "event" | "task"\`):**
    - Use "event" if the request implies a specific time on a calendar (e.g., "meeting", "appointment", "class").
    - Use "task" if the request implies a to-do item, something to be completed, or prioritized (e.g., "to-do", "chore", "remember to", "prioritize").
- **Dates & Times**:
    - Do NOT guess or hallucinate specific dates or times if they are truly ambiguous. Omit fields rather than guessing.
    - If a relative date is clear (e.g., "tomorrow", "next Monday", "this Friday"), calculate and provide the specific YYYY-MM-DD based on the 'Current Date'.
    - If a start time is given but no end time for an event, assume a 1-hour duration.
- **Multi-Day Events (\`startDate\`, \`endDate\`):** If a user requests an event spanning multiple days (e.g., "vacation for 3 days," "training from Monday to Friday"), use 'startDate' and 'endDate' fields for a single 'event' operation. Do not create multiple daily events in this case.
- **Recurring Events (\`recurrence\`, \`recurrenceEndDate\`):**
    - If a request specifies a repeating event (e.g., "every Monday for a month", "daily for a week"), use the 'recurrence' field ('daily', 'weekly', 'monthly', 'yearly') and the 'recurrenceEndDate' (the specific date when the recurrence should stop).
    - If 'recurrence' is set, 'recurrenceEndDate' must also be set.
    - If 'recurrenceEndDate' is not specified in the request, infer a reasonable end date (e.g., one month from start date for "monthly", 7 days from start date for "daily/weekly").
- **Task-Specific Fields**:
    - \`dueDate\`: Use if a task has a specific deadline.
    - \`priority\`: Infer 'high', 'medium', or 'low' based on words like "urgent", "important", "not critical". Default to 'medium' if unclear.
    - \`status\`: Default to 'todo' for new tasks.
- **Availability Suggestions**:
    - If the user asks to "find the best time" or "when am I free for X minutes/hours", DO NOT create any operations.
    - Instead, analyze 'Existing events' for the earliest available continuous slot of the requested duration (default to 1 hour if not specified).
    - Provide this suggestion prominently in the 'naturalLanguageSummary' field.
    - For such requests, the 'operations' array should be EMPTY.
- **Natural Language Summary**: Provide a concise summary of the *planned operations* (e.g., "Created a meeting for...", "Scheduled a task...", "Suggested a time...").

`;
    const contents = [
      {
        role: "user", 
        parts: [{ text: instruction }]
      },
      {
        role: "user", 
        parts: [{
          text: `Current Date: ${new Date().toISOString().split('T')[0]}

Existing events:
${JSON.stringify(existingEvents, null, 2)}

User request:
${userMessage}

Output ONLY JSON.`
        }]
      }
    ];

    const raw = await generateJSON(contents);
    const aiResult = parseAIResult(raw);

    const knownIds = new Set(existingEvents.map(e => e.id));
    const unknownIdOps = aiResult.operations.filter(
      op => (op.action === 'update' || op.action === 'delete') && !knownIds.has(op.id)
    );
    if (unknownIdOps.length) {
      aiResult.ambiguities = [
        ...(aiResult.ambiguities || []),
        `Some operations reference unknown ids: ${unknownIdOps.map(o => o.id).join(', ')}`
      ];
    }

    res.json(aiResult);

  } catch (e) {
    console.error('AI planning error:', e);
    if (e.message && e.message.includes('GoogleGenerativeAI Error')) {
        res.status(500).json({ error: `AI planning error: ${e.message}` });
    } else {
        res.status(500).json({ error: e.message || 'An unknown AI planning error occurred.' });
    }
  }
});

export default router;