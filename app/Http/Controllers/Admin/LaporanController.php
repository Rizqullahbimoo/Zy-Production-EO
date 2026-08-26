<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pemesanan;
use App\Models\PenawaranCustom;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class LaporanController extends Controller
{
    /**
     * Ringkasan keuangan (total pendapatan, jumlah transaksi, rata-rata per
     * transaksi) untuk periode bulan/tahun terpilih — dipakai frontend untuk
     * menampilkan 3 kartu ringkasan di atas tombol unduh laporan.
     */
    public function ringkasan(Request $request)
    {
        $bulan = $request->input('bulan', date('m'));
        $tahun = $request->input('tahun', date('Y'));

        $pemesanan = Pemesanan::whereMonth('tanggal_pemesanan', $bulan)
            ->whereYear('tanggal_pemesanan', $tahun)
            ->where('payment_status', 'paid')
            ->with('paketLayanan')
            ->get();

        $custom = PenawaranCustom::whereMonth('created_at', $bulan)
            ->whereYear('created_at', $tahun)
            ->where('payment_status', 'paid')
            ->get();

        $totalPendapatan = $pemesanan->sum(fn ($p) => $p->paketLayanan->harga ?? 0)
            + $custom->sum(fn ($c) => $c->total_penawaran ?? 0);

        $jumlahTransaksi = $pemesanan->count() + $custom->count();

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

        $pemesanan = Pemesanan::with(['user', 'paketLayanan'])
            ->whereMonth('tanggal_pemesanan', $bulan)
            ->whereYear('tanggal_pemesanan', $tahun)
            ->where('payment_status', 'paid')
            ->get();

        $custom = PenawaranCustom::with(['requestCustomPaket.user', 'requestCustomPaket.kategoriEvent'])
            ->whereMonth('created_at', $bulan)
            ->whereYear('created_at', $tahun)
            ->where('payment_status', 'paid')
            ->get();

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
            $headers = ['ID Transaksi', 'Tanggal', 'Nama Customer', 'Tipe', 'Paket/Event', 'Total Pemasukan (Rp)'];
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
            $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);

            // Add data
            $row = 2;
            $totalPendapatan = 0;
            $totalCount = 0;

            if ($pemesanan->isEmpty() && $custom->isEmpty()) {
                $sheet->mergeCells("A{$row}:F{$row}");
                $sheet->setCellValue("A{$row}", "Pemberitahuan: Tidak ada data transaksi pemesanan lunas yang ditemukan pada periode Bulan {$bulan} Tahun {$tahun}.");
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}")->getFont()->setItalic(true)->getColor()->setRGB('721c24');
                $sheet->getStyle("A{$row}:F{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('f8d7da');
                $row++;
            } else {
                foreach ($pemesanan as $p) {
                    $sheet->setCellValue('A'.$row, $p->kode_pemesanan);
                    $sheet->setCellValue('B'.$row, Carbon::parse($p->tanggal_pemesanan)->format('Y-m-d'));
                    $sheet->setCellValue('C'.$row, $p->user->name ?? '-');
                    $sheet->setCellValue('D'.$row, 'Paket Bawaan');
                    $sheet->setCellValue('E'.$row, $p->paketLayanan->nama_paket ?? '-');
                    $sheet->setCellValue('F'.$row, $p->paketLayanan->harga ?? 0);

                    $totalPendapatan += $p->paketLayanan->harga ?? 0;
                    $totalCount++;
                    $row++;
                }

                foreach ($custom as $c) {
                    $sheet->setCellValue('A'.$row, $c->requestCustomPaket->kode_request ?? '-');
                    $sheet->setCellValue('B'.$row, $c->created_at->format('Y-m-d'));
                    $sheet->setCellValue('C'.$row, $c->requestCustomPaket->user->name ?? '-');
                    $sheet->setCellValue('D'.$row, 'Custom Paket');
                    $sheet->setCellValue('E'.$row, $c->requestCustomPaket->kategoriEvent->nama_kategori ?? 'Event Custom');
                    $sheet->setCellValue('F'.$row, $c->total_penawaran ?? 0);

                    $totalPendapatan += $c->total_penawaran ?? 0;
                    $totalCount++;
                    $row++;
                }

                $avgPendapatan = $totalCount > 0 ? $totalPendapatan / $totalCount : 0;

                // Empty row for spacing
                $row++;

                // Add Summary Section
                $sheet->mergeCells("A{$row}:F{$row}");
                $sheet->setCellValue("A{$row}", 'RINGKASAN KEUANGAN');
                $sheet->getStyle("A{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}:F{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('e2efda');
                $row++;

                $sheet->mergeCells("A{$row}:E{$row}");
                $sheet->setCellValue("A{$row}", 'Total Transaksi (Pesanan)');
                $sheet->setCellValue("F{$row}", $totalCount);
                $row++;

                $sheet->mergeCells("A{$row}:E{$row}");
                $sheet->setCellValue("A{$row}", 'Rata-rata Pendapatan per Transaksi');
                $sheet->setCellValue("F{$row}", $avgPendapatan);
                $sheet->getStyle("F{$row}")->getNumberFormat()->setFormatCode('#,##0');
                $row++;

                $sheet->mergeCells("A{$row}:E{$row}");
                $sheet->setCellValue("A{$row}", 'Total Pendapatan Bersih');
                $sheet->setCellValue("F{$row}", $totalPendapatan);
                $sheet->getStyle("F{$row}")->getNumberFormat()->setFormatCode('#,##0');
                
                // Style Summary rows
                $summaryStart = $row - 3;
                $summaryEnd = $row;
                $sheet->getStyle("A{$summaryStart}:F{$summaryEnd}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);
                $sheet->getStyle("A{$row}:F{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$summaryStart}:E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }

            // Format currency column (hanya pada row data, jika ada)
            if ($totalCount > 0) {
                $dataEndRow = $row - 5;
                if ($dataEndRow >= 2) {
                    $sheet->getStyle("F2:F{$dataEndRow}")->getNumberFormat()->setFormatCode('#,##0');
                }
            }

            // Auto size columns
            foreach (range('A', 'F') as $col) {
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
            'pemesanan' => $pemesanan,
            'custom' => $custom,
            'bulan' => $bulan,
            'tahun' => $tahun,
        ]);

        return $pdf->download("Laporan_Keuangan_{$bulan}_{$tahun}.pdf");
    }
}
