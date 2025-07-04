import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TutorialPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutorial</CardTitle>
        <CardDescription>
          Cara menggunakan aplikasi Manajemen Resiko, termasuk matriks analisis risiko yang digunakan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center mb-4">Matriks Analisis Risiko 5x5</h2>
          <div className="overflow-x-auto p-2">
            <table className="min-w-full border-collapse border border-black text-center text-sm">
              <tbody>
                <tr>
                  <th className="border border-black p-2 font-bold align-middle" rowSpan={2} colSpan={2}>Matriks Analisis Risiko 5x5</th>
                  <th className="border border-black p-2 font-bold" colSpan={5}>Level Dampak</th>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold">1<br/>Tidak Signifikan</th>
                  <th className="border border-black p-2 font-bold">2<br/>Kurang Signifikan</th>
                  <th className="border border-black p-2 font-bold">3<br/>Cukup Signifikan</th>
                  <th className="border border-black p-2 font-bold">4<br/>Signifikan</th>
                  <th className="border border-black p-2 font-bold">5<br/>Sangat Signifikan</th>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold align-middle" rowSpan={5}>
                    <div className="flex items-center justify-center h-full -rotate-90">
                        <span className="w-28">Level Kemungkinan</span>
                    </div>
                  </th>
                  <th className="border border-black p-2 font-bold whitespace-nowrap">5<br/>Sangat Sering Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">9</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">15</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">18</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">23</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">25</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold">4<br/>Sering Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">6</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">12</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">16</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">19</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">24</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold whitespace-nowrap">3<br/>Kadang Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">4</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">10</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">14</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">17</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">22</td>
                </tr>
                 <tr>
                  <th className="border border-black p-2 font-bold">2<br/>Jarang Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">2</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">7</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">11</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">13</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">21</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold">1<br/>Hampir Tidak Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">1</td>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">3</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">5</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">8</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">20</td>
                </tr>
              </tbody>
            </table>
             <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold">Keterangan:</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-600"></div><span>Bahaya</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Sedang</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-600"></div><span>Rendah</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-600"></div><span>Minor</span></div>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
