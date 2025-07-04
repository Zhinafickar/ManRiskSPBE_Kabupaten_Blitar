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
                  <td className="border border-black p-2">X < 2 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">2</td>
                  <td className="border border-black p-2 text-left">Jarang terjadi</td>
                  <td className="border border-black p-2">5% < X ≤ 10%</td>
                  <td className="border border-black p-2">2 ≤ X ≤ 5 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">3</td>
                  <td className="border border-black p-2 text-left">Kadang terjadi</td>
                  <td className="border border-black p-2">10% < X ≤ 20%</td>
                  <td className="border border-black p-2">6 ≤ X ≤ 9 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">4</td>
                  <td className="border border-black p-2 text-left">Sering terjadi</td>
                  <td className="border border-black p-2">20% < X ≤ 50%</td>
                  <td className="border border-black p-2">10 ≤ X ≤ 12 kali</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">5</td>
                  <td className="border border-black p-2 text-left">Sangat sering terjadi</td>
                  <td className="border border-black p-2">X > 50%</td>
                  <td className="border border-black p-2">> 12 kali</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto p-2 mb-8">
            <h2 className="text-xl font-semibold text-center mb-4">Tabel Kriteria Dampak Risiko</h2>
            <table className="min-w-full border-collapse border border-black text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="border border-black p-2 font-bold align-middle" rowSpan={2}>Area Dampak</th>
                  <th className="border border-black p-2 font-bold align-middle" rowSpan={2}></th>
                  <th className="border border-black p-2 font-bold text-center" colSpan={5}>Level Dampak</th>
                </tr>
                <tr>
                  <th className="border border-black p-2 font-bold text-center">1<br/>Tidak Signifikan</th>
                  <th className="border border-black p-2 font-bold text-center">2<br/>Kurang Signifikan</th>
                  <th className="border border-black p-2 font-bold text-center">3<br/>Cukup Signifikan</th>
                  <th className="border border-black p-2 font-bold text-center">4<br/>Signifikan</th>
                  <th className="border border-black p-2 font-bold text-center">5<br/>Sangat Signifikan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Finansial</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Kerugian 1 jt - 5 jt</td>
                  <td className="border border-black p-2 text-left">Kerugian 6 jt - 20 jt</td>
                  <td className="border border-black p-2 text-left">Kerugian 21 jt - 30 jt</td>
                  <td className="border border-black p-2 text-left">Kerugian 30 jt - 50jt</td>
                  <td className="border border-black p-2 text-left">Kerugian >50jt</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Reputasi</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Berdampak memberikan reputasi buruk bagi seorang ASN Pemkab Kukar</td>
                  <td className="border border-black p-2 text-left">Berdampak memberikan reputasi buruk bagi suatu Bidang di instansi Pemkab Kukar</td>
                  <td className="border border-black p-2 text-left">Berdampak memberikan reputasi buruk bagi suatu instansi Pemkab Kukar</td>
                  <td className="border border-black p-2 text-left">Berdampak memberikan reputasi buruk bagi beberapa instansi di Pemkab Kukar</td>
                  <td className="border border-black p-2 text-left">Berdampak memberikan reputasi buruk bagi Pemkab Kukar</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Kinerja</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Tidak berpengaruh dalam mengurangi indeks kinerja</td>
                  <td className="border border-black p-2 text-left">Kurang signifikan berpengaruh dalam mengurangi indeks kinerja</td>
                  <td className="border border-black p-2 text-left">Cukup signifikan berpengaruh dalam mengurangi indeks kinerja</td>
                  <td className="border border-black p-2 text-left">Signifikan berpengaruh dalam mengurangi indeks kinerja</td>
                  <td className="border border-black p-2 text-left">Sangat signifikan berpengaruh dalam mengurangi indeks kinerja</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Layanan Organisasi</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 10 menit namun tidak berpengaruh pada indeks kepuasan masyarakat</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 60 menit namun tidak berpengaruh pada indeks kepuasan masyarakat</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 5 jam namun tidak berpengaruh pada indeks kepuasan masyarakat</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 24 jam dan berpengaruh pada indeks kepuasan masyarakat</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 2 hari dan berpengaruh pada indeks kepuasan masyarakat</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Operasional dan Aset TIK</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 10 menit namun tidak berpengaruh pada layanan pemerintah</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 60 menit namun tidak berpengaruh pada layanan pemerintah</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 5 jam dan berpengaruh pada layanan pemerintah</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu +- 24 jam dan berpengaruh pada layanan pemerintah</td>
                  <td className="border border-black p-2 text-left">Layanan terganggu selama lebih dari 2 hari dan berpengaruh pada layanan pemerintah</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Hukum dan Regulasi</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Tidak berpengaruh dalam kepatuhan terhadap regulasi yang ada</td>
                  <td className="border border-black p-2 text-left">Kurang signifikan berpengaruh dalam kepatuhan terhadap regulasi yang ada</td>
                  <td className="border border-black p-2 text-left">Cukup signifikan berpengaruh dalam kepatuhan terhadap regulasi yang ada</td>
                  <td className="border border-black p-2 text-left">Signifikan berpengaruh dalam kepatuhan terhadap regulasi yang ada</td>
                  <td className="border border-black p-2 text-left">Sangat signifikan berpengaruh dalam kepatuhan terhadap regulasi yang ada</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-semibold align-middle text-left" rowSpan={2}>Sumber Daya Manusia</td>
                  <td className="border border-black p-2 text-left">Positif</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                  <td className="border border-black p-2 text-center">x</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">Negatif</td>
                  <td className="border border-black p-2 text-left">Tidak signifikan berdampak pada kecemasan SDM</td>
                  <td className="border border-black p-2 text-left">Berdampak pada kecemasan SDM</td>
                  <td className="border border-black p-2 text-left">Berdampak pada produktivitas SDM</td>
                  <td className="border border-black p-2 text-left">Berdampak pada kesehatan SDM</td>
                  <td className="border border-black p-2 text-left">Berdampak dapat menyebabkan penyakit kronis - meninggal dunia</td>
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
