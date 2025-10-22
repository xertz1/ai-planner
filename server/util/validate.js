

import { z } from 'zod';


const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional();
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, expected HH:MM").optional();

const operationSchema = z.object({
  action: z.enum(['create', 'update', 'delete']),
  id: z.string().optional(), 
  
  type: z.enum(['event', 'task']).optional(), 

  title: z.string().optional(),
  notes: z.string().optional(),


  date: dateSchema, 
  startDate: dateSchema, 
  endDate: dateSchema, 
  startTime: timeSchema,
  endTime: timeSchema,
  recurrence: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurrenceEndDate: dateSchema, 

  dueDate: dateSchema, 
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
});

export const aiResponseSchema = z.object({
  operations: z.array(operationSchema),
  naturalLanguageSummary: z.string().optional(),
  ambiguities: z.array(z.string()).optional(),
});

export function parseAIResult(rawJsonString) {
  try {
    const parsed = JSON.parse(rawJsonString);
    return aiResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod Validation Error:', error.errors);
      throw new Error(`AI response validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    console.error('JSON parsing or other error:', error);
    throw new Error('Failed to parse AI response as valid JSON.');
  }
}