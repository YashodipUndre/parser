import { Upload, Download, Shield, Zap, Target, Database, Sparkles, CheckCircle2, TrendingUp, Award } from 'lucide-react';

export const FEATURES = [
    { title: 'Smart Auto-Fix Engine', desc: 'AI-powered corrections for names, emails, phones & dropdowns with fuzzy matching', icon: Sparkles, stat: '95% Auto-Fixed', color: 'blue', metric: '1000+', label: 'Rows/sec' },
    { title: 'Real-Time Validation', desc: 'Instant error detection across 41 ERPNext fields with live feedback', icon: Shield, stat: 'Zero Errors', color: 'green', metric: '<500ms', label: 'Response' },
    { title: 'Virtual Scrolling', desc: 'Handle massive datasets smoothly with 60fps performance', icon: Zap, stat: '10K+ Rows', color: 'yellow', metric: '60 FPS', label: 'Smooth' },
    { title: 'ERPNext Native', desc: 'Built specifically for ERPNext workflows & standards', icon: Award, stat: '41 Fields', color: 'purple', metric: '100%', label: 'Compatible' }
];

export const WORKFLOW = [
    { step: 1, title: 'Upload or Create', desc: 'Drag-drop Excel files or start fresh with blank template', icon: Upload, color: 'blue', features: ['Excel/CSV support', 'Blank template option', 'Auto field detection', 'Session recovery'] },
    { step: 2, title: 'Auto-Fix & Validate', desc: 'Watch AI clean your data in real-time with smart corrections', icon: Zap, color: 'green', features: ['Fuzzy dropdown matching', 'Email/phone formatting', 'Duplicate ID detection', 'Live error highlighting'] },
    { step: 3, title: 'Export Clean Data', desc: 'Download ERPNext-ready Excel with validation reports', icon: Download, color: 'purple', features: ['One-click export', 'Error summary report', 'Auto-saved sessions', 'Batch processing'] }
];

export const COLOR_MAP = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-100', badge: 'bg-blue-600', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', accent: 'bg-green-100', badge: 'bg-green-600', icon: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'bg-yellow-100', badge: 'bg-yellow-600', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-100', badge: 'bg-purple-600', icon: 'text-purple-600' }
};
