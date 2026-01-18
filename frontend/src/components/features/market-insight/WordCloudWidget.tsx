// 'use client';

// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
// import { Hash } from 'lucide-react';

// // Mock 워드 클라우드 데이터 - 향후 실제 데이터로 교체
// const mockWords = [
//   { text: '디지털', size: 'text-2xl', color: 'text-blue-600' },
//   { text: '혁신', size: 'text-xl', color: 'text-green-600' },
//   { text: '지속가능', size: 'text-3xl', color: 'text-purple-600' },
//   { text: '기업', size: 'text-lg', color: 'text-gray-600' },
//   { text: '환경', size: 'text-2xl', color: 'text-emerald-600' },
//   { text: '투자', size: 'text-xl', color: 'text-indigo-600' },
//   { text: '기술', size: 'text-lg', color: 'text-cyan-600' },
//   { text: '사회적', size: 'text-xl', color: 'text-pink-600' },
//   { text: '책임', size: 'text-lg', color: 'text-orange-600' },
//   { text: '미래', size: 'text-2xl', color: 'text-teal-600' },
//   { text: '성장', size: 'text-lg', color: 'text-red-600' },
//   { text: '변화', size: 'text-xl', color: 'text-violet-600' },
// ];

// export function WordCloudWidget() {
//   return (
//     <Card className="h-fit">
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center space-x-2 text-lg">
//           <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
//             <Hash className="w-4 h-4 text-blue-600" />
//           </div>
//           <span>수집된 기사 워드 클라우드</span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-0">
//         {/* 임시 워드 클라우드 - 향후 react-wordcloud 라이브러리로 교체 */}
//         <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 overflow-hidden">
//           <div className="flex flex-wrap items-center justify-center h-full gap-2">
//             {mockWords.map((word, index) => (
//               <span
//                 key={index}
//                 className={`${word.size} ${word.color} font-bold hover:opacity-75 cursor-pointer transition-opacity`}
//                 style={{
//                   transform: `rotate(${Math.random() * 30 - 15}deg)`,
//                   margin: `${Math.random() * 8}px`,
//                 }}
//               >
//                 {word.text}
//               </span>
//             ))}
//           </div>
          
//           {/* 배경 장식 */}
//           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
//         </div>
        
//         {/* 하단 정보 */}
//         <div className="mt-3 text-xs text-gray-500 text-center">
//           최근 7일간 수집된 기사에서 추출된 키워드
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
