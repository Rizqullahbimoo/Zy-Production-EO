<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class LaporanController extends Controller
{
    /**
     * Ambil semua baris pembayaran (DP + pelunasan) yang benar-benar cair pada
     * bulan/tahun terpilih — cash basis, per event pembayaran, bukan per
     * pesanan dibuat. Satu pesanan yang DP dan pelunasannya jatuh di bulan
     * berbeda akan muncul sebagai baris terpisah di masing-masing bulan.
     */
    private function pembayaranPeriode(string $bulan, string $tahun)
    {
        return Pembayaran::with([
            'pemesanan.paketLayanan',
            'pemesanan.user',
            'penawaranCustom.requestCustomPaket.user',
            'penawaranCustom.requestCustomPaket.kategoriEvent',
        ])
            ->where('status_konfirmasi', 'dikonfirmasi')
            ->whereMonth('tanggal_bayar', $bulan)
            ->whereYear('tanggal_bayar', $tahun)
            ->orderBy('tanggal_bayar')
            ->get();
    }

    private function jenisLabel(Pembayaran $p): string
    {
        return $p->jenis === 'dp' ? 'DP' : 'Pelunasan';
    }

    /**
     * Ringkasan keuangan (total pendapatan, jumlah entri pemasukan, rata-rata
     * per entri) untuk periode bulan/tahun terpilih — dipakai frontend untuk
     * menampilkan 3 kartu ringkasan di atas tombol unduh laporan.
     */
    public function ringkasan(Request $request)
    {
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));

        $pembayaran = $this->pembayaranPeriode($bulan, $tahun);

        $totalPendapatan = (float) $pembayaran->sum('jumlah_bayar');
        $jumlahTransaksi = $pembayaran->count();
        $rataRata = $jumlahTransaksi > 0 ? $totalPendapatan / $jumlahTransaksi : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_pendapatan' => $totalPendapatan,
                'jumlah_transaksi' => $jumlahTransaksi,
                'rata_rata' => $rataRata,
            ],
        ]);
    }

    public function generateLaporan(Request $request)
    {
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));

        $pembayaran = $this->pembayaranPeriode($bulan, $tahun);

        $pemesananRows = $pembayaran->filter(fn ($p) => $p->id_pemesanan !== null)->values();
        $customRows = $pembayaran->filter(fn ($p) => $p->id_penawaran !== null)->values();

        $format = $request->input('format', 'pdf');

        if ($format === 'excel') {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();

            // Set document properties
            $spreadsheet->getProperties()
                ->setCreator('ZY Production')
                ->setLastModifiedBy('ZY Production')
                ->setTitle('Laporan Keuangan ZY Production')
                ->setSubject('Laporan Keuangan')
                ->setDescription("Laporan Keuangan ZY Production Bulan {$bulan} Tahun {$tahun}");

            // Set header values
            $headers = ['Kode Transaksi', 'Tanggal Diterima', 'Nama Customer', 'Tipe', 'Paket/Event', 'Jenis', 'Jumlah Diterima (Rp)'];
            $sheet->fromArray($headers, null, 'A1');

            // Style header
            $headerStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '217346'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
            ];
            $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);

            // Add data
            $row = 2;
            $totalPendapatan = 0;
            $totalCount = 0;

            if ($pemesananRows->isEmpty() && $customRows->isEmpty()) {
                $sheet->mergeCells("A{$row}:G{$row}");
                $sheet->setCellValue("A{$row}", "Pemberitahuan: Tidak ada pembayaran yang diterima pada periode Bulan {$bulan} Tahun {$tahun}.");
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}")->getFont()->setItalic(true)->getColor()->setRGB('721c24');
                $sheet->getStyle("A{$row}:G{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('f8d7da');
                $row++;
            } else {
                foreach ($pemesananRows as $p) {
                    $sheet->setCellValue('A'.$row, $p->pemesanan->kode_pemesanan ?? '-');
                    $sheet->setCellValue('B'.$row, $p->tanggal_bayar->format('Y-m-d'));
                    $sheet->setCellValue('C'.$row, $p->pemesanan->user->nama ?? '-');
                    $sheet->setCellValue('D'.$row, 'Paket Bawaan');
                    $sheet->setCellValue('E'.$row, $p->pemesanan->paketLayanan->nama_paket ?? '-');
                    $sheet->setCellValue('F'.$row, $this->jenisLabel($p));
                    $sheet->setCellValue('G'.$row, (float) $p->jumlah_bayar);

                    $totalPendapatan += (float) $p->jumlah_bayar;
                    $totalCount++;
                    $row++;
                }

                foreach ($customRows as $p) {
                    $req = $p->penawaranCustom->requestCustomPaket ?? null;
                    $sheet->setCellValue('A'.$row, $req->kode_request ?? '-');
                    $sheet->setCellValue('B'.$row, $p->tanggal_bayar->format('Y-m-d'));
                    $sheet->setCellValue('C'.$row, $req->user->nama ?? '-');
                    $sheet->setCellValue('D'.$row, 'Custom Paket');
                    $sheet->setCellValue('E'.$row, $req->kategoriEvent->nama_kategori ?? 'Event Custom');
                    $sheet->setCellValue('F'.$row, $this->jenisLabel($p));
                    $sheet->setCellValue('G'.$row, (float) $p->jumlah_bayar);

                    $totalPendapatan += (float) $p->jumlah_bayar;
                    $totalCount++;
                    $row++;
                }

                $avgPendapatan = $totalCount > 0 ? $totalPendapatan / $totalCount : 0;

                // Empty row for spacing
                $row++;

                // Add Summary Section
                $sheet->mergeCells("A{$row}:G{$row}");
                $sheet->setCellValue("A{$row}", 'RINGKASAN KEUANGAN');
                $sheet->getStyle("A{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}:G{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('e2efda');
                $row++;

                $sheet->mergeCells("A{$row}:F{$row}");
                $sheet->setCellValue("A{$row}", 'Total Entri Pemasukan (DP + Pelunasan)');
                $sheet->setCellValue("G{$row}", $totalCount);
                $row++;

                $sheet->mergeCells("A{$row}:F{$row}");
                $sheet->setCellValue("A{$row}", 'Rata-rata per Entri Pemasukan');
                $sheet->setCellValue("G{$row}", $avgPendapatan);
                $sheet->getStyle("G{$row}")->getNumberFormat()->setFormatCode('#,##0');
                $row++;

                $sheet->mergeCells("A{$row}:F{$row}");
                $sheet->setCellValue("A{$row}", 'Total Pemasukan Bersih');
                $sheet->setCellValue("G{$row}", $totalPendapatan);
                $sheet->getStyle("G{$row}")->getNumberFormat()->setFormatCode('#,##0');

                // Style Summary rows
                $summaryStart = $row - 3;
                $summaryEnd = $row;
                $sheet->getStyle("A{$summaryStart}:G{$summaryEnd}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);
                $sheet->getStyle("A{$row}:G{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$summaryStart}:F{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }

            // Format currency column (hanya pada row data, jika ada)
            if ($totalCount > 0) {
                $dataEndRow = $row - 5;
                if ($dataEndRow >= 2) {
                    $sheet->getStyle("G2:G{$dataEndRow}")->getNumberFormat()->setFormatCode('#,##0');
                }
            }

            // Auto size columns
            foreach (range('A', 'G') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);

            $fileName = "Laporan_Keuangan_ZY_Production_{$bulan}_{$tahun}.xlsx";

            $callback = function () use ($writer) {
                $file = fopen('php://output', 'w');
                $writer->save($file);
                fclose($file);
            };

            return response()->stream($callback, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                'Cache-Control' => 'max-age=0',
            ]);
        }

        $pdf = Pdf::loadView('admin.laporan.pdf', [
            'pemesananRows' => $pemesananRows,
            'customRows' => $customRows,
            'bulan' => $bulan,
            'tahun' => $tahun,
        ]);

        return $pdf->download("Laporan_Keuangan_{$bulan}_{$tahun}.pdf");
    }
}
