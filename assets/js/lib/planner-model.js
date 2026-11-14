// Which planner items actually book someone's time. Projects are containers,
// and a phase that has tasks is booked through those tasks instead.
export function bookableItems(items) {
  const phasesWithTasks = new Set(items.filter((i) => i.kind === 'task').map((i) => i.parent));
  return items.filter((i) => i.kind === 'task' || i.kind === 'course' || (i.kind === 'phase' && !phasesWithTasks.has(i.id)));
}
