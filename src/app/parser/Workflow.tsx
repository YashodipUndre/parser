import { CheckCircle2, ArrowRight } from 'lucide-react';
import { WORKFLOW, COLOR_MAP } from '@/constants/landing';

interface WorkflowCardProps {
    step: number;
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
    isLast?: boolean;
}

export function WorkflowCard({ step, title, desc, icon: Icon, color, features, isLast }: WorkflowCardProps) {
    const c = COLOR_MAP[color as keyof typeof COLOR_MAP];
    return (
        <div className="relative h-full">
            <div className={`${c.bg} ${c.border} border-2 rounded-xl p-8 relative hover:shadow-xl transition-all duration-300 group h-full flex flex-col`}>
                <div className={`absolute -top-4 -left-4 ${c.badge} w-12 h-12 text-white rounded-full flex items-center justify-center text-lg font-extrabold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step}
                </div>
                <div className={`${c.accent} ${c.icon} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ml-8`}>
                    {Icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight h-14 flex items-center">{title}</h4>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed h-20">{desc}</p>
                <div className="space-y-3 mt-auto">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                            <CheckCircle2 size={18} className={`${c.icon} shrink-0 mt-0.5`} />
                            <span className="leading-relaxed">{f}</span>
                        </div>
                    ))}
                </div>
            </div>
            {!isLast && (
                <div className="hidden md:flex absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                    <div className="bg-white rounded-full p-2 shadow-md">
                        <ArrowRight size={20} className="text-gray-400" />
                    </div>
                </div>
            )}
        </div>
    );
}

export function Workflow() {
    return (
        <div className="mb-16">
            <div className="text-center mb-14">
                <div className="inline-block mb-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        3 Simple Steps
                    </div>
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">How It Works</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">Transform messy lead data into clean, ERPNext-ready files in minutes</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 relative">
                {WORKFLOW.map((w, i) => <WorkflowCard key={i} {...w} icon={<w.icon size={24} />} isLast={i === WORKFLOW.length - 1} />)}
            </div>
        </div>
    );
}
