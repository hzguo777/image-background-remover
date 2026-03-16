export default function HowItWorks() {
  const steps = [
    { icon: '⬆️', title: 'Upload', desc: 'Drop or select a JPG, PNG, or WebP image' },
    { icon: '🤖', title: 'AI Removes BG', desc: 'Our AI instantly erases the background' },
    { icon: '⬇️', title: 'Download', desc: 'Save your transparent PNG for free' },
  ]

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-2xl shadow">
                {s.icon}
              </div>
              <p className="font-semibold text-gray-800">{s.title}</p>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
