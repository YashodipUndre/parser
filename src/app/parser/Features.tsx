import { Zap } from 'lucide-react';
import { FEATURES, COLOR_MAP } from '@/constants/landing';

interface CardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    stat: string;
    metric: string;
    label: string;
    color: string;
}

export function FeatureCard({ title, desc, icon: Icon, stat, metric, label, color }: CardProps) {
    const c = COLOR_MAP[color as keyof typeof COLOR_MAP];
    return (
        <div className={`${c.bg} ${c.border} border rounded-lg p-6 hover:shadow-lg transition-all duration-300 group cursor-default relative overflow-hidden h-full flex flex-col`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/40 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex flex-col h-full">
                <div className={`${c.badge} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{Icon}</div>
                </div>
                <h5 className="font-bold text-gray-900 mb-2 text-base leading-tight h-12 flex items-center">{title}</h5>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed h-16">{desc}</p>
                <div className="flex items-end justify-between pt-3 border-t border-gray-200/50 mt-auto">
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-none">{metric}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
                    </div>
                    <span className={`${c.accent} ${c.icon} text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap`}>{stat}</span>
                </div>
            </div>
        </div>
    );
}

export function Features() {
    return (
        <div className="relative bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-10 border border-blue-100 shadow-sm mb-16 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="relative">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-4 shadow-sm">
                        <Zap size={16} className="animate-pulse" /> Powered by Intelligence
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Built for Speed & Accuracy</h3>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">Enterprise-grade lead processing designed exclusively for MT ERPNext workflows</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((f, i) => <FeatureCard key={i} {...f} icon={<f.icon size={22} />} />)}
                </div>
            </div>
        </div>
    );
}
