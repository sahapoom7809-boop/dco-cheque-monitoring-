const Icon = ({ name, size = 18, className = "" }) => {
    const p = { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className };
    switch (name) {
        case 'Layers': return <svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
        case 'TrendingUp': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
        case 'Download': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
        case 'ChevronLeft': return <svg {...p}><polyline points="15 18 9 12 15 6" /></svg>;
        case 'ChevronRight': return <svg {...p}><polyline points="9 18 15 12 9 6" /></svg>;
        case 'X': return <svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
        case 'Crosshair': return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>;
        case 'Lock': return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
        case 'Briefcase': return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
        case 'UploadCloud': return <svg {...p}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
        case 'Filter': return <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
        case 'ListFilter': return <svg {...p}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>;
        case 'AlertTriangle': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
        case 'Activity': return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
        case 'Calendar': return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
        case 'BarChart2': return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
        case 'Search': return <svg {...p}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
        case 'Sun': return <svg {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
        case 'Moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
        case 'GitCompare': return <svg {...p}><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M11 18H8a2 2 0 0 1-2-2V9"></path></svg>;
        case 'HelpCircle': return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
        case 'Trash2': return <svg {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
        case 'Sparkles': return <svg {...p}><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
        case 'UserMinus': return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
        case 'Award': return <svg {...p}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
        case 'Printer': return <svg {...p}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
        case 'Sliders': return <svg {...p}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
        case 'ShieldAlert': return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>;
        case 'Target': return <svg {...p}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
        default: return <circle {...p} cx="12" cy="12" r="1" />;
    }
};

const MessageModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 bg-slate-800 dark:bg-slate-900 text-white font-bold flex justify-between items-center">
                    <span>{title || 'Notification'}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); onClose(); }} className="hover:text-red-400 p-1 cursor-pointer">
                        <Icon name="X" size={18} />
                    </button>
                </div>
                <div className="p-6 text-slate-700 dark:text-slate-300 font-medium">{message}</div>
                <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-right">
                    <button type="button" onClick={(e) => { e.preventDefault(); onClose(); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm cursor-pointer shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="p-20 text-center font-bold text-red-600 bg-white m-10 rounded-2xl shadow-xl">System Error. Please reload the page.</div>;
        return this.props.children;
    }
}

const ComparisonBadge = ({ val, type }) => {
    if (val === null || val === undefined) return null;
    const isGood = type === 'return' ? val < 0 : val >= 0;
    return <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 ${isGood ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-red-600 bg-red-50 dark:bg-red-900/30'}`}>{val > 0 ? '▲' : (val < 0 ? '▼' : '-')} {Math.abs(val).toFixed(2)}%</span>;
};

const StatCard = ({ title, count, amount, growthCount, growthAmount, sparkData, color, icon, onClick, isActive, isFilter }) => {
    const { ResponsiveContainer, LineChart, Line } = window.Recharts;
    const bdColor = !isActive ? (color === 'slate' ? '#0F172A' : color === 'red' ? '#EF4444' : color === 'purple' ? '#8B5CF6' : '#3B82F6') : '';
    return (
        <div onClick={onClick} className={`card-base p-4 border-l-[6px] relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer h-full ${isActive ? `bg-${color}-50 dark:bg-${color}-900/20 ring-4 ring-${color}-200 dark:ring-${color}-800` : ''}`} style={{ borderColor: bdColor }}>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    {isFilter && <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Filtered</div>}
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest block mb-2">{title}</span>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2"><span className={`text-2xl font-black ${color === 'slate' ? 'text-slate-800 dark:text-white' : color === 'red' ? 'text-danger' : color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>{fmtNum(count)}</span><span className="text-[10px] font-bold text-slate-400">Txns</span><ComparisonBadge val={growthCount} type={title.includes('Return') ? 'return' : 'normal'} /></div>
                        <div className="flex items-center gap-2"><div className={`text-lg font-bold ${color === 'slate' ? 'text-slate-400 dark:text-slate-500' : color === 'red' ? 'text-danger/40' : color === 'purple' ? 'text-purple-300' : 'text-blue-300'}`}>฿{fmtAmtM(amount)}</div><ComparisonBadge val={growthAmount} type={title.includes('Return') ? 'return' : 'normal'} /></div>
                    </div>
                </div>
                <div className={`p-2 rounded-xl self-start ${color === 'slate' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300' : color === 'red' ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : color === 'purple' ? 'bg-purple-100 text-purple-500 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}><Icon name={icon} size={20}/></div>
            </div>
            {sparkData && sparkData.length > 0 && <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none"><ResponsiveContainer width="100%" height="100%"><LineChart data={sparkData}><Line type="linear" dataKey="val" stroke={color === 'slate' ? '#0F172A' : color === 'red' ? '#EF4444' : color === 'purple' ? '#8B5CF6' : '#3B82F6'} strokeWidth={4} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>}
        </div>
    );
};
