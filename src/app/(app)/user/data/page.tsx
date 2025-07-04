import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DataPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Referensi</CardTitle>
        <CardDescription>
          Informasi mengenai matriks analisis risiko dan level kemungkinan yang digunakan dalam sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto p-2 mb-8">
            <h2 className="text-xl font-semibold text-center mb-4">Tabel Level Kemungkinan Terjadinya Risiko</h2>
            <table className="min-w-full border-collapse border border-black text-center text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="border border-black p-2 font-bold">No.</th>
                  <th className="border border-black p-2 font-bold">Frekuensi Kejadian</th>
                  <th className="border border-black p-2 font-bold">Persentase Kemungkinan Terjadinya dalam Satu Tahun</th>
                  <th className="border border-black p-2 font-bold">Jumlah Frekuensi Kemungkinan Terjadinya dalam Satu Tahun</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">1</td>
                  <td className="border border-black p-2 text-left">Hampir tidak terjadi</td>
                  <td className="border border-black p-2">X ≤ 5%</td>
                  <td className="border border-black p-2">X &lt; 2 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">2</td>
                  <td className="border border-black p-2 text-left">Jarang terjadi</td>
                  <td className="border border-black p-2">5% &lt; X ≤ 10%</td>
                  <td className="border border-black p-2">2 ≤ X ≤ 5 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">3</td>
                  <td className="border border-black p-2 text-left">Kadang terjadi</td>
                  <td className="border border-black p-2">10% &lt; X ≤ 20%</td>
                  <td className="border border-black p-2">6 ≤ X ≤ 9 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">4</td>
                  <td className="border border-black p-2 text-left">Sering terjadi</td>
                  <td className="border border-black p-2">20% &lt; X ≤ 50%</td>
                  <td className="border border-black p-2">10 ≤ X ≤ 12 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">5</td>
                  <td className="border border-black p-2 text-left">Sangat sering terjadi</td>
                  <td className="border border-black p-2">X &gt; 50%</td>
                  <td className="border border-black p-2">&gt; 12 kali</td>
                </tr>
              </tbody>
            </table>
          </div>

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
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">Sedang</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold">4<br/>Sering Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">Minor</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">Sedang</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold whitespace-nowrap">3<br/>Kadang Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">Minor</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">Sedang</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                </tr>
                 <tr>
                  <th className="border border-black p-2 font-bold">2<br/>Jarang Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">Minor</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold">1<br/>Hampir Tidak Terjadi</th>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">Minor</td>
                  <td className="border border-black p-2 font-bold bg-blue-600 text-white">Minor</td>
                  <td className="border border-black p-2 font-bold bg-green-600 text-white">Rendah</td>
                  <td className="border border-black p-2 font-bold bg-yellow-500 text-black">Sedang</td>
                  <td className="border border-black p-2 font-bold bg-red-600 text-white">Bahaya</td>
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
