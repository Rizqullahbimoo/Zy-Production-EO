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

            foreach ($pemesanan as $p) {
                $sheet->setCellValue('A'.$row, $p->kode_pemesanan);
                $sheet->setCellValue('B'.$row, Carbon::parse($p->tanggal_pemesanan)->format('Y-m-d'));
                $sheet->setCellValue('C'.$row, $p->user->name ?? '-');
                $sheet->setCellValue('D'.$row, 'Paket Bawaan');
                $sheet->setCellValue('E'.$row, $p->paketLayanan->nama_paket ?? '-');
                $sheet->setCellValue('F'.$row, $p->paketLayanan->harga ?? 0);

                $totalPendapatan += $p->paketLayanan->harga ?? 0;
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
                $row++;
            }

            // Add total row
            $sheet->mergeCells("A{$row}:E{$row}");
            $sheet->setCellValue("A{$row}", 'Total Pendapatan');
            $sheet->setCellValue("F{$row}", $totalPendapatan);

            // Style total row
            $totalStyle = [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                'borders' => [
                    'top' => ['borderStyle' => Border::BORDER_THIN],
                    'bottom' => ['borderStyle' => Border::BORDER_THICK],
                ],
            ];
            $sheet->getStyle("A{$row}:F{$row}")->applyFromArray($totalStyle);

            // Format currency column
            $sheet->getStyle("F2:F{$row}")->getNumberFormat()->setFormatCode('#,##0');

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
