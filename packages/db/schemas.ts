import { z } from "zod";

export const QuickAddSchema = z.object({
  poolId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  visibility: z.enum(["owner_only","household","work","public"]).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string().min(1).max(40)).optional()
});

export type QuickAddInput = z.infer<typeof QuickAddSchema>;

export const TodayProposeSchema = z.object({
  poolId: z.string().uuid(),
  taskId: z.string().uuid(),
  date: z.string() // YYYY-MM-DD
});

export const TodayRespondSchema = z.object({
  proposalId: z.string().uuid(),
  action: z.enum(["accept","decline","move"]),
  newDate: z.string().optional()
});

export const MemberInviteSchema = z.object({
  poolId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["spouse","colleague","guest"])
});

export const EmailAliasCreateSchema = z.object({
  poolId: z.string().uuid()
});

export const TaskUpdateSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  visibility: z.enum(["owner_only","household","work","public"]).optional(),
  status: z.enum(["open","in_progress","done","archived"]).optional()
});

export const TaskDeleteSchema = z.object({
  taskId: z.string().uuid()
});
