<!DOCTYPE html>
<html lang="th" class="transition-colors duration-300">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DCO - NIC Cheque Monitoring</title>
    
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.7/Recharts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">

    <script>
        tailwind.config = { darkMode: 'class', theme: { extend: { colors: { primary: '#0F172A', accent: '#F59E0B', success: '#10B981', danger: '#EF4444', subtle: '#64748B', corp: '#8B5CF6', darkbg: '#0f172a', darkcard: '#1e293b' }, fontFamily: { sans: ['Inter', 'Sarabun', 'sans-serif'] } } } }
    </script>
    <style>
        body{font-family:'Inter','Sarabun',sans-serif;background-color:#f1f5f9;color:#1E293B;transition:background-color 0.3s,color 0.3s}.dark body{background-color:#020617;color:#f8fafc}.custom-scrollbar::-webkit-scrollbar{width:6px;height:6px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:10px}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#475569}.card-base{background:#ffffff;border:1px solid #E2E8F0;border-radius:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);transition:all 0.2s}.card-base:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}.dark .card-base{background:#1e293b;border-color:#334155;box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);color:#f1f5f9}.glass-header{background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.dark .glass-header{background:rgba(2,6,23,0.95);border-bottom:1px solid #1e293b}.filter-input{background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.25rem 0.75rem;font-size:0.875rem;width:140px;outline:none;transition:all 0.2s;font-weight:bold}.filter-input:focus{border-color:#F59E0B;box-shadow:0 0 0 2px rgba(245,158,11,0.2)}.dark .filter-input{background:#334155;border-color:#475569;color:white}.animate-in{animation:fadeIn 0.5s ease-out}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media print{body *{visibility:hidden}#exec-report-modal,#exec-report-modal *{visibility:visible}#exec-report-modal{position:absolute;left:0;top:0;width:100%;height:auto;box-shadow:none;overflow:visible;background:white;color:black}.hide-on-print{display:none !important}.dark #exec-report-modal{background:white;color:black}.dark #exec-report-modal *{color:black !important;border-color:#e2e8f0 !important}}input[type=range]{-webkit-appearance:none;background:transparent}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;border-radius:50%;background:#4f46e5;cursor:pointer;margin-top:-8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:2px solid white}input[type=range]::-webkit-slider-runnable-track{width:100%;height:6px;cursor:pointer;background:#e2e8f0;border-radius:3px}.dark input[type=range]::-webkit-slider-runnable-track{background:#334155}
    </style>
</head>
<body class="bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
    <div id="root"></div>
    
    <script type="text/babel" src="components/Constants.js"></script>
    <script type="text/babel" src="components/StatCard.js"></script>
    <script type="text/babel" src="components/Charts.js"></script>
    <script type="text/babel" src="App.js"></script>
</body>
</html>
