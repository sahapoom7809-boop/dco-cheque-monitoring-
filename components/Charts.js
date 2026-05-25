const CustomLineLabel = (props) => {
    const { x, y, value, isReturn, index, trendData, trendMode } = props; 
    const num = parseFloat(value);
    const rawVal = trendData && trendData[index] ? trendData[index][trendMode] : null;
    if (rawVal === null || rawVal === undefined) return null;
    
    const displayRaw = trendMode === 'amount' ? `฿${fmtAmtM(rawVal)}` : fmtNum(rawVal);
    const isPos = num > 0;
    
    // แก้ไข: เช็คคืนให้แสดงสีเขียว (THEME_GREEN)
    const color = isReturn ? THEME_GREEN : (isPos ? THEME_GREEN : THEME_RED);
    const showGrowth = !isNaN(num) && Math.abs(num) >= 0.01;

    return (
        <g>
            <text x={x} y={y - (showGrowth ? 24 : 15)} textAnchor="middle" fontSize={11} fontWeight="900" fill={color} stroke="#ffffff" strokeWidth={2} paintOrder="stroke" style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))' }}>
                {displayRaw}
            </text>
            {showGrowth && (
                <text x={x} y={y - 12} textAnchor="middle" fontSize={10} fontWeight="800" fill={color} stroke="#ffffff" strokeWidth={2} paintOrder="stroke" style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))' }}>
                    {`${isPos ? '▲' : '▼'}${Math.abs(num).toFixed(1)}%`}
                </text>
            )}
        </g>
    );
};

const CustomHighlightedTick = ({ x, y, payload, minLabel, maxLabel }) => {
    const isMin = payload.value === minLabel, isMax = payload.value === maxLabel;
    return <g transform={`translate(${x},${y})`}><text x={0} y={0} dy={16} textAnchor="end" fill={isMin ? "#EF4444" : isMax ? "#10B981" : "#64748B"} fontSize={isMin || isMax ? 11 : 10} fontWeight={isMin || isMax ? "900" : "normal"} transform="rotate(-45)">{payload.value}</text></g>;
};

const CustomGraphTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
        const data = payload[0].payload;
        if(data.isForecast) {
            return (
                <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-xl shadow-xl border border-indigo-200 dark:border-indigo-700 text-xs">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 border-b border-indigo-200 dark:border-indigo-700 pb-1">🤖 Forecast: {label}</div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Est. Total:</span> <span className="font-bold text-slate-800 dark:text-white">{fmtNum(data.count)} Txns</span></div>
                        <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Est. Amount:</span> <span className="font-bold text-slate-800 dark:text-white">฿{fmtAmtM(data.amount)}</span></div>
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-200 mb-2 border-b dark:border-slate-600 pb-1">{label}</div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Total:</span> <span className="font-bold text-slate-800 dark:text-white">{fmtNum(data.count)} Txns</span></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Amount:</span> <span className="font-bold text-slate-800 dark:text-white">฿{fmtAmtM(data.amount)}</span></div>
                    {data.returnCount > 0 && <><div className="h-px bg-slate-100 dark:bg-slate-600 my-1"></div><div className="flex justify-between gap-4"><span className="text-red-500">Return:</span> <span className="font-bold text-red-600">{fmtNum(data.returnCount)} Txns</span></div><div className="flex justify-between gap-4"><span className="text-red-500">Ret. Amt:</span> <span className="font-bold text-red-600">฿{fmtAmtM(data.returnAmount)}</span></div></>}
                </div>
            </div>
        );
    }
    return null;
};

const TopAnalysisTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0 && payload[0]) {
        const d = payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-600 shadow-xl rounded-xl text-xs text-slate-800 dark:text-white min-w-[150px]">
                <div className="font-bold mb-2">{d.fullLabel || d.name}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Transactions:</span>
                    <span className="font-black text-orange-500 text-sm">{fmtNum(d.actualCount || d.count)} <span className="text-[10px] text-slate-400 font-bold">({d.percent}%)</span></span>
                </div>
            </div>
        );
    }
    return null;
};

const renderTopRankLabel = (props, dataArray) => {
    const { x, y, width, height, index } = props;
    if (!dataArray || !dataArray[index]) return null;
    const data = dataArray[index];
    const xPos = data.isOther ? x + 10 : x + width + 8;
    return (
        <text x={xPos} y={y + height / 2 + 4} fill="#64748b" fontSize={12} fontWeight="900">
            {fmtNum(data.actualCount)} <tspan fill="#94a3b8" fontSize={10} fontWeight="bold">({data.percent}%)</tspan>
        </text>
    );
};
