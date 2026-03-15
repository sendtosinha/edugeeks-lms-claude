const STATS = [
  { value: '50,000+', label: 'Active Students', emoji: '🎓' },
  { value: '200+', label: 'Video Courses', emoji: '📹' },
  { value: '500+', label: 'Hours of Content', emoji: '⏱️' },
  { value: '98%', label: 'Success Rate', emoji: '🏆' },
];

export default function StatsSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-brand-600 to-brand-800">
      <div className="container-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label, emoji }) => (
            <div key={label} className="text-white">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl">{value}</div>
              <div className="text-brand-200 text-sm font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
