import type {
  ProjectHealth,
  ProjectWithStats,
} from '../types/project.types';

/**
 * Format a date for display
 */
export function formatProjectDate(date: Date | null | undefined): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString();
}

/**
 * Calculate milestone progress percentage
 */
export function calculateMilestoneProgress(
  totalMilestones: number,
  completedMilestones: number
): number {
  if (totalMilestones === 0) return 0;
  return Math.round((completedMilestones / totalMilestones) * 100);
}

/**
 * Get health indicator color class
 */
export function getHealthColorClass(health: ProjectHealth): string {
  const colorMap: Record<ProjectHealth, string> = {
    not_started: 'text-gray-500',
    on_track: 'text-green-600',
    at_risk: 'text-yellow-600',
    blocked: 'text-red-600',
  };
  return colorMap[health];
}

/**
 * Get health indicator background color class
 */
export function getHealthBgColorClass(health: ProjectHealth): string {
  const colorMap: Record<ProjectHealth, string> = {
    not_started: 'bg-gray-100',
    on_track: 'bg-green-100',
    at_risk: 'bg-yellow-100',
    blocked: 'bg-red-100',
  };
  return colorMap[health];
}

/**
 * Check if a project is overdue
 */
export function isProjectOverdue(project: ProjectWithStats): boolean {
  if (!project.targetDate) return false;
  const target = new Date(project.targetDate);
  const now = new Date();
  return now > target && project.status !== 'completed' && project.status !== 'cancelled';
}

/**
 * Get days until target date
 */
export function getDaysUntilTarget(targetDate: Date | null | undefined): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

