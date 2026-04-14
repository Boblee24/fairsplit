// "use client";

// import type { Connector } from "wagmi";

// interface WalletConnectModalProps {
//   open: boolean;
//   connectors: readonly Connector[];
//   isPending: boolean;
//   onClose: () => void;
//   onConnect: (connector: Connector) => void;
// }

// export function WalletConnectModal({
//   open,
//   connectors,
//   isPending,
//   onClose,
//   onConnect,
// }: WalletConnectModalProps) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center">
      
//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         className="absolute inset-0 bg-black/80 backdrop-blur-md"
//       />

//       {/* Modal */}
//       <div className="relative z-10 w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col">
        
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <p className="text-xs uppercase tracking-widest text-sky-400">
//               Network: Base
//             </p>
//             <h2 className="text-2xl font-semibold text-white mt-1">
//               Connect Wallet
//             </h2>
//             <p className="text-sm text-slate-400">
//               Choose your preferred wallet
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="size-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Connector List */}
//         <div className="flex-1 overflow-y-auto space-y-3 pr-1">
//           {connectors.map((connector) => (
//             <button
//               key={connector.id}
//               onClick={() => onConnect(connector)}
//               disabled={isPending}
//               className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:border-sky-500 hover:bg-slate-800 transition disabled:opacity-50"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-semibold">
//                   {connector.name[0]}
//                 </div>
//                 <span className="text-base font-medium text-white">
//                   {connector.name}
//                 </span>
//               </div>

//               <span className="text-xs text-slate-400">
//                 {isPending ? "Connecting..." : "Connect"}
//               </span>
//             </button>
//           ))}
//         </div>

//         {/* Footer */}
//         <p className="mt-6 text-center text-xs text-slate-500">
//           By connecting, you agree to the Terms of Service.
//         </p>
//       </div>
//     </div>
//   );
// }