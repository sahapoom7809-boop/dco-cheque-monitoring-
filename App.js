const { useState, useMemo, useRef, useEffect, Fragment, startTransition } = React;
const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, ReferenceLine, ScatterChart, Scatter, ZAxis } = window.Recharts;

function App() {
    const [sheetsData, setSheetsData] = useState([]);
    const [accountMap, setAccountMap] = useState({});
    const [codeDescMap, setCodeDescMap] = useState(DEFAULT_CODE_DESC);
    const [accountIndex, setAccountIndex] = useState({});
    const [closedAccountSet, setClosedAccountSet] = useState(new Set()); 
    
    const [viewType, setViewType] = useState('monthly'); 
    const [selectedSheetNames, setSelectedSheetNames] = useState([]);
    const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0); 
    const [customDateStart, setCustomDateStart] = useState(''); 
    const [customDateEnd, setCustomDateEnd] = useState(''); 
    const [selectedCodes, setSelectedCodes] = useState([]); 
    const [filterDate, setFilterDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [filterBusinessType, setFilterBusinessType] = useState('ALL'); 
    const [detailSearch, setDetailSearch] = useState('');
    const [sortBy, setSortBy] = useState('count');
    const [topNInput, setTopNInput] = useState(20); 
    const [trendMode, setTrendMode] = useState('count');
    const [leftPanelTab, setLeftPanelTab] = useState('reasons'); 
    const [showInsightModal, setShowInsightModal] = useState(false);
    const [showInsightDetails, setShowInsightDetails] = useState(false);
    const [insightSearchTerm, setInsightSearchTerm] = useState('');
    
    const [isCashierFilter, setIsCashierFilter] = useState(false);
    const [cashierMode, setCashierMode] = useState('ALL'); 
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const [selectedAccount, setSelectedAccount] = useState(null); 
    const [showFilterBar, setShowFilterBar] = useState(false);
    const [showClosedAnalysis, setShowClosedAnalysis] = useState(false);
    const [showTopAnalysis, setShowTopAnalysis] = useState(false);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false); 
    const [showDistModal, setShowDistModal] = useState(false); 
    const [showExecReport, setShowExecReport] = useState(false); 
    
    const [showSimulator, setShowSimulator] = useState(false);
    const [simReturnLimit, setSimReturnLimit] = useState(2); 
    const [simRateLimit, setSimRateLimit] = useState(20); 
    
    const riskThresholdRate = 20; const riskThresholdCount = 3;
    const [closedTab, setClosedTab] = useState('conversion'); 
    const [minAmt, setMinAmt] = useState('');
    const [maxAmt, setMaxAmt] = useState('');
    const [pieView, setPieView] = useState('overview');
    const [transactionFilter, setTransactionFilter] = useState({ mode: 'ALL', value: null });
    const [closedTopN, setClosedTopN] = useState(20); 
    const [chequeSearch, setChequeSearch] = useState('');
    const [trendChartMode, setTrendChartMode] = useState('trend'); 
    const [trendGroupMode, setTrendGroupMode] = useState('auto'); 
    
    const [darkMode, setDarkMode] = useState(false);
    const [chartColor, setChartColor] = useState('#f97316'); 
    const [distFilter, setDistFilter] = useState('ALL');
    const [topAnalysisTab, setTopAnalysisTab] = useState('overview');
    const [selectedTopCode, setSelectedTopCode] = useState('1');
    const [customTopN, setCustomTopN] = useState(20);
    
    const [compareMode, setCompareMode] = useState('month'); 
    const [compareMonth1, setCompareMonth1] = useState('');
    const [compareMonth2, setCompareMonth2] = useState('');
    const [compTab, setCompTab] = useState('overview');
    const [churnFilter, setChurnFilter] = useState('ALL');

    const topAnalysisRef = useRef(null); const insightModalRef = useRef(null); const comparisonRef = useRef(null);
    const helpModalRef = useRef(null); const distModalRef = useRef(null);
    const fileInputRef = useRef(null); const fullPageRef = useRef(null);
    const closedModalRef = useRef(null); const registryRef = useRef(null);
    const execReportRef = useRef(null);
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });

    const chartColorOptions = [
        { id: 'light-pink', val: '#f9a8d4' }, { id: 'light-red', val: '#fca5a5' }, { id: 'rose', val: '#f43f5e' },
        { id: 'red', val: '#ef4444' }, { id: 'dark-red', val: '#991b1b' }, { id: 'orange', val: '#f97316' },
        { id: 'teal', val: '#14b8a6' }, { id: 'blue', val: '#3b82f6' }, { id: 'indigo', val: '#6366f1' }
    ];

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const getExportPeriod = () => {
        if (viewType === 'monthly' && sheetsData.length > 0 && selectedSheetNames.length > 0) {
            const sheet = sheetsData.find(s => s.name === selectedSheetNames[0]);
            if (sheet?.data?.length > 0) { const d = sheet.data[0].date; if(d?.includes('-')) { const [y, m] = d.split('-'); return `${MONTHS[parseInt(m, 10)-1]} ${y}`; } }
            return selectedSheetNames[0];
        }
        return viewType === 'quarterly' ? `Quarter ${currentQuarterIndex + 1}` : viewType === 'yearly' ? "Yearly Summary" : "All Data";
    };
    
    const availableBusinessTypes = useMemo(() => {
        const types = new Set();
        Object.values(accountMap).forEach(acc => {
            if (acc.businessType && acc.businessType !== 'Unclassified') types.add(acc.businessType);
        });
        return Array.from(types).sort();
    }, [accountMap]);

    useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

    useEffect(() => {
        const loadSavedData = async () => {
            try {
                const savedData = await window.localforage.getItem('dco_dashboard_data');
                if (savedData) {
                    setSheetsData(savedData.sheetsData);
                    setAccountMap(savedData.accountMap);
                    setCodeDescMap(savedData.codeDescMap);
                    setAccountIndex(savedData.accountIndex);
                    setClosedAccountSet(new Set(savedData.closedAccountList));
                    setSelectedSheetNames([savedData.sheetsData[0].name]);
                }
            } catch (e) {
                console.error("Error loading saved data", e);
            }
        };
        loadSavedData();
    }, []);

    const clearSavedData = async () => {
        if(confirm("Are you sure you want to clear all saved data?")) {
            await window.localforage.removeItem('dco_dashboard_data');
            setSheetsData([]);
        }
    };

    const showModal = (title, message) => setModalState({ isOpen: true, title, message });
    const closeModal = () => setModalState({ ...modalState, isOpen: false });

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files); if (!files.length) return;
        setIsProcessing(true);
        setUploadProgress(0);
        setSheetsData([]); 
        
        let allNewSheets = [];
        let allClosedSet = new Set();
        let allDescMap = { ...DEFAULT_CODE_DESC };
        let allAccMap = {};
        let allIndex = {};

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const baseProgress = (i / files.length) * 100;
            const fileWeight = 100 / files.length;
            
            setLoadingMessage(`Reading File ${i + 1}/${files.length} : ${file.name}...`);
            setUploadProgress(baseProgress + (fileWeight * 0.1));
            
            await new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onprogress = (e) => {
                    if(e.lengthComputable) {
                        const readPercent = e.loaded / e.total;
                        setUploadProgress(baseProgress + (fileWeight * 0.1) + (fileWeight * 0.3 * readPercent));
                    }
                };
                
                reader.onload = (e) => {
                    setLoadingMessage(`Parsing File ${i + 1}/${files.length} (Please wait)...`);
                    setUploadProgress(baseProgress + (fileWeight * 0.4));
                    const data = new Uint8Array(e.target.result);
                    
                    const workerCode = `
                        importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
                        self.onmessage = function(e) {
                            try {
                                const data = e.data.data;
                                const workbook = XLSX.read(data, { type: 'array' });
                                
                                const newSheets = [];
                                const newClosedSet = [];
                                const newDescMap = {};
                                const newAccMap = {};
                                const newIndex = {};
                                
                                workbook.SheetNames.forEach(sName => {
                                    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sName], { header: 1 }); 
                                    if (!rows.length) return;
                                    
                                    if (sName.toUpperCase().includes("CLOSE")) {
                                        const hIdx = rows.findIndex(r => r && Array.isArray(r) && r.some(v => String(v||"").toUpperCase().includes("ACCOUNT") || String(v||"").toUpperCase().includes("NO.")));
                                        if (hIdx !== -1) {
                                            const aI = rows[hIdx].map(v => String(v||"").toUpperCase()).findIndex(v => v.includes("ACCOUNT") || v.includes("A/C") || v.includes("NO.") || v.includes("เลขที่"));
                                            if (aI !== -1) { for(let i=hIdx+1; i<rows.length; i++) if(rows[i] && rows[i][aI]) newClosedSet.push(String(rows[i][aI]).replace(/[^0-9]/g, '')); }
                                        }
                                    }
                                    else if (sName.toUpperCase().includes("DESC")) { 
                                        rows.forEach(r => { if(r.length>=2) newDescMap[String(r[0]).trim()] = String(r[1]).trim(); }); 
                                    } 
                                    else if (sName.toUpperCase().includes("DATA") || sName.toUpperCase().includes("MAPPING")) { 
                                        rows.forEach(r => { if(r.length>=2) newAccMap[String(r[0]).trim()] = { name: String(r[1]).trim(), businessType: r[2] ? String(r[2]).trim() : '' }; }); 
                                    } 
                                    else {
                                        const hIdx = rows.findIndex(r => r && Array.isArray(r) && r.some(v => String(v||"").toUpperCase().includes("CODE")));
                                        if (hIdx !== -1) {
                                            const h = rows[hIdx].map(v => String(v||"").toUpperCase());
                                            const cI = h.findIndex(v => v === "CODE" || v.includes("REASON") || v.includes("RET"));
                                            const aI = h.findIndex(v => v.includes("ACCOUNT") || v.includes("A/C") || v.includes("ACC") || v.includes("NO.") || v.includes("เลขที่บัญชี"));
                                            const mI = h.findIndex(v => v.includes("AMOUNT") || v.includes("AMT") || v.includes("BAHT") || v.includes("จำนวนเงิน"));
                                            const dI = h.findIndex(v => v.includes("DATE") || v.includes("DT") || v.includes("วันที่"));
                                            
                                            const sData = [];
                                            for (let i = hIdx + 1; i < rows.length; i++) {
                                                const r = rows[i]; if (!r || r[cI] === undefined) continue;
                                                
                                                let dt = String(r[dI] || "").trim();
                                                if (typeof r[dI] === 'number') { 
                                                    const d = new Date(Math.round((r[dI] - 25569) * 86400 * 1000)); 
                                                    if (!isNaN(d)) dt = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`; 
                                                } else {
                                                    const str = String(dt).trim();
                                                    if (!str.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
                                                        const parts = str.split(/[\\/\\.\\-]/);
                                                        if (parts.length === 3) {
                                                            let pd = parts[0], pm = parts[1], py = parts[2];
                                                            if (py.length === 2) py = "20" + py;
                                                            dt = \`\${py}-\${pm.padStart(2, '0')}-\${pd.padStart(2, '0')}\`;
                                                        }
                                                    }
                                                }
                                                
                                                const code = String(r[cI]).trim();
                                                const acc = (aI !== -1 && r[aI]) ? String(r[aI]).trim() : "UNKNOWN";
                                                
                                                let amount = r[mI];
                                                amount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0).replace(/[",]/g, '')) || 0;
                                                
                                                const isCodeGreen = code === '0' || code === '00';
                                                
                                                const item = { code, accountNo: acc, amount, date: dt, status: isCodeGreen ? 'A' : 'R', chequeNo: String(r[3] !== undefined ? r[3] : "-").trim() };
                                                sData.push(item);
                                                
                                                const cleanAccount = String(acc).replace(/[^0-9]/g, ''); 
                                                if (!newIndex[cleanAccount]) newIndex[cleanAccount] = []; 
                                                newIndex[cleanAccount].push(item);
                                                
                                                if (code === '2') newClosedSet.push(cleanAccount);
                                            }
                                            newSheets.push({ name: sName, data: sData });
                                        }
                                    }
                                });
                                
                                self.postMessage({ success: true, newSheets, newClosedSet, newDescMap, newAccMap, newIndex });
                            } catch (err) {
                                self.postMessage({ success: false, error: err.toString() });
                            }
                        };
                    `;
                    
                    const blob = new Blob([workerCode], { type: 'application/javascript' });
                    const worker = new Worker(URL.createObjectURL(blob));
                    
                    let simProgress = 0;
                    const simInterval = setInterval(() => {
                        simProgress += 5;
                        if(simProgress > 95) clearInterval(simInterval);
                        else setUploadProgress(baseProgress + (fileWeight * 0.4) + (fileWeight * 0.6 * (simProgress/100)));
                    }, 300);

                    worker.onmessage = (msg) => {
                        clearInterval(simInterval);
                        if (msg.data.success) {
                            const { newSheets, newClosedSet, newDescMap, newAccMap, newIndex } = msg.data;
                            
                            const yearMatch = file.name.match(/20\d{2}|\d{4}/);
                            const fileSuffix = yearMatch ? yearMatch[0] : `File${i+1}`;

                            newSheets.forEach(sheet => {
                                const sheetName = files.length > 1 ? `${sheet.name} (${fileSuffix})` : sheet.name;
                                allNewSheets.push({ name: sheetName, data: sheet.data });
                            });

                            newClosedSet.forEach(acc => allClosedSet.add(acc));
                            Object.assign(allDescMap, newDescMap);
                            Object.assign(allAccMap, newAccMap);

                            Object.keys(newIndex).forEach(acc => {
                                if(!allIndex[acc]) allIndex[acc] = [];
                                allIndex[acc] = allIndex[acc].concat(newIndex[acc]);
                            });
                            
                            setUploadProgress(baseProgress + fileWeight);
                            resolve();
                        } else {
                            console.error("Worker error:", msg.data.error);
                            reject(msg.data.error);
                        }
                        worker.terminate();
                    };
                    
                    worker.postMessage({ data }, [data.buffer]);
                };
                reader.readAsArrayBuffer(file);
            });
        }

        setLoadingMessage("Finalizing data and saving...");
        setUploadProgress(98);

        if (allNewSheets.length === 0) {
            showModal("Error", "ไม่พบข้อมูลที่ถูกต้องในไฟล์ที่เลือก กรุณาตรวจสอบรูปแบบไฟล์");
        } else {
            setSheetsData(allNewSheets); 
            setAccountIndex(allIndex); 
            setAccountMap(allAccMap); 
            setCodeDescMap(allDescMap); 
            setClosedAccountSet(allClosedSet); 
            setSelectedSheetNames([allNewSheets[0].name]); 
            
            await window.localforage.setItem('dco_dashboard_data', {
                sheetsData: allNewSheets, accountMap: allAccMap, codeDescMap: allDescMap, accountIndex: allIndex, closedAccountList: Array.from(allClosedSet)
            });
        }
        
        setUploadProgress(100);
        setTimeout(() => setIsProcessing(false), 500);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleMinChange = (e) => setMinAmt(formatInputNumber(e.target.value));
    const handleMaxChange = (e) => setMaxAmt(formatInputNumber(e.target.value));
    const selectQuarter = (qIdx) => { const safeIdx = (typeof qIdx === 'number' && !isNaN(qIdx)) ? qIdx : 0; setCurrentQuarterIndex(safeIdx); if (!sheetsData.length) return; const months = [[1,2,3], [4,5,6], [7,8,9], [10,11,12]][safeIdx]; if (!months) return; setSelectedSheetNames(sheetsData.filter(s => s.data?.length && months.includes(parseInt(s.data[0].date.split('-')[1]))).map(s => s.name)); setViewType('quarterly'); setFilterDate(''); setSelectedAccount(null); setSelectedCodes([]); };
    const handlePrevRange = () => { if (!sheetsData.length) return; setSelectedAccount(null); setSelectedCodes([]); if (viewType === 'monthly') { const idx = sheetsData.findIndex(s => s.name === selectedSheetNames[0]); setSelectedSheetNames([sheetsData[(idx > 0) ? idx - 1 : sheetsData.length - 1].name]); } else if (viewType === 'quarterly') selectQuarter(currentQuarterIndex === 0 ? 3 : currentQuarterIndex - 1); };
    const handleNextRange = () => { if (!sheetsData.length) return; setSelectedAccount(null); setSelectedCodes([]); if (viewType === 'monthly') { const idx = sheetsData.findIndex(s => s.name === selectedSheetNames[0]); setSelectedSheetNames([sheetsData[(idx < sheetsData.length - 1) ? idx + 1 : 0].name]); } else if (viewType === 'quarterly') selectQuarter(currentQuarterIndex >= 3 ? 0 : currentQuarterIndex + 1); };
    
    const exportRegistryToExcel = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(registryList.map((r, i) => ({ Rank: i + 1, Account: r.acc, Name: accountMap[r.acc]?.name || 'Unknown', BusinessType: accountMap[r.acc]?.businessType || '-', Transactions: r.count, PercentTxn: stats.tC > 0 ? (r.count / stats.tC * 100).toFixed(2) + '%' : '0%', Amount: r.amount, PercentAmount: stats.tA > 0 ? (r.amount / stats.tA * 100).toFixed(2) + '%' : '0%', Status: closedAccountSet.has(cleanAcc(r.acc)) ? 'Closed' : 'Active' })));
            const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Registry"); XLSX.writeFile(wb, "NIC_Registry_Export.xlsx");
        } catch(e) { showModal("Export Error", "Export failed."); }
    };
    
    const saveDashboardAsImage = async () => {
        if (!fullPageRef.current) return; setIsProcessing(true); setLoadingMessage("Capturing Dashboard..."); await new Promise(r => setTimeout(r, 500));
        try {
            window.scrollTo(0,0);
            const canvas = await window.html2canvas(fullPageRef.current, { scale: 1.5, useCORS: true, backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', logging: false });
            const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `DCO_Dashboard_${new Date().toISOString().slice(0,10)}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
        } catch (err) { showModal("Error", "Failed to save image."); } finally { setIsProcessing(false); }
    };
    
    const captureAndExport = async (ref, name) => { 
        if (!ref.current) return; setIsProcessing(true); setLoadingMessage("Exporting Image...");
        const origOverflow = ref.current.style.overflow, origHeight = ref.current.style.height, origMaxHeight = ref.current.style.maxHeight;
        ref.current.style.overflow = 'visible'; ref.current.style.height = 'auto'; ref.current.style.maxHeight = 'none';
        await new Promise(r => setTimeout(r, 500)); 
        try { 
            window.scrollTo(0,0); 
            const canvas = await window.html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: darkMode ? '#1e293b' : '#f8fafc', logging: false, windowHeight: ref.current.scrollHeight + 100 }); 
            const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `${name}.png`; link.click(); 
        } catch (err) { alert("Capture failed."); } finally { ref.current.style.overflow = origOverflow; ref.current.style.height = origHeight; ref.current.style.maxHeight = origMaxHeight; setIsProcessing(false); }
    };

    const handleInsightClick = (entry) => { 
        if (!entry) return; 
        if (entry.activePayload?.length) { const payload = entry.activePayload[0].payload; if (payload?.month) { setTransactionFilter({ mode: 'MONTH', value: payload.month }); setShowInsightDetails(true); return; } }
        const data = entry.payload || entry;
        if (pieView === 'overview') { if (data.name === 'Return') { setPieView('breakdown'); setTransactionFilter({ mode: 'STATUS', value: 'R' }); } else if (data.name === 'Pass') { setTransactionFilter({ mode: 'STATUS', value: 'A' }); } } else if (data.code) setTransactionFilter({ mode: 'CODE', value: data.code });
        setShowInsightDetails(true);
    };
    const resetInsightFilter = () => { setTransactionFilter({ mode: 'ALL', value: null }); if (pieView === 'breakdown') setPieView('overview'); };

    const baseContextData = useMemo(() => { 
        const res = []; const rawMin = minAmt ? parseFloat(minAmt.replace(/,/g, '')) : -Infinity, rawMax = maxAmt ? parseFloat(maxAmt.replace(/,/g, '')) : Infinity; 
        sheetsData.forEach(s => { 
            let shouldIncludeSheet = true;
            if (viewType === 'monthly' || viewType === 'quarterly') {
                shouldIncludeSheet = selectedSheetNames.includes(s.name);
            }
            if (shouldIncludeSheet) {
                s.data?.forEach(i => { 
                    if (i.amount < rawMin || i.amount > rawMax) return;
                    if (viewType === 'custom' && customDateStart && customDateEnd) {
                        const m = i.date.substring(0, 7);
                        if (m < customDateStart || m > customDateEnd) return;
                    }
                    res.push(i); 
                }); 
            }
        }); 
        return res; 
    }, [sheetsData, selectedSheetNames, viewType, minAmt, maxAmt, customDateStart, customDateEnd]);
    
    const simulationResults = useMemo(() => {
        if (!showSimulator) return null;
        const sortedData = [...baseContextData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const accHistory = {};
        let savedAmount = 0; let savedTxns = 0;
        let lostGoodAmount = 0; let lostGoodTxns = 0;

        sortedData.forEach(txn => {
            const acc = txn.accountNo;
            if (!accHistory[acc]) accHistory[acc] = { total: 0, returns: 0 };
            const pastTotal = accHistory[acc].total;
            const pastReturns = accHistory[acc].returns;
            const pastRate = pastTotal > 0 ? (pastReturns / pastTotal) * 100 : 0;
            const wouldBeBlocked = pastReturns >= simReturnLimit && pastRate >= simRateLimit;

            if (wouldBeBlocked) {
                if (txn.status === 'R') {
                    savedAmount += txn.amount; 
                    savedTxns++;
                } else {
                    lostGoodAmount += txn.amount; 
                    lostGoodTxns++;
                }
            }
            accHistory[acc].total++;
            if (txn.status === 'R') accHistory[acc].returns++;
        });

        return { savedAmount, savedTxns, lostGoodAmount, lostGoodTxns };
    }, [baseContextData, showSimulator, simReturnLimit, simRateLimit]);

    const commonFilteredData = useMemo(() => {
        return baseContextData.filter(i => {
            if (filterDate && i.date !== filterDate) return false;
            if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
            if (selectedAccount && i.accountNo !== selectedAccount) return false;
            if (filterBusinessType !== 'ALL' && (accountMap[i.accountNo]?.businessType || 'Unclassified') !== filterBusinessType) return false;
            if (isCashierFilter) {
                if (!isCashierAccount(i.accountNo)) return false;
                const isCM = String(i.chequeNo).startsWith('8');
                if (cashierMode === 'CM' && !isCM) return false;
                if (cashierMode === 'NORMAL' && isCM) return false;
            }
            if (chequeSearch && !String(i.chequeNo).includes(chequeSearch)) return false;
            return true;
        });
    }, [baseContextData, filterDate, statusFilter, selectedAccount, isCashierFilter, cashierMode, chequeSearch, filterBusinessType, accountMap]);
    
    const globalFilteredData = useMemo(() => selectedCodes.length > 0 ? commonFilteredData.filter(i => selectedCodes.includes(i.code)) : commonFilteredData, [commonFilteredData, selectedCodes]);

    const stats = useMemo(() => { let tC=0, tA=0, rC=0, rA=0, cmC=0, cmA=0, nmC=0, nmA=0; globalFilteredData.forEach(i => { tC++; tA += i.amount; if (i.status === 'R') { rC++; rA += i.amount; } if (isCashierAccount(i.accountNo)) { if (String(i.chequeNo).startsWith('8')) { cmC++; cmA += i.amount; } else { nmC++; nmA += i.amount; } } }); return { tC, tA, rC, rA, cmC, cmA, nmC, nmA }; }, [globalFilteredData]);
    
    const prevStats = useMemo(() => { if (!sheetsData.length) return null; let pData = [], hasPrev = false; const applyFilters = (data) => { const rawMin = minAmt ? parseFloat(minAmt.replace(/,/g, '')) : -Infinity, rawMax = maxAmt ? parseFloat(maxAmt.replace(/,/g, '')) : Infinity; return data.filter(i => { if (i.amount < rawMin || i.amount > rawMax || (selectedAccount && i.accountNo !== selectedAccount) || (selectedCodes.length > 0 && !selectedCodes.includes(i.code)) || (filterBusinessType !== 'ALL' && (accountMap[i.accountNo]?.businessType || 'Unclassified') !== filterBusinessType)) return false; if (isCashierFilter) { if (!isCashierAccount(i.accountNo) || (cashierMode === 'CM' && !String(i.chequeNo).startsWith('8')) || (cashierMode === 'NORMAL' && String(i.chequeNo).startsWith('8'))) return false; } return true; }); }; if (filterDate) { const allDates = Array.from(new Set(sheetsData.flatMap(s => s.data?.map(i => i.date) || []))).sort(); const currIdx = allDates.indexOf(filterDate); if (currIdx > 0) { pData = sheetsData.flatMap(s => s.data || []).filter(i => i.date === allDates[currIdx - 1]); hasPrev = true; } } else { const currentIdx = sheetsData.findIndex(s => s.name === selectedSheetNames[0]); if (viewType === 'quarterly') { if (currentIdx >= 3) { pData = sheetsData.slice(currentIdx - 3, currentIdx).flatMap(s => s.data || []); hasPrev = pData.length > 0; } } else if (currentIdx > 0) { pData = sheetsData[currentIdx - 1].data || []; hasPrev = true; } } if (!hasPrev || pData.length === 0) return null; const fPData = applyFilters(pData); let pTC = fPData.length, pTA = fPData.reduce((s, i) => s + i.amount, 0), pRC=0, pRA=0, pCMC=0, pCMA=0, pNMC=0, pNMA=0; fPData.forEach(i => { if (i.status === 'R') { pRC++; pRA += i.amount; } if (isCashierAccount(i.accountNo)) { if (String(i.chequeNo).startsWith('8')) { pCMC++; pCMA += i.amount; } else { pNMC++; pNMA += i.amount; } } }); const cG = (c, p) => p > 0 ? ((c - p) / p * 100) : 0; return { tcG: cG(stats.tC, pTC), taG: cG(stats.tA, pTA), rcG: cG(stats.rC, pRC), raG: cG(stats.rA, pRA), cmcG: cG(stats.cmC, pCMC), cmaG: cG(stats.cmA, pCMA), nmcG: cG(stats.nmC, pNMC), nmaG: cG(stats.nmA, pNMA), valid: true }; }, [sheetsData, selectedSheetNames, stats, selectedAccount, cashierMode, filterDate, viewType, minAmt, maxAmt, selectedCodes, filterBusinessType, isCashierFilter, accountMap]);

    const closedStatsGlobal = useMemo(() => {
        const accs = new Set();
        let txns = 0;
        baseContextData.forEach(i => {
            if(i.code === '2') {
                accs.add(i.accountNo);
                txns++;
            }
        });
        return { accs: accs.size, txns };
    }, [baseContextData]);

    const autoSummaryText = useMemo(() => {
        if(stats.tC === 0) return "Ready to analyze data. Please upload a file.";
        const retRate = stats.tC > 0 ? ((stats.rC / stats.tC) * 100).toFixed(1) : "0.0";
        let text = `Analysis Complete: Processed ${fmtNum(stats.tC)} transactions totaling ฿${fmtAmtM(stats.tA)}. `;
        text += `Overall return rate is ${retRate}% (${fmtNum(stats.rC)} cheques). `;
        
        if (filterBusinessType !== 'ALL') {
            text += `Currently focused on the [${filterBusinessType}] sector. `;
        } else {
            const bMap = {};
            globalFilteredData.forEach(i => {
                const t = accountMap[i.accountNo]?.businessType || 'Unclassified';
                if(!bMap[t]) bMap[t] = 0;
                if(i.status === 'R') bMap[t]++;
            });
            const topBiz = Object.entries(bMap).sort((a,b)=>b[1]-a[1])[0];
            if(topBiz && topBiz[1] > 0) text += `Sector [${topBiz[0]}] has the highest return volume. `;
        }
        
        if(stats.rC > 0 && stats.cmC > 0) text += `Cashier accounts (CM) show ${fmtNum(stats.cmC)} returns. `;
        if(closedStatsGlobal.txns > 0) text += `Critical alert: Found ${closedStatsGlobal.txns} transactions from ${closedStatsGlobal.accs} closed accounts.`;
        
        return text;
    }, [stats, filterBusinessType, closedStatsGlobal, globalFilteredData, accountMap]);

    const sectorData = useMemo(() => {
        const map = {};
        globalFilteredData.forEach(i => {
            const t = accountMap[i.accountNo]?.businessType || 'Unclassified';
            if(!map[t]) map[t] = { name: t, value: 0, amount: 0 };
            map[t].value++;
            map[t].amount += i.amount;
        });
        return Object.values(map).sort((a,b)=>b.value - a.value);
    }, [globalFilteredData, accountMap]);

    const trendData = useMemo(() => { 
        const map = {}; let source = baseContextData; 
        if (selectedAccount) source = source.filter(i => i.accountNo === selectedAccount); 
        if (statusFilter !== 'ALL') source = source.filter(i => i.status === statusFilter); 
        if (selectedCodes.length > 0) source = source.filter(i => selectedCodes.includes(i.code)); 
        if (filterBusinessType !== 'ALL') source = source.filter(i => (accountMap[i.accountNo]?.businessType || 'Unclassified') === filterBusinessType);
        if (isCashierFilter) { source = source.filter(i => isCashierAccount(i.accountNo)); if (cashierMode === 'CM') source = source.filter(i => String(i.chequeNo).startsWith('8')); if (cashierMode === 'NORMAL') source = source.filter(i => !String(i.chequeNo).startsWith('8')); } 
        if (chequeSearch) source = source.filter(i => String(i.chequeNo).includes(chequeSearch)); 
        
        source.forEach(i => { 
            if (!i.date.includes('-')) return; const parts = i.date.split('-'), y = parts[0], m = parseInt(parts[1], 10);
            let k = i.date, label = getDisplayDate(i.date), mode = trendGroupMode === 'auto' ? (viewType === 'monthly' ? 'day' : 'month') : trendGroupMode;
            if (mode === 'month') { k = `${y}-${String(m).padStart(2, '0')}`; label = getMonthDisplay(k); } else if (mode === 'quarter') { const q = Math.ceil(m / 3); k = `${y}-Q${q}`; label = `Q${q} ${y}`; } else if (mode === 'year') { k = `${y}`; label = `${y}`; }
            if (!map[k]) map[k] = { date: k, label, count: 0, amount: 0, returnCount: 0, returnAmount: 0 }; 
            map[k].count++; map[k].amount += i.amount; if(i.status === 'R') { map[k].returnCount++; map[k].returnAmount += i.amount; } 
        }); 
        
        let result = Object.values(map).sort((a,b)=>a.date.localeCompare(b.date)).map((item, idx, arr) => { 
            if (idx === 0) return { ...item, growth: 0 }; 
            const prev = arr[idx-1]; 
            const gVal = trendMode === 'amount' ? (prev.amount > 0 ? ((item.amount - prev.amount) / prev.amount) * 100 : 0) : (prev.count > 0 ? ((item.count - prev.count) / prev.count) * 100 : 0); 
            return { ...item, growth: gVal.toFixed(2) }; 
        });
        
        if(result.length >= 3 && trendChartMode === 'trend') {
            const yValues = result.map(d => trendMode === 'amount' ? d.amount : d.count);
            const n = yValues.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            yValues.forEach((y, i) => { sumX += i; sumY += y; sumXY += i * y; sumXX += i * i; });
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            const nextX = n;
            const predictedY = Math.max(0, slope * nextX + intercept);
            
            let nextLabel = "Forecast";
            
            result.push({
                date: "FORECAST",
                label: nextLabel,
                count: trendMode === 'count' ? predictedY : 0,
                amount: trendMode === 'amount' ? predictedY : 0,
                isForecast: true
            });
        }
        return result;
    }, [baseContextData, viewType, selectedAccount, statusFilter, selectedCodes, isCashierFilter, cashierMode, trendMode, chequeSearch, trendGroupMode, filterBusinessType, accountMap, trendChartMode]);

    const sparklineData = useMemo(() => { const map = {}; let source = selectedAccount ? baseContextData.filter(i => i.accountNo === selectedAccount) : baseContextData; source.forEach(i => { const key = viewType === 'monthly' ? i.date : i.date.substring(0, 7); if (!map[key]) map[key] = { date: key, total: 0, return: 0, cm: 0, normal: 0 }; const val = trendMode === 'amount' ? i.amount : 1; map[key].total += val; if (i.status === 'R') map[key].return += val; if (isCashierAccount(i.accountNo)) { if (String(i.chequeNo).startsWith('8')) map[key].cm += val; else map[key].normal += val; } }); const sorted = Object.values(map).sort((a,b)=>a.date.localeCompare(b.date)); return { total: calculateRegression(sorted.map(d => ({ val: d.total }))), return: calculateRegression(sorted.map(d => ({ val: d.return }))), cm: calculateRegression(sorted.map(d => ({ val: d.cm }))), normal: calculateRegression(sorted.map(d => ({ val: d.normal }))) }; }, [baseContextData, viewType, selectedAccount, trendMode]);
    const trendStats = useMemo(() => { const validData = trendData.filter(d => !d.isForecast); if (!validData.length) return { min: 0, max: 0, avg: 0, days: 0, minIdx: -1, maxIdx: -1, minLabel: '', maxLabel: '' }; const values = validData.map(d => parseFloat(d[trendMode])); const min = Math.min(...values), max = Math.max(...values), sum = values.reduce((a, b) => a + b, 0); const days = validData.length; const avg = days > 0 ? sum / days : 0, minIdx = values.indexOf(min), maxIdx = values.indexOf(max); return { min, max, avg, days, minIdx, maxIdx, minLabel: minIdx >= 0 ? validData[minIdx].label : '', maxLabel: maxIdx >= 0 ? validData[maxIdx].label : '' }; }, [trendData, trendMode]);
    const heatmapMatrix = useMemo(() => { const map = {}, monthCounts = {}; let mx = 1, ty, tm, f = baseContextData; if (statusFilter !== 'ALL') f = f.filter(i => i.status === statusFilter); if (selectedAccount) f = f.filter(i => i.accountNo === selectedAccount); if (selectedCodes.length > 0) f = f.filter(i => selectedCodes.includes(i.code)); if (filterBusinessType !== 'ALL') f = f.filter(i => (accountMap[i.accountNo]?.businessType || 'Unclassified') === filterBusinessType); if (isCashierFilter) { f = f.filter(i => isCashierAccount(i.accountNo)); if (cashierMode === 'CM') f = f.filter(i => String(i.chequeNo).startsWith('8')); if (cashierMode === 'NORMAL') f = f.filter(i => !String(i.chequeNo).startsWith('8')); } f.forEach(i => { map[i.date] = (map[i.date] || 0) + 1; if (map[i.date] > mx) mx = map[i.date]; const [y, m] = i.date.split('-'); const key = `${y}-${m}`; monthCounts[key] = (monthCounts[key] || 0) + 1; }); if (Object.keys(monthCounts).length > 0) { const b = Object.keys(monthCounts).sort((a,b) => monthCounts[b] - monthCounts[a])[0].split('-'); ty = parseInt(b[0]); tm = parseInt(b[1]); } else if (baseContextData.length > 0) { const s = baseContextData[0].date.split('-'); ty = parseInt(s[0]); tm = parseInt(s[1]); } const days = []; let monthLabel = "No Data"; if (ty && tm) { monthLabel = `${MONTHS[tm-1]} ${ty}`; const sDay = new Date(ty, tm-1, 1).getDay(), tDays = new Date(ty, tm, 0).getDate(); for (let i = 0; i < sDay; i++) days.push({ empty: true }); for (let d = 1; d <= tDays; d++) { const ds = `${ty}-${String(tm).padStart(2, '0')}-${String(d).padStart(2, '0')}`; days.push({ date: ds, dayNum: d, count: map[ds] || 0 }); } } return { days, max: mx, monthLabel }; }, [baseContextData, selectedAccount, selectedCodes, isCashierFilter, cashierMode, statusFilter, filterBusinessType, accountMap]);
    
    const registryList = useMemo(() => { 
        const map = {}; 
        let f = baseContextData; 
        if (statusFilter !== 'ALL') f = f.filter(i => i.status === statusFilter); 
        if (selectedCodes.length > 0) f = f.filter(i => selectedCodes.includes(i.code)); 
        if (filterBusinessType !== 'ALL') f = f.filter(i => (accountMap[i.accountNo]?.businessType || 'Unclassified') === filterBusinessType); 
        if (isCashierFilter) { f = f.filter(i => isCashierAccount(i.accountNo)); if (cashierMode === 'CM') f = f.filter(i => String(i.chequeNo).startsWith('8')); if (cashierMode === 'NORMAL') f = f.filter(i => !String(i.chequeNo).startsWith('8')); } 
        if (filterDate) f = f.filter(i => i.date === filterDate); 
        
        f.forEach(i => { 
            if (!map[i.accountNo]) map[i.accountNo] = { acc: i.accountNo, count: 0, amount: 0, returnCount: 0, breakdown: {} }; 
            map[i.accountNo].count++; 
            map[i.accountNo].amount += i.amount; 
            if (i.status === 'R') map[i.accountNo].returnCount++;
            
            if (!map[i.accountNo].breakdown[i.code]) map[i.accountNo].breakdown[i.code] = { count: 0, amount: 0 }; 
            map[i.accountNo].breakdown[i.code].count++; 
            map[i.accountNo].breakdown[i.code].amount += i.amount; 
        }); 
        
        let arr = Object.values(map).map(item => {
            const isClosed = closedAccountSet.has(cleanAcc(item.acc));
            item.health = calculateHealthScore(item.count, item.breakdown, isClosed);
            return item;
        });
        
        if (detailSearch) arr = arr.filter(i => i.acc.includes(detailSearch) || (accountMap[i.acc]?.name || "").toLowerCase().includes(detailSearch.toLowerCase())); 
        arr.sort((a,b) => sortBy === 'amount' ? b.amount - a.amount : b.count - a.count); 
        
        const limit = parseInt(topNInput); 
        return (limit && limit > 0) ? arr.slice(0, limit) : arr; 
    }, [baseContextData, selectedCodes, isCashierFilter, cashierMode, filterDate, detailSearch, sortBy, topNInput, accountMap, statusFilter, filterBusinessType, closedAccountSet]);
    
    const dayAnalysisData = useMemo(() => { const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => ({ day: d, total: 0, return: 0, amount: 0, returnAmount: 0 })); let src = baseContextData; if (selectedAccount) src = src.filter(i => i.accountNo === selectedAccount); if (statusFilter !== 'ALL') src = src.filter(i => i.status === statusFilter); if (selectedCodes.length > 0) src = src.filter(i => selectedCodes.includes(i.code)); if (filterBusinessType !== 'ALL') src = src.filter(i => (accountMap[i.accountNo]?.businessType || 'Unclassified') === filterBusinessType); if (isCashierFilter) { src = src.filter(i => isCashierAccount(i.accountNo)); if (cashierMode === 'CM') src = src.filter(i => String(i.chequeNo).startsWith('8')); if (cashierMode === 'NORMAL') src = src.filter(i => !String(i.chequeNo).startsWith('8')); } if (chequeSearch) src = src.filter(i => String(i.chequeNo).includes(chequeSearch)); src.forEach(i => { const d = new Date(i.date); if(!isNaN(d)) { const idx = d.getDay(); map[idx].total++; map[idx].amount += i.amount; if(i.status === 'R') { map[idx].return++; map[idx].returnAmount += i.amount; } } }); return map; }, [baseContextData, selectedAccount, statusFilter, selectedCodes, isCashierFilter, cashierMode, chequeSearch, filterBusinessType, accountMap]);
    const distributionData = useMemo(() => { const ranges = [{ label: '< 10k', min: 0, max: 10000 }, { label: '10k - 50k', min: 10000, max: 50000 }, { label: '50k - 100k', min: 50000, max: 100000 }, { label: '100k - 500k', min: 100000, max: 500000 }, { label: '500k - 1M', min: 500000, max: 1000000 }, { label: '> 1M', min: 1000000, max: Infinity }]; const data = ranges.map(r => ({ ...r, passCount: 0, returnCount: 0, passAmt: 0, returnAmt: 0 })); commonFilteredData.forEach(item => { const rIdx = ranges.findIndex(r => item.amount >= r.min && item.amount < r.max); if (rIdx !== -1) { if (item.status === 'R') { data[rIdx].returnCount++; data[rIdx].returnAmt += item.amount; } else { data[rIdx].passCount++; data[rIdx].passAmt += item.amount; } } }); return data; }, [commonFilteredData]);
    
    const insightStats = useMemo(() => { 
        if (!insightSearchTerm || !accountIndex[cleanAcc(insightSearchTerm)]) return null; 
        const data = accountIndex[cleanAcc(insightSearchTerm)]; 
        let c=0, a=0, r=0, p=0, m={}, rc={}; 
        const fTxns = data.filter(t => { if (transactionFilter.mode === 'ALL') return true; if (transactionFilter.mode === 'STATUS') return t.status === transactionFilter.value; if (transactionFilter.mode === 'CODE') return t.code === transactionFilter.value; if (transactionFilter.mode === 'MONTH') return t.date.startsWith(transactionFilter.value); return true; }); 
        let sCodeInfo = null; 
        if (transactionFilter.mode === 'CODE') { const codeTxns = data.filter(t => t.code === transactionFilter.value); sCodeInfo = { code: transactionFilter.value, count: codeTxns.length, amount: codeTxns.reduce((s, t) => s + t.amount, 0) }; } 
        data.forEach(i => { c++; a += i.amount; if (i.status === 'R') { r++; if(!rc[i.code]) rc[i.code] = {count: 0, val: 0}; rc[i.code].count++; rc[i.code].val += i.amount; } else p++; const k = i.date?.substring(0, 7); if (k) { if (!m[k]) m[k] = { month: k, pass: 0, return: 0 }; if (i.status === 'R') m[k].return++; else m[k].pass++; } }); 
        const pieData = pieView === 'overview' ? [ { name: 'Pass', value: p, fill: THEME_GREEN }, { name: 'Return', value: r, fill: THEME_RED } ] : Object.entries(rc).map(([k,v])=>({name:`Code ${k}`, value:v.count, amount:v.val, code:k})); 
        
        const isClosed = closedAccountSet.has(cleanAcc(insightSearchTerm));
        const health = calculateHealthScore(c, rc, isClosed);
        
        return { accNo: insightSearchTerm, accName: accountMap[insightSearchTerm]?.name || 'Unknown Owners', count: c, amount: a, rCount: r, passCount: p, pieData, isClosed, health, selectedCodeInfo: sCodeInfo, returnCodes: Object.entries(rc).map(([k,v])=>({name:`Code ${k}`, value:v.count, amount:v.val, code:k})), monthlyData: Object.values(m).sort((x,y)=>y.month.localeCompare(x.month)).map(x=>({...x, displayMonth: getMonthDisplay(x.month)})), transactions: fTxns.sort((x,y)=>new Date(y.date)-new Date(x.date)) }; 
    }, [insightSearchTerm, accountIndex, accountMap, pieView, transactionFilter, closedAccountSet]);
    
    const riskyToClosedAnalysis = useMemo(() => { const wSet = new Set(), dByM = {}; baseContextData.forEach(i => { if (i.code !== '1') return; const m = i.date.substring(0, 7); if (!dByM[m]) dByM[m] = {}; dByM[m][i.accountNo] = (dByM[m][i.accountNo] || 0) + 1; }); Object.values(dByM).forEach(mM => Object.entries(mM).sort((a,b) => b[1] - a[1]).slice(0, 20).forEach(e => wSet.add(e[0]))); const cMap = {}; let tCT = 0, tCA = 0; baseContextData.forEach(i => { if (i.code === '2') { tCT++; tCA += i.amount; if (!cMap[i.accountNo]) cMap[i.accountNo] = { count: 0, amt: 0 }; cMap[i.accountNo].count++; cMap[i.accountNo].amt += i.amount; } }); const matched = Object.keys(cMap).filter(acc => wSet.has(acc)).map(acc => ({ acc, name: accountMap[acc]?.name || 'Unknown', code2Count: cMap[acc].count, code2Amt: cMap[acc].amt, percentTxn: tCT > 0 ? (cMap[acc].count / tCT * 100) : 0, percentAmt: tCA > 0 ? (cMap[acc].amt / tCA * 100) : 0, isClosed: true })).sort((a,b) => b.code2Count - a.code2Count); const wTable = Array.from(wSet).map(acc => ({ acc, name: accountMap[acc]?.name || 'Unknown', code2Count: cMap[acc]?.count || 0, code2Amt: cMap[acc]?.amt || 0, isClosed: closedAccountSet.has(cleanAcc(acc)) || (cMap[acc]?.count || 0) > 0 })).sort((a,b) => b.code2Count - a.code2Count); return { list: matched, watchlistTable: wTable, totalRiskyCount: wSet.size, foundClosedCount: matched.length, totalClosedAccounts: Object.keys(cMap).length, totalClosedAmt: tCA }; }, [baseContextData, accountMap, closedAccountSet]);
    const closedAccList = useMemo(() => { const map = {}; baseContextData.forEach(i => { if (i.code === '2') { if (!map[i.accountNo]) map[i.accountNo] = { acc: i.accountNo, name: accountMap[i.accountNo]?.name || 'Unknown', count: 0, amt: 0 }; map[i.accountNo].count++; map[i.accountNo].amt += i.amount; } }); let arr = Object.values(map).sort((a,b) => b.count - a.count); const limit = parseInt(closedTopN); return limit > 0 ? arr.slice(0, limit) : arr; }, [baseContextData, accountMap, closedTopN]);
    const riskyList = useMemo(() => { const map = {}; baseContextData.forEach(i => { if (!map[i.accountNo]) map[i.accountNo] = { acc: i.accountNo, total: 0, ret: 0 }; map[i.accountNo].total++; if (i.status === 'R') map[i.accountNo].ret++; }); return Object.values(map).filter(a => a.total >= riskThresholdCount).map(a => ({ ...a, rate: (a.ret / a.total) * 100 })).filter(a => a.rate > riskThresholdRate).sort((a, b) => b.rate - a.rate); }, [baseContextData, riskThresholdCount, riskThresholdRate]);
    const sidebarReturnStats = useMemo(() => { const map = {}; let f = statusFilter !== 'ALL' ? commonFilteredData.filter(i => i.status === statusFilter) : commonFilteredData; f.forEach(i => { if (i.code === '0' || i.code === '00') return; if (!map[i.code]) map[i.code] = { code: i.code, count: 0, amount: 0 }; map[i.code].count++; map[i.code].amount += i.amount; }); return Object.values(map).sort((a,b) => b.count - a.count); }, [commonFilteredData, statusFilter]);
    const riskScatterData = useMemo(() => { const map = {}; commonFilteredData.forEach(i => { if (!map[i.accountNo]) map[i.accountNo] = { acc: i.accountNo, name: accountMap[i.accountNo]?.name || 'Unknown', total: 0, ret: 0, amt: 0 }; map[i.accountNo].total++; map[i.accountNo].amt += i.amount; if (i.status === 'R') map[i.accountNo].ret++; }); return Object.values(map).map(x => ({ ...x, rate: (x.ret/x.total)*100 })).filter(x => x.total >= 1); }, [commonFilteredData, accountMap]);

    const topAnalysisData = useMemo(() => {
        const source = commonFilteredData.filter(i => i.status === 'R');
        const applyTopNAndOther = (arr, n, labelKey = 'name', otherLabel = 'Other') => {
            const total = arr.reduce((s, i) => s + i.count, 0); if (total === 0) return [];
            const top = arr.slice(0, n).map(i => ({ ...i, displayCount: i.count, actualCount: i.count, percent: ((i.count / total) * 100).toFixed(1), isOther: false }));
            if (arr.length > n) { const oC = arr.slice(n).reduce((s, i) => s + i.count, 0); top.push({ [labelKey]: otherLabel, fullLabel: otherLabel, name: otherLabel, displayCount: 0, actualCount: oC, percent: ((oC / total) * 100).toFixed(1), isOther: true }); }
            return top;
        };
        const rMap = {}; source.forEach(i => { if(!rMap[i.code]) rMap[i.code] = { code: i.code, count: 0, desc: codeDescMap[i.code] || i.code }; rMap[i.code].count++; });
        const sReasons = Object.values(rMap).sort((a,b) => b.count - a.count).map(i => ({ ...i, fullLabel: `No.${i.code} ${i.desc}` }));
        const getTopAccounts = (code) => { const aM = {}; source.filter(i => i.code === code).forEach(i => { if(!aM[i.accountNo]) aM[i.accountNo] = { acc: i.accountNo, name: accountMap[i.accountNo]?.name || 'Unknown', count: 0 }; aM[i.accountNo].count++; }); return Object.values(aM).sort((a,b) => b.count - a.count); };
        const bMap = {}; source.forEach(i => { const t = accountMap[i.accountNo]?.businessType || 'Unclassified'; if(!bMap[t]) bMap[t] = { name: t, count: 0 }; bMap[t].count++; });
        return { topReasons: applyTopNAndOther(sReasons, customTopN, 'fullLabel', 'Other Reasons'), topCode1: applyTopNAndOther(getTopAccounts('1'), customTopN, 'name', 'Other Accounts'), topCode2: applyTopNAndOther(getTopAccounts('2'), customTopN, 'name', 'Other Accounts'), getCustomTopForCode: (code, n) => applyTopNAndOther(getTopAccounts(code), n, 'name', 'Other Accounts'), allCodes: Object.keys(rMap).sort(), topBiz: applyTopNAndOther(Object.values(bMap).sort((a,b) => b.count - a.count), customTopN, 'name', 'Other Sectors') };
    }, [commonFilteredData, codeDescMap, accountMap, customTopN]);

    const allDataForCompare = useMemo(() => {
        const res = [];
        for (let i = 0; i < sheetsData.length; i++) {
            const sheet = sheetsData[i];
            if (sheet.data) {
                for (let j = 0; j < sheet.data.length; j++) {
                    res.push(sheet.data[j]);
                }
            }
        }
        return res;
    }, [sheetsData]);

    const comparisonData = useMemo(() => {
        const periods = new Set(); allDataForCompare.forEach(i => { if(!i.date.includes('-')) return; const p = i.date.split('-'), y = p[0], m = parseInt(p[1], 10); if (compareMode === 'month') periods.add(`${y}-${String(m).padStart(2, '0')}`); else if (compareMode === 'quarter') periods.add(`${y}-Q${Math.ceil(m/3)}`); else if (compareMode === 'year') periods.add(`${y}`); });
        const aP = Array.from(periods).sort().reverse(), eM1 = aP.includes(compareMonth1) ? compareMonth1 : (aP[0] || ''), eM2 = aP.includes(compareMonth2) ? compareMonth2 : (aP[1] || aP[0] || '');
        const getStats = (p) => { 
            if (!p) return { count: 0, amount: 0, rCount: 0, rAmt: 0, codeMap: {}, sectorMap: {} }; 
            let c=0, a=0, rc=0, ra=0, codeMap={}, sectorMap={}; 
            allDataForCompare.filter(i => { 
                if(!i.date.includes('-')) return false; const pt = i.date.split('-'), y = pt[0], m = parseInt(pt[1], 10); 
                if (compareMode === 'month') return `${y}-${String(m).padStart(2, '0')}` === p; 
                if (compareMode === 'quarter') return `${y}-Q${Math.ceil(m/3)}` === p; 
                return `${y}` === p; 
            }).forEach(i => { 
                c++; a += i.amount; 
                if(i.status === 'R') { 
                    rc++; ra += i.amount;
                    if(!codeMap[i.code]) codeMap[i.code] = 0; codeMap[i.code]++;
                    const sector = accountMap[i.accountNo]?.businessType || 'Unclassified';
                    if(!sectorMap[sector]) sectorMap[sector] = 0; sectorMap[sector]++;
                } 
            }); 
            return { count: c, amount: a, rCount: rc, rAmt: ra, codeMap, sectorMap }; 
        };
        
        const s1 = getStats(eM1), s2 = getStats(eM2), fP = (p) => { if (!p) return ''; if (compareMode === 'month') return getMonthDisplay(p); if (compareMode === 'quarter') { const [y, q] = p.split('-'); return `${q} ${y}`; } return p; };
        
        const deltaDrivers = { codes: [], sectors: [] };
        if (eM1 && eM2) {
            const allCodes = new Set([...Object.keys(s1.codeMap), ...Object.keys(s2.codeMap)]);
            allCodes.forEach(code => {
                const diff = (s1.codeMap[code] || 0) - (s2.codeMap[code] || 0);
                if(diff !== 0) deltaDrivers.codes.push({ name: `Code ${code}`, diff, desc: codeDescMap[code] });
            });
            const allSectors = new Set([...Object.keys(s1.sectorMap), ...Object.keys(s2.sectorMap)]);
            allSectors.forEach(sector => {
                const diff = (s1.sectorMap[sector] || 0) - (s2.sectorMap[sector] || 0);
                if(diff !== 0) deltaDrivers.sectors.push({ name: sector, diff });
            });
            deltaDrivers.codes.sort((a,b) => b.diff - a.diff);
            deltaDrivers.sectors.sort((a,b) => b.diff - a.diff);
        }

        let insightText = "";
        let insightColor = "text-slate-500";
        if (eM1 && eM2) {
            const diff = s1.rCount - s2.rCount; 
            if (diff < 0) {
                const drops = deltaDrivers.codes.filter(d => d.diff < 0).sort((a,b) => a.diff - b.diff);
                insightText = `✅ ข่าวดี! ยอดเช็คคืนลดลง ${Math.abs(diff)} ใบ `;
                if (drops.length > 0) insightText += `ปัจจัยหลักมาจาก "${drops[0].desc}" (Code ${drops[0].name.replace('Code ','')}) ที่ลดลง ${Math.abs(drops[0].diff)} ใบ`;
                insightColor = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50";
            } else if (diff > 0) {
                const rises = deltaDrivers.codes.filter(d => d.diff > 0).sort((a,b) => b.diff - a.diff);
                insightText = `⚠️ ระวัง! ยอดเช็คคืนเพิ่มขึ้น ${diff} ใบ `;
                if (rises.length > 0) insightText += `สาเหตุหลักมาจาก "${rises[0].desc}" (Code ${rises[0].name.replace('Code ','')}) ที่เพิ่มขึ้น ${rises[0].diff} ใบ`;
                insightColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
            } else {
                insightText = `ยอดเช็คคืนไม่มีการเปลี่ยนแปลงเมื่อเทียบกับฐานอ้างอิง`;
                insightColor = "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
            }
        }

        return { months: aP, effectiveM1: eM1, effectiveM2: eM2, m1Stats: s1, m2Stats: s2, deltaDrivers, insightText, insightColor, chartData: [{ name: 'Total Txns', m1: s1.count, m2: s2.count }, { name: 'Return Txns', m1: s1.rCount, m2: s2.rCount }], formatPeriod: fP };
    }, [allDataForCompare, compareMonth1, compareMonth2, compareMode, accountMap, codeDescMap]);
    
    const accountComparisonData = useMemo(() => {
        if (!comparisonData || !comparisonData.effectiveM1 || !comparisonData.effectiveM2) return null;
        const periodCurrent = comparisonData.effectiveM1;
        const periodPast = comparisonData.effectiveM2;

        const dataCurrent = {};
        const dataPast = {};

        allDataForCompare.forEach(i => {
             if(!i.date.includes('-')) return;
             const pt = i.date.split('-');
             const y = pt[0], m = parseInt(pt[1], 10);
             let p = '';
             if (compareMode === 'month') p = `${y}-${String(m).padStart(2, '0')}`;
             else if (compareMode === 'quarter') p = `${y}-Q${Math.ceil(m/3)}`;
             else p = `${y}`;

             if (p === periodCurrent) {
                 if (!dataCurrent[i.accountNo]) dataCurrent[i.accountNo] = true;
             }
             if (p === periodPast) {
                 if (!dataPast[i.accountNo]) dataPast[i.accountNo] = { count: 0, amount: 0, passCount: 0, passAmount: 0, returnCount: 0, returnAmount: 0 };
                 dataPast[i.accountNo].count++;
                 dataPast[i.accountNo].amount += i.amount;
                 if (i.status === 'R') {
                     dataPast[i.accountNo].returnCount++;
                     dataPast[i.accountNo].returnAmount += i.amount;
                 } else {
                     dataPast[i.accountNo].passCount++;
                     dataPast[i.accountNo].passAmount += i.amount;
                 }
             }
        });

        const lostAccounts = [];

        for (const acc in dataPast) {
            if (!dataCurrent[acc]) {
                lostAccounts.push({
                    acc,
                    name: accountMap[acc]?.name || 'Unknown',
                    count: dataPast[acc].count,
                    amount: dataPast[acc].amount,
                    passCount: dataPast[acc].passCount,
                    passAmount: dataPast[acc].passAmount,
                    returnCount: dataPast[acc].returnCount,
                    returnAmount: dataPast[acc].returnAmount
                });
            }
        }

        return { lostAccounts, periodCurrent, periodPast };

    }, [allDataForCompare, comparisonData, compareMode, accountMap]);

    const execReportData = useMemo(() => {
        if (!baseContextData.length) return null;
        
        const totalAmount = stats.tA;
        const totalCount = stats.tC;
        const returnAmount = stats.rA;
        const returnCount = stats.rC;
        const returnRatePct = totalCount > 0 ? (returnCount / totalCount) * 100 : 0;
        
        const sectorMap = {};
        globalFilteredData.forEach(i => {
            if (i.status === 'R') {
                const t = accountMap[i.accountNo]?.businessType || 'Unclassified';
                if(!sectorMap[t]) sectorMap[t] = { name: t, amount: 0, count: 0 };
                sectorMap[t].amount += i.amount;
                sectorMap[t].count++;
            }
        });
        const topSectors = Object.values(sectorMap).sort((a,b) => b.amount - a.amount).slice(0, 3);
        
        const reasonMap = {};
        globalFilteredData.forEach(i => {
            if (i.status === 'R') {
                if(!reasonMap[i.code]) reasonMap[i.code] = { code: i.code, desc: codeDescMap[i.code] || 'Unknown', amount: 0, count: 0 };
                reasonMap[i.code].amount += i.amount;
                reasonMap[i.code].count++;
            }
        });
        const topReasons = Object.values(reasonMap).sort((a,b) => b.amount - a.amount).slice(0, 5);
        
        const accMap = {};
        globalFilteredData.forEach(i => {
            if (i.status === 'R') {
                if(!accMap[i.accountNo]) accMap[i.accountNo] = { acc: i.accountNo, name: accountMap[i.accountNo]?.name || 'Unknown', amount: 0, count: 0 };
                accMap[i.accountNo].amount += i.amount;
                accMap[i.accountNo].count++;
            }
        });
        const topAccounts = Object.values(accMap).sort((a,b) => b.amount - a.amount).slice(0, 5);
        
        const trendM = {};
        baseContextData.forEach(i => {
             if(!i.date.includes('-')) return;
             const pt = i.date.split('-');
             const k = `${pt[0]}-${pt[1]}`;
             if (!trendM[k]) trendM[k] = { label: getMonthDisplay(k), k, returnAmount: 0 };
             if (i.status === 'R') trendM[k].returnAmount += i.amount;
        });
        const trendDataArray = Object.values(trendM).sort((a,b) => a.k.localeCompare(b.k)).slice(-6);

        return {
            period: getExportPeriod(),
            totalAmount, totalCount, returnAmount, returnCount, returnRatePct,
            topSectors, topReasons, topAccounts, trendDataArray
        };

    }, [baseContextData, globalFilteredData, stats, accountMap, codeDescMap]);

    return (
        <div className="flex flex-col min-h-screen pb-10 font-sans" ref={fullPageRef}>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .xlsb, .csv" />
            <MessageModal isOpen={modalState.isOpen} title={modalState.title} message={modalState.message} onClose={closeModal} />

            {sheetsData.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 text-white px-6 py-2 text-xs font-bold flex justify-between items-center hide-on-export shadow-inner">
                    <div className="flex items-center gap-2">
                        <Icon name="Sparkles" size={14} className="text-yellow-300 animate-pulse" />
                        <span className="tracking-wide">{autoSummaryText}</span>
                    </div>
                </div>
            )}

            {sheetsData.length === 0 && !isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFileUpload({ target: { files: e.dataTransfer.files } }); }}>
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-2xl text-center border-4 border-dashed border-indigo-100 dark:border-slate-700 max-w-2xl w-full mx-4 animate-in">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Icon name="UploadCloud" size={48} className="text-indigo-600 dark:text-indigo-400" /></div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 uppercase">DCO Cheque Monitoring</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Drag & Drop your Excel files here (.xlsb, .xlsx, .xls)</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg">Browse Files</button>
                        </div>
                    </div>
                </div>
            )}
            
            <nav className="glass-header text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 shadow-lg gap-4 font-bold hide-on-export">
                <div className="flex items-center gap-4">
                    <div className="bg-accent p-2.5 rounded-xl shadow-lg"><Icon name="Layers" size={24} /></div>
                    <div><h1 className="text-xl font-black uppercase">DCO Monitoring</h1><p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">NIC Cheque Management</p></div>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-slate-800/80 rounded-xl p-1 border border-slate-700/50 items-center">
                        <button onClick={handlePrevRange} className="p-2 hover:text-accent font-bold"><Icon name="ChevronLeft" /></button>
                        <span className="px-4 text-xs font-bold text-accent min-w-[100px] text-center uppercase">{viewType==='yearly'?'ALL':(viewType==='quarterly'?`QUARTER ${currentQuarterIndex+1}`:selectedSheetNames[0] || "No Data")}</span>
                        <button onClick={handleNextRange} className="p-2 hover:text-accent font-bold"><Icon name="ChevronRight" /></button>
                    </div>
                    <div className="flex bg-slate-800/80 p-1 rounded-xl gap-1">
                        <button onClick={() => { startTransition(() => { setViewType('monthly'); setFilterDate(''); }); }} className={`px-4 py-1.5 text-[10px] rounded-lg transition-all ${viewType==='monthly'?'bg-accent text-white shadow-lg':'text-slate-400'}`}>Monthly</button>
                        <button onClick={() => startTransition(() => selectQuarter(currentQuarterIndex))} className={`px-4 py-1.5 text-[10px] rounded-lg transition-all ${viewType==='quarterly'?'bg-accent text-white shadow-lg':'text-slate-400'}`}>Quarterly</button>
                        <button onClick={() => { startTransition(() => { setViewType('yearly'); setFilterDate(''); }); }} className={`px-4 py-1.5 text-[10px] rounded-lg transition-all ${viewType==='yearly'?'bg-accent text-white shadow-lg':'text-slate-400'}`}>Yearly</button>
                        <button onClick={() => { startTransition(() => { setViewType('custom'); setFilterDate(''); setShowFilterBar(true); }); }} className={`px-4 py-1.5 text-[10px] rounded-lg transition-all flex items-center gap-1 ${viewType==='custom'?'bg-purple-600 text-white shadow-lg':'text-slate-400 hover:text-white'}`}>Range</button>
                    </div>
                    
                    <button onClick={() => setShowFilterBar(!showFilterBar)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showFilterBar?'bg-accent text-white shadow-lg':'bg-slate-700'}`}><Icon name="Filter" size={14} /> Filter</button>
                    
                    <button onClick={() => setShowSimulator(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer transition-transform hover:scale-105 border border-indigo-400">
                        <Icon name="Sliders" size={14} /> 🎛️ จำลองนโยบาย
                    </button>
                    
                    <button onClick={() => { if(selectedAccount) { setInsightSearchTerm(selectedAccount); setShowInsightModal(true); } else showModal("Selection Required", "กรุณาเลือกบัญชีที่ต้องการตรวจสอบจากตารางด้านล่างก่อน"); }} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-white shadow-lg"><Icon name="Crosshair" size={14} /> Insight</button>
                    <button onClick={() => setShowTopAnalysis(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"><Icon name="Activity" size={14} /> Top Rank</button>
                    
                    <button onClick={() => setShowExecReport(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-xs font-black shadow-lg cursor-pointer transition-transform hover:scale-105 border border-amber-300">
                        <Icon name="Award" size={16} /> รายงานผู้บริหาร
                    </button>
                    
                    <button onClick={() => setShowClosedAnalysis(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer">
                        <Icon name="Lock" size={14} /> 
                        Closed <span className="bg-red-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{fmtNum(closedStatsGlobal.accs)} Accs | {fmtNum(closedStatsGlobal.txns)} Txns</span>
                    </button>
                    
                    <button onClick={() => setShowComparisonModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"><Icon name="GitCompare" size={14} /> Compare</button>
                    
                    <div className="h-8 w-px bg-slate-700 mx-1"></div>
                    
                    <button onClick={() => setShowDistModal(true)} className="p-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 shadow-md transition-all" title="Distribution Analysis"><Icon name="BarChart2" size={20} /></button>
                    <button onClick={toggleDarkMode} className="p-2.5 bg-slate-800 text-yellow-400 rounded-xl hover:bg-slate-700 shadow-md transition-all" title="Toggle Dark Mode"><Icon name={darkMode ? "Sun" : "Moon"} size={20} /></button>
                    <button onClick={() => setShowHelpModal(true)} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all" title="Help / Code Glossary"><Icon name="HelpCircle" size={20} /></button>
                    <button onClick={saveDashboardAsImage} className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-md flex items-center gap-2" title="Save as Image"><Icon name="Download" size={20} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-700 rounded-xl hover:bg-slate-600 transition-all shadow-md" title="Upload New File"><Icon name="UploadCloud" size={20} /></button>
                    <button onClick={clearSavedData} className="p-2.5 bg-red-900/50 text-red-400 rounded-xl hover:bg-red-700 hover:text-white transition-all shadow-md" title="Clear Local Data"><Icon name="Trash2" size={20} /></button>
                </div>
            </nav>

            {showFilterBar && (
                <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-6 py-3 flex gap-6 items-center shadow-inner animate-in slide-in-from-top duration-300 font-sans hide-on-export flex-wrap">
                    {viewType === 'custom' && (
                        <Fragment>
                            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                                <Icon name="Calendar" size={14} className="text-purple-600" />
                                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest mr-1">Period:</span>
                                <input type="month" className="filter-input font-bold !w-auto text-xs py-1" value={customDateStart} onChange={(e) => setCustomDateStart(e.target.value)} />
                                <span className="text-purple-400 font-bold px-1">to</span>
                                <input type="month" className="filter-input font-bold !w-auto text-xs py-1" value={customDateEnd} onChange={(e) => setCustomDateEnd(e.target.value)} />
                            </div>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
                        </Fragment>
                    )}

                    <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Filter (฿)</span><input type="text" placeholder="Min Amount" className="filter-input font-bold" value={minAmt} onChange={handleMinChange} /><span className="text-slate-300 font-bold">to</span><input type="text" placeholder="Max Amount" className="filter-input font-bold" value={maxAmt} onChange={handleMaxChange} /></div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Type</span>
                        <select className="filter-input font-bold" value={filterBusinessType} onChange={(e) => setFilterBusinessType(e.target.value)}><option value="ALL">All Business Types</option><option value="Unclassified">Unclassified</option>{availableBusinessTypes.map((type, idx) => <option key={idx} value={type}>{type}</option>)}</select>
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
                    <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Cheque</span><div className="relative"><input type="text" placeholder="Enter Cheque No..." className="filter-input font-bold pl-8 w-40 transition-all focus:w-64" value={chequeSearch} onChange={(e) => setChequeSearch(e.target.value)} /><div className="absolute left-2.5 top-1.5 text-slate-400"><Icon name="Crosshair" size={14}/></div></div></div>
                    <div className="flex-grow"></div>
                    <button onClick={() => { startTransition(() => { setMinAmt(''); setMaxAmt(''); setChequeSearch(''); setFilterBusinessType('ALL'); }); }} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear Filters</button>
                </div>
            )}

            {sheetsData.length > 0 && (
                <div className="p-6 space-y-6 flex-grow font-bold">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="grid grid-cols-2 gap-4 lg:w-1/2 min-w-[300px]">
                            <StatCard title={selectedAccount ? "Selected Balance" : "Total Balance"} count={stats.tC} amount={stats.tA} growthCount={prevStats?.tcG} growthAmount={prevStats?.taG} sparkData={sparklineData.total} color="slate" icon="Layers" onClick={() => {}} isActive={false} isFilter={selectedAccount} />
                            <StatCard title="Return Volume" count={stats.rC} amount={stats.rA} growthCount={prevStats?.rcG} growthAmount={prevStats?.raG} sparkData={sparklineData.return} color="red" icon="AlertTriangle" onClick={() => { startTransition(() => { if(statusFilter==='R') setStatusFilter('ALL'); else { setStatusFilter('R'); setIsCashierFilter(false); setLeftPanelTab('reasons'); } }); }} isActive={statusFilter === 'R'} />
                            <StatCard title="Cashier (CM)" count={stats.cmC} amount={stats.cmA} growthCount={prevStats?.cmcG} growthAmount={prevStats?.cmaG} sparkData={sparklineData.cm} color="purple" icon="Briefcase" onClick={() => { startTransition(() => { if (isCashierFilter && cashierMode === 'CM') { setIsCashierFilter(false); setCashierMode('ALL'); } else { setIsCashierFilter(true); setCashierMode('CM'); setStatusFilter('ALL'); } }); }} isActive={isCashierFilter && cashierMode === 'CM'} />
                            <StatCard title="Cashier (Normal)" count={stats.nmC} amount={stats.nmA} growthCount={prevStats?.nmcG} growthAmount={prevStats?.nmaG} sparkData={sparklineData.normal} color="blue" icon="Briefcase" onClick={() => { startTransition(() => { if (isCashierFilter && cashierMode === 'NORMAL') { setIsCashierFilter(false); setCashierMode('ALL'); } else { setIsCashierFilter(true); setCashierMode('NORMAL'); setStatusFilter('ALL'); } }); }} isActive={isCashierFilter && cashierMode === 'NORMAL'} />
                        </div>
                        
                        <div className="card-base p-6 lg:w-1/2 flex flex-col justify-center h-full">
                            <div className="text-center border-b dark:border-slate-700 pb-4 mb-4 uppercase"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Intensity Matrix</h3><p className="text-[10px] text-accent font-black tracking-widest mt-1">{heatmapMatrix.monthLabel}</p></div>
                            <div className="grid grid-cols-7 gap-3 mb-2 text-center text-xs font-bold text-slate-400 uppercase"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>
                            <div className="grid grid-cols-7 gap-3">
                                {heatmapMatrix?.days?.map((d, i) => {
                                    if (d.empty) return <div key={i} className="aspect-square" />;
                                    const r = heatmapMatrix.max > 0 ? d.count / heatmapMatrix.max : 0;
                                    let bg = 'bg-slate-50 dark:bg-slate-800', tx = 'text-slate-300 dark:text-slate-600';
                                    if (d.count > 0) {
                                        if (r < 0.2) { bg = 'bg-orange-100 dark:bg-orange-900/40'; tx = 'text-orange-600 dark:text-orange-300'; }
                                        else if (r < 0.4) { bg = 'bg-orange-200 dark:bg-orange-800/60'; tx = 'text-orange-700 dark:text-orange-200'; }
                                        else if (r < 0.6) { bg = 'bg-orange-300 dark:bg-orange-700/80'; tx = 'text-orange-800 dark:text-orange-100'; }
                                        else if (r < 0.8) { bg = 'bg-orange-400 dark:bg-orange-600'; tx = 'text-white'; }
                                        else { bg = 'bg-orange-600 dark:bg-orange-500'; tx = 'text-white'; }
                                    }
                                    return <div key={i} onClick={() => startTransition(() => setFilterDate(filterDate===d.date?'':d.date))} className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all ${filterDate===d.date ? 'bg-indigo-600 text-white scale-110 shadow-lg font-black ring-4 ring-indigo-200' : bg}`} title={`${d.date}\nTxns: ${d.count}`}><span className={`text-xs font-bold ${filterDate===d.date ? 'text-white' : tx}`}>{d.dayNum}</span></div>;
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="card-base p-6 w-full relative flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name={trendChartMode === 'trend' ? "TrendingUp" : "Calendar"} className="text-accent"/> {trendChartMode === 'trend' ? "Performance Trend & Forecast" : "Day of Week Analysis"}</h3>
                                <div className="flex gap-3 text-[10px] uppercase font-bold text-slate-400 mt-1 bg-slate-50 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg self-start">
                                    <div className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-300 font-black">Min</span> <span className="text-red-600 dark:text-red-400 font-black text-xs">{trendMode==='amount' ? `฿${fmtAmtM(trendStats.min)}` : fmtNum(trendStats.min)}</span></div><div className="w-px h-3 bg-slate-300 dark:bg-slate-500"></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-300 font-black">Max</span> <span className="text-green-600 dark:text-green-400 font-black text-xs">{trendMode==='amount' ? `฿${fmtAmtM(trendStats.max)}` : fmtNum(trendStats.max)}</span></div><div className="w-px h-3 bg-slate-300 dark:bg-slate-500"></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-300 font-black">Avg</span> <span className="text-slate-800 dark:text-white font-black text-xs">{trendMode==='amount' ? `฿${fmtAmtM(trendStats.avg)}` : fmtNum(trendStats.avg)}</span></div><div className="w-px h-3 bg-slate-300 dark:bg-slate-500"></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-300 font-black">Active</span> <span className="text-slate-800 dark:text-white font-black text-xs">{trendStats.days} Days</span></div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                {trendChartMode === 'trend' && (
                                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-lg gap-1 hide-on-export">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 pl-2 uppercase">Group By:</span>
                                        <select value={trendGroupMode} onChange={(e) => startTransition(() => setTrendGroupMode(e.target.value))} className="bg-transparent text-[10px] font-bold text-indigo-600 dark:text-indigo-400 outline-none px-1 cursor-pointer"><option value="auto">Auto</option><option value="day">Daily</option><option value="month">Monthly</option><option value="quarter">Quarterly</option><option value="year">Yearly</option></select>
                                    </div>
                                )}
                                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg gap-1 hide-on-export"><button onClick={() => startTransition(() => setTrendChartMode('trend'))} className={`px-3 py-1 text-[10px] font-bold rounded-md ${trendChartMode==='trend'?'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300':'text-slate-500 dark:text-slate-400'}`}>Trend</button><button onClick={() => startTransition(() => setTrendChartMode('day'))} className={`px-3 py-1 text-[10px] font-bold rounded-md ${trendChartMode==='day'?'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300':'text-slate-500 dark:text-slate-400'}`}>Day Analysis</button></div>
                                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg gap-1 hide-on-export"><button onClick={() => startTransition(() => setTrendMode('count'))} className={`px-3 py-1 text-[10px] font-bold rounded-md ${trendMode==='count'?'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300':'text-slate-400 dark:text-slate-400'}`}>Vol</button><button onClick={() => startTransition(() => setTrendMode('amount'))} className={`px-3 py-1 text-[10px] font-bold rounded-md ${trendMode==='amount'?'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300':'text-slate-400 dark:text-slate-400'}`}>Val</button></div>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                {trendChartMode === 'trend' ? (
                                    <LineChart data={trendData} margin={{ top: 50, right: 60, left: 20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="label" tick={<CustomHighlightedTick minLabel={trendStats.minLabel} maxLabel={trendStats.maxLabel} />} interval="preserveStartEnd" height={60} />
                                        <YAxis tick={{fontSize:10, fill:'#94a3b8'}} tickFormatter={(v)=>trendMode==='amount'?fmtAmtM(v):fmtNum(v)} padding={{ top: 40 }} />
                                        <Tooltip content={<CustomGraphTooltip />} />
                                        {filterDate && <ReferenceLine x={viewType==='monthly' ? getDisplayDate(filterDate) : getMonthDisplay(filterDate)} stroke="red" strokeDasharray="3 3" label={{ value: 'Selected', position: 'top', fill: 'red', fontSize: 10 }} />}
                                        
                                        {/* แก้ไขสีกราฟเช็คคืนเป็น THEME_GREEN */}
                                        <Line type="monotone" dataKey={(d) => !d.isForecast ? d[trendMode] : null} stroke={statusFilter==='R'? THEME_GREEN : THEME_ORANGE} strokeWidth={3} dot={trendData.length > 40 ? false : {r:4, fill: '#fff'}} isAnimationActive={true}>
                                            {trendData.length <= 40 && <LabelList dataKey="growth" content={(props) => <CustomLineLabel {...props} isReturn={statusFilter === 'R'} trendData={trendData} trendMode={trendMode} />} />}
                                        </Line>
                                        
                                        <Line type="monotone" dataKey={(d) => d.isForecast || d.label === trendData[trendData.length-2]?.label ? d[trendMode] : null} stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={{r:4, fill: '#6366f1'}} isAnimationActive={true} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={dayAnalysisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="day" tick={{fontSize: 10}} />
                                        <YAxis tick={{fontSize: 10, fill:'#94a3b8'}} tickFormatter={(v)=>trendMode==='amount'?fmtAmtM(v):fmtNum(v)} />
                                        <Tooltip cursor={{fill: darkMode ? '#334155' : '#f8fafc'}} content={({ active, payload, label }) => { if (active && payload && payload.length) { const d = payload[0].payload; return ( <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 text-xs"> <div className="font-bold text-slate-700 dark:text-white mb-2 border-b dark:border-slate-600 pb-1">{label}</div> <div className="flex flex-col gap-1"> <div className="flex justify-between gap-4"><span className="text-slate-500 dark:text-slate-400">Total:</span> <span className="font-bold text-slate-800 dark:text-white">{fmtNum(d.total)} Txns</span></div> <div className="flex justify-between gap-4"><span className="text-red-500">Return:</span> <span className="font-bold text-red-600">{fmtNum(d.return)} Txns</span></div> <div className="text-[10px] text-right text-slate-400 mt-1">({((d.return/d.total)*100 || 0).toFixed(1)}% Rate)</div> </div> </div> ); } return null; }} />
                                        <Bar dataKey={trendMode === 'amount' ? 'amount' : 'total'} fill="#cbd5e1" name="Total" radius={[4,4,0,0]} />
                                        <Bar dataKey={trendMode === 'amount' ? 'returnAmount' : 'return'} fill="#ef4444" name="Return" radius={[4,4,0,0]} maxBarSize={60} ><LabelList dataKey={trendMode === 'amount' ? 'returnAmount' : 'return'} position="top" fontSize={10} fontWeight="bold" fill="#ef4444" formatter={(v) => trendMode==='amount'?fmtAmtM(v):fmtNum(v)} /></Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="card-base lg:w-1/3 flex flex-col overflow-hidden uppercase font-bold">
                            <div className="flex bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 font-bold uppercase">
                                <button onClick={() => setLeftPanelTab('reasons')} className={`flex-1 py-3 text-[10px] tracking-wider ${leftPanelTab === 'reasons' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-b-2 border-primary' : 'text-slate-400 dark:text-slate-500'}`}>Reasons</button>
                                <button onClick={() => setLeftPanelTab('sectors')} className={`flex-1 py-3 text-[10px] tracking-wider ${leftPanelTab === 'sectors' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 dark:text-slate-500'}`}>Sectors</button>
                                <button onClick={() => setLeftPanelTab('risky')} className={`flex-1 py-3 text-[10px] tracking-wider ${leftPanelTab === 'risky' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-b-2 border-red-500' : 'text-slate-400 dark:text-slate-500'}`}>Risky</button>
                            </div>
                            <div className="p-6 overflow-auto custom-scrollbar h-[450px]">
                                {leftPanelTab === 'reasons' ? sidebarReturnStats.map((item, idx) => {
                                    const percent = stats.rC > 0 ? (item.count / stats.rC * 100).toFixed(1) : "0.0";
                                    return (
                                        <div key={idx} onClick={() => startTransition(() => setSelectedCodes(selectedCodes.includes(item.code) ? [] : [item.code]))} className={`mb-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCodes.includes(item.code) ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}>
                                            <div className="flex justify-between items-center"><span className={`text-base font-black ${selectedCodes.includes(item.code)?'text-white':'text-danger'}`}>{item.code}</span><div className="text-right"><span className={`text-sm font-bold block ${selectedCodes.includes(item.code)?'text-white':'text-primary dark:text-slate-200'}`}>{fmtNum(item.count)} Txns</span><span className={`text-xs font-bold ${selectedCodes.includes(item.code)?'text-indigo-100':'text-accent'}`}>฿{fmtAmtM(item.amount)}</span></div></div>
                                            <div className={`text-[10px] mt-2 border-t pt-2 font-bold uppercase flex justify-between ${selectedCodes.includes(item.code)?'border-indigo-400 text-white':'border-slate-50 dark:border-slate-700 text-slate-400'}`}><span>{codeDescMap[item.code] || (isCodeGreen(item.code) ? "Pass" : "System Reason")}</span><span>{percent}%</span></div>
                                        </div>
                                    );
                                }) : leftPanelTab === 'sectors' ? (
                                    <Fragment>
                                        <div className="mb-3 flex justify-between items-center">
                                            <span className="text-[10px] text-slate-400 uppercase">Filter by Sector</span>
                                            {filterBusinessType !== 'ALL' && <button onClick={() => startTransition(() => setFilterBusinessType('ALL'))} className="text-[9px] text-red-500 bg-red-50 px-2 py-0.5 rounded font-bold hover:underline">Clear</button>}
                                        </div>
                                        {sectorData.map((item, idx) => {
                                            const isSelected = filterBusinessType === item.name;
                                            const percent = stats.tC > 0 ? (item.value / stats.tC * 100).toFixed(1) : 0;
                                            return (
                                                <div key={idx} onClick={() => startTransition(() => setFilterBusinessType(isSelected ? 'ALL' : item.name))} className={`mb-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}>
                                                    <div className="flex justify-between items-center mb-1"><span className={`text-xs font-black truncate max-w-[120px] ${isSelected?'text-white':'text-slate-700 dark:text-slate-200'}`}>{item.name}</span><span className={`text-xs font-bold ${isSelected?'text-indigo-100':'text-primary dark:text-slate-300'}`}>{fmtNum(item.value)} Txns</span></div>
                                                    <div className="flex justify-between items-center text-[10px] font-bold"><span className={`${isSelected?'text-indigo-200':'text-slate-400'}`}>{percent}%</span><span className={`${isSelected?'text-white':'text-indigo-600 dark:text-indigo-400'}`}>฿{fmtAmtM(item.amount)}</span></div>
                                                    <div className={`w-full h-1 mt-2 rounded-full overflow-hidden ${isSelected?'bg-indigo-700':'bg-slate-100 dark:bg-slate-700'}`}><div className={`${isSelected?'bg-white':'bg-indigo-500'} h-full rounded-full`} style={{width: `${percent}%`}}></div></div>
                                                </div>
                                            );
                                        })}
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <div className="mb-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-lg text-[10px] text-yellow-800 dark:text-yellow-200 flex items-center justify-between"><span>Criteria: Rate > 20% & Txns >= 3</span></div>
                                        {riskyList.map((item, idx) => (
                                            <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center mb-3 ${selectedAccount===item.acc?'bg-red-600 text-white border-red-700 shadow-lg':'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900'}`} onClick={() => startTransition(() => setSelectedAccount(selectedAccount===item.acc?null:item.acc))}>
                                                <div><div className="text-sm font-bold font-mono">{item.acc}</div><div className={`text-[10px] ${selectedAccount===item.acc?'text-red-100':'text-slate-500 dark:text-slate-400'}`}>{accountMap[item.acc]?.name}</div></div>
                                                <div className="text-right font-black"><span className="text-lg">{item.rate.toFixed(1)}%</span><div className={`text-[8px] uppercase ${selectedAccount===item.acc?'text-red-200':'text-red-400'} font-bold`}>Rate</div></div>
                                            </div>
                                        ))}
                                    </Fragment>
                                )}
                            </div>
                        </div>

                        <div className="card-base p-6 lg:w-2/3" ref={registryRef}>
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 font-black uppercase">
                                <h3 className="text-lg text-slate-800 dark:text-white tracking-tight"><Icon name="Briefcase"/> NIC Registry</h3>
                                <div className="flex gap-2 items-center hide-on-export">
                                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                                        <button onClick={() => startTransition(() => setSortBy('count'))} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${sortBy==='count'?'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm':'text-slate-400 dark:text-slate-400 hover:text-indigo-500'}`}>Trxn</button>
                                        <button onClick={() => startTransition(() => setSortBy('amount'))} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${sortBy==='amount'?'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm':'text-slate-400 dark:text-slate-400 hover:text-indigo-500'}`}>Amt</button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-xl px-3 py-1 text-[10px]"><span className="font-bold text-slate-400">TOP:</span><input type="number" className="w-12 bg-transparent text-sm font-bold text-center outline-none text-indigo-600 dark:text-indigo-400" value={topNInput} onChange={e => setTopNInput(e.target.value)} /></div>
                                    <input type="text" placeholder="Search..." className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase dark:text-white" value={detailSearch} onChange={e => setDetailSearch(e.target.value)} />
                                    <button onClick={exportRegistryToExcel} className="p-2 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-xl hover:bg-slate-200"><Icon name="Download" size={18}/></button>
                                </div>
                            </div>
                            <div className="overflow-auto h-[350px] custom-scrollbar">
                                <table className="w-full text-left font-bold text-[11px] border-collapse">
                                    <thead className="sticky top-0 z-10 uppercase text-slate-800 dark:text-slate-200 shadow-sm">
                                        <tr>
                                            <th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[40px] text-center text-slate-900">Rank</th>
                                            <th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[100px] text-slate-900">Account No.</th>
                                            <th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 text-slate-900">Account Name</th>
                                            <th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[120px] text-slate-900">Business Type</th>
                                            {sortBy === 'count' ? <><th className="py-3 px-2 bg-red-600 text-white border-b border-r border-red-700 w-[70px] text-center">Transactions</th><th className="py-3 px-2 bg-red-600 text-white border-b border-r border-red-700 w-[60px] text-right">%</th><th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[100px] text-right text-slate-900">Amount</th><th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[70px] text-right text-slate-900">% Amt</th></> : <><th className="py-3 px-2 bg-red-600 text-white border-b border-r border-red-700 w-[100px] text-right">Amount</th><th className="py-3 px-2 bg-red-600 text-white border-b border-r border-red-700 w-[70px] text-right">% Amt</th><th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[70px] text-center text-slate-900">Transactions</th><th className="py-3 px-2 bg-amber-400 border-b border-r border-amber-500 w-[60px] text-right text-slate-900">%</th></>}
                                            <th className="py-3 px-2 bg-amber-400 border-b border-amber-500 w-[80px] text-center text-slate-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-700 dark:text-slate-300">
                                        {registryList.map((row, idx) => {
                                            const isClosed = closedAccountSet.has(cleanAcc(row.acc));
                                            const rowClass = isClosed ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                                            const pctTxn = stats.tC > 0 ? (row.count / stats.tC * 100).toFixed(2) + '%' : '0.00%';
                                            const pctAmt = stats.tA > 0 ? (row.amount / stats.tA * 100).toFixed(2) + '%' : '0.00%';
                                            const txnCells = <><td className="py-2 px-2 text-center font-bold border-r border-slate-200 dark:border-slate-700">{fmtNum(row.count)}</td><td className="py-2 px-2 text-right font-mono border-r border-slate-200 dark:border-slate-700">{pctTxn}</td></>;
                                            const amtCells = <><td className="py-2 px-2 text-right font-mono border-r border-slate-200 dark:border-slate-700">{sortBy === 'amount' ? `฿${fmtAmtM(row.amount)}` : fmtNum(row.amount)}</td><td className="py-2 px-2 text-right font-mono border-r border-slate-200 dark:border-slate-700">{pctAmt}</td></>;
                                            return (
                                                <Fragment key={row.acc}>
                                                    <tr onClick={(e) => { e.stopPropagation(); startTransition(() => setSelectedAccount(selectedAccount === row.acc ? null : row.acc)); }} className={`border-b dark:border-slate-700 cursor-pointer transition-all ${rowClass} ${selectedAccount === row.acc ? '!bg-indigo-600 !text-white' : ''}`}>
                                                        <td className="py-2 px-2 text-center border-r border-slate-200 dark:border-slate-700">{idx + 1}</td>
                                                        <td className="py-2 px-2 font-mono border-r border-slate-200 dark:border-slate-700">{row.acc}</td>
                                                        <td className="py-2 px-2 truncate max-w-[200px] border-r border-slate-200 dark:border-slate-700">{accountMap[row.acc]?.name || 'Unknown'}</td>
                                                        <td className="py-2 px-2 truncate max-w-[120px] border-r border-slate-200 dark:border-slate-700">{accountMap[row.acc]?.businessType || '-'}</td>
                                                        {sortBy === 'count' ? <>{txnCells}{amtCells}</> : <>{amtCells}{txnCells}</>}
                                                        <td className="py-2 px-2 text-center flex justify-center items-center h-full pt-3">
                                                            {isClosed ? 
                                                                <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-black tracking-widest shadow-sm">CLOSED</span> : 
                                                                <span className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px] px-2 py-0.5 rounded font-black tracking-widest shadow-sm">ACTIVE</span>
                                                            }
                                                            <button onClick={(e) => { e.stopPropagation(); setInsightSearchTerm(row.acc); setShowInsightModal(true); }} className="text-slate-400 hover:text-indigo-500 ml-2"><Icon name="Crosshair" size={14}/></button>
                                                        </td>
                                                    </tr>
                                                    {selectedAccount === row.acc && (
                                                        <tr className="bg-slate-50 dark:bg-slate-900">
                                                            <td colSpan="9" className="p-4 border-b dark:border-slate-700">
                                                                <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                                                                    <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-700 border-b dark:border-slate-600 flex justify-between items-center text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold"><span>Breakdown details</span><button onClick={(e) => { e.stopPropagation(); setInsightSearchTerm(row.acc); setShowInsightModal(true); }} className="text-indigo-600 dark:text-indigo-400 hover:underline hide-on-export">Analysis Insight</button></div>
                                                                    <table className="w-full text-xs text-left">
                                                                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 font-bold uppercase text-[9px]"><tr><th className="py-2 px-4">Code</th><th>Description</th><th className="text-center">Txns</th><th className="text-right px-4">Value</th></tr></thead>
                                                                        <tbody>{Object.entries(row.breakdown || {}).map(([code, d], idx2) => (<tr key={idx2} className="border-b dark:border-slate-700 last:border-none uppercase text-slate-600 dark:text-slate-300"><td className={`py-2 px-4 font-bold ${isCodeGreen(code)?'text-success font-black':'text-danger'}`}>{code}</td><td>{codeDescMap[code] || (isCodeGreen(code) ? "Pass" : "System Reason")}</td><td className="text-center font-bold">{fmtNum(d.count)}</td><td className="text-right font-mono px-4">{fmtNum(d.amount)}</td></tr>))}</tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showExecReport && execReportData && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 font-sans hide-on-export overflow-y-auto" onClick={() => setShowExecReport(false)}>
                    <div id="exec-report-modal" className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-amber-400 text-slate-900 flex justify-between items-center hide-on-print">
                            <h3 className="text-xl font-black uppercase flex items-center gap-2"><Icon name="Award" /> รายงานสรุปสำหรับผู้บริหาร (Executive Summary)</h3>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="p-2 hover:bg-amber-500 rounded-lg bg-amber-300 transition-colors" title="Print"><Icon name="Printer" /></button>
                                <button onClick={() => setShowExecReport(false)} className="p-2 hover:bg-amber-500 rounded-lg bg-amber-300 transition-colors"><Icon name="X" /></button>
                            </div>
                        </div>
                        <div className="p-8 text-slate-800 dark:text-slate-200 print:text-black print:p-0">
                            <div className="border-b-2 border-amber-400 pb-4 mb-6">
                                <h1 className="text-3xl font-black uppercase text-center">Executive Summary Report</h1>
                                <p className="text-center text-slate-500 mt-2 font-bold uppercase">NIC Cheque Monitoring Dashboard</p>
                                <p className="text-center text-slate-400 text-sm mt-1">Period: <span className="font-bold">{execReportData.period}</span></p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Total Transactions</div>
                                    <div className="text-2xl font-black">{fmtNum(execReportData.totalCount)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 text-center">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Total Amount</div>
                                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">฿{fmtAmtM(execReportData.totalAmount)}</div>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
                                    <div className="text-xs text-red-500 uppercase font-bold">Return Volume</div>
                                    <div className="text-2xl font-black text-red-600 dark:text-red-400">{fmtNum(execReportData.returnCount)} <span className="text-sm font-bold text-red-500/70">({execReportData.returnRatePct.toFixed(1)}%)</span></div>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
                                    <div className="text-xs text-red-500 uppercase font-bold">Return Amount</div>
                                    <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">฿{fmtAmtM(execReportData.returnAmount)}</div>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 border-b dark:border-slate-600 pb-2">Return Trend (Last 6 Months)</h4>
                                <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={execReportData.trendDataArray}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" tick={{fontSize: 10}} />
                                            <YAxis tick={{fontSize: 10}} tickFormatter={v => fmtAmtM(v)} />
                                            <Tooltip cursor={{fill: 'transparent'}} formatter={(v) => `฿${fmtAmtFull(v)}`} />
                                            <Bar dataKey="returnAmount" fill="#EF4444" radius={[4,4,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 border-b dark:border-slate-600 pb-2">Top 3 Sectors (By Return Amt)</h4>
                                    <ul className="space-y-3">
                                        {execReportData.topSectors.map((s,i) => (
                                            <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <span className="font-bold text-sm">{i+1}. {s.name}</span>
                                                <span className="font-mono text-red-600 dark:text-red-400 font-bold">฿{fmtAmtM(s.amount)}</span>
                                            </li>
                                        ))}
                                        {execReportData.topSectors.length === 0 && <li className="text-slate-400 text-sm">No return data available.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 border-b dark:border-slate-600 pb-2">Top 5 Return Reasons</h4>
                                    <ul className="space-y-2 text-sm">
                                        {execReportData.topReasons.map((r,i) => (
                                            <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <span className="truncate max-w-[200px]" title={r.desc}><b className="text-red-500 mr-1">{r.code}</b> {r.desc}</span>
                                                <span className="font-mono text-red-600 dark:text-red-400 font-bold shrink-0">฿{fmtAmtM(r.amount)}</span>
                                            </li>
                                        ))}
                                        {execReportData.topReasons.length === 0 && <li className="text-slate-400 text-sm">No return data available.</li>}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-red-600 uppercase mb-3 border-b border-red-200 dark:border-red-900 pb-2">Top 5 Critical Accounts</h4>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-xs text-slate-600 dark:text-slate-300">
                                            <tr><th className="p-3">Account No.</th><th className="p-3">Account Name</th><th className="p-3 text-center">Return Txns</th><th className="p-3 text-right">Return Amount</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {execReportData.topAccounts.map((a,i) => (
                                                <tr key={i} className="bg-white dark:bg-slate-900">
                                                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">{a.acc}</td>
                                                    <td className="p-3 truncate max-w-[250px] font-bold">{a.name}</td>
                                                    <td className="p-3 text-center text-red-600 dark:text-red-400 font-bold">{fmtNum(a.count)}</td>
                                                    <td className="p-3 text-right font-mono text-red-600 dark:text-red-400 font-bold">฿{fmtAmtFull(a.amount)}</td>
                                                </tr>
                                            ))}
                                            {execReportData.topAccounts.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-400">No critical accounts found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showSimulator && simulationResults && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans hide-on-export" onClick={() => setShowSimulator(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase flex items-center gap-2"><Icon name="Sliders" /> ระบบจำลองนโยบาย (What-If Policy Simulator)</h3>
                                <p className="text-xs text-indigo-200 mt-1">จำลองผลลัพธ์ย้อนหลัง หากบังคับใช้เงื่อนไขระงับการรับเช็คตามประวัติ (History-based Rule)</p>
                            </div>
                            <button onClick={() => setShowSimulator(false)} className="p-2 hover:bg-indigo-700 rounded-lg bg-indigo-500"><Icon name="X" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase text-slate-700 dark:text-slate-300">จำนวนเช็คคืนสะสม (ใบ) : <span className="text-indigo-600 dark:text-indigo-400 text-lg font-black">{simReturnLimit}</span></label>
                                    <input type="range" min="1" max="10" value={simReturnLimit} onChange={e => setSimReturnLimit(parseInt(e.target.value))} className="w-full" />
                                    <div className="flex justify-between text-[10px] mt-1 text-slate-500 font-bold"><span>1</span><span>10</span></div>
                                    <p className="text-xs text-slate-400 mt-2">ระงับถ้ายอดคืนสะสมตั้งแต่ {simReturnLimit} ใบขึ้นไป</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 uppercase text-slate-700 dark:text-slate-300">อัตราการคืนเช็คสะสม (%) : <span className="text-indigo-600 dark:text-indigo-400 text-lg font-black">{simRateLimit}%</span></label>
                                    <input type="range" min="5" max="100" step="5" value={simRateLimit} onChange={e => setSimRateLimit(parseInt(e.target.value))} className="w-full" />
                                    <div className="flex justify-between text-[10px] mt-1 text-slate-500 font-bold"><span>5%</span><span>100%</span></div>
                                    <p className="text-xs text-slate-400 mt-2">และอัตราการคืนทั้งหมดในอดีตมากกว่า {simRateLimit}%</p>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                                <Icon name="Activity" size={16} className="inline mr-2" />
                                หากใช้นโยบายนี้ตลอดช่วงเวลาข้อมูลที่มี จะส่งผลกระทบต่อธุรกิจดังต่อไปนี้
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="ShieldAlert" size={100} /></div>
                                    <h4 className="text-green-700 dark:text-green-400 font-bold uppercase text-sm mb-4 flex items-center gap-2 relative z-10"><Icon name="ShieldAlert" /> ความเสียหายที่ป้องกันได้</h4>
                                    <p className="text-3xl font-black text-green-600 dark:text-green-400 mb-1 relative z-10">฿{fmtAmtFull(simulationResults.savedAmount)}</p>
                                    <p className="text-sm font-bold text-green-700/70 dark:text-green-500 relative z-10">({fmtNum(simulationResults.savedTxns)} ใบ)</p>
                                    <p className="text-xs mt-4 text-green-600/70 relative z-10">ยอดเช็คเด้ง (Return) ที่จะถูกปฏิเสธตั้งแต่แรกก่อนรับเข้าระบบ</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="AlertTriangle" size={100} /></div>
                                    <h4 className="text-red-700 dark:text-red-400 font-bold uppercase text-sm mb-4 flex items-center gap-2 relative z-10"><Icon name="AlertTriangle" /> โอกาสทางธุรกิจที่เสียไป (False Positive)</h4>
                                    <p className="text-3xl font-black text-red-600 dark:text-red-400 mb-1 relative z-10">฿{fmtAmtFull(simulationResults.lostGoodAmount)}</p>
                                    <p className="text-sm font-bold text-red-700/70 dark:text-red-500 relative z-10">({fmtNum(simulationResults.lostGoodTxns)} ใบ)</p>
                                    <p className="text-xs mt-4 text-red-600/70 relative z-10">ยอดเช็คผ่านปกติ (Pass) ที่โดนผลกระทบถูกบล็อกด้วยเงื่อนไข</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDistModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-bold uppercase hide-on-export" onClick={() => setShowDistModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-purple-600 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4"><h3 className="text-xl font-bold uppercase"><Icon name="BarChart2" className="inline mr-2"/> Amount Distribution Analysis</h3></div>
                            <div className="flex items-center gap-2">
                                <div className="flex bg-purple-700 p-1 rounded-lg">
                                    <button onClick={() => setDistFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${distFilter === 'ALL' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-200 hover:text-white'}`}>All</button>
                                    <button onClick={() => setDistFilter('PASS')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${distFilter === 'PASS' ? 'bg-white text-green-600 shadow-sm' : 'text-purple-200 hover:text-white'}`}>Pass Only</button>
                                    <button onClick={() => setDistFilter('RETURN')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${distFilter === 'RETURN' ? 'bg-white text-red-500 shadow-sm' : 'text-purple-200 hover:text-white'}`}>Return Only</button>
                                </div>
                                <div className="w-px h-6 bg-purple-500 mx-2"></div>
                                <button onClick={() => setShowDistModal(false)} className="p-2 hover:bg-purple-700 rounded-lg"><Icon name="X" /></button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900 flex-grow font-sans space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <h4 className="text-sm font-bold uppercase text-slate-700 dark:text-white mb-4">Volume Distribution (Number of Transactions)</h4>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={distributionData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                            <XAxis dataKey="label" tick={{fontSize: 10}} />
                                            <YAxis tick={{fontSize: 10}} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px'}} />
                                            <Legend />
                                            <Bar dataKey="passCount" name="Pass" stackId="a" fill="#10B981" hide={distFilter === 'RETURN'} />
                                            <Bar dataKey="returnCount" name="Return" stackId="a" fill="#EF4444" hide={distFilter === 'PASS'} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <h4 className="text-sm font-bold uppercase text-slate-700 dark:text-white mb-4">Value Distribution (Total Amount)</h4>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={distributionData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                            <XAxis dataKey="label" tick={{fontSize: 10}} />
                                            <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `฿${fmtAmtM(val)}`} />
                                            <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => `฿${fmtNum(val)}`} contentStyle={{fontSize: '12px'}} />
                                            <Legend />
                                            <Bar dataKey="passAmt" name="Pass Amount" stackId="a" fill="#34D399" hide={distFilter === 'RETURN'} />
                                            <Bar dataKey="returnAmt" name="Return Amount" stackId="a" fill="#F87171" hide={distFilter === 'PASS'} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showInsightModal && insightStats && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-bold uppercase hide-on-export" onClick={() => setShowInsightModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans" onClick={e => e.stopPropagation()} ref={insightModalRef}>
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
                                <Icon name="Activity" size={200} />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur"><Icon name="Crosshair" size={24} /></div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black uppercase tracking-wider">{insightStats.accNo}</h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase border shadow-sm ${insightStats.health.colorClass}`}>
                                            <Icon name={insightStats.health.icon} size={14} /> 
                                            Score: {insightStats.health.score !== null ? insightStats.health.score : 'N/A'} 
                                            <span className="opacity-75">({insightStats.health.label})</span>
                                        </div>
                                    </div>
                                    <p className="text-indigo-200 text-sm tracking-widest mt-1">{insightStats.accName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 relative z-10">
                                <button onClick={() => captureAndExport(insightModalRef, `Insight_${insightStats.accNo}`)} className="p-2 hover:bg-indigo-700 rounded-lg bg-indigo-800/50 transition-colors"><Icon name="Download" /></button>
                                <button onClick={() => setShowInsightModal(false)} className="p-2 hover:bg-indigo-700 rounded-lg bg-indigo-800/50 transition-colors"><Icon name="X" /></button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900 flex-grow">
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="text-xs text-slate-400 uppercase">Total Transactions</div><div className="text-2xl font-black text-slate-800 dark:text-white">{fmtNum(insightStats.count)}</div></div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="text-xs text-slate-400 uppercase">Total Amount</div><div className="text-2xl font-black text-slate-800 dark:text-white">฿{fmtAmtM(insightStats.amount)}</div></div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="text-xs text-slate-400 uppercase">Return Count</div><div className="text-2xl font-black text-red-500">{fmtNum(insightStats.rCount)}</div></div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="text-xs text-slate-400 uppercase">Return Rate</div><div className="text-2xl font-black text-red-500">{insightStats.count > 0 ? ((insightStats.rCount/insightStats.count)*100).toFixed(1) : 0}%</div></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 h-[400px] flex flex-col">
                                    <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-700 dark:text-white uppercase text-sm">Return Analysis</h4><div className="flex gap-2 text-[10px]"><button onClick={() => setPieView('overview')} className={`px-3 py-1 rounded ${pieView==='overview'?'bg-indigo-600 text-white':'bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}>Overview</button><button onClick={() => setPieView('breakdown')} className={`px-3 py-1 rounded ${pieView==='breakdown'?'bg-indigo-600 text-white':'bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}>Breakdown</button></div></div>
                                    <ResponsiveContainer><PieChart><Pie data={insightStats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2} onClick={handleInsightClick}>{insightStats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieView === 'overview' ? entry.fill : RETURN_COLORS[index % RETURN_COLORS.length]} cursor="pointer" />)}</Pie><Tooltip /><Legend onClick={handleInsightClick} wrapperStyle={{ cursor: 'pointer' }} /></PieChart></ResponsiveContainer>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 h-[400px] flex flex-col">
                                    <h4 className="font-bold text-slate-700 dark:text-white uppercase text-sm mb-4">Monthly Trend</h4>
                                    <ResponsiveContainer><BarChart data={insightStats.monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="displayMonth" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip cursor={{fill: 'transparent'}} content={({active, payload}) => active && payload && payload.length ? <div className="bg-white dark:bg-slate-800 p-2 shadow border text-xs text-slate-800 dark:text-white"><b>{payload[0].payload.displayMonth}</b><br/><span className="text-green-600">Pass: {payload[0].payload.pass}</span><br/><span className="text-red-600">Return: {payload[0].payload.return}</span></div> : null} /><Bar dataKey="pass" stackId="a" fill="#10B981" onClick={(data) => handleInsightClick({activePayload:[{payload:data}]})} /><Bar dataKey="return" stackId="a" fill="#EF4444" radius={[4,4,0,0]} onClick={(data) => handleInsightClick({activePayload:[{payload:data}]})} /></BarChart></ResponsiveContainer>
                                </div>
                            </div>
                            {showInsightDetails && (
                                <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden animate-in fade-in">
                                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex justify-between items-center"><h4 className="font-bold text-slate-700 dark:text-white uppercase text-sm flex items-center gap-2"><Icon name="ListFilter" size={16}/> Transaction Details {transactionFilter.value && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">{transactionFilter.mode}: {transactionFilter.value}</span>}</h4><button onClick={resetInsightFilter} className="text-xs text-red-500 font-bold hover:underline">Reset Filter</button></div>
                                    <div className="max-h-[300px] overflow-auto custom-scrollbar">
                                        <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
                                            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold uppercase sticky top-0">
                                                <tr><th className="py-2 px-4">Date</th><th className="px-4">Cheque No</th><th className="px-4">Code</th><th className="text-right px-4">Amount</th></tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-slate-700">
                                                {insightStats.transactions.map((t, idx) => ( 
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                                        <td className="py-2 px-4 font-mono">{t.date}</td>
                                                        <td className="px-4 font-mono font-bold">{t.chequeNo || '-'}</td>
                                                        <td className={`px-4 font-bold ${isCodeGreen(t.code)?'text-green-600':'text-red-600'}`}>{t.code} - {codeDescMap[t.code]||t.code}</td>
                                                        <td className="px-4 text-right font-mono">฿{fmtNum(t.amount)}</td>
                                                    </tr> 
                                                ))}
                                                {insightStats.transactions.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-slate-400">No transactions found for this filter.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {showComparisonModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-bold uppercase hide-on-export" onClick={() => setShowComparisonModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-teal-600 text-white flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold uppercase"><Icon name="GitCompare" className="inline mr-2"/> Comparison Analysis</h3>
                                <div className="flex gap-2"><button onClick={() => captureAndExport(comparisonRef, "ComparisonAnalysis")} className="p-2 hover:bg-teal-700 rounded-lg"><Icon name="Download" /></button><button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-teal-700 rounded-lg"><Icon name="X" /></button></div>
                            </div>
                            <div className="flex bg-teal-700 p-1 rounded-lg self-start">
                                <button onClick={() => setCompareMode('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='month'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Month</button>
                                <button onClick={() => setCompareMode('quarter')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='quarter'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Quarter</button>
                                <button onClick={() => setCompareMode('year')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='year'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Year</button>
                            </div>
                            <div className="flex bg-teal-800/50 p-1 rounded-lg self-start border border-teal-500/30">
                                <button onClick={() => setCompTab('overview')} className={`px-6 py-2 text-[10px] font-bold rounded-md transition-all ${compTab==='overview'?'bg-teal-500 text-white shadow-md':'text-teal-200 hover:text-white'}`}>Overview (ยอดรวม)</button>
                                <button onClick={() => setCompTab('churn')} className={`px-6 py-2 text-[10px] font-bold rounded-md transition-all ${compTab==='churn'?'bg-red-500 text-white shadow-md':'text-teal-200 hover:text-white'}`}>Account Drop-off (บัญชีที่หายไป)</button>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex-grow overflow-y-auto custom-scrollbar text-slate-800 dark:text-white" ref={comparisonRef}>
                            <div className="flex justify-center gap-8 mb-8 border-b dark:border-slate-700 pb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-indigo-600 dark:text-indigo-400">ฐานอ้างอิง (Base Period)</label>
                                    <select value={comparisonData.effectiveM1} onChange={(e) => setCompareMonth1(e.target.value)} className="p-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-700 text-sm font-bold min-w-[150px]"><option value="">Select Period</option>{comparisonData.months.map(m => <option key={m} value={m}>{comparisonData.formatPeriod(m)}</option>)}</select>
                                </div>
                                {/* Comparison Analysis Modal */}
                            {showComparisonModal && (
                                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-bold uppercase hide-on-export" onClick={() => setShowComparisonModal(false)}>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                                        <div className="p-6 bg-teal-600 text-white flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-bold uppercase"><Icon name="GitCompare" className="inline mr-2"/> Comparison Analysis</h3>
                                                <div className="flex gap-2"><button onClick={() => captureAndExport(comparisonRef, "ComparisonAnalysis")} className="p-2 hover:bg-teal-700 rounded-lg"><Icon name="Download" /></button><button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-teal-700 rounded-lg"><Icon name="X" /></button></div>
                                            </div>
                                            <div className="flex bg-teal-700 p-1 rounded-lg self-start">
                                                <button onClick={() => setCompareMode('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='month'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Month</button>
                                                <button onClick={() => setCompareMode('quarter')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='quarter'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Quarter</button>
                                                <button onClick={() => setCompareMode('year')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compareMode==='year'?'bg-white text-teal-700 shadow-sm':'text-teal-100 hover:text-white'}`}>By Year</button>
                                            </div>
                                            <div className="flex bg-teal-800/50 p-1 rounded-lg self-start border border-teal-500/30">
                                                <button onClick={() => setCompTab('overview')} className={`px-6 py-2 text-[10px] font-bold rounded-md transition-all ${compTab==='overview'?'bg-teal-500 text-white shadow-md':'text-teal-200 hover:text-white'}`}>Overview (ยอดรวม)</button>
                                                <button onClick={() => setCompTab('churn')} className={`px-6 py-2 text-[10px] font-bold rounded-md transition-all ${compTab==='churn'?'bg-red-500 text-white shadow-md':'text-teal-200 hover:text-white'}`}>Account Drop-off (บัญชีที่หายไป)</button>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex-grow overflow-y-auto custom-scrollbar text-slate-800 dark:text-white" ref={comparisonRef}>
                                            <div className="flex justify-center gap-8 mb-8 border-b dark:border-slate-700 pb-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-indigo-600 dark:text-indigo-400">ฐานอ้างอิง (Base Period)</label>
                                                    <select value={comparisonData.effectiveM1} onChange={(e) => setCompareMonth1(e.target.value)} className="p-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-700 text-sm font-bold min-w-[150px]"><option value="">Select Period</option>{comparisonData.months.map(m => <option key={m} value={m}>{comparisonData.formatPeriod(m)}</option>)}</select>
                                                </div>
                                                <div className="flex items-center pt-6 text-slate-300 dark:text-slate-600"><Icon name="GitCompare" size={24}/></div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-teal-600 dark:text-teal-400">เดือนที่ตรวจสอบ (Target Period)</label>
                                                    <select value={comparisonData.effectiveM2} onChange={(e) => setCompareMonth2(e.target.value)} className="p-2 rounded-lg border-2 border-teal-300 dark:border-teal-600 bg-white dark:bg-slate-700 text-sm font-bold min-w-[150px]"><option value="">Select Period</option>{comparisonData.months.map(m => <option key={m} value={m}>{comparisonData.formatPeriod(m)}</option>)}</select>
                                                </div>
                                            </div>
                                            
                                            {comparisonData.effectiveM1 && comparisonData.effectiveM2 && (
                                                <>
                                                    {/* Overview Tab */}
                                                    {compTab === 'overview' && (
                                                        <div className="animate-in fade-in space-y-6">
                                                            {/* AI Insight Text Banner */}
                                                            {comparisonData.insightText && (
                                                                <div className={`p-4 rounded-xl font-bold flex items-start gap-3 border shadow-sm ${comparisonData.insightColor}`}>
                                                                    <div className="pt-0.5"><Icon name="Activity" size={18} /></div>
                                                                    <div className="text-sm leading-relaxed">{comparisonData.insightText}</div>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="grid grid-cols-4 gap-4 text-center">
                                                                {[{ label: 'Total Volume', m1: comparisonData.m1Stats.count, m2: comparisonData.m2Stats.count, fmt: fmtNum, isGood: comparisonData.m1Stats.count >= comparisonData.m2Stats.count, diff: comparisonData.m1Stats.count - comparisonData.m2Stats.count, prefix: '' }, { label: 'Total Amount', m1: comparisonData.m1Stats.amount, m2: comparisonData.m2Stats.amount, fmt: fmtAmtM, isGood: comparisonData.m1Stats.amount >= comparisonData.m2Stats.amount, diff: comparisonData.m1Stats.amount - comparisonData.m2Stats.amount, prefix: '฿' }, { label: 'Return Volume', m1: comparisonData.m1Stats.rCount, m2: comparisonData.m2Stats.rCount, fmt: fmtNum, isGood: comparisonData.m1Stats.rCount <= comparisonData.m2Stats.rCount, diff: comparisonData.m1Stats.rCount - comparisonData.m2Stats.rCount, prefix: '', reverseCol: true }, { label: 'Return Rate (%)', m1: (comparisonData.m1Stats.rCount/comparisonData.m1Stats.count*100||0), m2: (comparisonData.m2Stats.rCount/comparisonData.m2Stats.count*100||0), fmt: v=>v.toFixed(2)+'%', noDiff: true, isGood: (comparisonData.m1Stats.rCount/comparisonData.m1Stats.count||0) <= (comparisonData.m2Stats.rCount/comparisonData.m2Stats.count||0) }].map((stat, i) => (
                                                                    <div key={i} className={`bg-white dark:bg-slate-800 p-4 rounded-xl border-t-4 shadow-sm ${stat.noDiff ? (stat.isGood ? 'border-green-500' : 'border-red-500') : (stat.diff > 0 ? (stat.reverseCol ? 'border-red-500' : 'border-green-500') : (stat.diff < 0 ? (stat.reverseCol ? 'border-green-500' : 'border-red-500') : 'border-slate-300'))}`}>
                                                                        <div className="text-xs text-slate-400 uppercase font-bold">{stat.label}</div>
                                                                        <div className="grid grid-cols-2 mt-2 gap-2 text-sm">
                                                                            <div><div className="text-indigo-400 dark:text-indigo-300 text-[10px] font-black">{comparisonData.formatPeriod(comparisonData.effectiveM1)}</div><div className={`font-bold ${stat.reverseCol ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{stat.prefix}{stat.fmt(stat.m1)}</div></div>
                                                                            <div><div className="text-teal-500 dark:text-teal-400 text-[10px] font-black">{comparisonData.formatPeriod(comparisonData.effectiveM2)}</div><div className={`font-bold ${stat.reverseCol ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{stat.prefix}{stat.fmt(stat.m2)}</div></div>
                                                                        </div>
                                                                        {!stat.noDiff && <div className={`mt-2 text-xs font-black ${stat.diff > 0 ? (stat.reverseCol ? 'text-red-500' : 'text-green-500') : (stat.diff < 0 ? (stat.reverseCol ? 'text-green-500' : 'text-red-500') : 'text-slate-400')}`}>{stat.diff > 0 ? '+' : ''}{stat.prefix}{stat.fmt(stat.diff)}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Root Cause Analysis (Delta Drivers) */}
                                                            {comparisonData.effectiveM1 && comparisonData.effectiveM2 && comparisonData.m1Stats.rCount !== comparisonData.m2Stats.rCount && (
                                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                                                    <h4 className="text-sm font-black uppercase mb-4 text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                                                                        <Icon name="Search" /> วิเคราะห์สาเหตุ (Root Cause): เช็คคืนเปลี่ยนแปลงจากอะไร?
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                        <div>
                                                                            <div className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-1">เรียงตามรหัสการคืนเช็ค (Reason Code)</div>
                                                                            <div className="space-y-2">
                                                                                {comparisonData.deltaDrivers.codes.slice(0, 4).map((driver, idx) => {
                                                                                    const isIncrease = driver.diff > 0;
                                                                                    return (
                                                                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                                                                {driver.name} <span className="text-[9px] text-slate-400 block truncate max-w-[150px]">{driver.desc}</span>
                                                                                            </div>
                                                                                            <div className={`text-sm font-black flex items-center gap-1 ${isIncrease ? 'text-red-500' : 'text-green-600'}`}>
                                                                                                {isIncrease ? 'ขึ้น' : 'ลดลง'} {Math.abs(driver.diff)} ใบ
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-indigo-200 dark:border-indigo-800 pb-1">เรียงตามกลุ่มอุตสาหกรรม (Sector)</div>
                                                                            <div className="space-y-2">
                                                                                {comparisonData.deltaDrivers.sectors.slice(0, 4).map((driver, idx) => {
                                                                                    const isIncrease = driver.diff > 0;
                                                                                    return (
                                                                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                                                                                                {driver.name}
                                                                                            </div>
                                                                                            <div className={`text-sm font-black flex items-center gap-1 ${isIncrease ? 'text-red-500' : 'text-green-600'}`}>
                                                                                                {isIncrease ? 'ขึ้น' : 'ลดลง'} {Math.abs(driver.diff)} ใบ
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 h-[300px]">
                                                                <h4 className="text-sm font-bold uppercase mb-4 text-slate-700 dark:text-slate-300">Transaction Comparison</h4>
                                                                <ResponsiveContainer>
                                                                    <BarChart data={comparisonData.chartData}>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                        <XAxis dataKey="name" tick={{fontSize:12}} />
                                                                        <YAxis tick={{fontSize:10}} />
                                                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => { if (active && payload && payload.length) { return <div className="bg-white dark:bg-slate-800 p-2 shadow border dark:border-slate-700 text-xs font-bold"><div>{payload[0].payload.name}</div><div className="text-indigo-500">{comparisonData.formatPeriod(comparisonData.effectiveM1)}: {fmtNum(payload[0].value)}</div><div className="text-teal-500">{comparisonData.formatPeriod(comparisonData.effectiveM2)}: {fmtNum(payload[1].value)}</div></div>; } return null; }} />
                                                                        <Legend />
                                                                        <Bar dataKey="m1" name={comparisonData.formatPeriod(comparisonData.effectiveM1)} fill="#6366f1" radius={[4,4,0,0]} />
                                                                        <Bar dataKey="m2" name={comparisonData.formatPeriod(comparisonData.effectiveM2)} fill="#14b8a6" radius={[4,4,0,0]} />
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Account Drop-off (Churn) Tab */}
                                                    {compTab === 'churn' && accountComparisonData && (() => {
                                                        const filteredLostAccounts = accountComparisonData.lostAccounts.filter(item => {
                                                            if (churnFilter === 'PASS') return item.passCount > 0;
                                                            if (churnFilter === 'RETURN') return item.returnCount > 0;
                                                            return true;
                                                        }).sort((a, b) => {
                                                            if (churnFilter === 'PASS') return b.passAmount - a.passAmount;
                                                            if (churnFilter === 'RETURN') return b.returnAmount - a.returnAmount;
                                                            return b.amount - a.amount;
                                                        });
                                                        
                                                        const sumCount = filteredLostAccounts.length;
                                                        const sumAmt = filteredLostAccounts.reduce((s, i) => s + i.amount, 0);
                                                        const sumPassAmt = filteredLostAccounts.reduce((s, i) => s + i.passAmount, 0);
                                                        const sumRetAmt = filteredLostAccounts.reduce((s, i) => s + i.returnAmount, 0);
                                                        const displaySumAmt = churnFilter === 'PASS' ? sumPassAmt : (churnFilter === 'RETURN' ? sumRetAmt : sumAmt);

                                                        return (
                                                        <div className="animate-in fade-in space-y-6">
                                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                                                <div className="max-w-xl">
                                                                    <h4 className="text-red-800 dark:text-red-300 font-bold uppercase text-lg flex items-center gap-2"><Icon name="UserMinus"/> Account Drop-off Summary</h4>
                                                                    <p className="text-sm text-red-700 dark:text-red-400 mt-2 font-normal leading-relaxed">
                                                                        ค้นหาบัญชีที่หายไป: แสดงรายชื่อบัญชีที่เคยมีรายการใน <span className="font-black bg-red-100 dark:bg-red-900/50 px-1 rounded">ฐานอ้างอิง ({comparisonData.formatPeriod(accountComparisonData.periodPast)})</span> แต่พอมาถึง <span className="font-black bg-red-100 dark:bg-red-900/50 px-1 rounded">เดือนที่ตรวจสอบ ({comparisonData.formatPeriod(accountComparisonData.periodCurrent)})</span> กลับไม่มีการทำรายการใดๆ เลย (ยอดหายไป 100%)
                                                                    </p>
                                                                    
                                                                    <div className="mt-4 flex gap-2 hide-on-export">
                                                                        <button onClick={() => setChurnFilter('ALL')} className={`px-4 py-2 text-[10px] uppercase font-bold rounded-lg border-2 transition-all ${churnFilter === 'ALL' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:border-red-400'}`}>ทั้งหมด (All)</button>
                                                                        <button onClick={() => setChurnFilter('PASS')} className={`px-4 py-2 text-[10px] uppercase font-bold rounded-lg border-2 transition-all ${churnFilter === 'PASS' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:border-green-400'}`}>เช็คปกติหายไป (Pass)</button>
                                                                        <button onClick={() => setChurnFilter('RETURN')} className={`px-4 py-2 text-[10px] uppercase font-bold rounded-lg border-2 transition-all ${churnFilter === 'RETURN' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:border-orange-400'}`}>เช็คคืนหายไป (Return)</button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-4 text-right bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900">
                                                                    <div className="pr-4 border-r border-slate-100 dark:border-slate-700">
                                                                        <div className="text-[10px] uppercase font-bold text-slate-400">บัญชีที่หายไป</div>
                                                                        <div className="text-xl font-black text-slate-700 dark:text-slate-200">{fmtNum(sumCount)}</div>
                                                                    </div>
                                                                    {churnFilter !== 'RETURN' && (
                                                                        <div className="pr-4 border-r border-slate-100 dark:border-slate-700">
                                                                            <div className="text-[10px] uppercase font-bold text-green-500">ยอดปกติที่หายไป (Pass)</div>
                                                                            <div className="text-xl font-black text-green-600">฿{fmtAmtM(sumPassAmt)}</div>
                                                                        </div>
                                                                    )}
                                                                    {churnFilter !== 'PASS' && (
                                                                        <div className="pr-4 border-r border-slate-100 dark:border-slate-700">
                                                                            <div className="text-[10px] uppercase font-bold text-orange-500">ยอดคืนที่หายไป (Return)</div>
                                                                            <div className="text-xl font-black text-orange-600">฿{fmtAmtM(sumRetAmt)}</div>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="text-[10px] uppercase font-bold text-red-500">รวมเงินที่สูญเสีย (฿)</div>
                                                                        <div className="text-xl font-black text-red-600">฿{fmtAmtM(displaySumAmt)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm overflow-hidden h-[450px] flex flex-col">
                                                                <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600 flex justify-between items-center">
                                                                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">List of Missing Accounts</h4>
                                                                    <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border dark:border-slate-600">Sorted by Lost Amount (Desc)</span>
                                                                </div>
                                                                <div className="overflow-auto custom-scrollbar flex-grow">
                                                                    <table className="w-full text-xs text-left uppercase text-slate-700 dark:text-slate-300">
                                                                        <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b dark:border-slate-700 sticky top-0 z-10">
                                                                            <tr>
                                                                                <th className="py-3 px-3 w-[50px] text-center">No.</th>
                                                                                <th className="py-3 px-3 w-[100px]">Account</th>
                                                                                <th className="py-3 px-3">Account Name</th>
                                                                                {churnFilter !== 'RETURN' && <th className="py-3 px-3 text-center border-l dark:border-slate-600">Pass (ปกติ)<br/><span className="text-[9px] font-normal text-slate-400">Txns / Amount</span></th>}
                                                                                {churnFilter !== 'PASS' && <th className="py-3 px-3 text-center border-l dark:border-slate-600">Return (คืน)<br/><span className="text-[9px] font-normal text-slate-400">Txns / Amount</span></th>}
                                                                                <th className="py-3 px-3 text-right border-l dark:border-slate-600">Total Lost (฿)</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-bold">
                                                                            {filteredLostAccounts.length > 0 ? filteredLostAccounts.map((item, idx) => {
                                                                                const displayAmt = churnFilter === 'PASS' ? item.passAmount : (churnFilter === 'RETURN' ? item.returnAmount : item.amount);
                                                                                return (
                                                                                <tr key={idx} className="hover:bg-red-50/50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => { setInsightSearchTerm(item.acc); setShowComparisonModal(false); setShowInsightModal(true); }}>
                                                                                    <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                                                                                    <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{item.acc}</td>
                                                                                    <td className="py-2 px-3 truncate max-w-[200px]">{item.name}</td>
                                                                                    {churnFilter !== 'RETURN' && (
                                                                                        <td className="py-2 px-3 text-center border-l dark:border-slate-700">
                                                                                            {item.passCount > 0 ? <><span className="text-green-600">{item.passCount}</span> <span className="text-slate-400 font-normal">/</span> <span className="text-green-700 font-mono">฿{fmtNum(item.passAmount)}</span></> : <span className="text-slate-300">-</span>}
                                                                                        </td>
                                                                                    )}
                                                                                    {churnFilter !== 'PASS' && (
                                                                                        <td className="py-2 px-3 text-center border-l dark:border-slate-700">
                                                                                            {item.returnCount > 0 ? <><span className="text-orange-500">{item.returnCount}</span> <span className="text-slate-400 font-normal">/</span> <span className="text-orange-600 font-mono">฿{fmtNum(item.returnAmount)}</span></> : <span className="text-slate-300">-</span>}
                                                                                        </td>
                                                                                    )}
                                                                                    <td className="py-2 px-3 text-right font-mono text-red-600 border-l dark:border-slate-700 text-sm">฿{fmtAmtFull(displayAmt)}</td>
                                                                                </tr>
                                                                            )}) : (
                                                                                <tr><td colSpan={churnFilter === 'ALL' ? "6" : "5"} className="py-12 text-center text-slate-400">ไม่มีบัญชีใดที่หายไปในช่วงเวลานี้ (No accounts dropped off).</td></tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center font-bold uppercase hide-on-export">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 w-96 max-w-[90vw] animate-in">
                                        <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <div className="w-full space-y-2 text-center">
                                            <span className="font-black text-slate-700 dark:text-white tracking-widest text-sm">{loadingMessage || "Processing Data..."}</span>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">{Math.round(uploadProgress)}% Complete</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                const rootElement = document.getElementById('root');
                if (rootElement) {
                    const root = ReactDOM.createRoot(rootElement);
                    root.render(<ErrorBoundary><App /></ErrorBoundary>);
                }
