import { portfolioProcessSteps } from './portfolio-home-content'

const tagColors = {
  green: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-800',
  neutral: 'border-border/70 bg-muted/50 text-muted-foreground',
  red: 'border-red-200 bg-red-50 text-red-800',
  purple: 'border-violet-200 bg-violet-50 text-violet-800',
  pink: 'border-pink-200 bg-pink-50 text-pink-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
} as const

const gateColors = {
  green: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
} as const

const flowColors = [
  'border-red-200 bg-red-50 text-red-700',
  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'border-border/70 bg-muted/50 text-muted-foreground',
] as const

export function PortfolioProcessMap() {
  return (
    <section className="rounded-2xl border border-border/70 bg-white/80 p-5 shadow-[0_18px_56px_-46px_rgba(20,48,31,0.24)] backdrop-blur md:p-6">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
        Processo de engenharia
      </p>

      <div className="relative pl-7">
        <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-200" />

        {portfolioProcessSteps.map((step, index) => (
          <div key={step.title} className={`relative ${index < portfolioProcessSteps.length - 1 ? 'mb-4' : ''}`}>
            <div
              className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                step.accent === 'red' ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            />

            <div
              className={`rounded-xl border p-3 ${
                step.accent === 'red' ? 'border-red-200/80' : 'border-border/70'
              } bg-white`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tagColors[step.tagColor]}`}>
                  {step.tag}
                </span>
              </div>

              {'description' in step && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}

              {'badges' in step && step.badges && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {'flow' in step && step.flow && (
                <div className="mt-2 flex items-center gap-1.5">
                  {step.flow.map((item, i) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${flowColors[i]}`}>
                        {item}
                      </span>
                      {i < step.flow!.length - 1 && (
                        <span className="text-xs text-muted-foreground/50">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {'gates' in step && step.gates && (
                <div className="mt-2 flex items-center gap-1.5">
                  {step.gates.map((gate, i) => (
                    <div key={gate.label} className="flex items-center gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${gateColors[gate.color]}`}>
                        {gate.label}
                      </span>
                      {i < step.gates!.length - 1 && (
                        <span className="text-xs text-muted-foreground/50">→</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
