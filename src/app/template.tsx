/**
 * Next remounts a template on every navigation, so the animation below plays
 * on every route enter without a single line of JavaScript. The direction is
 * read from the flag TransitionLink writes onto <html>.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
